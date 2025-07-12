import React, { useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Container,
  Center,
  Spinner,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
} from '@chakra-ui/react';
import { EmailIcon, CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import apiService from '../services/api';

const EmailVerificationPrompt = ({ user, onVerificationComplete }) => {
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState(user?.email || '');
  const [isValidEmail, setIsValidEmail] = useState(true);
  const toast = useToast();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setIsValidEmail(validateEmail(newEmail));
  };

  const handleResendVerification = async () => {
    if (!validateEmail(email)) {
      setIsValidEmail(false);
      return;
    }

    setIsResending(true);
    try {
      await apiService.resendVerification({ email });
      toast({
        title: 'Verification Email Sent',
        description: 'Please check your email for the verification link.',
        status: 'success',
        duration: 6000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Failed to Send Email',
        description: error.response?.data?.message || 'Failed to send verification email. Please try again.',
        status: 'error',
        duration: 6000,
        isClosable: true,
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/login';
    }
  };

  return (
    <Container maxW="md" py={10}>
      <Center>
        <VStack spacing={6} w="full">
          <WarningIcon w={16} h={16} color="orange.500" />
          <Heading size="lg" color="orange.500">Email Verification Required</Heading>

          <Alert status="warning">
            <AlertIcon />
            <Box>
              <AlertTitle>Please verify your email</AlertTitle>
              <AlertDescription>
                You need to verify your email address before you can access PopTask.
                Check your email for a verification link.
              </AlertDescription>
            </Box>
          </Alert>

          <Text textAlign="center" color="gray.600">
            Didn't receive the email? Enter your email address below and we'll send you a new verification link.
          </Text>

          <FormControl isInvalid={!isValidEmail}>
            <FormLabel>Email Address</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email address"
              size="lg"
            />
            {!isValidEmail && (
              <FormErrorMessage>Please enter a valid email address</FormErrorMessage>
            )}
          </FormControl>

          <Button
            leftIcon={<EmailIcon />}
            colorScheme="blue"
            size="lg"
            onClick={handleResendVerification}
            isLoading={isResending}
            loadingText="Sending..."
            w="full"
          >
            Resend Verification Email
          </Button>

          <Button
            variant="ghost"
            onClick={handleLogout}
            size="md"
          >
            Back to Login
          </Button>
        </VStack>
      </Center>
    </Container>
  );
};

export default EmailVerificationPrompt;
