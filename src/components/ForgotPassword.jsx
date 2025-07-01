import React, { useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
  Container,
  Center,
  Link,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import apiService from '../services/api';

const ForgotPassword = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const validateEmail = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email is invalid');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.forgotPassword(email);

      setIsSubmitted(true);
      toast({
        title: 'Reset Link Sent',
        description: 'If an account with this email exists, a password reset link has been sent.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send reset link. Please try again.';

      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Container maxW="md" py={10}>
        <Center>
          <VStack spacing={6}>
            <Alert status="success">
              <AlertIcon />
              <Box>
                <Text fontWeight="bold">Reset Link Sent!</Text>
                <Text fontSize="sm">
                  If an account with {email} exists, we've sent a password reset link to your email.
                </Text>
              </Box>
            </Alert>
            <Text fontSize="sm" color="gray.600" textAlign="center">
              Please check your email and click the reset link to create a new password.
            </Text>
            <Button colorScheme="blue" onClick={onBackToLogin}>
              Back to Login
            </Button>
          </VStack>
        </Center>
      </Container>
    );
  }

  return (
    <Container maxW="md" py={10}>
      <Center>
        <VStack spacing={8} w="full">
          <VStack spacing={2}>
            <Heading size="lg">Reset Password</Heading>
            <Text color="gray.600" textAlign="center">
              Enter your email address and we'll send you a link to reset your password
            </Text>
          </VStack>

          <Box as="form" onSubmit={handleSubmit} w="full">
            <VStack spacing={4}>
              <FormControl isInvalid={!!error}>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter your email address"
                />
                <FormErrorMessage>{error}</FormErrorMessage>
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                w="full"
                isLoading={isLoading}
                loadingText="Sending reset link..."
              >
                Send Reset Link
              </Button>
            </VStack>
          </Box>

          <VStack spacing={2}>
            <Text fontSize="sm" color="gray.600">
              Remember your password?{' '}
              <Link color="blue.500" onClick={onBackToLogin}>
                Sign in
              </Link>
            </Text>
          </VStack>
        </VStack>
      </Center>
    </Container>
  );
};

export default ForgotPassword;
