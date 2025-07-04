import React, { useState, useEffect } from 'react';
import { Box, Text, Button, VStack, HStack, Badge, Input, FormControl, FormLabel } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

const DebugAuth = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [debugInfo, setDebugInfo] = useState({});
  const [sharedTasks, setSharedTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [manualToken, setManualToken] = useState('');

  const checkAuthStatus = async () => {
    const info = {
      isAuthenticated,
      isLoading,
      user: user ? { username: user.username, email: user.email } : null,
      hasToken: !!localStorage.getItem('popTask_accessToken'),
      hasRefreshToken: !!localStorage.getItem('popTask_refreshToken'),
      token: localStorage.getItem('popTask_accessToken')?.substring(0, 50) + '...',
      refreshToken: localStorage.getItem('popTask_refreshToken')?.substring(0, 50) + '...',
    };
    setDebugInfo(info);
  };

  const testSharedTasks = async () => {
    setLoading(true);
    try {
      const response = await apiService.getSharedTasks();
      setSharedTasks(response.data || []);
      console.log('Shared tasks response:', response);
    } catch (error) {
      console.error('Error fetching shared tasks:', error);
      setSharedTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const setTokenManually = () => {
    if (manualToken) {
      localStorage.setItem('popTask_accessToken', manualToken);
      checkAuthStatus();
      console.log('Token set manually');
    }
  };

  const clearTokens = () => {
    localStorage.removeItem('popTask_accessToken');
    localStorage.removeItem('popTask_refreshToken');
    checkAuthStatus();
    console.log('Tokens cleared');
  };

  useEffect(() => {
    checkAuthStatus();
  }, [isAuthenticated, user, isLoading]);

  return (
    <Box p={4} border="1px" borderColor="gray.200" borderRadius="md" bg="gray.50" mb={4}>
      <Text fontWeight="bold" mb={2}>Debug Authentication</Text>

      <VStack align="start" spacing={2} mb={4}>
        <HStack>
          <Text>Authenticated:</Text>
          <Badge colorScheme={isAuthenticated ? 'green' : 'red'}>
            {isAuthenticated ? 'Yes' : 'No'}
          </Badge>
        </HStack>

        <HStack>
          <Text>Loading:</Text>
          <Badge colorScheme={isLoading ? 'yellow' : 'green'}>
            {isLoading ? 'Yes' : 'No'}
          </Badge>
        </HStack>

        <HStack>
          <Text>User:</Text>
          <Text>{user?.username || 'None'}</Text>
        </HStack>

        <HStack>
          <Text>Has Token:</Text>
          <Badge colorScheme={debugInfo.hasToken ? 'green' : 'red'}>
            {debugInfo.hasToken ? 'Yes' : 'No'}
          </Badge>
        </HStack>

        <HStack>
          <Text>Has Refresh Token:</Text>
          <Badge colorScheme={debugInfo.hasRefreshToken ? 'green' : 'red'}>
            {debugInfo.hasRefreshToken ? 'Yes' : 'No'}
          </Badge>
        </HStack>

        <Text fontSize="sm" color="gray.600">
          Token: {debugInfo.token || 'None'}
        </Text>
      </VStack>

      <VStack spacing={3} mb={4}>
        <Button onClick={testSharedTasks} isLoading={loading} colorScheme="blue">
          Test Shared Tasks API
        </Button>

        <Button onClick={checkAuthStatus} colorScheme="gray">
          Refresh Auth Status
        </Button>

        <Button onClick={clearTokens} colorScheme="red" size="sm">
          Clear Tokens
        </Button>
      </VStack>

      <FormControl mb={4}>
        <FormLabel fontSize="sm">Manual Token (for testing):</FormLabel>
        <HStack>
          <Input
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
            placeholder="Paste token here..."
            size="sm"
          />
          <Button onClick={setTokenManually} size="sm" colorScheme="green">
            Set Token
          </Button>
        </HStack>
      </FormControl>

      {sharedTasks.length > 0 && (
        <Box>
          <Text fontWeight="bold" mb={2}>Shared Tasks ({sharedTasks.length}):</Text>
          <VStack align="start" spacing={1}>
            {sharedTasks.map((task, index) => (
              <Text key={index} fontSize="sm">
                • {task.title} (by {task.owner?.username || 'unknown'})
              </Text>
            ))}
          </VStack>
        </Box>
      )}
    </Box>
  );
};

export default DebugAuth;
