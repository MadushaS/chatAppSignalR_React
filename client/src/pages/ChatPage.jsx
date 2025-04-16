import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Flex, Button } from '@chakra-ui/react';
import AppLayout from '../components/layouts/AppLayout';
import DirectChatWindow from '../features/directMessages/DirectChatWindow';
import UserSearchModal from '../features/userSearch/UserSearchModal';
import { userService } from '../services/userService';
import { Plus } from 'lucide';
import { useEffect } from 'react';
import { toaster } from '../components/ui/toaster';

const ChatPage = () => {
  const { userId } = useParams();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [activeUser, setActiveUser] = useState(null);

  useEffect(() => {
    if (userId) {
      // Fetch user details based on userId
      // For now, we'll just set a dummy user
      userService.getProfile(userId).then((user) => {
        setActiveUser(user);
      }
      ).catch((error) => {
        toaster.error('Error fetching user details: '+error.message);
      }
      );
    }
  }
  , [userId]);

  return (
    <AppLayout>
      {userId ? (
        <DirectChatWindow
          activeUser={activeUser}
        />
      ) : (
        <Flex
          direction="column"
          align="center"
          justify="center"
          h="full"
          p="10"
        >
          <Box maxW="md" textAlign="center">
            <h2>Start a new conversation</h2>
            <p>Search for users to start chatting</p>
            <Button
              leftIcon={<Plus />}
              colorScheme="blue"
              mt="6"
              onClick={() => { setIsSearchModalOpen(true) }}
            >
              Find Users
            </Button>
          </Box>
        </Flex>
      )}

      <UserSearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </AppLayout>
  );
};

export default ChatPage;