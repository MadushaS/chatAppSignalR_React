import { Flex, Box, Text, Spinner, IconButton, Button, Avatar } from '@chakra-ui/react';
import React from 'react';
import { LuCheckCheck, LuCircleAlert, LuRefreshCw } from 'react-icons/lu';
import { useColorModeValue } from '../../components/ui/color-mode';

// Updated Message component with sending states
export const Message = ({ message, isOwn, onRetry }) => {
    const ownBgColor = useColorModeValue('blue.100', 'blue.800');
    const otherBgColor = useColorModeValue('gray.100', 'gray.700');
    const failedBgColor = useColorModeValue('red.100', 'red.900');

    // Determine background color based on message state
    const bgColor = isOwn
        ? message.failed ? failedBgColor : ownBgColor
        : otherBgColor;

    return (
        <Flex justify={isOwn ? 'flex-end' : 'flex-start'} mb="3">
            {!isOwn && (
                <Avatar.Root
                    size="sm"
                    mr="2" >
                    <Avatar.Fallback name={message.username} />
                    <Avatar.Image alt={message.username}
                        src={message.avatar} />
                </Avatar.Root>
            )}

            <Box
                maxW="70%"
                bg={bgColor}
                px="3"
                py="2"
                borderRadius="lg"
                borderBottomLeftRadius={!isOwn ? '2' : undefined}
                borderBottomRightRadius={isOwn ? '2' : undefined}
                position="relative"
            >
                {!isOwn && (
                    <Text fontSize="xs" fontWeight="bold" mb="1">
                        {message.username}
                    </Text>
                )}

                {/* Status indicators for own messages */}
                {isOwn && (
                    <Box position="absolute" top="2" right="2">
                        {message.sending && <Spinner size="xs" />}
                        {message.failed && (
                            <IconButton
                                aria-label="Retry sending"
                                icon={<LuCircleAlert />}
                                size="xs"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => onRetry(message.id, message.message)}
                                title="Failed to send. Click to retry." />
                        )}
                        {message.read && <LuCheckCheck color="blue" />}
                    </Box>
                )}

                <Text>{message.message}</Text>

                <Text fontSize="xs" color="gray.500" textAlign="right" mt="1">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>

                {/* Failed message retry button */}
                {isOwn && message.failed && (
                    <Button
                        size="xs"
                        leftIcon={<LuRefreshCw />}
                        mt="2"
                        onClick={() => onRetry(message.id, message.message)}
                        colorScheme="blue"
                    >
                        Retry
                    </Button>
                )}
            </Box>

            {isOwn && (
                <Avatar.Root
                    size="sm"
                    name="You"
                    src={message.avatar}
                    ml="2" >
                    <Avatar.Fallback name="You" />
                    <Avatar.Image
                        alt="You"
                        src={message.avatar}
                        fallbackSrc="https://via.placeholder.com/150"
                        borderRadius="full"
                        boxSize="24px"
                        objectFit="cover"
                    />
                </Avatar.Root>
            )}
        </Flex>
    );
};
