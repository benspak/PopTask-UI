import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  useToast,
  Container,
  Center,
} from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import apiService from '../services/api';

const EmailVerification = () => {
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const toast = useToast();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get token from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (!token) {
          setVerificationStatus('error');
          setErrorMessage('No verification token found in the URL.');
          toast({
            title: 'Verification Error',
            description: 'No verification token found in the URL.',
            status: 'error',
            duration: 6000,
            isClosable: true,
          });
          return;
        }

        // Make API call to verify email
        const response = await apiService.verifyEmail(token);

        if (response.success) {
          setVerificationStatus('success');
          toast({
            title: 'Email Verified!',
            description: 'Your email address has been successfully verified. You can now log in.',
            status: 'success',
            duration: 6000,
            isClosable: true,
          });
        } else {
          setVerificationStatus('error');
          setErrorMessage(response.message || 'Email verification failed.');
          toast({
            title: 'Verification Error',
            description: response.message || 'Email verification failed.',
            status: 'error',
            duration: 6000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error('Email verification error:', error);
        setVerificationStatus('error');
        setErrorMessage(
          error.response?.data?.message ||
          error.message ||
          'An error occurred during email verification.'
        );
        toast({
          title: 'Verification Error',
          description: error.response?.data?.message || error.message || 'An error occurred during email verification.',
          status: 'error',
          duration: 6000,
          isClosable: true,
        });
      }
    };

    verifyEmail();
  }, [toast]);

  const handleGoToLogin = () => {
    // Navigate back to the main app
    window.history.pushState({}, '', '/');
    window.location.reload();
  };

  if (verificationStatus === 'verifying') {
    return (
      <Container maxW="md" py={10}>
        <Center>
          <VStack spacing={6}>
            <Spinner size="xl" color="blue.500" />
            <Heading size="lg">Verifying Your Email</Heading>
            <Text textAlign="center" color="gray.600">
              Please wait while we verify your email address...
            </Text>
          </VStack>
        </Center>
      </Container>
    );
  }

  if (verificationStatus === 'success') {
    return (
      <Container maxW="md" py={10}>
        <Center>
          <VStack spacing={6}>
            <CheckCircleIcon w={16} h={16} color="green.500" />
            <Heading size="lg" color="green.500">Email Verified!</Heading>
            <Text textAlign="center" color="gray.600">
              Your email address has been successfully verified. You can now log in to your PopTask account.
            </Text>
            <Button colorScheme="blue" onClick={handleGoToLogin}>
              Go to Login
            </Button>
          </VStack>
        </Center>
      </Container>
    );
  }

  return (
    <Container maxW="md" py={10}>
      <Center>
        <VStack spacing={6}>
          <WarningIcon w={16} h={16} color="red.500" />
          <Heading size="lg" color="red.500">Verification Failed</Heading>
          <Alert status="error">
            <AlertIcon />
            <Box>
              <AlertTitle>Verification Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Box>
          </Alert>
          <Button colorScheme="blue" onClick={handleGoToLogin}>
            Go Back to App
          </Button>
        </VStack>
      </Center>
    </Container>
  );
};

export default EmailVerification;
