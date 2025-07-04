import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError('Email is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await apiService.forgotPassword(email);

      setIsSubmitted(true);
      toast({
        title: 'Reset Email Sent',
        description: 'If an account with this email exists, you will receive password reset instructions.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMessage = error.message || 'Failed to send reset email. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Center>
        <VStack spacing={6} textAlign="center">
          <Alert status="success" borderRadius="md">
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold">Check Your Email</Text>
              <Text fontSize="sm">
                We've sent password reset instructions to {email}
              </Text>
            </VStack>
          </Alert>

          <Text color="gray.300">
            Didn't receive the email? Check your spam folder or{' '}
            <Link color="blue.300" onClick={() => setIsSubmitted(false)}>
              try again
            </Link>
          </Text>

          <Button
            variant="outline"
            colorScheme="blue"
            onClick={onBackToLogin}
          >
            Back to Login
          </Button>
        </VStack>
      </Center>
    );
  }

  return (
    <Box as="form" onSubmit={handleSubmit} w="full">
      <VStack spacing={4}>
        <FormControl isInvalid={!!error}>
          <FormLabel color="gray.300">Email</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            bg="gray.800"
            borderColor="gray.600"
            color="white"
            _placeholder={{ color: 'gray.400' }}
            _hover={{ borderColor: 'gray.500' }}
            _focus={{ borderColor: 'blue.400', boxShadow: 'none' }}
          />
          <FormErrorMessage>{error}</FormErrorMessage>
        </FormControl>

        <Button
          type="submit"
          colorScheme="blue"
          size="lg"
          w="full"
          isLoading={isLoading}
          loadingText="Sending..."
        >
          Send Reset Email
        </Button>
      </VStack>
    </Box>
  );
};

export default ForgotPassword;
