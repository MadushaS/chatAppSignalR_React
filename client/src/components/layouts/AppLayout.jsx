import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';
import { useColorModeValue } from '../ui/color-mode';
import { Toaster } from '../ui/toaster';

const AppLayout = ({ children }) => {
    const bgColor = useColorModeValue('gray.50', 'gray.900');

    return (
        <Flex h="100vh" flexDirection="column">
            <Header />
            <Toaster />
            <Flex flex="1" overflow="hidden">
                <Sidebar />
                <Box
                    flex="1"
                    bg={bgColor}
                    p={0}
                    overflowY="auto"
                >
                    {children}
                </Box>
            </Flex>
        </Flex>
    );
};

export default AppLayout;