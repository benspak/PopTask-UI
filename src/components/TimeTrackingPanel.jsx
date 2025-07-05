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
  const [estimatedHours, setEstimatedHours] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState('');
  const [isEditingEstimate, setIsEditingEstimate] = useState(false);
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Convert minutes to hours and minutes
  const minutesToHoursMinutes = (totalMinutes) => {
    if (!totalMinutes || totalMinutes === 0) return { hours: '', minutes: '' };
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { hours: hours.toString(), minutes: minutes.toString() };
  };

  // Convert hours and minutes to total minutes
  const hoursMinutesToMinutes = (hours, minutes) => {
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    return h * 60 + m;
  };

  // Format estimated time for display
  const formatEstimatedTime = (minutes) => {
    if (!minutes || minutes === 0) return 'Not set';
    const { hours, minutes: mins } = minutesToHoursMinutes(minutes);
    if (parseInt(hours) > 0) {
      return `${hours}h ${mins}m`;
    } else {
      return `${mins}m`;
    }
  };

  useEffect(() => {
    if (task) {
      fetchTimeSummary();
      const { hours, minutes } = minutesToHoursMinutes(task.estimatedTime);
      setEstimatedHours(hours);
      setEstimatedMinutes(minutes);
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
      const totalMinutes = hoursMinutesToMinutes(estimatedHours, estimatedMinutes);

      if (totalMinutes < 0) {
        toast({
          title: 'Invalid time',
          description: 'Please enter a valid time (hours and minutes)',
          status: 'error',
          duration: 3000,
        });
        return;
      }

      await apiService.updateTaskEstimatedTime(task._id, totalMinutes);
      setIsEditingEstimate(false);

      // Refetch time summary to update the UI with new estimated time
      await fetchTimeSummary();

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
                <VStack spacing={2} align="start">
                  <HStack spacing={2}>
                    <Input
                      size="sm"
                      value={estimatedHours}
                      onChange={(e) => setEstimatedHours(e.target.value)}
                      placeholder="Hours"
                      w="60px"
                      type="number"
                      min="0"
                    />
                    <Text fontSize="sm">h</Text>
                    <Input
                      size="sm"
                      value={estimatedMinutes}
                      onChange={(e) => setEstimatedMinutes(e.target.value)}
                      placeholder="Minutes"
                      w="60px"
                      type="number"
                      min="0"
                      max="59"
                    />
                    <Text fontSize="sm">m</Text>
                  </HStack>
                  <HStack spacing={2}>
                    <Button size="sm" onClick={handleUpdateEstimatedTime}>
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setIsEditingEstimate(false)}>
                      Cancel
                    </Button>
                  </HStack>
                </VStack>
              ) : (
                <HStack>
                  <Text>{formatEstimatedTime(timeSummary.estimatedTime)}</Text>
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
