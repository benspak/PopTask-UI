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
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import apiService from '../services/api';

const Login = ({ setIsAuthenticated, setUser, onSwitchToRegister, onSwitchToForgotPassword }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const toast = useToast();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      const response = await apiService.login(formData);

      // Check if login was successful (has message and user data)
      if (response.message && (response.message.includes('successful') || response.message === 'Login successful') && response.user) {
        // Store user data for email verification status
        localStorage.setItem('userData', JSON.stringify(response.user));

        // Update authentication state
        setIsAuthenticated(true);
        setUser(response.user);

        toast({
          title: 'Login Successful!',
          description: `Welcome back, ${response.user.firstName}!`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        // Navigate to dashboard
        navigate('/');
      } else {
        toast({
          title: 'Login Failed',
          description: response.message || 'Invalid credentials',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';

      toast({
        title: 'Login Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="md" py={10}>
      <Center>
        <VStack spacing={8} w="full">
          <VStack spacing={2}>
            <Heading size="lg">Welcome Back</Heading>
            <Text color="gray.600" textAlign="center">
              Sign in to your PopTask account
            </Text>
          </VStack>

          <Box as="form" onSubmit={handleSubmit} w="full">
            <VStack spacing={4}>
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

              <FormControl isInvalid={!!errors.password}>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter your password"
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
                <FormErrorMessage>{errors.password}</FormErrorMessage>
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                w="full"
                isLoading={isLoading}
                loadingText="Signing in..."
              >
                Sign In
              </Button>
            </VStack>
          </Box>

          <VStack spacing={2}>
            <Text fontSize="sm" color="gray.600">
              Don't have an account?{' '}
              <Link color="blue.500" onClick={onSwitchToRegister}>
                Sign up
              </Link>
            </Text>
            <Link color="blue.500" fontSize="sm" onClick={onSwitchToForgotPassword}>
              Forgot your password?
            </Link>
          </VStack>
        </VStack>
      </Center>
    </Container>
  );
};

export default Login;
