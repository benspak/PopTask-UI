import React, { useMemo, useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  IconButton,
  Spinner,
  Alert,
  AlertIcon,
  AlertDescription,
  useColorModeValue,
  Flex,
  Checkbox,
  Tooltip,
} from '@chakra-ui/react';
import DismissibleAlert from './DismissibleAlert';
import {
  AttachmentIcon,
  LinkIcon,
  AddIcon
} from '@chakra-ui/icons';
import apiService from '../services/api';

const TaskList = ({
  tasks = [],
  loading = false,
  error = null,
  selectedTask,
  onTaskSelect,
  onTaskUpdate,
  onTaskDelete,
  onShareTask,
  onTagClick,
  searchTerm = '',
  statusFilter = 'all',
  sortBy = 'createdAt',
  sortOrder = 'desc',
  selectedProject,
  selectedTag,
  selectedDay,
  isFilteredByDay = false,
  isFilteredByTag = false,
  onClearDayFilter,
  onClearProjectFilter,
  onClearTagFilter,
  refreshLimitsTrigger = 0,
  onDismissError,
}) => {
  const [taskLimits, setTaskLimits] = useState(null);
  const [isTaskLimitAlertDismissed, setIsTaskLimitAlertDismissed] = useState(false);

  // Fetch task limits to show specific alert
  useEffect(() => {
    const fetchTaskLimits = async () => {
      try {
        const response = await apiService.getTaskLimits();
        if (response.success) {
          setTaskLimits(response.data);
        }
      } catch (err) {
        // Silently handle errors - don't show anything if we can't fetch limits
      }
    };

    fetchTaskLimits();
  }, [refreshLimitsTrigger]);

  // Reset dismissed state when limits change (e.g., when user creates/deletes tasks)
  useEffect(() => {
    if (taskLimits && taskLimits.remaining !== 2) {
      setIsTaskLimitAlertDismissed(false);
    }
  }, [taskLimits]);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const selectedBg = useColorModeValue('blue.50', 'blue.900');

  // Utility function to format dates without timezone issues
  const formatDate = (dateString) => {
    if (!dateString) return '';
    // Split the date string and take only the date part (YYYY-MM-DD)
    const dateOnly = dateString.split('T')[0];
    const [year, month, day] = dateOnly.split('-');
    // Create date in local timezone by using the date components
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString();
  };

  // Utility function to format time in seconds to readable format
  const formatTime = (seconds) => {
    if (!seconds || seconds === 0) return '0s';

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

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => {
        if (statusFilter === 'completed') return task.completed;
        if (statusFilter === 'pending') return !task.completed;
        return true;
      });
    }

    // Sort tasks
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'title':
          aValue = a.title || '';
          bValue = b.title || '';
          break;
        case 'dueDate':
          aValue = a.dueDate || '';
          bValue = b.dueDate || '';
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [tasks, searchTerm, statusFilter, sortBy, sortOrder]);

  const handleTaskClick = (task) => {
    if (onTaskSelect) {
      onTaskSelect(task);
    }
  };

  const handleToggleCompleted = async (taskId, completed) => {
    if (onTaskUpdate) {
      await onTaskUpdate(taskId, { completed: !completed });
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (onTaskDelete) {
      await onTaskDelete(taskId);
    }
  };

  const getStatusColor = (completed) => {
    return completed ? 'green' : 'blue';
  };

  if (loading) {
    return (
      <Box p={8} textAlign="center">
        <Spinner size="lg" />
        <Text mt={4}>Loading tasks...</Text>
      </Box>
    );
  }

  // Display error above the task list instead of replacing it
  const errorAlert = error ? (
    <DismissibleAlert
      status="error"
      description={error}
      onDismiss={onDismissError}
      mb={4}
      borderRadius="md"
    />
  ) : null;

  if (filteredAndSortedTasks.length === 0) {
    return (
      <Box p={4}>
        {errorAlert}
        <Box p={8} textAlign="center">
          <Text color="gray.500" fontSize="lg">
            {isFilteredByDay
              ? `No tasks on ${selectedDay}s`
              : selectedProject
              ? `No tasks in project "${selectedProject?.name || 'Unknown'}"`
              : selectedTag
              ? `No tasks with tag "${selectedTag}"`
              : searchTerm || statusFilter !== 'all'
              ? 'No tasks match your filters'
              : 'No tasks yet'}
          </Text>
          {isFilteredByDay && (
            <Button
              mt={4}
              size="sm"
              colorScheme="blue"
              variant="outline"
              onClick={onClearDayFilter}
            >
              Show All Tasks
            </Button>
          )}
          {selectedProject && !isFilteredByDay && (
            <Button
              mt={4}
              size="sm"
              colorScheme="green"
              variant="outline"
              onClick={onClearProjectFilter}
            >
              Show All Tasks
            </Button>
          )}
          {selectedTag && !isFilteredByDay && !selectedProject && (
            <Button
              mt={4}
              size="sm"
              colorScheme="purple"
              variant="outline"
              onClick={onClearTagFilter}
            >
              Show All Tasks
            </Button>
          )}
          {!selectedProject && !isFilteredByDay && !selectedTag && (
            <Text color="gray.400" fontSize="sm" mt={2}>
              Select a project to see its tasks
            </Text>
          )}
        </Box>
      </Box>
    );
  }

    return (
    <Box h="full" overflowY="auto">
      {/* Error Alert - Display above task list */}
      {errorAlert}

      {/* Task Limit Alert - Show when user has only 2 tasks remaining */}
      {taskLimits && !taskLimits.unlimited && taskLimits.remaining === 2 && !isTaskLimitAlertDismissed && (
        <Box p={4} pb={2}>
          <Alert status="info" size="sm" borderRadius="md" mb={3}>
            <AlertIcon />
            <AlertDescription fontSize="xs" flex="1">
              Only 2 tasks remaining. Upgrade to Pro for unlimited tasks.
              <Button
                size="xs"
                colorScheme="blue"
                ml={2}
                onClick={() => window.open('/#pricing', '_blank')}
              >
                Upgrade
              </Button>
            </AlertDescription>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => setIsTaskLimitAlertDismissed(true)}
              color="gray.500"
              _hover={{ color: "gray.700" }}
            >
              ✕
            </Button>
          </Alert>
        </Box>
      )}

      {/* Day Filter Indicator */}
      {isFilteredByDay && (
        <Box mb={4} p={3} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200">
          <HStack justify="space-between" align="center">
            <HStack spacing={2}>
              <Text fontSize="sm" fontWeight="medium" color="blue.800">
                📅 Filtered by {selectedDay}s
              </Text>
              <Badge colorScheme="blue" size="sm">
                {filteredAndSortedTasks.length} task{filteredAndSortedTasks.length !== 1 ? 's' : ''}
              </Badge>
            </HStack>
            <Button
              size="sm"
              variant="ghost"
              colorScheme="blue"
              onClick={onClearDayFilter}
            >
              Clear Filter
            </Button>
          </HStack>
        </Box>
      )}

      {/* Project Filter Indicator */}
      {selectedProject && !isFilteredByDay && (
        <Box mb={4} p={3} bg="gray.700" borderRadius="md" border="1px" borderColor="gray.600">
          <HStack justify="space-between" align="center">
            <HStack spacing={2}>
              <Text fontSize="sm" fontWeight="medium" color="white">
                📁 Filtered by project: {selectedProject?.name || 'Unknown'}
              </Text>
              <Badge colorScheme="green" variant="solid" size="sm">
                {filteredAndSortedTasks.length} task{filteredAndSortedTasks.length !== 1 ? 's' : ''}
              </Badge>
            </HStack>
            <Button
              size="sm"
              variant="solid"
              colorScheme="green"
              onClick={onClearProjectFilter}
            >
              Clear Filter
            </Button>
          </HStack>
        </Box>
      )}

      {/* Tag Filter Indicator */}
      {selectedTag && !isFilteredByDay && !selectedProject && (
        <Box mb={4} p={3} bg="gray.700" borderRadius="md" border="1px" borderColor="gray.600">
          <HStack justify="space-between" align="center">
            <HStack spacing={2}>
              <Text fontSize="sm" fontWeight="medium" color="white">
                🏷️ Filtered by tag: #{selectedTag}
              </Text>
              <Badge colorScheme="green" variant="solid" size="sm">
                {filteredAndSortedTasks.length} task{filteredAndSortedTasks.length !== 1 ? 's' : ''}
              </Badge>
            </HStack>
            <Button
              size="sm"
              variant="solid"
              colorScheme="green"
              onClick={onClearTagFilter}
            >
              Clear Filter
            </Button>
          </HStack>
        </Box>
      )}

      <VStack spacing={2} p={4} align="stretch">
        {filteredAndSortedTasks.map((task) => {
          const isSelected = selectedTask?._id === task._id;

          return (
            <Box
              key={task._id}
              border="1px"
              borderColor={isSelected ? 'blue.300' : borderColor}
              borderRadius="md"
              bg={isSelected ? selectedBg : bgColor}
              _hover={{ bg: hoverBg }}
              transition="all 0.2s"
              cursor="pointer"
              onClick={() => handleTaskClick(task)}
            >
              <VStack spacing={0} align="stretch">
                {/* Task Header */}
                <HStack p={3} spacing={3} align="center">
                  <Checkbox
                    isChecked={task.completed || false}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleToggleCompleted(task._id, task.completed);
                    }}
                    colorScheme="green"
                  />

                  <VStack align="start" spacing={1} flex={1}>
                    <HStack spacing={2} align="center">
                      <Text
                        fontSize="md"
                        fontWeight="medium"
                        textDecoration={task.completed ? 'line-through' : 'none'}
                        color={task.completed ? 'gray.500' : 'inherit'}
                      >
                        {task.title}
                      </Text>
                    </HStack>

                    <HStack spacing={2} fontSize="sm" color="gray.500">
                      {task.dueDate && (
                        <Text>Due: {formatDate(task.dueDate)}</Text>
                      )}
                      {task.project && (
                        <Badge
                          size="sm"
                          colorScheme="blue"
                          variant="subtle"
                          px={3}
                          py={1}
                          borderRadius="md"
                        >
                          {task.project}
                        </Badge>
                      )}
                    </HStack>

                    {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                      <HStack spacing={1} flexWrap="wrap">
                        {task.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            size="sm"
                            colorScheme="gray"
                            variant="outline"
                            px={2}
                            py={0.5}
                            borderRadius="sm"
                            fontSize="xs"
                            cursor="pointer"
                            _hover={{ bg: "gray.100" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onTagClick(tag);
                            }}
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </HStack>
                    )}

                    {/* Time Tracking Info */}
                    <HStack spacing={2}>
                      {task.timeTracking?.totalTime > 0 && (
                        <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                          {formatTime(task.timeTracking.totalTime)}
                        </Badge>
                      )}
                      {task.timeTracking?.isRunning && (
                        <Badge colorScheme="green" variant="solid" fontSize="xs">
                          Live
                        </Badge>
                      )}
                    </HStack>
                  </VStack>

                  <HStack spacing={1}>
                    {task.fileAttachments && task.fileAttachments.length > 0 && (
                      <Tooltip label={`${task.fileAttachments.length} file(s) attached`}>
                        <IconButton
                          size="sm"
                          variant="ghost"
                          icon={<AttachmentIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        />
                      </Tooltip>
                    )}

                    <Tooltip label="Share Task">
                      <IconButton
                        size="sm"
                        variant="ghost"
                        icon={<LinkIcon />}
                        colorScheme="green"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onShareTask) {
                            onShareTask(task);
                          }
                        }}
                      />
                    </Tooltip>
                  </HStack>
                </HStack>
              </VStack>
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
};

export default TaskList;
