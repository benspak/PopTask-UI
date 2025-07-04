import React, { useState, useEffect } from 'react';
import {
  Button,
  HStack,
  Text,
  useToast,
  Tooltip,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { TimeIcon } from '@chakra-ui/icons';
import apiService from '../services/api';

const TimeTrackingButton = ({ task, onTimeUpdate }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    if (task?.timeTracking) {
      setIsTracking(task.timeTracking.isRunning);
      setTotalTime(task.timeTracking.totalTime || 0);
    }
  }, [task]);

  useEffect(() => {
    let interval;
    if (isTracking) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  };

  const handleStartTimer = async () => {
    try {
      await apiService.startTaskTimer(task._id);
      setIsTracking(true);
      setElapsedTime(0);
      toast({
        title: 'Timer Started',
        description: 'Time tracking has begun',
        status: 'success',
        duration: 3000,
      });
      if (onTimeUpdate) onTimeUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start timer',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleStopTimer = async () => {
    try {
      const response = await apiService.stopTaskTimer(task._id);
      setIsTracking(false);
      setTotalTime(prev => prev + response.data.sessionDuration);
      setElapsedTime(0);
      toast({
        title: 'Timer Stopped',
        description: `Session completed: ${formatTime(response.data.sessionDuration)}`,
        status: 'success',
        duration: 3000,
      });
      if (onTimeUpdate) onTimeUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to stop timer',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <HStack spacing={3}>
      <Button
        size="sm"
        colorScheme={isTracking ? 'red' : 'blue'}
        variant={isTracking ? 'solid' : 'outline'}
        onClick={isTracking ? handleStopTimer : handleStartTimer}
        leftIcon={<TimeIcon />}
      >
        {isTracking ? 'Stop' : 'Start'} Timer
      </Button>

      {isTracking && (
        <Badge colorScheme="green" variant="subtle">
          {formatTime(elapsedTime)}
        </Badge>
      )}

      {totalTime > 0 && (
        <Tooltip label="Total time tracked">
          <Badge colorScheme="blue" variant="outline">
            Total: {formatTime(totalTime)}
          </Badge>
        </Tooltip>
      )}
    </HStack>
  );
};

export default TimeTrackingButton;
