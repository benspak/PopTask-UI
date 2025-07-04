import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner, Center, Text, VStack } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';

export default function AuthGuard({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
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

  return children;
}
