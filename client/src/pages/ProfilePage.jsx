import React, { useEffect, useState } from 'react';
import {
  Box,
  Input,
  VStack,
  Heading,
  Text,
  Avatar,
  Flex,
  IconButton,
  FieldRoot,
  FieldLabel,
  Loader
} from '@chakra-ui/react';
import AppLayout from '../components/layouts/AppLayout';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { X, Check, Edit } from 'lucide';
import { toaster } from '../components/ui/toaster'
import Divider from '../components/ui/divider';
import { LuCheck, LuX } from 'react-icons/lu';
import { FiEdit } from 'react-icons/fi';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    bio: '',
    avatar: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await userService.getProfile(user?.id);
        setProfile(data);
        setFormData({
          username: data?.username || '',
          displayName: data?.displayName || '',
          bio: data?.bio || '',
          avatar: data?.avatar || ''
        });
      } catch (err) {
        setError('Failed to load profile');
        toaster.create({
          title: 'Error loading profile',
          description: err.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchProfile();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updatedProfile = {
        id: user.id,
        ...formData
      };

      const result = await userService.updateProfile(updatedProfile);
      setProfile(result);
      setEditMode(false);

      toaster.create({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toaster.create({
        title: 'Error updating profile',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: profile?.username || '',
      displayName: profile?.displayName || '',
      bio: profile?.bio || '',
      avatar: profile?.avatar || ''
    });
    setEditMode(false);
  };

  if (loading) {
    return (
      <AppLayout>
        <Flex justify="center" align="center" height="100vh">
          <Loader />
        </Flex>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <Box textAlign="center" py={10} px={6}>
          <Heading as="h2" size="xl" mt={6} mb={2}>
            Error Loading Profile
          </Heading>
          <Text color="gray.500">
            {error}
          </Text>
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Box maxW="800px" mx="auto" py={8} px={4}>
        <Flex justify="space-between" align="center" mb={6}>
          <Heading size="lg">My Profile</Heading>
          {!editMode ? (
            <IconButton
              title='Edit profile'
              aria-label="Edit profile"
              onClick={() => setEditMode(true)}
              colorScheme="blue"
              
            >
              <FiEdit/>
            </IconButton>
          ) : (
            <Flex gap={2}>
              <IconButton
                aria-label="Cancel"
                onClick={handleCancel}
                colorScheme="red"
              >
                <LuX/>
              </IconButton>
              <IconButton
                aria-label="Save changes"
                onClick={handleSubmit}
                colorScheme="green"
                isLoading={saving}
              >
                <LuCheck/>
              </IconButton>
            </Flex>
          )}
        </Flex>

        <Flex direction={{ base: "column", md: "row" }} gap={8}>
          <Box textAlign="center">
            <Avatar.Root size="2xl" mb={4} >
              <Avatar.Fallback name={profile?.displayName || profile?.username} />
              <Avatar.Image src={profile?.avatar} alt={profile?.displayName || profile?.username} />
            </Avatar.Root>
            {!editMode ? (
              <Text fontSize="xl" fontWeight="bold">{profile?.displayName || profile?.username}</Text>
            ) : null}
          </Box>

          <VStack flex={1} align="stretch" spacing={6}>
            {editMode ? (
              <form onSubmit={handleSubmit}>
                <VStack spacing={4} align="stretch">
                  <FieldRoot>
                    <FieldLabel>Username</FieldLabel>
                    <Input
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                    />
                  </FieldRoot>

                  <FieldRoot>
                    <FieldLabel>Display Name</FieldLabel>
                    <Input
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleChange}
                    />
                  </FieldRoot>

                  <FieldRoot>
                    <FieldLabel>Bio</FieldLabel>
                    <Input
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      as="textarea"
                      rows={4}
                    />
                  </FieldRoot>

                  <FieldRoot>
                    <FieldLabel>Avatar URL</FieldLabel>
                    <Input
                      name="avatar"
                      value={formData.avatar}
                      onChange={handleChange}
                      placeholder="https://example.com/avatar.png"
                    />
                  </FieldRoot>
                </VStack>
              </form>
            ) : (
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text fontWeight="bold">Username:</Text>
                  <Text>{profile?.username}</Text>
                </Box>

                {profile?.displayName && (
                  <Box>
                    <Text fontWeight="bold">Display Name:</Text>
                    <Text>{profile.displayName}</Text>
                  </Box>
                )}

                {profile?.bio && (
                  <Box>
                    <Text fontWeight="bold">Bio:</Text>
                    <Text>{profile.bio}</Text>
                  </Box>
                )}

                <Divider my={2} />

                <Box>
                  <Text fontWeight="bold">Email:</Text>
                  <Text>{user?.email}</Text>
                </Box>

                <Box>
                  <Text fontWeight="bold">User ID:</Text>
                  <Text fontSize="sm">{user?.id}</Text>
                </Box>

                {user?.createdAt && (
                  <Box>
                    <Text fontWeight="bold">Account Created:</Text>
                    <Text>{new Date(user.createdAt).toLocaleDateString()}</Text>
                  </Box>
                )}
              </VStack>
            )}
          </VStack>
        </Flex>
      </Box>
    </AppLayout>
  );
};

export default ProfilePage;