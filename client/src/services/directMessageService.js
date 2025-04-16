import { signalRService } from "./signalRService";
import { supabase } from "./supabase";

const BASE_URL = import.meta.env.VITE_API_URL;

export const directMessageService = {
    async getConversation(currentUserId, otherUserId) {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`)
                .order('timestamp', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching conversation:', error);
            throw error;
        }
    },

    // Send a direct message using SignalR
    async sendMessage(recipientId, message) {
        try {
            const success = await signalRService.sendDirectMessage(recipientId, message);
            if (!success) {
                throw new Error("Failed to send message via SignalR");
            }
            return true;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    },

    // Mark conversation as read
    async markAsRead(senderId) {
        try {
            const success = await signalRService.markMessagesAsRead(senderId);
            if (!success) {
                throw new Error("Failed to mark messages as read");
            }
            return true;
        } catch (error) {
            console.error('Error marking messages as read:', error);
            throw error;
        }
    },

    async sendTypingIndicator(recipientId) {
        try {
            const success = await signalRService.sendTypingIndicator(recipientId);
            if (!success) {
                throw new Error("Failed to send typing indicator");
            }
            return true;
        } catch (error) {
            console.error('Error sending typing indicator:', error);
            throw error;
        }
    },
};