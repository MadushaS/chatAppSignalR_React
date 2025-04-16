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
    Text,
} from '@chakra-ui/react';
import { toaster, Toaster } from '../components/ui/toaster'
import { useColorModeValue } from '../components/ui/color-mode'
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data, error } = await signIn(email, password);
            if (error) throw error;

            toaster.create({
                title: 'Login successful',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            navigate('/chats');
        } catch (error) {
            setError(error.message || 'Failed to log in');
            toaster.create({
                title: 'Login failed',
                description: error.message || 'Failed to log in',
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
            <Toaster />
            <Stack spacing={8} mx="auto" maxW="lg" py={12} px={6}>
                <Stack align="center">
                    <Image src="/logo.png" w={'96'} />
                    <Heading fontSize="4xl">Sign in to your account</Heading>
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
                    <Stack spacing={4}>
                        <FieldRoot id="email">
                            <FieldLabel>Email address</FieldLabel>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <FieldErrorText>{error}</FieldErrorText>
                        </FieldRoot>

                        <FieldRoot id="password">
                            <FieldLabel>Password</FieldLabel>
                            <Input
                                type={'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <FieldErrorText>{error}</FieldErrorText>
                        </FieldRoot>

                        <Stack spacing={10}>
                            <Stack
                                direction={{ base: 'column', sm: 'row' }}
                                align="start"
                                justify="space-between"
                            >
                                <Link color="blue.400">Forgot password?</Link>
                            </Stack>
                            <Button
                                bg="blue.400"
                                color="white"
                                _hover={{
                                    bg: 'blue.500',
                                }}
                                type="submit"
                                isLoading={loading}
                            >
                                Sign in
                            </Button>
                        </Stack>

                        <Stack pt={6}>
                            <Text align="center">
                                Don't have an account?{' '}
                                <Link as={RouterLink} to="/register" color="blue.400">
                                    Register
                                </Link>
                            </Text>
                        </Stack>
                    </Stack>
                </Box>
            </Stack>
        </Box>
    );
};

export default LoginPage;