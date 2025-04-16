import { useState, useEffect, useRef } from 'react';
import {
    Box,
    Flex,
    HStack,
    IconButton,
    Text,
    Input,
    InputGroup,
    Portal,
    Menu,
    Avatar,
    Image,
    VStack,
} from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useColorMode, useColorModeValue } from '../ui/color-mode';
import { LuBell, LuMoon, LuSearch, LuSun } from 'react-icons/lu';
import { signalRService } from '../../services/signalRService';
import { supabase } from '../../services/supabase';


const Header = () => {
    const { colorMode, toggleColorMode } = useColorMode();
    const [userStatus, setUserStatus] = useState('online');
    const [statusTickColor, setStatusTickColor] = useState('green.500');
    const { user, signOut } = useAuth();

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    const dropDownBgColor = useColorModeValue('gray.100', 'gray.700');

    const updateStatus = async (status) => {
        setUserStatus(status);
        if (status === 'offline') {
            setStatusTickColor('gray.500');
        }
        else if (status === 'away') {
            setStatusTickColor('orange.500');
        }
        else {
            setStatusTickColor('green.500');
        }
        await signalRService.updateUserStatus(status);
    };

    const searchUsers = async (query) => {
        if (!query || query.trim() === '') {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, username, avatar_url')
                .ilike('username', `%${query}%`)
                .limit(5);

            if (error) throw error;
            setSearchResults(data || []);
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        setShowResults(true);

        // Debounce search to avoid too many requests
        const timeoutId = setTimeout(() => {
            searchUsers(value);
        }, 300);

        return () => clearTimeout(timeoutId);
    };

    // Handle clicking on a search result
    const handleSelectUser = (userId) => {
        setSearchQuery('');
        setShowResults(false);
        navigate(`/chat/${userId}`);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <Box
            as="header"
            bg={bgColor}
            px={4}
            borderBottom="1px"
            borderColor={borderColor}
            position="sticky"
            top={0}
            zIndex={10}
        >
            <Flex h="16" alignItems="center" justifyContent="space-between">
                <Image src="/logo_text.png" boxSize="192px" objectFit="contain" />

                <Box position="relative" w="md" mx={6} display={{ base: 'none', md: 'block' }} ref={searchRef}>
                    <InputGroup startElement={<LuSearch />}>
                        <Input
                            placeholder="Search for users..."
                            borderRadius="full"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onFocus={() => searchQuery && setShowResults(true)}
                        />
                    </InputGroup>

                    {/* Search Results Dropdown */}
                    {showResults && searchResults.length > 0 && (
                        <VStack
                            position="absolute"
                            top="100%"
                            left="0"
                            right="0"
                            mt="2"
                            bg={bgColor}
                            borderRadius="md"
                            boxShadow="md"
                            borderWidth="1px"
                            borderColor={borderColor}
                            p="2"
                            spacing="1"
                            align="stretch"
                            maxH="300px"
                            overflowY="auto"
                            zIndex="dropdown"
                        >
                            {searchResults.map(user => (
                                <Flex
                                    key={user.id}
                                    p="2"
                                    borderRadius="md"
                                    _hover={{ bg: dropDownBgColor }}
                                    cursor="pointer"
                                    onClick={() => handleSelectUser(user.id)}
                                    align="center"
                                >
                                    <Avatar.Root size="sm" mr="3">
                                        <Avatar.Fallback name={user.username} />
                                        <Avatar.Image src={user.avatar_url} />
                                    </Avatar.Root>
                                    <Text>{user.username}</Text>
                                </Flex>
                            ))}
                        </VStack>
                    )}

                    {showResults && isSearching && (
                        <Box
                            position="absolute"
                            top="100%"
                            left="0"
                            right="0"
                            mt="2"
                            bg={bgColor}
                            borderRadius="md"
                            boxShadow="md"
                            p="4"
                            textAlign="center"
                        >
                            <Text>Searching...</Text>
                        </Box>
                    )}

                    {showResults && !isSearching && searchQuery && searchResults.length === 0 && (
                        <Box
                            position="absolute"
                            top="100%"
                            left="0"
                            right="0"
                            mt="2"
                            bg={bgColor}
                            borderRadius="md"
                            boxShadow="md"
                            p="4"
                            textAlign="center"
                        >
                            <Text>No results found</Text>
                        </Box>
                    )}
                </Box>

                <HStack spacing={3}>
                    <IconButton
                        onClick={toggleColorMode}
                        variant="ghost"
                        aria-label="Toggle color mode"
                    >
                        {colorMode === 'light' ? <LuMoon /> : <LuSun />}
                    </IconButton>

                    <Menu.Root>
                        <Menu.Trigger asChild>
                            <IconButton variant="ghost" cursor="pointer" minW={0}>
                                <Avatar.Root size="sm">
                                    <Avatar.Fallback name={user?.name} />
                                    <Avatar.Image src={user?.avatar} alt={user?.name} />
                                </Avatar.Root>
                                <Box
                                    position="absolute"
                                    top="2px"
                                    right="2px"
                                    bg={statusTickColor}
                                    borderRadius="full"
                                    w="8px"
                                    h="8px"
                                />
                            </IconButton>
                        </Menu.Trigger>
                        <Portal>
                            <Menu.Positioner>
                                <Menu.Content>
                                    <Menu.Item onClick={() => updateStatus('online')}>
                                        <Box w="2" h="2" borderRadius="full" bg="green.500" display="inline-block" mr="2" />
                                        Online
                                    </Menu.Item>
                                    <Menu.Item onClick={() => updateStatus('away')}>
                                        <Box w="2" h="2" borderRadius="full" bg="orange.500" display="inline-block" mr="2" />
                                        Away
                                    </Menu.Item>
                                    <Menu.Item onClick={() => updateStatus('offline')}>
                                        <Box w="2" h="2" borderRadius="full" bg="gray.500" display="inline-block" mr="2" />
                                        Appear Offline
                                    </Menu.Item>
                                    <Menu.Separator />
                                    <Menu.Item >
                                        <Link to="/profile">Profile</Link>
                                    </Menu.Item>
                                    <Menu.Item >
                                        <Link to="/settings">Settings</Link>
                                    </Menu.Item>
                                    <Menu.Separator />
                                    <Menu.Item cursor={'pointer'} onClick={signOut}>Sign Out</Menu.Item>
                                </Menu.Content>
                            </Menu.Positioner>
                        </Portal>
                    </Menu.Root>
                </HStack>
            </Flex>
        </Box>
    );
};

export default Header;