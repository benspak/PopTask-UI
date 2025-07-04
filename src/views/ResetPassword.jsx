import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, VStack, Text, Link, useColorModeValue } from '@chakra-ui/react';
import ResetPassword from '../components/ResetPassword';

export default function ResetPasswordView() {
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
              Reset Your Password
            </Text>
            <Text color={textColor}>
              Enter your new password below
            </Text>
          </VStack>

          <ResetPassword onBackToLogin={handleBackToLogin} />

          <Text color={textColor} fontSize="sm" textAlign="center">
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
