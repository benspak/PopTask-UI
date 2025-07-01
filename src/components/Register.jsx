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
  FormHelperText,
  useToast,
  Container,
  Center,
  Link,
  InputGroup,
  InputRightElement,
  IconButton,
  Progress,
  HStack,
  Text as ChakraText,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
import apiService from '../services/api';

const Register = ({ setIsAuthenticated, setUser, onSwitchToLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    displayName: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const toast = useToast();

  // Password strength indicators
  const passwordRequirements = {
    length: formData.password.length >= 12,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password),
  };

  const passwordStrength = Object.values(passwordRequirements).filter(Boolean).length;

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, underscores, and hyphens';
    }

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 12) {
      newErrors.password = 'Password must be at least 12 characters';
    } else if (!passwordRequirements.uppercase || !passwordRequirements.lowercase || !passwordRequirements.special) {
      newErrors.password = 'Password must contain uppercase, lowercase, and special characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
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
      const response = await apiService.register(formData);

      // Check if registration was successful (201 status and has message)
      if (response.message && response.message.includes('registered successfully')) {
        // Store user data for email verification status
        if (response.user) {
          localStorage.setItem('userData', JSON.stringify(response.user));

          // Update authentication state
          setIsAuthenticated(true);
          setUser(response.user);
        }

        toast({
          title: 'Account Created Successfully!',
          description: `${response.message} You can now access your dashboard!`,
          status: 'success',
          duration: 8000,
          isClosable: true,
        });

        // Show email verification notice
        setTimeout(() => {
          toast({
            title: 'Email Verification',
            description: 'We\'ve sent a verification link to your email. Please check your inbox and click the link to verify your account.',
            status: 'info',
            duration: 10000,
            isClosable: true,
          });
        }, 1000);

        // Navigate to dashboard
        navigate('/');
      } else {
        // Handle unexpected response format
        toast({
          title: 'Registration Issue',
          description: response.message || 'There was an issue with your registration. Please try again.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      const errorTitle = 'Registration Failed';

      // Clear previous field errors
      setErrors({});

      // Check for specific field errors and set them on the form
      if (errorMessage.includes('username is already taken') || errorMessage.includes('username already exists')) {
        setErrors(prev => ({ ...prev, username: 'This username is already taken' }));
        toast({
          title: 'Username Already Exists',
          description: 'An account with this username already exists. Please choose a different username.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else if (errorMessage.includes('email already exists') || errorMessage.includes('email is already taken')) {
        setErrors(prev => ({ ...prev, email: 'An account with this email already exists' }));
        toast({
          title: 'Account Already Exists',
          description: 'An account with this email address already exists. Please sign in instead.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else if (errorMessage.includes('validation failed')) {
        // Handle validation errors
        const validationErrors = error.response?.data?.errors;
        if (validationErrors) {
          Object.keys(validationErrors).forEach(field => {
            setErrors(prev => ({ ...prev, [field]: validationErrors[field].message }));
          });
        }
        toast({
          title: 'Invalid Information',
          description: 'Please check the form and correct any errors.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else if (error.response?.status === 429) {
        toast({
          title: 'Too Many Attempts',
          description: 'Too many registration attempts. Please wait a few minutes before trying again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else if (error.response?.status >= 500) {
        toast({
          title: 'Server Error',
          description: 'Our servers are experiencing issues. Please try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else {
        // Generic error handling
        toast({
          title: errorTitle,
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const RequirementItem = ({ met, text }) => (
    <HStack spacing={2}>
      {met ? (
        <CheckIcon color="green.500" size="sm" />
      ) : (
        <CloseIcon color="red.500" size="sm" />
      )}
      <ChakraText fontSize="sm" color={met ? "green.500" : "red.500"}>
        {text}
      </ChakraText>
    </HStack>
  );

  return (
    <Container maxW="md" py={10}>
      <Center>
        <VStack spacing={8} w="full">
          <VStack spacing={2}>
            <Heading size="lg">Create Account</Heading>
            <Text color="gray.600" textAlign="center">
              Join PopTask to organize your tasks efficiently
            </Text>
          </VStack>

          <Box as="form" onSubmit={handleSubmit} w="full">
            <VStack spacing={4}>
              <HStack spacing={4} w="full">
                <FormControl isInvalid={!!errors.firstName}>
                  <FormLabel>First Name</FormLabel>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="First name"
                  />
                  <FormErrorMessage>{errors.firstName}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.lastName}>
                  <FormLabel>Last Name</FormLabel>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Last name"
                  />
                  <FormErrorMessage>{errors.lastName}</FormErrorMessage>
                </FormControl>
              </HStack>

              <FormControl isInvalid={!!errors.email}>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.username}>
                <FormLabel>Username</FormLabel>
                <Input
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value.toLowerCase())}
                  placeholder="Choose a username"
                />
                <FormErrorMessage>{errors.username}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.displayName}>
                <FormLabel>Display Name</FormLabel>
                <Input
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  placeholder="How should we call you?"
                />
                <FormErrorMessage>{errors.displayName}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.password}>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Create a strong password"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  </InputRightElement>
                </InputGroup>
                <FormHelperText>
                  <VStack align="start" spacing={1} mt={2}>
                    <Progress
                      value={passwordStrength * 25}
                      size="sm"
                      colorScheme={passwordStrength >= 3 ? "green" : passwordStrength >= 2 ? "yellow" : "red"}
                      w="full"
                    />
                    <RequirementItem met={passwordRequirements.length} text="At least 12 characters" />
                    <RequirementItem met={passwordRequirements.uppercase} text="One uppercase letter" />
                    <RequirementItem met={passwordRequirements.lowercase} text="One lowercase letter" />
                    <RequirementItem met={passwordRequirements.special} text="One special character" />
                  </VStack>
                </FormHelperText>
                <FormErrorMessage>{errors.password}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.confirmPassword}>
                <FormLabel>Confirm Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm your password"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                loadingText="Creating account..."
              >
                Create Account
              </Button>
            </VStack>
          </Box>

          <VStack spacing={2}>
            <Text fontSize="sm" color="gray.600">
              Already have an account?{' '}
              <Link color="blue.500" onClick={onSwitchToLogin}>
                Sign in
              </Link>
            </Text>
          </VStack>
        </VStack>
      </Center>
    </Container>
  );
};

export default Register;
