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
  Badge,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useDisclosure,
  useColorModeValue,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Divider,
  Link,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tooltip,
} from '@chakra-ui/react';
import {
  CloseIcon,
  DeleteIcon,
  EditIcon,
  ExternalLinkIcon,
  TimeIcon,
  ViewIcon,
  CalendarIcon,
  CheckCircleIcon,
  AttachmentIcon,
  DownloadIcon,
} from '@chakra-ui/icons';
import apiService from '../services/api';

const TaskDetailModal = ({
  task,
  projects = [],
  onTaskUpdate,
  onTaskDelete,
  onLeaveTask,
  onClose,
  onShareTask,
  isOpen,
  isShared = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({});
  const [tagsInput, setTagsInput] = useState('');
  const toast = useToast();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
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
      // Handle limit errors specifically
      if (error.isLimitError) {
        toast({
          title: 'Task Limit Reached',
          description: error.message || 'You have reached your task limit. Upgrade to Pro for unlimited tasks.',
          status: 'warning',
          duration: 8000,
          isClosable: true,
          position: 'top',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update task',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
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
    onDeleteClose();
  };

  const handleLeaveTask = async () => {
    try {
      await onLeaveTask(task._id);
      onClose();
      toast({
        title: 'Success',
        description: 'Successfully left the shared task',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to leave task',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
    onDeleteClose();
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const dateOnly = dateString.split('T')[0];
    const [year, month, day] = dateOnly.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString();
  };

  const getProjectColor = (projectName) => {
    const project = projects.find(p => p.name === projectName);
    return project?.color || '#3182ce';
  };

  const getProjectDescription = (projectName) => {
    const project = projects.find(p => p.name === projectName);
    return project?.description || '';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTaskStats = () => {
    const timeTracked = task.timeTracking?.totalTime || 0;
    const sessions = task.timeTracking?.sessions?.length || 0;
    const lastSession = task.timeTracking?.sessions?.[task.timeTracking.sessions.length - 1];

    return {
      timeTracked,
      sessions,
      lastSession,
    };
  };

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

  if (!task) return null;

  const stats = getTaskStats();

  return (
    <>
      {/* Delete/Leave Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {isShared ? 'Leave Task' : 'Delete Task'}
            </AlertDialogHeader>
            <AlertDialogBody>
              {isShared
                ? 'Are you sure you want to leave this shared task? You will no longer have access to edit it.'
                : 'Are you sure you want to delete this task? This action cannot be undone.'
              }
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button
                colorScheme={isShared ? "orange" : "red"}
                onClick={isShared ? handleLeaveTask : handleDelete}
                ml={3}
              >
                {isShared ? 'Leave' : 'Delete'}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Task Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent maxW="800px">
          <ModalHeader>
            <HStack spacing={3} align="center">
              <Box
                w={6}
                h={6}
                bg={getStatusColor(task.completed)}
                borderRadius="md"
                border="2px solid"
                borderColor={useColorModeValue('gray.200', 'gray.600')}
              />
              <Text>Task Details</Text>
              {isShared && (
                <Badge colorScheme="green" size="sm">
                  Shared
                </Badge>
              )}
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {task && (
              <VStack spacing={6} align="stretch">
                {/* Task Header */}
                <VStack align="start" spacing={2}>
                  <HStack spacing={2} align="center">
                    <Text fontSize="2xl" fontWeight="bold">
                      {task.title}
                    </Text>
                    <Badge
                      colorScheme={getStatusColor(task.completed)}
                      variant="subtle"
                    >
                      {task.completed ? 'Completed' : 'Pending'}
                    </Badge>
                    {task.priority && (
                      <Badge
                        colorScheme={getPriorityColor(task.priority)}
                        variant="subtle"
                      >
                        {task.priority}
                      </Badge>
                    )}
                  </HStack>
                  {task.description && (
                    <Text fontSize="md" color="gray.600">
                      {task.description}
                    </Text>
                  )}
                </VStack>

                {/* Task Statistics */}
                <Box p={4} border="1px" borderColor={useColorModeValue('gray.200', 'gray.600')} borderRadius="md" bg={useColorModeValue('gray.50', 'gray.700')}>
                  <Text fontSize="md" fontWeight="semibold" mb={3}>Task Statistics</Text>
                  <SimpleGrid columns={2} spacing={4}>
                    <Stat>
                      <StatLabel>Time Tracked</StatLabel>
                      <StatNumber>{formatTime(stats.timeTracked)}</StatNumber>
                      <StatHelpText>Total time spent</StatHelpText>
                    </Stat>
                    <Stat>
                      <StatLabel>Sessions</StatLabel>
                      <StatNumber>{stats.sessions}</StatNumber>
                      <StatHelpText>Time tracking sessions</StatHelpText>
                    </Stat>
                    {task.dueDate && (
                      <Stat>
                        <StatLabel>Due Date</StatLabel>
                        <StatNumber>{formatDate(task.dueDate)}</StatNumber>
                        <StatHelpText>Task deadline</StatHelpText>
                      </Stat>
                    )}
                    {task.project && task.project !== 'general' && (
                      <Stat>
                        <StatLabel>Project</StatLabel>
                        <StatNumber>{task.project}</StatNumber>
                        <StatHelpText>Associated project</StatHelpText>
                      </Stat>
                    )}
                  </SimpleGrid>
                </Box>

                {/* Task Information */}
                <Box p={4} border="1px" borderColor={useColorModeValue('gray.200', 'gray.600')} borderRadius="md">
                  <Text fontSize="md" fontWeight="semibold" mb={3}>Task Information</Text>
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm">Status</Text>
                      <Badge colorScheme={getStatusColor(task.completed)}>
                        {task.completed ? 'Completed' : 'Pending'}
                      </Badge>
                    </HStack>
                    {task.priority && (
                      <HStack justify="space-between">
                        <Text fontSize="sm">Priority</Text>
                        <Badge colorScheme={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </HStack>
                    )}
                    {task.dueDate && (
                      <HStack justify="space-between">
                        <Text fontSize="sm">Due Date</Text>
                        <Text fontSize="sm">{formatDate(task.dueDate)}</Text>
                      </HStack>
                    )}
                    {task.project && task.project !== 'general' && (
                      <HStack justify="space-between">
                        <Text fontSize="sm">Project</Text>
                        <HStack spacing={2}>
                          <Box w={4} h={4} bg={getProjectColor(task.project)} borderRadius="sm" border="1px solid" borderColor="gray.300" />
                          <Text fontSize="sm">{task.project}</Text>
                        </HStack>
                      </HStack>
                    )}
                    {task.tags && task.tags.length > 0 && (
                      <HStack justify="space-between">
                        <Text fontSize="sm">Tags</Text>
                        <HStack spacing={1}>
                          {task.tags.map((tag, index) => (
                            <Badge key={index} size="sm" colorScheme="blue" variant="subtle">
                              {tag}
                            </Badge>
                          ))}
                        </HStack>
                      </HStack>
                    )}
                    {task.createdAt && (
                      <HStack justify="space-between">
                        <Text fontSize="sm">Created</Text>
                        <Text fontSize="sm">{formatDate(task.createdAt)}</Text>
                      </HStack>
                    )}
                    {task.updatedAt && task.updatedAt !== task.createdAt && (
                      <HStack justify="space-between">
                        <Text fontSize="sm">Last Updated</Text>
                        <Text fontSize="sm">{formatDate(task.updatedAt)}</Text>
                      </HStack>
                    )}
                  </VStack>
                </Box>

                {/* File Attachments */}
                {task.fileAttachments && task.fileAttachments.length > 0 && (
                  <Box p={4} border="1px" borderColor={useColorModeValue('gray.200', 'gray.600')} borderRadius="md">
                    <Text fontSize="md" fontWeight="semibold" mb={3}>Attachments</Text>
                    <VStack spacing={2} align="stretch">
                      {task.fileAttachments.map((file, index) => (
                        <HStack key={index} p={3} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
                          <AttachmentIcon />
                          <Box flex={1}>
                            <Text fontSize="sm" fontWeight="medium">
                              {file.originalName}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {formatFileSize(file.size)}
                            </Text>
                          </Box>
                          <Tooltip label="Download file">
                            <IconButton
                              size="sm"
                              icon={<DownloadIcon />}
                              onClick={() => window.open(apiService.getFileUrl(file.filename), '_blank')}
                            />
                          </Tooltip>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                )}

                {/* Sharing Information */}
                {task.isShared && (
                  <Box p={4} border="1px" borderColor={useColorModeValue('gray.200', 'gray.600')} borderRadius="md">
                    <Text fontSize="md" fontWeight="semibold" mb={3}>Sharing</Text>
                    <VStack align="start" spacing={2}>
                      <HStack>
                        <Badge colorScheme="green">Shared</Badge>
                        <Badge colorScheme={task.sharePermission === 'editable' ? 'blue' : 'gray'}>
                          {task.sharePermission}
                        </Badge>
                      </HStack>

                      {task.shareViewCount > 0 && (
                        <HStack>
                          <ViewIcon />
                          <Text fontSize="sm">{task.shareViewCount} views</Text>
                        </HStack>
                      )}

                      {task.lastViewedAt && (
                        <HStack>
                          <TimeIcon />
                          <Text fontSize="sm">
                            Last viewed: {formatDate(task.lastViewedAt)}
                          </Text>
                        </HStack>
                      )}

                      {task.shareCreatedAt && (
                        <HStack>
                          <TimeIcon />
                          <Text fontSize="sm">
                            Shared: {formatDate(task.shareCreatedAt)}
                          </Text>
                        </HStack>
                      )}

                      {task.shareExpiresAt && (
                        <HStack>
                          <TimeIcon />
                          <Text fontSize="sm">
                            Expires: {formatDate(task.shareExpiresAt)}
                          </Text>
                        </HStack>
                      )}
                    </VStack>
                  </Box>
                )}

                {/* Edit Form */}
                {isEditing && (
                  <Box p={4} border="1px" borderColor={useColorModeValue('gray.200', 'gray.600')} borderRadius="md" bg={useColorModeValue('gray.50', 'gray.700')}>
                    <Text fontSize="md" fontWeight="semibold" mb={3}>Edit Task</Text>
                    <VStack spacing={4} align="stretch">
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={2}>Title</Text>
                        <Input
                          value={editedTask.title}
                          onChange={(e) => setEditedTask(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Task title"
                        />
                      </Box>
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={2}>Description</Text>
                        <Textarea
                          value={editedTask.description}
                          onChange={(e) => setEditedTask(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Task description"
                          rows={3}
                        />
                      </Box>
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={2}>Due Date</Text>
                        <Input
                          type="date"
                          value={editedTask.dueDate}
                          onChange={(e) => setEditedTask(prev => ({ ...prev, dueDate: e.target.value }))}
                        />
                      </Box>
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={2}>Project</Text>
                        <Select
                          value={editedTask.project}
                          onChange={(e) => setEditedTask(prev => ({ ...prev, project: e.target.value }))}
                        >
                          <option value="">No Project</option>
                          {projects.map(project => (
                            <option key={project._id} value={project.name}>
                              {project.name}
                            </option>
                          ))}
                        </Select>
                      </Box>
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={2}>Tags</Text>
                        <Input
                          value={tagsInput}
                          onChange={(e) => setTagsInput(e.target.value)}
                          onBlur={handleTagsBlur}
                          placeholder="Enter tags separated by commas"
                        />
                      </Box>
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={2}>Priority</Text>
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
                        <Checkbox
                          isChecked={editedTask.completed}
                          onChange={(e) => setEditedTask(prev => ({ ...prev, completed: e.target.checked }))}
                        >
                          Completed
                        </Checkbox>
                      </Box>
                      <HStack justify="flex-end" spacing={2}>
                        <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                        <Button size="sm" colorScheme="blue" onClick={handleSave}>
                          Save Changes
                        </Button>
                      </HStack>
                    </VStack>
                  </Box>
                )}

                {/* Actions */}
                <VStack spacing={3} align="stretch" display={{ base: 'flex', md: 'none' }}>
                  <Button
                    leftIcon={<EditIcon />}
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                    w="full"
                  >
                    {isEditing ? 'Cancel Edit' : 'Edit Task'}
                  </Button>
                  {isShared ? (
                    <Button
                      leftIcon={<DeleteIcon />}
                      colorScheme="orange"
                      variant="outline"
                      onClick={onDeleteOpen}
                      w="full"
                    >
                      Leave Task
                    </Button>
                  ) : (
                    <Button
                      leftIcon={<DeleteIcon />}
                      colorScheme="red"
                      variant="outline"
                      onClick={onDeleteOpen}
                      w="full"
                    >
                      Delete Task
                    </Button>
                  )}
                  <Button
                    leftIcon={<ExternalLinkIcon />}
                    colorScheme="blue"
                    onClick={() => onShareTask && onShareTask(task)}
                    w="full"
                  >
                    Share Task
                  </Button>
                </VStack>

                {/* Desktop Actions */}
                <HStack spacing={3} justify="flex-end" display={{ base: 'none', md: 'flex' }}>
                  <Button
                    leftIcon={<EditIcon />}
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? 'Cancel Edit' : 'Edit Task'}
                  </Button>
                  {isShared ? (
                    <Button
                      leftIcon={<DeleteIcon />}
                      colorScheme="orange"
                      variant="outline"
                      onClick={onDeleteOpen}
                    >
                      Leave Task
                    </Button>
                  ) : (
                    <Button
                      leftIcon={<DeleteIcon />}
                      colorScheme="red"
                      variant="outline"
                      onClick={onDeleteOpen}
                    >
                      Delete Task
                    </Button>
                  )}
                  <Button
                    leftIcon={<ExternalLinkIcon />}
                    colorScheme="blue"
                    onClick={() => onShareTask && onShareTask(task)}
                  >
                    Share Task
                  </Button>
                </HStack>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default TaskDetailModal;
