import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { signalRService } from '../services/signalRService';
import { directMessageService } from '../services/directMessageService';
import { supabase } from '../services/supabase';

export function useDirectChat(recipientId) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('offline');
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [isSending, setIsSending] = useState(false);
  
  // Connection management
  const connect = useCallback(async () => {
    if (!user) return false;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (token) {
        const success = await signalRService.startConnection(token);
        setConnectionStatus(success ? 'connected' : 'disconnected');
        return success;
      }
      return false;
    } catch (error) {
      console.error('Error connecting to SignalR:', error);
      setConnectionStatus('disconnected');
      return false;
    }
  }, [user]);

  const disconnect = useCallback(async () => {
    try {
      await signalRService.stopConnection();
      setConnectionStatus('disconnected');
      return true;
    } catch (error) {
      console.error('Error disconnecting from SignalR:', error);
      return false;
    }
  }, []);
  
  // Initialize connection
  useEffect(() => {
    if (user && connectionStatus === 'disconnected') {
      connect();
    } else if (!user && connectionStatus !== 'disconnected') {
      disconnect();
    }

    return () => {
      if (connectionStatus !== 'disconnected') {
        disconnect();
      }
    };
  }, [user, connect, disconnect, connectionStatus]);

  // Set up connection status handlers
  useEffect(() => {
    const reconnectingHandler = () => setConnectionStatus('reconnecting');
    const reconnectedHandler = () => {
      setConnectionStatus('connected');
      // Refetch messages to ensure we didn't miss any while disconnected
      fetchMessages();
    };
    const disconnectedHandler = () => setConnectionStatus('disconnected');
    
    signalRService.on('Reconnecting', reconnectingHandler);
    signalRService.on('Reconnected', reconnectedHandler);
    signalRService.on('Disconnected', disconnectedHandler);
    
    return () => {
      signalRService.off('Reconnecting');
      signalRService.off('Reconnected');
      signalRService.off('Disconnected');
    };
  }, []);
  
  // Fetch message history
  const fetchMessages = useCallback(async () => {
    if (!user || !recipientId) return;
    
    try {
      const messageData = await directMessageService.getConversation(user.id, recipientId);
      setMessages(messageData || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [user, recipientId]);
  
  // Set up message and status handlers
  useEffect(() => {
    if (!user || !recipientId) return;
    
    // Mark messages as read when chat is opened
    const markMessagesAsRead = async () => {
      try {
        await directMessageService.markAsRead(recipientId);
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    };
    
    // Message handlers
    const directMessageHandler = (senderId, messageText, messageId, timestamp) => {
      if (senderId === recipientId || senderId === user.id) {
        // Check if message already exists to prevent duplicates
        setMessages(prev => {
          // If message with this ID already exists, don't add it again
          if (messageId && prev.some(m => m.id === messageId)) {
            return prev;
          }
          
          return [...prev, {
            id: messageId || `temp-${Date.now()}`,
            sender_id: senderId,
            receiver_id: senderId === user.id ? recipientId : user.id,
            message: messageText,
            timestamp: timestamp || new Date(),
            read: false
          }];
        });
        
        // If we received a message from the recipient, mark it as read
        if (senderId === recipientId) {
          markMessagesAsRead();
        }
      }
    };
    
    const typingIndicatorHandler = (senderId) => {
      if (senderId === recipientId) {
        setIsTyping(true);
        // Hide typing indicator after 3 seconds of inactivity
        setTimeout(() => {
          setIsTyping(false);
        }, 3000);
      }
    };
    
    const statusChangeHandler = (userId, newStatus) => {
      if (userId === recipientId) {
        setStatus(newStatus);
      }
    };
    
    const messagesReadHandler = (readerId) => {
      if (readerId === recipientId) {
        // Update messages to show read status
        setMessages(prev => prev.map(msg =>
          msg.sender_id === user.id ? { ...msg, read: true } : msg
        ));
      }
    };
    
    // Fetch initial user status
    const fetchInitialStatus = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('status')
          .eq('id', recipientId)
          .single();

        if (data) {
          setStatus(data.status || 'offline');
        }
      } catch (error) {
        console.error('Error fetching user status:', error);
      }
    };
    
    // Register event handlers
    signalRService.on('ReceiveDirectMessage', directMessageHandler);
    signalRService.on('ReceiveTypingIndicator', typingIndicatorHandler);
    signalRService.on('UserStatusChanged', statusChangeHandler);
    signalRService.on('MessagesMarkedAsRead', messagesReadHandler);
    
    // Initialize
    fetchMessages();
    markMessagesAsRead();
    fetchInitialStatus();
    
    // Cleanup function
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      // Remove event handlers
      signalRService.off('ReceiveDirectMessage');
      signalRService.off('ReceiveTypingIndicator');
      signalRService.off('UserStatusChanged');
      signalRService.off('MessagesMarkedAsRead');
    };
  }, [user, recipientId, typingTimeout, fetchMessages]);
  
  // Send a new message
  const sendMessage = async (messageText) => {
    if (!messageText.trim() || isSending) return false;
    
    try {
      setIsSending(true);
      
      // Ensure connection is active
      if (connectionStatus !== 'connected') {
        await connect();
      }
      
      // Generate a temporary ID for the message
      const tempId = `temp-${Date.now()}`;
      
      // Add message locally with a temporary ID for immediate display
      setMessages(prev => [...prev, {
        id: tempId,
        sender_id: user.id,
        receiver_id: recipientId,
        message: messageText,
        timestamp: new Date(),
        read: false,
        sending: true // Flag to show sending state
      }]);
      
      // Send the message through SignalR
      const success = await directMessageService.sendMessage(recipientId, messageText);
      
      if (!success) {
        // Update the message to show it failed
        setMessages(prev => prev.map(msg => 
          msg.id === tempId ? { ...msg, sending: false, failed: true } : msg
        ));
        return false;
      }
      
      // The backend will save the message and broadcast it back
      // When it comes back via SignalR, it will have a proper ID
      // No need to update the local message here
      
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    } finally {
      setIsSending(false);
    }
  };
  
  // Retry sending a failed message
  const retryMessage = async (tempId, messageText) => {
    if (!messageText.trim() || isSending) return false;
    
    try {
      setIsSending(true);
      
      // Update message to show it's being sent
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...msg, sending: true, failed: false } : msg
      ));
      
      // Ensure connection is active
      if (connectionStatus !== 'connected') {
        await connect();
      }
      
      // Send the message through SignalR
      const success = await directMessageService.sendMessage(recipientId, messageText);
      
      if (!success) {
        // Update the message to show it failed again
        setMessages(prev => prev.map(msg => 
          msg.id === tempId ? { ...msg, sending: false, failed: true } : msg
        ));
        return false;
      }
      
      // Remove the temporary message - it will be replaced by the real one
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      
      return true;
    } catch (error) {
      console.error('Error retrying message:', error);
      return false;
    } finally {
      setIsSending(false);
    }
  };
  
  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    const newTimeout = setTimeout(async () => {
      try {
        if (connectionStatus === 'connected') {
          await directMessageService.sendTypingIndicator(recipientId);
        }
      } catch (error) {
        console.error('Error sending typing indicator:', error);
      }
    }, 500); // Send typing event after 500ms of inactivity
    
    setTypingTimeout(newTimeout);
  }, [recipientId, connectionStatus, typingTimeout]);
  
  return {
    messages,
    status,
    isTyping,
    connectionStatus,
    isSending,
    sendMessage,
    retryMessage,
    handleTyping,
    connect,
    disconnect,
    refreshMessages: fetchMessages
  };
}