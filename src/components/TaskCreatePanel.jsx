import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  FormHelperText,
  IconButton,
  useColorModeValue,
  useToast,
  Divider,
  Heading,
  Flex,
  Select,
  Badge,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { CloseIcon, CheckIcon, AddIcon } from '@chakra-ui/icons';

const TaskCreatePanel = ({
  isOpen,
  onClose,
  onCreateTask,
  projects = [],
  sharedProjects = [],
  loading = false,
}) => {
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    dueDate: '',
    project: 'general',
    priority: 'medium',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');

  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');

  const handleInputChange = (field, value) => {
    setTaskData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !taskData.tags.includes(tag)) {
      setTaskData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTaskData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async () => {
    if (!taskData.title.trim()) {
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
      await onCreateTask(taskData);
      setTaskData({
        title: '',
        description: '',
        dueDate: '',
        project: 'general',
        priority: 'medium',
        tags: [],
      });
      setTagInput('');
      onClose();
      toast({
        title: 'Success',
        description: 'Task created successfully',
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
          description: error.message || 'Failed to create task',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleCancel = () => {
    setTaskData({
      title: '',
      description: '',
      dueDate: '',
      project: 'general',
      priority: 'medium',
      tags: [],
    });
    setTagInput('');
    onClose();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      handleSubmit();
    } else if (event.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <Box
      w={{ base: 'full', md: '400px' }}
      bg={bgColor}
      borderLeft="1px"
      borderColor={borderColor}
      h="100vh"
      overflowY="auto"
      position="fixed"
      right={0}
      top={0}
      zIndex={1000}
      mb={{ base: "80px", md: "60px" }}
    >
      <VStack spacing={6} p={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Heading size="md" color={textColor}>
            Create New Task
          </Heading>
          <IconButton
            icon={<CloseIcon />}
            variant="ghost"
            onClick={handleCancel}
            aria-label="Close"
            size="sm"
          />
        </Flex>

        <Divider />

        {/* Form */}
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel color={textColor}>Task Title</FormLabel>
            <Input
              value={taskData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter task title"
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <FormHelperText>
              Give your task a clear, descriptive title
            </FormHelperText>
          </FormControl>

          <FormControl>
            <FormLabel color={textColor}>Description</FormLabel>
            <Textarea
              value={taskData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Add details about this task (optional)"
              rows={3}
              onKeyDown={handleKeyDown}
            />
            <FormHelperText>
              Provide additional context or instructions
            </FormHelperText>
          </FormControl>

          <FormControl>
            <FormLabel color={textColor}>Due Date</FormLabel>
            <Input
              type="date"
              value={taskData.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <FormHelperText>
              Set a deadline for this task (optional)
            </FormHelperText>
          </FormControl>

          <FormControl>
            <FormLabel color={textColor}>Project</FormLabel>
            <Select
              value={taskData.project}
              onChange={(e) => handleInputChange('project', e.target.value)}
              onKeyDown={handleKeyDown}
            >
              <optgroup label="My Projects">
                {projects.map((project) => (
                  <option key={project._id || project.name} value={project.name}>
                    {project.name}
                  </option>
                ))}
              </optgroup>
              {sharedProjects.length > 0 && (
                <optgroup label="Shared Projects">
                  {sharedProjects.map((project) => (
                    <option key={project._id || project.name} value={project.name}>
                      📁 {project.name} (shared by {project.owner?.firstName || project.owner?.username || 'Unknown'})
                    </option>
                  ))}
                </optgroup>
              )}
            </Select>
            <FormHelperText>
              Assign this task to a specific project. You can create tasks in projects shared with you.
            </FormHelperText>
          </FormControl>

          <FormControl>
            <FormLabel color={textColor}>Priority</FormLabel>
            <Select
              value={taskData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              onKeyDown={handleKeyDown}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
            <FormHelperText>
              Set the priority level for this task
            </FormHelperText>
          </FormControl>

          <FormControl>
            <FormLabel color={textColor}>Tags</FormLabel>
            <HStack>
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag"
                onKeyDown={handleTagKeyDown}
              />
              <IconButton
                icon={<AddIcon />}
                onClick={handleAddTag}
                aria-label="Add tag"
                size="sm"
              />
            </HStack>
            {taskData.tags.length > 0 && (
              <Wrap mt={2}>
                {taskData.tags.map((tag, index) => (
                  <WrapItem key={index}>
                    <Badge
                      colorScheme="blue"
                      variant="outline"
                      cursor="pointer"
                      onClick={() => handleRemoveTag(tag)}
                      _hover={{ bg: 'blue.50' }}
                    >
                      #{tag} ×
                    </Badge>
                  </WrapItem>
                ))}
              </Wrap>
            )}
            <FormHelperText>
              Add tags to organize and categorize your task
            </FormHelperText>
          </FormControl>
        </VStack>

        <Divider />

        {/* Actions */}
        <VStack spacing={3}>
          <Button
            leftIcon={<CheckIcon />}
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={loading}
            loadingText="Creating..."
            w="full"
          >
            Create Task
          </Button>
          <Button
            variant="ghost"
            onClick={handleCancel}
            w="full"
          >
            Cancel
          </Button>
        </VStack>

        {/* Keyboard shortcuts hint */}
        <Box
          bg={useColorModeValue('gray.50', 'gray.700')}
          p={3}
          borderRadius="md"
          fontSize="sm"
          color={useColorModeValue('gray.600', 'gray.300')}
        >
          <Text fontWeight="medium" mb={1}>Keyboard Shortcuts:</Text>
          <Text>• Ctrl/Cmd + Enter: Create task</Text>
          <Text>• Escape: Cancel</Text>
          <Text>• Enter in tag field: Add tag</Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default TaskCreatePanel;
