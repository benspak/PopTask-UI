import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Divider,
  Badge,
  useToast,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import { TimeIcon, EditIcon } from '@chakra-ui/icons';
import apiService from '../services/api';

const TimeTrackingPanel = ({ task, onTimeUpdate }) => {
  const [timeSummary, setTimeSummary] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState('');
  const [isEditingEstimate, setIsEditingEstimate] = useState(false);
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    if (task) {
      fetchTimeSummary();
      setEstimatedTime(task.timeTracking?.estimatedTime?.toString() || '');
    }
  }, [task]);

  const fetchTimeSummary = async () => {
    try {
      const data = await apiService.getTaskTimeSummary(task._id);
      setTimeSummary(data.data);
    } catch (error) {
      console.error('Failed to fetch time summary:', error);
    }
  };

  const handleUpdateEstimatedTime = async () => {
    try {
      const minutes = parseInt(estimatedTime);
      if (isNaN(minutes) || minutes < 0) {
        toast({
          title: 'Invalid time',
          description: 'Please enter a valid number of minutes',
          status: 'error',
          duration: 3000,
        });
        return;
      }

      await apiService.updateTaskEstimatedTime(task._id, minutes);
      setIsEditingEstimate(false);
      toast({
        title: 'Success',
        description: 'Estimated time updated',
        status: 'success',
        duration: 3000,
      });
      if (onTimeUpdate) onTimeUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update estimated time',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  if (!timeSummary) return null;

  return (
    <Box p={4} border="1px" borderColor={borderColor} borderRadius="md" bg={bgColor}>
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Text fontWeight="semibold">Time Tracking</Text>
          <Badge colorScheme={timeSummary.isActive ? 'green' : 'gray'}>
            {timeSummary.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </HStack>

        <HStack spacing={6}>
          <Stat>
            <StatLabel>Total Time</StatLabel>
            <StatNumber>{formatTime(timeSummary.totalTime)}</StatNumber>
            <StatHelpText>{timeSummary.sessionCount} sessions</StatHelpText>
          </Stat>

          <Stat>
            <StatLabel>Estimated Time</StatLabel>
            <StatNumber>
              {isEditingEstimate ? (
                <HStack>
                  <Input
                    size="sm"
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(e.target.value)}
                    placeholder="Minutes"
                    w="60px"
                  />
                  <Button size="sm" onClick={handleUpdateEstimatedTime}>
                    Save
                  </Button>
                </HStack>
              ) : (
                <HStack>
                  <Text>{timeSummary.estimatedTime ? `${timeSummary.estimatedTime}m` : 'Not set'}</Text>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditingEstimate(true)}>
                    <EditIcon />
                  </Button>
                </HStack>
              )}
            </StatNumber>
          </Stat>
        </HStack>

        {timeSummary.estimatedTime && timeSummary.totalTime > 0 && (
          <Box>
            <Text fontSize="sm" color="gray.500">
              Progress: {Math.round((timeSummary.totalTime / (timeSummary.estimatedTime * 60)) * 100)}%
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default TimeTrackingPanel;
