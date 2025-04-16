import React from 'react';
import {
    Box,
    Heading,
    Text,
    Button,
    VStack
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useColorModeValue } from '../components/ui/color-mode';

const NotFoundPage = () => {
    const bgColor = useColorModeValue('white', 'gray.800');
    const headingColor = useColorModeValue('gray.800', 'white');
    const textColor = useColorModeValue('gray.600', 'gray.400');

    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
            bg={useColorModeValue('gray.50', 'gray.900')}
            p={4}
        >
            <Box
                p={8}
                bg={bgColor}
                rounded="lg"
                shadow="lg"
                maxW="lg"
                width="full"
                textAlign="center"
            >
                <VStack spacing={6}>
                    <Text fontSize="9xl" fontWeight="bold" color="blue.400">
                        404
                    </Text>

                    <Heading as="h1" size="xl" color={headingColor}>
                        Page Not Found
                    </Heading>

                    <Text color={textColor}>
                        The page you're looking for doesn't exist or has been moved.
                    </Text>

                    <Button
                        as={Link}
                        to="/"
                        colorScheme="blue"
                        size="lg"
                        width={{ base: "full", md: "auto" }}
                    >
                        Return Home
                    </Button>
                </VStack>
            </Box>
        </Box>
    );
};

export default NotFoundPage;