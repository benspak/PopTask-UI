import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner, Center, Text, VStack } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import EmailVerificationPrompt from './EmailVerificationPrompt';

export default function AuthGuard({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading...</Text>
        </VStack>
      </Center>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login with the current location as state
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user is authenticated but email is not verified
  if (user && !user.isEmailVerified) {
    return <EmailVerificationPrompt user={user} />;
  }

  return children;
}
