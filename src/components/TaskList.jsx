import React, { useState, useMemo } from 'react';
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
  useColorModeValue,
  Flex,
  Checkbox,
  Tooltip,
} from '@chakra-ui/react';
import {
  ChevronRightIcon,
  AttachmentIcon,
  EditIcon,
  DeleteIcon,
  AddIcon
} from '@chakra-ui/icons';

const TaskList = ({
  tasks = [],
  loading = false,
  error = null,
  selectedTask,
  onTaskSelect,
  onTaskUpdate,
  onTaskDelete,
  searchTerm = '',
  statusFilter = 'all',
  sortBy = 'createdAt',
  sortOrder = 'desc',
  selectedProject,
}) => {
  const [expandedTasks, setExpandedTasks] = useState({});

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const selectedBg = useColorModeValue('blue.50', 'blue.900');

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

  const toggleExpanded = (taskId) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
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

  if (error) {
    return (
      <Box p={4}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Box>
    );
  }

  if (filteredAndSortedTasks.length === 0) {
    return (
      <Box p={8} textAlign="center">
        <Text color="gray.500" fontSize="lg">
          {searchTerm || statusFilter !== 'all'
            ? 'No tasks match your filters'
            : 'No tasks yet'}
        </Text>
        {!selectedProject && (
          <Text color="gray.400" fontSize="sm" mt={2}>
            Select a project to see its tasks
          </Text>
        )}
      </Box>
    );
  }

  return (
    <Box h="full" overflowY="auto">
      <VStack spacing={2} p={4} align="stretch">
        {filteredAndSortedTasks.map((task) => {
          const isSelected = selectedTask?._id === task._id;
          const isExpanded = expandedTasks[task._id];

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

                    {task.description && (
                      <Text fontSize="sm" color="gray.600" noOfLines={1}>
                        {task.description}
                      </Text>
                    )}

                    <HStack spacing={2} fontSize="sm" color="gray.500">
                      {task.dueDate && (
                        <Text>Due: {new Date(task.dueDate).toLocaleDateString()}</Text>
                      )}
                      {task.project && (
                        <Badge size="sm" colorScheme="blue" variant="subtle">
                          {task.project}
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
                            toggleExpanded(task._id);
                          }}
                        />
                      </Tooltip>
                    )}



                    <Tooltip label="Edit Task">
                      <IconButton
                        size="sm"
                        variant="ghost"
                        icon={<EditIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implement edit functionality
                        }}
                      />
                    </Tooltip>

                    <Tooltip label="Delete Task">
                      <IconButton
                        size="sm"
                        variant="ghost"
                        icon={<DeleteIcon />}
                        colorScheme="red"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTask(task._id);
                        }}
                      />
                    </Tooltip>

                    {(task.description || (task.fileAttachments && task.fileAttachments.length > 0)) && (
                      <IconButton
                        size="sm"
                        variant="ghost"
                        icon={<ChevronRightIcon />}
                        transform={isExpanded ? 'rotate(90deg)' : 'none'}
                        transition="transform 0.2s"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpanded(task._id);
                        }}
                      />
                    )}
                  </HStack>
                </HStack>

                {/* Expanded Content */}
                {isExpanded && (
                  <Box p={3} pt={0} borderTop="1px" borderColor={borderColor}>
                    {task.description && (
                      <Text fontSize="sm" color="gray.600" mb={3}>
                        {task.description}
                      </Text>
                    )}

                    {task.fileAttachments && task.fileAttachments.length > 0 && (
                      <VStack align="start" spacing={2}>
                        <Text fontSize="sm" fontWeight="medium">
                          Attachments:
                        </Text>
                        {task.fileAttachments.map((file, index) => (
                          <Text key={index} fontSize="sm" color="blue.500">
                            {file.name}
                          </Text>
                        ))}
                      </VStack>
                    )}
                  </Box>
                )}
              </VStack>
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
};

export default TaskList;
