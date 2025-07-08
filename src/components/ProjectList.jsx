import React, { useState } from 'react';
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useDisclosure,
  useToast,
  HStack as ChakraHStack,
  FormHelperText,
  Switch,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, SettingsIcon } from '@chakra-ui/icons';
import LimitsDisplay from './LimitsDisplay';

const ProjectList = ({
  projects = [],
  loading = false,
  error = null,
  selectedProject,
  onProjectSelect,
  onProjectCreate,
  onProjectUpdate,
  onProjectDelete,
  onLeaveProject,
  onProjectDetailOpen,
  refreshLimitsTrigger = 0,
  isOpen,
  isShared = false,
}) => {
  const { isOpen: isModalOpen, onOpen, onClose: onModalClose } = useDisclosure();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
  });
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const selectedBg = useColorModeValue('blue.50', 'blue.900');

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) {
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
      await onProjectCreate(newProject);
      setNewProject({ name: '', description: '' });
      onClose();
      toast({
        title: 'Success',
        description: 'Project created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      // Handle limit errors specifically
      if (error.isLimitError) {
        toast({
          title: 'Project Limit Reached',
          description: error.message || 'You have reached your project limit. Upgrade to Pro for unlimited projects.',
          status: 'warning',
          duration: 8000,
          isClosable: true,
          position: 'top',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to create project',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleUpdateProject = async () => {
    if (!editingProject.name.trim()) {
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
      await onProjectUpdate(editingProject._id, editingProject);
      setEditingProject(null);
      setIsEditMode(false);
      onClose();
      toast({
        title: 'Success',
        description: 'Project updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update project',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteProject = async (projectId) => {
    const message = isShared
      ? 'Are you sure you want to leave this shared project? You will no longer have access to edit it.'
      : 'Are you sure you want to delete this project? This action cannot be undone.';

    if (window.confirm(message)) {
      try {
        if (isShared) {
          await onLeaveProject(projectId);
          toast({
            title: 'Success',
            description: 'Successfully left the shared project',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        } else {
          await onProjectDelete(projectId);
          toast({
            title: 'Success',
            description: 'Project deleted successfully',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: isShared ? 'Failed to leave project' : 'Failed to delete project',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setEditingProject(null);
    setNewProject({ name: '', description: '' });
    onOpen();
  };

  const openEditModal = (project) => {
    setIsEditMode(true);
    setEditingProject({ ...project });
    onOpen();
  };

  if (loading) {
    return (
      <Box p={8} textAlign="center">
        <Spinner size="lg" />
        <Text mt={4}>Loading projects...</Text>
      </Box>
    );
  }

  // Display error above the project list instead of replacing it
  const errorAlert = error ? (
    <Alert status="error" mb={4} borderRadius="md">
      <AlertIcon />
      <AlertDescription>
        {error}
      </AlertDescription>
    </Alert>
  ) : null;

  return (
    <>
      <VStack spacing={4} align="stretch">
        {/* Error Alert - Display above project list */}
        {errorAlert}

        {/* Header */}
        <HStack justify="space-between" align="center">
          <Text fontSize="lg" fontWeight="bold">
            Projects
          </Text>
          <Button
            leftIcon={<AddIcon />}
            size="sm"
            colorScheme="blue"
            onClick={openCreateModal}
          >
            New Project
          </Button>
        </HStack>

        {/* Project Limits Display */}
        <LimitsDisplay type="projects" refreshTrigger={refreshLimitsTrigger} />

        {/* Project List */}
        <VStack spacing={2} align="stretch">
          {projects.length === 0 ? (
            <Box p={4} textAlign="center">
              <Text color="gray.500">No projects yet</Text>
              <Text color="gray.400" fontSize="sm" mt={1}>
                Create your first project to get started
              </Text>
            </Box>
          ) : (
            projects.map((project) => {
              const isSelected = selectedProject?._id === project._id;

              return (
                <Box
                  key={project._id}
                  border="1px"
                  borderColor={isSelected ? 'blue.300' : borderColor}
                  borderRadius="md"
                  bg={isSelected ? selectedBg : bgColor}
                  _hover={{ bg: hoverBg }}
                  transition="all 0.2s"
                  cursor="pointer"
                  onClick={() => onProjectSelect(project)}
                >
                  <HStack p={3} spacing={3} align="center">
                    <Box w={4} h={4} bg={project.color || '#3182ce'} borderRadius="sm" border="1px solid" borderColor="gray.300" />
                    <VStack align="start" spacing={1} flex={1}>
                      <Text fontSize="md" fontWeight="medium">
                        {project.name}
                      </Text>
                      {project.description && (
                        <Text fontSize="sm" color="gray.600" noOfLines={1}>
                          {project.description}
                        </Text>
                      )}
                      {project.taskCount !== undefined && (
                        <Text fontSize="sm" color="gray.600">
                          {project.taskCount} task{project.taskCount !== 1 ? 's' : ''}
                        </Text>
                      )}
                    </VStack>

                    <HStack spacing={1}>
                      <IconButton
                        size="sm"
                        variant="ghost"
                        icon={<SettingsIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onProjectDetailOpen) {
                            onProjectDetailOpen(project);
                          }
                        }}
                        title="Project Details"
                      />
                      <IconButton
                        size="sm"
                        variant="ghost"
                        icon={<EditIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(project);
                        }}
                        title="Quick Edit"
                      />
                      {/* Show delete or leave button based on ownership */}
                      {isShared ? (
                        <IconButton
                          size="sm"
                          variant="ghost"
                          icon={<DeleteIcon />}
                          colorScheme="orange"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project._id);
                          }}
                          title="Leave Project"
                        />
                      ) : (
                        <IconButton
                          size="sm"
                          variant="ghost"
                          icon={<DeleteIcon />}
                          colorScheme="red"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project._id);
                          }}
                          title="Delete Project"
                        />
                      )}
                    </HStack>
                  </HStack>
                </Box>
              );
            })
          )}
        </VStack>
      </VStack>

      {/* Create/Edit Project Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEditMode ? 'Edit Project' : 'New Project'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  value={isEditMode ? editingProject?.name : newProject.name}
                  onChange={e => {
                    if (isEditMode) setEditingProject(p => ({ ...p, name: e.target.value }));
                    else setNewProject(p => ({ ...p, name: e.target.value }));
                  }}
                  placeholder="Project name"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={isEditMode ? editingProject?.description : newProject.description}
                  onChange={e => {
                    if (isEditMode) setEditingProject(p => ({ ...p, description: e.target.value }));
                    else setNewProject(p => ({ ...p, description: e.target.value }));
                  }}
                  placeholder="Project description"
                />
              </FormControl>
            </VStack>
            <HStack mt={6} justify="flex-end">
              <Button onClick={onClose}>Cancel</Button>
              <Button colorScheme="blue" onClick={isEditMode ? handleUpdateProject : handleCreateProject}>
                {isEditMode ? 'Update' : 'Create'}
              </Button>
            </HStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProjectList;
