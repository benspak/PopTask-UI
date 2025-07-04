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
} from '@chakra-ui/react';
import { CloseIcon, CheckIcon } from '@chakra-ui/icons';

const ProjectCreatePanel = ({
  isOpen,
  onClose,
  onCreateProject,
  loading = false,
}) => {
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    color: '#3182ce',
  });

  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');

  const handleInputChange = (field, value) => {
    setProjectData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!projectData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Project name is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await onCreateProject(projectData);
      setProjectData({ name: '', description: '', color: '#3182ce' });
      onClose();
      toast({
        title: 'Success',
        description: 'Project created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create project',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCancel = () => {
    setProjectData({ name: '', description: '', color: '#3182ce' });
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
            Create New Project
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
            <FormLabel color={textColor}>Project Name</FormLabel>
            <Input
              value={projectData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter project name"
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <FormHelperText>
              Choose a descriptive name for your project
            </FormHelperText>
          </FormControl>

          <FormControl>
            <FormLabel color={textColor}>Description</FormLabel>
            <Textarea
              value={projectData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your project (optional)"
              rows={3}
              onKeyDown={handleKeyDown}
            />
            <FormHelperText>
              Add details about what this project is for
            </FormHelperText>
          </FormControl>

          <FormControl>
            <FormLabel color={textColor}>Color</FormLabel>
            <HStack spacing={3}>
              <Input
                type="color"
                value={projectData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                w="60px"
                h="40px"
                p={1}
                borderRadius="md"
              />
              <Input
                value={projectData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                placeholder="#3182ce"
                fontFamily="mono"
              />
            </HStack>
            <FormHelperText>
              Choose a color to identify this project
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
            Create Project
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
          <Text>• Ctrl/Cmd + Enter: Create project</Text>
          <Text>• Escape: Cancel</Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default ProjectCreatePanel;
