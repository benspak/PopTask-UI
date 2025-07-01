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
} from '@chakra-ui/react';
import {
  CloseIcon,
  DeleteIcon,
  EditIcon,
} from '@chakra-ui/icons';

const TaskDetailPanel = ({
  task,
  onTaskUpdate,
  onTaskDelete,
  onClose,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({});
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
        completed: task.completed || false,
      });
    }
  }, [task]);

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
      await onTaskUpdate(task._id, editedTask);
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

  if (!task) return null;

  return (
    <Box
      h="full"
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

      <VStack spacing={4} p={6} align="stretch" h="100%">
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
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Title
                </Text>
                <Text fontSize="md" fontWeight="medium">
                  {task.title}
                </Text>
              </Box>

              {task.description && (
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Description
                  </Text>
                  <Text fontSize="md" color="gray.600">
                    {task.description}
                  </Text>
                </Box>
              )}

              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Status
                </Text>
                <Badge colorScheme={getStatusColor(task.completed)}>
                  {task.completed ? 'Completed' : 'Pending'}
                </Badge>
              </Box>

              {task.dueDate && (
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Due Date
                  </Text>
                  <Text fontSize="md">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </Text>
                </Box>
              )}

              {task.project && (
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Project
                  </Text>
                  <Badge colorScheme="blue" variant="subtle">
                    {task.project}
                  </Badge>
                </Box>
              )}

              {task.fileAttachments && task.fileAttachments.length > 0 && (
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Attachments ({task.fileAttachments.length})
                  </Text>
                  <VStack align="start" spacing={1}>
                    {task.fileAttachments.map((file, index) => (
                      <Text key={index} fontSize="sm" color="blue.500">
                        {file.name}
                      </Text>
                    ))}
                  </VStack>
                </Box>
              )}

              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Created
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {new Date(task.createdAt).toLocaleString()}
                </Text>
              </Box>

              {task.updatedAt && task.updatedAt !== task.createdAt && (
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Last Updated
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {new Date(task.updatedAt).toLocaleString()}
                  </Text>
                </Box>
              )}
            </VStack>
          )}
        </VStack>
      </VStack>
    </Box>
  );
};

export default TaskDetailPanel;
