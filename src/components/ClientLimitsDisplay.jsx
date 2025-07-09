import React, { useState, useEffect } from 'react';
import {
  Box,
  HStack,
  Text,
  Badge,
  Alert,
  AlertIcon,
  AlertDescription,
  Button,
  useColorModeValue,
  Spinner,
} from '@chakra-ui/react';
import { InfoIcon, StarIcon } from '@chakra-ui/icons';
import apiService from '../services/api';

const ClientLimitsDisplay = ({ showNotification = true, refreshTrigger = 0 }) => {
  const [limits, setLimits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  useEffect(() => {
    const fetchLimits = async () => {
      try {
        setLoading(true);
        const response = await apiService.getClientLimits();

        if (response.success) {
          setLimits(response.data);
        } else {
          setError('Failed to fetch limits');
        }
      } catch (err) {
        // Don't show error for authentication issues - user might not be logged in yet
        if (err.message.includes('Authentication required') || err.message.includes('No token provided')) {
          setError(null);
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLimits();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <Box p={2} textAlign="center">
        <Spinner size="sm" />
      </Box>
    );
  }

  if (error || !limits) {
    return null; // Don't show anything if there's an error or no limits data
  }

  if (!limits) {
    return null;
  }

  const isAtLimit = limits.current >= limits.limit;
  const isUnlimited = limits.unlimited;
  const remaining = limits.remaining;
  const isProUser = limits.userType === 'pro' || limits.unlimited;

  return (
    <Box>
      {/* Limit Reached Notification - Only show for basic users */}
      {showNotification && isAtLimit && !isUnlimited && (
        <Alert status="warning" size="sm" borderRadius="md" mb={3}>
          <AlertIcon />
          <AlertDescription fontSize="xs">
            Client limit reached! Upgrade to Pro for unlimited clients.
            <Button
              size="xs"
              colorScheme="blue"
              ml={2}
              onClick={() => window.open('/#pricing', '_blank')}
            >
              Upgrade
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Enhanced Limit Warning for Basic Users */}
      {showNotification && !isUnlimited && remaining !== null && remaining <= 1 && remaining > 0 && (
        <Alert status="info" size="sm" borderRadius="md" mb={3}>
          <AlertIcon />
          <AlertDescription fontSize="xs">
            Only {remaining} client{remaining === 1 ? '' : 's'} remaining. Upgrade to Pro for unlimited clients.
            <Button
              size="xs"
              colorScheme="blue"
              ml={2}
              onClick={() => window.open('/#pricing', '_blank')}
            >
              Upgrade
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </Box>
  );
};

export default ClientLimitsDisplay;
