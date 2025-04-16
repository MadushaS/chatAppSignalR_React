import React, { useState, useEffect } from 'react';
import {
  Input,
  InputGroup,
  VStack,
  HStack,
  Avatar,
  Text,
  Box,
  Button,
  Dialog,
  Center,
  Loader,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useColorModeValue } from '../../components/ui/color-mode';
import { LuSearch } from 'react-icons/lu';

const UserSearchModal = ({ isOpen = false, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const searchUsers = async (searchQuery) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, status')
        .ilike('username', `%${searchQuery}%`)
        .limit(10);

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const debounceSearch = (() => {
    let timer;
    return (searchQuery) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        searchUsers(searchQuery);
      }, 500);
    };
  })();

  useEffect(() => {
    if (!query.trim() || query.length < 3) {
      setResults([]);
      return;
    }
    debounceSearch(query);
  }, [query]);

  useEffect(() => {
    if (!query.trim() || query.length < 3) {
      setResults([]);
      return;
    }
    debounceSearch(query);
  }, [query]);

  const startChat = (userId) => {
    if (onClose) onClose();
    navigate(`/chat/${userId}`);
  };

  const handleClose = () => {
    if (onClose) onClose();
    setQuery('');
    setResults([]);
  };

  const hoverBg = useColorModeValue('gray.100', 'gray.700');

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
      <Dialog.Content>
        <Dialog.Header>Find Users</Dialog.Header>
        <Dialog.CloseTrigger />
        <Dialog.Body pb="6">
          <InputGroup mb="4" startElement={<LuSearch/>}>
            <Input
              placeholder="Search by username (min 3 characters)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </InputGroup>

          {loading ? (
            <Center py="8">
              <Loader />
            </Center>
          ) : results.length > 0 ? (
            <VStack align="stretch" spacing="2">
              {results.map(user => (
                <HStack
                  key={user.id}
                  _hover={{ bg: hoverBg }}
                  borderRadius="md"
                >
                  <Avatar.Root size="md" >
                    <Avatar.Fallback name={user.username} />
                    <Avatar.Image alt={user.username} src={user.avatar_url} />
                  </Avatar.Root>
                  <Box flex="1">
                    <Text fontWeight="medium">@{user.username}</Text>
                  </Box>
                  <Button
                    size="sm"
                    onClick={() => startChat(user.id)}
                    colorScheme="blue"
                  >
                    Message
                  </Button>
                </HStack>
              ))}
            </VStack>
          ) : query.length >= 3 ? (
            <Center py="8">
              <Text color="gray.500">No users found</Text>
            </Center>
          ) : (
            <Center py="8">
              <Text color="gray.500">Type at least 3 characters to search</Text>
            </Center>
          )}
        </Dialog.Body>
      </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default UserSearchModal;