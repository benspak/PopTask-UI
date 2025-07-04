import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Textarea,
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

const ProjectDetailPanel = ({
  project,
  tasks = [],
  onProjectUpdate,
  onProjectDelete,
  onClose,
  onShareProject,
  isOpen,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState({});
  const toast = useToast();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelRef = React.useRef();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    if (project) {
      setEditedProject({
        name: project.name || '',
        description: project.description || '',
        color: project.color || '#3182ce',
        active: project.active !== undefined ? project.active : true,
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const dateOnly = dateString.split('T')[0];
    const [year, month, day] = dateOnly.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString();
  };

  const getProjectStats = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Calculate total time tracked
    const totalTimeTracked = tasks.reduce((total, task) => {
      return total + (task.timeTracking?.totalTime || 0);
    }, 0);

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate,
      totalTimeTracked,
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

  if (!project) return null;

  const stats = getProjectStats();

  return (
    <>
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Project
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this project? This action cannot be undone and will affect all tasks in this project.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Delete
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
            <HStack spacing={3} align="center">
              <Box
                w={6}
                h={6}
                bg={project?.color || '#3182ce'}
                borderRadius="md"
                border="2px solid"
                borderColor={useColorModeValue('gray.200', 'gray.600')}
              />
              <Text>Project Details</Text>
            </HStack>
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
                <Box p={4} border="1px" borderColor={useColorModeValue('gray.200', 'gray.600')} borderRadius="md" bg={useColorModeValue('gray.50', 'gray.700')}>
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
                      <StatHelpText>{stats.completionRate}% completion rate</StatHelpText>
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
                  </SimpleGrid>
                </Box>

                {/* Project Information */}
                <Box p={4} border="1px" borderColor={useColorModeValue('gray.200', 'gray.600')} borderRadius="md">
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
                      <Text fontSize="sm" color="white">Color</Text>
                      <HStack spacing={2}>
                        <Box w={4} h={4} bg={project.color || '#3182ce'} borderRadius="sm" border="1px solid" borderColor="gray.300" />
                        <Text fontSize="sm" color="white">{project.color || '#3182ce'}</Text>
                      </HStack>
                    </HStack>
                  </VStack>
                </Box>

                {/* Sharing Information */}
                {project.isShared && (
                  <Box p={4} border="1px" borderColor={useColorModeValue('gray.200', 'gray.600')} borderRadius="md">
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
                  <Box p={4} border="1px" borderColor={useColorModeValue('gray.200', 'gray.600')} borderRadius="md" bg={useColorModeValue('gray.50', 'gray.700')}>
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
                        <Text fontSize="sm" fontWeight="medium" mb={2}>Color</Text>
                        <HStack>
                          <Input
                            type="color"
                            w="40px"
                            p={0}
                            value={editedProject.color}
                            onChange={(e) => setEditedProject(prev => ({ ...prev, color: e.target.value }))}
                          />
                          <Text fontSize="sm">{editedProject.color}</Text>
                        </HStack>
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
                  <Button
                    leftIcon={<DeleteIcon />}
                    colorScheme="red"
                    variant="outline"
                    onClick={onDeleteOpen}
                    w="full"
                  >
                    Delete Project
                  </Button>
                  <Button
                    leftIcon={<ExternalLinkIcon />}
                    colorScheme="blue"
                    onClick={() => onShareProject && onShareProject(project)}
                    w="full"
                  >
                    Share Project
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
                  <Button
                    leftIcon={<DeleteIcon />}
                    colorScheme="red"
                    variant="outline"
                    onClick={onDeleteOpen}
                  >
                    Delete Project
                  </Button>
                  <Button
                    leftIcon={<ExternalLinkIcon />}
                    colorScheme="blue"
                    onClick={() => onShareProject && onShareProject(project)}
                  >
                    Share Project
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
