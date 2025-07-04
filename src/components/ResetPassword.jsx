import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  FormHelperText,
  useToast,
  Container,
  Center,
  Link,
  Alert,
  AlertIcon,
  InputGroup,
  InputRightElement,
  IconButton,
  Progress,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
import apiService from '../services/api';

const ResetPassword = ({ onBackToLogin }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState('');
  const toast = useToast();

  // Password strength indicators
  const passwordRequirements = {
    length: formData.newPassword.length >= 12,
    uppercase: /[A-Z]/.test(formData.newPassword),
    lowercase: /[a-z]/.test(formData.newPassword),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.newPassword),
  };

  const passwordStrength = Object.values(passwordRequirements).filter(Boolean).length;

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      toast({
        title: 'Invalid Reset Link',
        description: 'The password reset link is invalid or missing the token.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      navigate('/forgot-password');
      return;
    }
    setToken(tokenFromUrl);
  }, [searchParams, navigate, toast]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 12) {
      newErrors.newPassword = 'Password must be at least 12 characters long';
    } else if (!/[A-Z]/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one lowercase letter';
    } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one special character';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await apiService.resetPassword(token, formData.newPassword);

      setIsSuccess(true);
      toast({
        title: 'Password Reset Successful',
        description: 'Your password has been reset successfully. You can now log in with your new password.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = error.message || 'Failed to reset password. Please try again.';

      if (error.message?.includes('invalid') || error.message?.includes('expired')) {
        toast({
          title: 'Invalid Reset Link',
          description: 'This reset link is invalid or has expired. Please request a new one.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        navigate('/forgot-password');
      } else {
        setErrors({ submit: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Center>
        <VStack spacing={6} textAlign="center">
          <Alert status="success" borderRadius="md">
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold">Password Reset Successful!</Text>
              <Text fontSize="sm">
                Your password has been reset successfully. Redirecting to login...
              </Text>
            </VStack>
          </Alert>

          <Button
            variant="outline"
            colorScheme="blue"
            onClick={() => navigate('/login')}
          >
            Go to Login
          </Button>
        </VStack>
      </Center>
    );
  }

  if (!token) {
    return (
      <Center>
        <VStack spacing={6} textAlign="center">
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Text>Loading reset token...</Text>
          </Alert>
        </VStack>
      </Center>
    );
  }

  return (
    <Box as="form" onSubmit={handleSubmit} w="full">
      <VStack spacing={4}>
        {errors.submit && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {errors.submit}
          </Alert>
        )}

        <FormControl isInvalid={!!errors.newPassword}>
          <FormLabel color="gray.300">New Password</FormLabel>
          <InputGroup>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              placeholder="Enter your new password"
              bg="gray.800"
              borderColor="gray.600"
              color="white"
              _placeholder={{ color: 'gray.400' }}
              _hover={{ borderColor: 'gray.500' }}
              _focus={{ borderColor: 'blue.400', boxShadow: 'none' }}
            />
            <InputRightElement>
              <IconButton
                icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                onClick={() => setShowPassword(!showPassword)}
                variant="ghost"
                color="gray.400"
                _hover={{ color: 'white' }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              />
            </InputRightElement>
          </InputGroup>
          <FormHelperText color="gray.400">
            Password strength: {passwordStrength}/4
          </FormHelperText>
          <Progress
            value={(passwordStrength / 4) * 100}
            size="sm"
            colorScheme={passwordStrength <= 1 ? 'red' : passwordStrength <= 2 ? 'orange' : passwordStrength <= 3 ? 'yellow' : 'green'}
            mt={2}
          />
          <FormErrorMessage>{errors.newPassword}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.confirmPassword}>
          <FormLabel color="gray.300">Confirm New Password</FormLabel>
          <InputGroup>
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              placeholder="Confirm your new password"
              bg="gray.800"
              borderColor="gray.600"
              color="white"
              _placeholder={{ color: 'gray.400' }}
              _hover={{ borderColor: 'gray.500' }}
              _focus={{ borderColor: 'blue.400', boxShadow: 'none' }}
            />
            <InputRightElement>
              <IconButton
                icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                variant="ghost"
                color="gray.400"
                _hover={{ color: 'white' }}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              />
            </InputRightElement>
          </InputGroup>
          <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
        </FormControl>

        <Button
          type="submit"
          colorScheme="blue"
          size="lg"
          w="full"
          isLoading={isLoading}
          loadingText="Resetting Password..."
        >
          Reset Password
        </Button>

        <Text fontSize="sm" color="gray.400" textAlign="center">
          Remember your password?{' '}
          <Link color="blue.300" onClick={onBackToLogin}>
            Sign in
          </Link>
        </Text>
      </VStack>
    </Box>
  );
};

export default ResetPassword;
