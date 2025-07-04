import React from 'react';
import { Box, Container, VStack, Text, Link, useColorModeValue } from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Login from '../components/Login';

export default function LoginView() {
  const navigate = useNavigate();

  // Color mode values for dark theme
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('blue.600', 'blue.400');
  const linkColor = useColorModeValue('blue.500', 'blue.300');

  const handleSwitchToRegister = () => {
    navigate('/register');
  };

  const handleSwitchToForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <Box minH="100vh" bg={bgColor} py={8}>
      <Container maxW="md">
        <VStack spacing={8}>
          <Login
            onSwitchToRegister={handleSwitchToRegister}
            onSwitchToForgotPassword={handleSwitchToForgotPassword}
          />
        </VStack>
      </Container>
    </Box>
  );
}
