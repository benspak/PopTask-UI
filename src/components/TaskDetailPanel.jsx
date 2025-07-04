import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Textarea,
  Select,
  Checkbox,
  IconButton,
  Divider,
  Badge,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
  Spacer,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useColorModeValue,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Link,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import {
  CloseIcon,
  DeleteIcon,
  EditIcon,
  DownloadIcon,
  ExternalLinkIcon,
  TimeIcon,
  ViewIcon,
  AttachmentIcon,
} from '@chakra-ui/icons';
import TimeTrackingButton from './TimeTrackingButton';
import TimeTrackingPanel from './TimeTrackingPanel';
import apiService from '../services/api';

const TaskDetailPanel = ({
  task,
  projects = [],
  onTaskUpdate,
  onTaskDelete,
  onClose,
  onTagClick,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({});
  const [tagsInput, setTagsInput] = useState('');
  const toast = useToast();
  const { isOpen, onOpen, onClose: onDialogClose } = useDisclosure();
  const cancelRef = React.useRef();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    if (task) {
      setEditedTask({
        title: task.title || '',
        description: task.description || '',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        project: task.project || '',
        tags: task.tags || [],
        priority: task.priority || 'medium',
        completed: task.completed || false,
      });
      setTagsInput(task.tags ? task.tags.join(', ') : '');
    }
  }, [task]);

  const handleTagsBlur = () => {
    // Process tags when input loses focus
    const processedTags = tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    // Update the tags input to show cleaned format
    setTagsInput(processedTags.join(', '));

    // Update the editedTask with processed tags
    setEditedTask(prev => ({
      ...prev,
      tags: processedTags
    }));
  };

  const handleSave = async () => {
    if (!editedTask.title.trim()) {
      toast({
        title: 'Error',
        description: 'Task title is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Process tags input into array
      const processedTags = tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const taskDataToSave = {
        ...editedTask,
        tags: processedTags
      };

      await onTaskUpdate(task._id, taskDataToSave);
      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Task updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update task',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async () => {
    try {
      await onTaskDelete(task._id);
      onClose();
      toast({
        title: 'Success',
        description: 'Task deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete task',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
    onDialogClose();
  };

  const getStatusColor = (completed) => {
    return completed ? 'green' : 'blue';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    // Split the date string and take only the date part (YYYY-MM-DD)
    const dateOnly = dateString.split('T')[0];
    const [year, month, day] = dateOnly.split('-');
    // Create date in local timezone by using the date components
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString();
  };

  const getProjectColor = (projectName) => {
    const project = projects.find(p => p.name === projectName);
    return project?.color || 'blue.500';
  };

  const getProjectDescription = (projectName) => {
    const project = projects.find(p => p.name === projectName);
    return project?.description || '';
  };

  // Handle time tracking updates by refreshing the task data
  const handleTimeUpdate = async () => {
    try {
      // Get the updated task data from the server
      const updatedTask = await apiService.getTask(task._id);
      // Update the task in the parent component
      if (onTaskUpdate && updatedTask.data) {
        await onTaskUpdate(task._id, updatedTask.data);
      }
    } catch (error) {
      console.error('Failed to refresh task data after time tracking update:', error);
    }
  };

  if (!task) return null;

  return (
    <Box
      h="100%"
      maxH="100vh"
      display="flex"
      flexDirection="column"
      bg={bgColor}
      borderLeft="1px"
      borderColor={borderColor}
      overflowY="auto"
    >
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDialogClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Task
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDialogClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <VStack spacing={4} p={6} pb={8} mb="80px" align="stretch" h="100%">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <Text fontSize="lg" fontWeight="bold">
            Task Details
          </Text>
          <HStack spacing={2}>
            <IconButton
              size="sm"
              variant="ghost"
              icon={<EditIcon />}
              onClick={() => setIsEditing(!isEditing)}
            />
            <IconButton
              size="sm"
              variant="ghost"
              icon={<DeleteIcon />}
              colorScheme="red"
              onClick={onOpen}
            />
            <IconButton
              size="sm"
              variant="ghost"
              icon={<CloseIcon />}
              onClick={onClose}
            />
          </HStack>
        </HStack>

        <Divider />

        {/* Email Verification Notice */}
        {task.user && !task.user.emailVerified && (
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>Email Not Verified</AlertTitle>
              <AlertDescription>
                Please verify your email address to access all features.
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* Task Content */}
        <VStack spacing={4} flex={1} align="stretch">
          {isEditing ? (
            // Edit Mode
            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Title *
                </Text>
                <Input
                  value={editedTask.title}
                  onChange={(e) => setEditedTask(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter task title"
                />
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Description
                </Text>
                <Textarea
                  value={editedTask.description}
                  onChange={(e) => setEditedTask(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter task description"
                  rows={4}
                />
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Due Date
                </Text>
                <Input
                  type="date"
                  value={editedTask.dueDate}
                  onChange={(e) => setEditedTask(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Project
                </Text>
                <Select
                  value={editedTask.project}
                  onChange={(e) => setEditedTask(prev => ({ ...prev, project: e.target.value }))}
                >
                  <option value="">No project</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project.name}>
                      {project.name}
                    </option>
                  ))}
                </Select>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Priority
                </Text>
                <Select
                  value={editedTask.priority}
                  onChange={(e) => setEditedTask(prev => ({ ...prev, priority: e.target.value }))}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Select>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Tags (comma-separated)
                </Text>
                <Input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Enter tags separated by commas"
                  onBlur={handleTagsBlur}
                />
              </Box>

              <Checkbox
                isChecked={editedTask.completed}
                onChange={(e) => setEditedTask(prev => ({ ...prev, completed: e.target.checked }))}
                colorScheme="green"
              >
                Mark as completed
              </Checkbox>

              <HStack spacing={4} justify="flex-end">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button colorScheme="blue" onClick={handleSave}>
                  Save Changes
                </Button>
              </HStack>
            </VStack>
          ) : (
            // View Mode
            <VStack spacing={4} align="stretch">
              {/* Basic Info */}
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Title
                </Text>
                <Text fontSize="md" fontWeight="medium">
                  {task.title || 'No title'}
                </Text>
              </Box>

              {task.description && (
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Description
                  </Text>
                  <Text fontSize="md" color="gray.600" whiteSpace="pre-wrap">
                    {task.description}
                  </Text>
                </Box>
              )}

              {/* Status and Priority */}
              <SimpleGrid columns={2} spacing={4}>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Status
                  </Text>
                  <Badge colorScheme={getStatusColor(task.completed)}>
                    {task.completed ? 'Completed' : 'Pending'}
                  </Badge>
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Priority
                  </Text>
                  <Badge colorScheme={getPriorityColor(task.priority)}>
                    {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1) || 'Medium'}
                  </Badge>
                </Box>
              </SimpleGrid>

              {/* Project and Due Date */}
              <SimpleGrid columns={2} spacing={4}>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Project
                  </Text>
                  {task.project ? (
                    <VStack align="start" spacing={1}>
                      <Badge
                        colorScheme={getProjectColor(task.project)}
                        variant="subtle"
                        fontSize="sm"
                        px={2}
                        py={1}
                      >
                        {task.project}
                      </Badge>
                      {getProjectDescription(task.project) && (
                        <Text fontSize="xs" color="gray.500" noOfLines={2}>
                          {getProjectDescription(task.project)}
                        </Text>
                      )}
                    </VStack>
                  ) : (
                    <Text fontSize="sm" color="gray.500" fontStyle="italic">
                      No project assigned
                    </Text>
                  )}
                </Box>

                {task.dueDate && (
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>
                      Due Date
                    </Text>
                    <Text fontSize="md">
                      {formatDate(task.dueDate)}
                    </Text>
                  </Box>
                )}
              </SimpleGrid>

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Tags
                  </Text>
                  <HStack spacing={2} flexWrap="wrap">
                    {task.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        colorScheme="gray"
                        variant="outline"
                        fontSize="sm"
                        px={2}
                        py={1}
                        cursor="pointer"
                        _hover={{ bg: "gray.100" }}
                        onClick={() => onTagClick && onTagClick(tag)}
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </HStack>
                </Box>
              )}

              {/* File Attachments */}
              {task.fileAttachments && task.fileAttachments.length > 0 && (
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Attachments ({task.fileAttachments.length})
                  </Text>
                  <VStack align="start" spacing={2}>
                    {task.fileAttachments.map((file, index) => (
                      <Box
                        key={index}
                        p={3}
                        border="1px"
                        borderColor={borderColor}
                        borderRadius="md"
                        w="full"
                      >
                        <HStack justify="space-between" align="start">
                          <VStack align="start" spacing={1} flex={1}>
                            <Text fontSize="sm" fontWeight="medium">
                              {file.originalName || file.filename}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {formatFileSize(file.size)} • {file.mimetype}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              Uploaded: {formatDate(file.uploadedAt)}
                            </Text>
                          </VStack>
                          <IconButton
                            size="sm"
                            variant="ghost"
                            icon={<DownloadIcon />}
                            aria-label="Download file"
                          />
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              )}

              {/* Sharing Information */}
              {task.isShared && (
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Sharing
                  </Text>
                  <VStack align="start" spacing={2} p={3} bg="gray.50" borderRadius="md">
                    <HStack>
                      <Badge colorScheme="green">Shared</Badge>
                      <Badge colorScheme={task.sharePermission === 'editable' ? 'blue' : 'gray'} color={task.sharePermission === 'readonly' ? 'gray.700' : undefined}>
                        {task.sharePermission}
                      </Badge>
                    </HStack>

                    {task.shareViewCount > 0 && (
                      <HStack>
                        <ViewIcon />
                        <Text fontSize="sm" color="gray.700">{task.shareViewCount} views</Text>
                      </HStack>
                    )}

                    {task.lastViewedAt && (
                      <HStack>
                        <TimeIcon />
                        <Text fontSize="sm" color="gray.700">
                          Last viewed: {formatDate(task.lastViewedAt)}
                        </Text>
                      </HStack>
                    )}

                    {task.shareCreatedAt && (
                      <HStack>
                        <TimeIcon />
                        <Text fontSize="sm" color="gray.700">
                          Shared: {formatDate(task.shareCreatedAt)}
                        </Text>
                      </HStack>
                    )}

                    {task.shareExpiresAt && (
                      <HStack>
                        <TimeIcon />
                        <Text fontSize="sm" color="gray.700">
                          Expires: {formatDate(task.shareExpiresAt)}
                        </Text>
                      </HStack>
                    )}
                  </VStack>
                </Box>
              )}

              {/* Timestamps */}
              <SimpleGrid columns={1} spacing={3}>
                <Stat>
                  <StatLabel fontSize="sm" fontWeight="medium">Created</StatLabel>
                  <StatNumber fontSize="sm" color="gray.500">
                    {formatDate(task.createdAt)}
                  </StatNumber>
                </Stat>

                {task.updatedAt && task.updatedAt !== task.createdAt && (
                  <Stat>
                    <StatLabel fontSize="sm" fontWeight="medium">Last Updated</StatLabel>
                    <StatNumber fontSize="sm" color="gray.500">
                      {formatDate(task.updatedAt)}
                    </StatNumber>
                  </Stat>
                )}
              </SimpleGrid>

              {/* Time Tracking Section */}
              <TimeTrackingButton task={task} onTimeUpdate={handleTimeUpdate} />
              <TimeTrackingPanel task={task} onTimeUpdate={handleTimeUpdate} />
            </VStack>
          )}
        </VStack>
      </VStack>
    </Box>
  );
};

export default TaskDetailPanel;
