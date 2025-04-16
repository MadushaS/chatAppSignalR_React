import { Box } from "@chakra-ui/react";
import { useColorModeValue } from "./color-mode";

const Divider = () => {
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    return (
        <Box
            borderBottomWidth="1px"
            borderColor={borderColor}
            my="2"
        />
    );
};

export default Divider;