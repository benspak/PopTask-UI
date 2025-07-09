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
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  Link,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
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
} from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

const ProjectDetailPanel = ({
  project,
  tasks = [],
  onProjectUpdate,
  onProjectDelete,
  onLeaveProject,
  onClose,
  onShareProject,
  isOpen,
  isShared = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState({});
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const toast = useToast();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelRef = React.useRef();
  const navigate = useNavigate();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const statsBgColor = useColorModeValue('gray.50', 'gray.700');
  const editFormBgColor = useColorModeValue('gray.50', 'gray.700');

  // Load clients when component mounts
  useEffect(() => {
    const loadClients = async () => {
      try {
        setClientsLoading(true);
        const response = await apiService.getClients();
        const clientsData = Array.isArray(response) ? response : (response.data || []);
        setClients(clientsData);
      } catch (error) {
        console.error('Failed to load clients:', error);
        toast({
          title: 'Error',
          description: 'Failed to load clients',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setClientsLoading(false);
      }
    };

    if (isOpen) {
      loadClients();
    }
  }, [isOpen, toast]);

  useEffect(() => {
    if (project) {
      setEditedProject({
        name: project.name || '',
        description: project.description || '',
        active: project.active !== undefined ? project.active : true,
        clientId: project.clientId || '',
      });
    }
  }, [project]);

  const handleSave = async () => {
    if (!editedProject.name.trim()) {
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
      await onProjectUpdate(project._id, editedProject);
      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Project updated successfully',
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
          description: 'Failed to update project',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleDelete = async () => {
    try {
      await onProjectDelete(project._id);
      onClose();
      toast({
        title: 'Success',
        description: 'Project deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
    onDeleteClose();
  };

  const handleLeaveProject = async () => {
    try {
      await onLeaveProject(project._id);
      onClose();
      toast({
        title: 'Success',
        description: 'Successfully left the shared project',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to leave project',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
    onDeleteClose();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const dateOnly = dateString.split('T')[0];
    const [year, month, day] = dateOnly.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString();
  };

  const getProjectStats = () => {
    // Filter tasks to only include those assigned to this specific project
    const projectTasks = tasks.filter(
      task =>
        task.project &&
        project.name &&
        task.project.toLowerCase() === project.name.toLowerCase()
    );

    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;

    // Calculate total proposed time (estimated time in minutes converted to seconds)
    const totalProposedTime = projectTasks.reduce((total, task) => {
      return total + ((task.estimatedTime || 0) * 60); // Convert minutes to seconds
    }, 0);

    // Calculate total time tracked
    const totalTimeTracked = projectTasks.reduce((total, task) => {
      return total + (task.timeTracking?.totalTime || 0);
    }, 0);

    // Calculate completion percentage and rate based on proposed time vs tracked time
    let completionPercentage = 0;
    let completionRate = 0;

    if (totalProposedTime > 0 && totalTimeTracked > 0) {
      completionPercentage = Math.round((totalTimeTracked / totalProposedTime) * 100);
      completionRate = Math.round((totalTimeTracked / totalProposedTime) * 100);
    } else if (totalTasks > 0) {
      // Fallback to task-based completion if no time data
      completionRate = Math.round((completedTasks / totalTasks) * 100);
    }

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate,
      totalTimeTracked,
      totalProposedTime,
      completionPercentage,
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

  // Helper to create invoice line items from tasks
  const getLineItemsFromTasks = () => {
    // Only include tasks for this project
    const projectTasks = tasks.filter(
      task => task.project && project.name && task.project.toLowerCase() === project.name.toLowerCase()
    );
    return projectTasks.map(task => ({
      description: task.title || 'Task',
      hours: (task.timeTracking?.totalTime || 0) / 3600, // convert seconds to hours
      rate: 0, // User can edit this later
      amount: 0 // User can edit this later
    }));
  };

  const handleCreateInvoice = () => {
    const lineItems = getLineItemsFromTasks();
    navigate('/invoices/create', {
      state: {
        projectId: project._id,
        clientId: project.clientId?._id || project.clientId,
        lineItems
      }
    });
  };

  if (!project) return null;

  const stats = getProjectStats();

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
              {isShared ? 'Leave Project' : 'Delete Project'}
            </AlertDialogHeader>
            <AlertDialogBody>
              {isShared
                ? 'Are you sure you want to leave this shared project? You will no longer have access to edit it.'
                : 'Are you sure you want to delete this project? This action cannot be undone and will affect all tasks in this project.'
              }
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button
                colorScheme={isShared ? "orange" : "red"}
                onClick={isShared ? handleLeaveProject : handleDelete}
                ml={3}
              >
                {isShared ? 'Leave' : 'Delete'}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Project Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent maxW="800px">
          <ModalHeader>
            <Text>Project Details</Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {project && (
              <VStack spacing={6} align="stretch">
                {/* Project Header */}
                <VStack align="start" spacing={2}>
                  <HStack spacing={2} align="center">
                    <Text fontSize="2xl" fontWeight="bold">
                      {project.name}
                    </Text>
                    <Badge
                      colorScheme={project.active ? 'green' : 'gray'}
                      variant="subtle"
                    >
                      {project.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </HStack>
                  {project.description && (
                    <Text fontSize="md" color="gray.600">
                      {project.description}
                    </Text>
                  )}
                </VStack>

                {/* Project Statistics */}
                <Box p={4} border="1px" borderColor={borderColor} borderRadius="md" bg={statsBgColor}>
                  <Text fontSize="md" fontWeight="semibold" mb={3}>Project Statistics</Text>
                  <SimpleGrid columns={2} spacing={4}>
                    <Stat>
                      <StatLabel>Total Tasks</StatLabel>
                      <StatNumber>{stats.totalTasks}</StatNumber>
                      <StatHelpText>All tasks in project</StatHelpText>
                    </Stat>
                    <Stat>
                      <StatLabel>Completed</StatLabel>
                      <StatNumber>{stats.completedTasks}</StatNumber>
                      <StatHelpText>Tasks completed</StatHelpText>
                    </Stat>
                    <Stat>
                      <StatLabel>Pending</StatLabel>
                      <StatNumber>{stats.pendingTasks}</StatNumber>
                      <StatHelpText>Tasks to complete</StatHelpText>
                    </Stat>
                    <Stat>
                      <StatLabel>Time Tracked</StatLabel>
                      <StatNumber>{formatTime(stats.totalTimeTracked)}</StatNumber>
                      <StatHelpText>Total time spent</StatHelpText>
                    </Stat>

                    <Stat>
                      <StatLabel>Proposed Time</StatLabel>
                      <StatNumber>{formatTime(stats.totalProposedTime)}</StatNumber>
                      <StatHelpText>Estimated time for all tasks</StatHelpText>
                    </Stat>

                    <Stat>
                      <StatLabel>Completion Rate</StatLabel>
                      <StatNumber>{stats.completionRate}%</StatNumber>
                      <StatHelpText>Time vs proposed</StatHelpText>
                    </Stat>
                  </SimpleGrid>
                </Box>

                {/* Project Information */}
                <Box p={4} border="1px" borderColor={borderColor} borderRadius="md">
                  <Text fontSize="md" fontWeight="semibold" mb={3} color="white">Project Information</Text>
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="white">Created</Text>
                      <Text fontSize="sm" color="white">{formatDate(project.createdAt)}</Text>
                    </HStack>
                    {project.updatedAt && project.updatedAt !== project.createdAt && (
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="white">Last Updated</Text>
                        <Text fontSize="sm" color="white">{formatDate(project.updatedAt)}</Text>
                      </HStack>
                    )}
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="white">Status</Text>
                      <Badge colorScheme={project.active ? 'green' : 'gray'}>
                        {project.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="white">Client</Text>
                      <Text fontSize="sm" color="white">
                        {project.clientId ? (
                          <HStack spacing={1}>
                            <Text>{project.clientId.name}</Text>
                            {project.clientId.company && (
                              <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                                {project.clientId.company}
                              </Badge>
                            )}
                          </HStack>
                        ) : (
                          'No client assigned'
                        )}
                      </Text>
                    </HStack>
                  </VStack>
                </Box>

                {/* Sharing Information */}
                {project.isShared && (
                  <Box p={4} border="1px" borderColor={borderColor} borderRadius="md">
                    <Text fontSize="md" fontWeight="semibold" mb={3} color="white">Sharing</Text>
                    <VStack align="start" spacing={2}>
                      <HStack>
                        <Badge colorScheme="green">Shared</Badge>
                        <Badge colorScheme={project.sharePermission === 'editable' ? 'blue' : 'gray'}>
                          {project.sharePermission}
                        </Badge>
                      </HStack>

                      {project.shareViewCount > 0 && (
                        <HStack>
                          <ViewIcon />
                          <Text fontSize="sm" color="white">{project.shareViewCount} views</Text>
                        </HStack>
                      )}

                      {project.lastViewedAt && (
                        <HStack>
                          <TimeIcon />
                          <Text fontSize="sm" color="white">
                            Last viewed: {formatDate(project.lastViewedAt)}
                          </Text>
                        </HStack>
                      )}

                      {project.shareCreatedAt && (
                        <HStack>
                          <TimeIcon />
                          <Text fontSize="sm" color="white">
                            Shared: {formatDate(project.shareCreatedAt)}
                          </Text>
                        </HStack>
                      )}

                      {project.shareExpiresAt && (
                        <HStack>
                          <TimeIcon />
                          <Text fontSize="sm" color="white">
                            Expires: {formatDate(project.shareExpiresAt)}
                          </Text>
                        </HStack>
                      )}
                    </VStack>
                  </Box>
                )}

                {/* Edit Form */}
                {isEditing && (
                  <Box p={4} border="1px" borderColor={borderColor} borderRadius="md" bg={editFormBgColor}>
                    <Text fontSize="md" fontWeight="semibold" mb={3}>Edit Project</Text>
                    <VStack spacing={4} align="stretch">
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={2}>Name</Text>
                        <Input
                          value={editedProject.name}
                          onChange={(e) => setEditedProject(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Project name"
                        />
                      </Box>
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={2}>Description</Text>
                        <Textarea
                          value={editedProject.description}
                          onChange={(e) => setEditedProject(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Project description"
                          rows={3}
                        />
                      </Box>
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={2}>Client</Text>
                        <Select
                          value={editedProject.clientId}
                          onChange={(e) => setEditedProject(prev => ({ ...prev, clientId: e.target.value }))}
                          placeholder="Select a client"
                          isDisabled={clientsLoading}
                        >
                          <option value="">No client assigned</option>
                          {clients.map((client) => (
                            <option key={client._id} value={client._id}>
                              {client.name} {client.company ? `(${client.company})` : ''}
                            </option>
                          ))}
                        </Select>
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
                    {isEditing ? 'Cancel Edit' : 'Edit Project'}
                  </Button>
                  {/* Show delete or leave button based on ownership */}
                  {isShared ? (
                    <Button
                      leftIcon={<DeleteIcon />}
                      colorScheme="orange"
                      variant="outline"
                      onClick={onDeleteOpen}
                      w="full"
                    >
                      Leave Project
                    </Button>
                  ) : (
                    <Button
                      leftIcon={<DeleteIcon />}
                      colorScheme="red"
                      variant="outline"
                      onClick={onDeleteOpen}
                      w="full"
                    >
                      Delete Project
                    </Button>
                  )}
                  {/* Only show share button if user owns the project */}
                  {!project.isSharedWithMe && (
                    <Button
                      leftIcon={<ExternalLinkIcon />}
                      colorScheme="blue"
                      onClick={() => onShareProject && onShareProject(project)}
                      w="full"
                    >
                      Share Project
                    </Button>
                  )}
                  <Button
                    leftIcon={<CheckCircleIcon />}
                    colorScheme="green"
                    variant="solid"
                    onClick={handleCreateInvoice}
                    w="full"
                  >
                    Create Invoice from Tasks
                  </Button>
                </VStack>

                {/* Desktop Actions */}
                <HStack spacing={3} justify="flex-end" display={{ base: 'none', md: 'flex' }}>
                  <Button
                    leftIcon={<EditIcon />}
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? 'Cancel Edit' : 'Edit Project'}
                  </Button>
                  {/* Show delete or leave button based on ownership */}
                  {isShared ? (
                    <Button
                      leftIcon={<DeleteIcon />}
                      colorScheme="orange"
                      variant="outline"
                      onClick={onDeleteOpen}
                    >
                      Leave Project
                    </Button>
                  ) : (
                    <Button
                      leftIcon={<DeleteIcon />}
                      colorScheme="red"
                      variant="outline"
                      onClick={onDeleteOpen}
                    >
                      Delete Project
                    </Button>
                  )}
                  {/* Only show share button if user owns the project */}
                  {!project.isSharedWithMe && (
                    <Button
                      leftIcon={<ExternalLinkIcon />}
                      colorScheme="blue"
                      onClick={() => onShareProject && onShareProject(project)}
                    >
                      Share Project
                    </Button>
                  )}
                  <Button
                    leftIcon={<CheckCircleIcon />}
                    colorScheme="green"
                    variant="solid"
                    onClick={handleCreateInvoice}
                  >
                    Create Invoice from Tasks
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

export default ProjectDetailPanel;
