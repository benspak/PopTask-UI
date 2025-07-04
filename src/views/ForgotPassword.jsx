import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, VStack, Text, Link, useColorModeValue } from '@chakra-ui/react';
import ForgotPassword from '../components/ForgotPassword';

export default function ForgotPasswordView() {
  const navigate = useNavigate();

  // Color mode values for dark theme
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('blue.600', 'blue.400');
  const linkColor = useColorModeValue('blue.500', 'blue.300');

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <Box minH="100vh" bg={bgColor} py={8}>
      <Container maxW="md">
        <VStack spacing={8}>
          <VStack spacing={4} textAlign="center">
            <Text fontSize="3xl" fontWeight="bold" color={headingColor}>
              Reset Password
            </Text>
            <Text color={textColor}>
              Enter your email to receive reset instructions
            </Text>
          </VStack>

          <ForgotPassword onBackToLogin={handleBackToLogin} />

          <Text color={textColor}>
            Remember your password?{' '}
            <Link color={linkColor} fontWeight="medium" onClick={handleBackToLogin}>
              Sign in
            </Link>
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}
