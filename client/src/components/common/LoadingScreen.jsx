import React from 'react';
import { Center, Text, VStack, Skeleton } from '@chakra-ui/react';

const LoadingScreen = () => {
    return (
        <Center h="100vh">
            <VStack spacing={4}>
                <Skeleton height="20px" width="200px" startColor="gray.200" endColor="gray.300" />
                <Text fontSize="lg" color="gray.500">
                    Loading...
                </Text>
            </VStack>
        </Center>
    );
};

export default LoadingScreen;