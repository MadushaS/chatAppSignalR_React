import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Flex,
    Avatar,
    Text,
    Input,
    IconButton,
    HStack,
    VStack,
} from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';
import { useColorModeValue } from '../../components/ui/color-mode';
import { LuFilePlus, LuSquareArrowRight } from 'react-icons/lu';
import { toaster } from '../../components/ui/toaster';
import { useDirectChat } from '../../hooks/useDirectChat';
import { Message } from './Message';

const DirectChatWindow = ({ activeUser }) => {
    const { user } = useAuth();
    const [messageText, setMessageText] = useState('');
    const endRef = useRef(null);

    const recipientName = activeUser?.first_name + " " + activeUser?.last_name || 'Unknown User';

    const {
        messages,
        status,
        isTyping,
        connectionStatus,
        isSending,
        sendMessage,
        retryMessage,
        handleTyping,
        refreshMessages
    } = useDirectChat(activeUser.id);

    // UI-related constants
    const headerBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const typingBoxBgColor = useColorModeValue('gray.100', 'gray.700');

    // Scroll to bottom when messages change
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Refresh messages when changing recipients
    useEffect(() => {
        refreshMessages();
    }, [user, refreshMessages]);

    // Handle message submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!messageText.trim() || isSending) return;

        const success = await sendMessage(messageText);

        if (success) {
            setMessageText('');
        } else {
            toaster.error('Failed to send message. Message will be retried automatically.');
        }
    };

    // Handle retry for failed messages
    const handleRetry = async (messageId, messageContent) => {
        const success = await retryMessage(messageId, messageContent);

        if (!success) {
            toaster.error('Failed to resend message. Please try again later.');
        }
    };

    // Handle input changes and typing indicators
    const handleInputChange = (e) => {
        setMessageText(e.target.value);
        handleTyping();
    };

    return (
        <Flex direction="column" h="full">
            {/* Chat header */}
            <Box
                py="3"
                px="4"
                borderBottom="1px"
                borderColor={borderColor}
                bg={headerBg}
                position="relative"
            >
                <Flex align="center">
                    <Avatar.Root size="sm" mr="3" >
                        <Avatar.Fallback name={recipientName} />
                    </Avatar.Root>
                    <Box>
                        <Text fontWeight="medium">{recipientName}</Text>
                        <HStack spacing="1">
                            <Box
                                w="2"
                                h="2"
                                borderRadius="full"
                                bg={status === 'online' ? 'green.500' : status === 'away' ? 'orange.500' : 'gray.500'}
                            />
                            <Text fontSize="xs" color="gray.500">
                                {status === 'online' ? 'Online' : status === 'away' ? 'Away' : 'Offline'}
                            </Text>
                        </HStack>
                    </Box>
                </Flex>

                {/* Connection status indicator */}
                {connectionStatus === 'reconnecting' && (
                    <Box
                        position="absolute"
                        top="0"
                        left="0"
                        right="0"
                        bg="orange.500"
                        py="1"
                        textAlign="center"
                    >
                        <Text fontSize="xs" color="white">
                            Reconnecting to chat server...
                        </Text>
                    </Box>
                )}

                {connectionStatus === 'disconnected' && (
                    <Box
                        position="absolute"
                        top="0"
                        left="0"
                        right="0"
                        bg="red.500"
                        py="1"
                        textAlign="center"
                    >
                        <Text fontSize="xs" color="white">
                            Disconnected from chat server
                        </Text>
                    </Box>
                )}
            </Box>

            {/* Messages container */}
            <VStack
                flex="1"
                overflowY="auto"
                p="4"
                spacing="0"
                align="stretch"
            >
                {messages.map((msg) => (
                    <Message
                        key={msg.id}
                        message={msg}
                        isOwn={msg.sender_id === user.id}
                        onRetry={handleRetry}
                    />
                ))}
                <div ref={endRef} />
                {isTyping && (
                    <Flex align="center" pl="2" mb="2">
                        <Box
                            bg={typingBoxBgColor}
                            px="3"
                            py="2"
                            borderRadius="lg"
                        >
                            <Text fontSize="sm" fontStyle="italic" color="gray.500">
                                {recipientName} is typing...
                            </Text>
                        </Box>
                    </Flex>
                )}
            </VStack>

            {/* Input area */}
            <Box
                p="3"
                borderTop="1px"
                borderColor={borderColor}
                bg={headerBg}
            >
                <form onSubmit={handleSubmit}>
                    <Flex>
                        <IconButton
                            aria-label="Attach file"
                            variant="ghost"
                            mr="2"
                        >
                            <LuFilePlus />
                        </IconButton>
                        <Input
                            placeholder="Type a message..."
                            value={messageText}
                            onChange={handleInputChange}
                            borderRadius="full"
                            disabled={connectionStatus === 'disconnected'}
                        />
                        <IconButton
                            aria-label="Send message"
                            colorScheme="blue"
                            variant="solid"
                            ml="2"
                            borderRadius="full"
                            type="submit"
                            isLoading={isSending}
                            disabled={!messageText.trim() || connectionStatus === 'disconnected'}
                        >
                            <LuSquareArrowRight />
                        </IconButton>
                    </Flex>
                </form>
            </Box>
        </Flex>
    );
};

export default DirectChatWindow;