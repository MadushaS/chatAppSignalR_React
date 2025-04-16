import React, { useState } from 'react';
import {
    Box,
    Button,
    FieldErrorText,
    FieldLabel,
    FieldRoot,
    Heading,
    Image,
    Input,
    Link,
    Stack,
    Text
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { toaster } from '../components/ui/toaster';
import { useColorModeValue } from '../components/ui/color-mode';

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const { data, error } = await signUp(email, password);
            if (error) throw error;

            // Create a user profile in Supabase
            const { error: profileError } = await supabase.from('profiles').insert({
                id: data.user.id,
                username: username,
                display_name: username,
                status: 'offline',
                first_name: firstName,
                last_name: lastName,
                avatar_url: avatarUrl,
            });

            if (profileError) throw profileError;

            toaster.create({
                title: 'Account created',
                description: 'You have successfully registered!',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });

            navigate('/login');
        } catch (error) {
            setError(error.message || 'Failed to create account');
            toaster.create({
                title: 'Registration failed',
                description: error.message || 'Failed to create account',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            minH="100vh"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg={useColorModeValue('gray.50', 'gray.800')}
        >
            <Stack spacing={8} mx="auto" maxW="lg" py={12} px={6}>
                <Stack align="center">
                    <Image src="/logo.png" w={'96'} />
                    <Heading fontSize="4xl">Create your account</Heading>
                    <Text fontSize="lg" color={useColorModeValue('gray.600', 'gray.400')}>
                        to chat with friends ✌️
                    </Text>
                </Stack>
                <Box
                    rounded="lg"
                    bg={useColorModeValue('white', 'gray.700')}
                    boxShadow="lg"
                    p={8}
                    as="form"
                    onSubmit={handleSubmit}
                >
                    <Stack spacing={6}>
                        {/* Account Information Section */}
                        <Box>
                            <Heading size="sm" mb={3} color={useColorModeValue('gray.600', 'gray.400')}>
                                Account Information
                            </Heading>
                            <Stack direction={{ base: 'column', md: 'row' }} spacing={4} mb={2}>
                                <FieldRoot id="email" w="full">
                                    <FieldLabel>Email address</FieldLabel>
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </FieldRoot>
                                <FieldRoot id="username" w="full">
                                    <FieldLabel>Username</FieldLabel>
                                    <Input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </FieldRoot>
                            </Stack>

                            <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
                                <FieldRoot id="password" w="full">
                                    <FieldLabel>Password</FieldLabel>
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </FieldRoot>
                                <FieldRoot id="confirmPassword" invalid={!!error} w="full">
                                    <FieldLabel>Confirm Password</FieldLabel>
                                    <Input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                    <FieldErrorText>{error}</FieldErrorText>
                                </FieldRoot>
                            </Stack>
                        </Box>

                        {/* Personal Information Section */}
                        <Box>
                            <Heading size="sm" mb={3} color={useColorModeValue('gray.600', 'gray.400')}>
                                Personal Information
                            </Heading>
                            <Stack direction={{ base: 'column', md: 'row' }} spacing={4} mb={2}>
                                <FieldRoot id="firstName" w="full">
                                    <FieldLabel>First Name</FieldLabel>
                                    <Input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                    />
                                </FieldRoot>
                                <FieldRoot id="lastName" w="full">
                                    <FieldLabel>Last Name</FieldLabel>
                                    <Input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                    />
                                </FieldRoot>
                            </Stack>

                            <FieldRoot id="avatarUrl">
                                <FieldLabel>Avatar URL (optional)</FieldLabel>
                                <Input
                                    type="url"
                                    value={avatarUrl}
                                    onChange={(e) => setAvatarUrl(e.target.value)}
                                    placeholder="https://example.com/your-avatar.jpg"
                                />
                            </FieldRoot>
                        </Box>

                        <Stack spacing={10} pt={2}>
                            <Button
                                loadingText="Submitting"
                                size="lg"
                                bg="blue.400"
                                color="white"
                                _hover={{
                                    bg: 'blue.500',
                                }}
                                type="submit"
                                isLoading={loading}
                            >
                                Sign up
                            </Button>
                        </Stack>

                        <Stack pt={2}>
                            <Text align="center">
                                Already a user?{' '}
                                <Link as={RouterLink} to="/login" color="blue.400">
                                    Login
                                </Link>
                            </Text>
                        </Stack>
                    </Stack>
                </Box>
            </Stack>
        </Box>
    );
};

export default RegisterPage;