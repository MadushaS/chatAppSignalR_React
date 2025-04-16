import React, { useState } from 'react';
import {
    Box,
    VStack,
    Flex,
    Text,
    Icon,
    Badge,
    Input,
    InputGroup,
    Avatar,
} from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, MessageSquareMore, Settings, Info } from 'lucide';
import { useColorModeValue } from '../ui/color-mode';
import Divider from '../ui/divider';
import { LuInfo, LuMessageSquareMore, LuSearch, LuSettings } from 'react-icons/lu';
import { signalRService } from '../../services/signalRService';
import { useEffect } from 'react';
import { supabase } from '../../services/supabase';

const SidebarLink = ({ icon, children, isActive, badgeCount, ...rest }) => {
    const activeBg = useColorModeValue('blue.50', 'blue.900');
    const activeColor = useColorModeValue('blue.600', 'blue.200');
    const hoverBg = useColorModeValue('gray.100', 'gray.700');

    return (
        <Flex
            align="center"
            px="4"
            py="3"
            cursor="pointer"
            role="group"
            fontWeight={isActive ? "semibold" : "normal"}
            bg={isActive ? activeBg : "transparent"}
            color={isActive ? activeColor : "inherit"}
            _hover={{
                bg: isActive ? activeBg : hoverBg,
            }}
            borderRadius="md"
            {...rest}
        >
            <Icon as={icon} mr="3" fontSize="16" />
            <Text>{children}</Text>
            {badgeCount && (
                <Badge ml="auto" colorScheme="red" borderRadius="full">
                    {badgeCount}
                </Badge>
            )}
        </Flex>
    );
};

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [userStatuses, setUserStatuses] = useState({});
    const [chatUsers, setChatUsers] = useState([
        { id: 1, name: 'Sarah Johnson', status: 'online', avatar: '', unread: 3 },
        { id: 2, name: 'Michael Chen', status: 'offline', avatar: '', unread: 0 },
        { id: 3, name: 'Alexia Torres', status: 'away', avatar: '', unread: 1 },
        // More users...
    ]);

    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    const hoverBgColor = useColorModeValue('gray.100', 'gray.700');

    useEffect(() => {
        // Listen for status changes
        signalRService.on('UserStatusChanged', (userId, status) => {
            setUserStatuses(prev => ({
                ...prev,
                [userId]: status
            }));
        });

        // Fetch initial status for all users
        const fetchInitialStatuses = async () => {
            try {
                const { data } = await supabase
                    .from('profiles')
                    .select('id, status');

                if (data) {
                    const statuses = {};
                    data.forEach(user => {
                        statuses[user.id] = user.status || 'offline';
                    });
                    setUserStatuses(statuses);
                }
            } catch (error) {
                console.error('Error fetching user statuses:', error);
            }
        };

        fetchInitialStatuses();
    }, []);

    return (
        <Box
            w={{ base: "full", md: "60" }}
            h="full"
            bg={bgColor}
            borderRight="1px"
            borderColor={borderColor}
            position="relative"
            overflowY="auto"
        >
            <VStack align="stretch" spacing="1" p="4">
                <InputGroup mb="4" startElement={<LuSearch />}>
                    <Input
                        placeholder="Search conversations..."
                        borderRadius="md"
                        size="sm"
                    />
                </InputGroup>

                <SidebarLink
                    icon={LuMessageSquareMore}
                    isActive={location.pathname === '/chats'}
                    onClick={() => navigate('/chats')}
                    badgeCount={4}
                >
                    Chats
                </SidebarLink>

                <SidebarLink
                    icon={LuSettings}
                    isActive={location.pathname === '/settings'}
                    onClick={() => navigate('/settings')}
                >
                    Settings
                </SidebarLink>

                <Divider />

                <Text px="3" fontSize="sm" fontWeight="semibold" color="gray.500">
                    Recent Conversations
                </Text>

                <VStack align="stretch" spacing="1" mt="2">
                    {chatUsers.map(user => (
                        <Flex
                            key={user.id}
                            _hover={{ bg: hoverBgColor }}
                            borderRadius="md"
                            cursor="pointer"
                            onClick={() => navigate(`/chat/${user.id}`)}
                        >
                            <Avatar.Root size="sm" mr="3" shape={'rounded'} >
                                <Avatar.Fallback name={user.name} />
                                <Avatar.Image src={user.avatar} />
                                <Box
                                    position="absolute"
                                    bottom="0"
                                    right="0"
                                    bg={userStatuses[user.id] === 'online' ? 'green.500' :
                                        userStatuses[user.id] === 'away' ? 'orange.500' : 'gray.500'}
                                    borderRadius="full"
                                    w="3px"
                                    h="3px"
                                    border="2px solid"
                                    borderColor={bgColor}
                                />
                            </Avatar.Root>
                            <Box flex="1" overflow="hidden">
                                <Text fontWeight="medium" noOfLines={1}></Text>
                                <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                    Last message preview...
                                </Text>
                            </Box>
                            {user.unread > 0 && (
                                <Badge colorScheme="blue" borderRadius="full" h="5" minW="5" display="flex" alignItems="center" justifyContent="center">
                                    {user.unread}
                                </Badge>
                            )}
                        </Flex>
                    ))}
                </VStack>
            </VStack>
        </Box>
    );
};

export default Sidebar;