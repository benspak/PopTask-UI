import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  useToast,
  Container,
  Center,
} from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext';

const OAuthCallback = () => {
  const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { oauthLogin } = useAuth();
  const toast = useToast();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Get parameters from URL
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refreshToken');
        const provider = searchParams.get('provider');
        const error = searchParams.get('error');

        if (error) {
          setStatus('error');
          setErrorMessage('OAuth authentication failed. Please try again.');
          toast({
            title: 'Authentication Failed',
            description: 'OAuth authentication failed. Please try again.',
            status: 'error',
            duration: 6000,
            isClosable: true,
          });
          return;
        }

        if (!token || !refreshToken) {
          setStatus('error');
          setErrorMessage('Invalid OAuth response. Missing authentication tokens.');
          toast({
            title: 'Authentication Error',
            description: 'Invalid OAuth response. Please try again.',
            status: 'error',
            duration: 6000,
            isClosable: true,
          });
          return;
        }

        // Use the oauthLogin method to handle authentication
        await oauthLogin(token, refreshToken);

        setStatus('success');
        toast({
          title: 'Authentication Successful!',
          description: `Successfully signed in with ${provider}.`,
          status: 'success',
          duration: 4000,
          isClosable: true,
        });

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1500);

      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setErrorMessage('Failed to complete authentication. Please try again.');
        toast({
          title: 'Authentication Error',
          description: 'Failed to complete authentication. Please try again.',
          status: 'error',
          duration: 6000,
          isClosable: true,
        });
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, oauthLogin, toast]);

  if (status === 'processing') {
    return (
      <Container maxW="md" py={10}>
        <Center>
          <VStack spacing={6}>
            <Spinner size="xl" />
            <Heading size="md">Completing Authentication</Heading>
            <Text textAlign="center">
              Please wait while we complete your authentication...
            </Text>
          </VStack>
        </Center>
      </Container>
    );
  }

  if (status === 'success') {
    return (
      <Container maxW="md" py={10}>
        <Center>
          <VStack spacing={6}>
            <CheckCircleIcon w={12} h={12} color="green.500" />
            <Heading size="md" color="green.500">
              Authentication Successful!
            </Heading>
            <Text textAlign="center">
              You have been successfully authenticated. Redirecting to dashboard...
            </Text>
          </VStack>
        </Center>
      </Container>
    );
  }

  return (
    <Container maxW="md" py={10}>
      <Center>
        <VStack spacing={6}>
          <WarningIcon w={12} h={12} color="red.500" />
          <Heading size="md" color="red.500">
            Authentication Failed
          </Heading>
          <Alert status="error">
            <AlertIcon />
            <Box>
              <AlertTitle>Authentication Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Box>
          </Alert>
          <Text textAlign="center">
            Please try logging in again or contact support if the problem persists.
          </Text>
        </VStack>
      </Center>
    </Container>
  );
};

export default OAuthCallback;
