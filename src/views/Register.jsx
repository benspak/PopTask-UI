import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, VStack, Text, Link, useColorModeValue } from '@chakra-ui/react';
import Register from '../components/Register';

export default function RegisterView() {
  const navigate = useNavigate();

  // Color mode values for dark theme
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('blue.600', 'blue.400');
  const linkColor = useColorModeValue('blue.500', 'blue.300');

  const handleSwitchToLogin = () => {
    navigate('/login');
  };

  return (
    <Box minH="100vh" bg={bgColor} py={8}>
      <Container maxW="md">
        <VStack spacing={8}>


          <Register onSwitchToLogin={handleSwitchToLogin} />

          
        </VStack>
      </Container>
    </Box>
  );
}
