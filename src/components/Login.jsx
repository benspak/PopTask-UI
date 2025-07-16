import React, { useState } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
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
  HStack,
  Divider,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext';

const Login = ({ onSwitchToRegister, onSwitchToForgotPassword }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null); // 'google'
  const toast = useToast();

  // Get the redirect URL from location state
  const from = location.state?.from || '/dashboard';
  const message = location.state?.message;

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
      // Use the login function from AuthContext
      const response = await login(formData);

      toast({
        title: 'Login Successful!',
        description: `Welcome back, ${response.user.firstName}!`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Navigate to the original destination or dashboard
      navigate(from);
    } catch (error) {
      const errorMessage = error.message || 'Login failed. Please try again.';

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

  const handleOAuthLogin = (provider) => {
    setOauthLoading(provider);

    // Redirect to OAuth provider
    const backendUrl = process.env.NODE_ENV === 'production'
      ? window.location.origin.replace('5173', '3001')
      : 'http://localhost:3001';

    window.location.href = `${backendUrl}/api/auth/${provider}`;
  };

  return (
    <Container maxW="md" py={10}>
      <Center>
        <VStack spacing={8} w="full">
          <VStack spacing={2}>
            <HStack spacing={2} mb={4}>
              <Link as={RouterLink} to="/" color="blue.500" fontSize="sm">
                ← Back to Homepage
              </Link>
            </HStack>
            <Heading size="lg">Welcome Back</Heading>
            <Text color="gray.600" textAlign="center">
              Sign in to your PopVia account
            </Text>
            {message && (
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Text fontSize="sm">{message}</Text>
              </Alert>
            )}
          </VStack>

          {/* OAuth Login Buttons */}
          <VStack spacing={3} w="full">
            <Button
              w="full"
              size="lg"
              variant="outline"
              onClick={() => handleOAuthLogin('google')}
              isLoading={oauthLoading === 'google'}
              loadingText="Connecting to Google..."
              leftIcon={
                <Box as="span" fontSize="18px">
                  🔍
                </Box>
              }
            >
              Continue with Google
            </Button>


          </VStack>

          <HStack w="full" spacing={4}>
            <Divider />
            <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
              or
            </Text>
            <Divider />
          </HStack>

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
