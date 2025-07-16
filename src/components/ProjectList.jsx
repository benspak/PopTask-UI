import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Input,
  VStack,
  HStack,
  Text,
  useToast,
  useColorMode,
  Heading,
  SimpleGrid,
  Badge,
  IconButton,
  Tooltip,
  Spinner,
  Alert,
  AlertIcon,
  AlertDescription,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  Select,
  Divider,
  Flex,
  useBreakpointValue,
  Collapse,
} from '@chakra-ui/react';
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  SettingsIcon,
  ChevronLeftIcon,
  StarIcon,
  ExternalLinkIcon,
  CheckCircleIcon,
  AtSignIcon,
  DownloadIcon,
  ViewIcon,
  EditIcon as EditIcon2,
} from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { useClients } from '../hooks/useClients';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import DismissibleAlert from './DismissibleAlert';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import MobileBackdropOverlay from './MobileBackdropOverlay';
import FeedbackModal from './FeedbackModal';

export default function ProjectList() {
  const [newProject, setNewProject] = useState({ name: '', description: '', clientId: '' });
  const [editingProject, setEditingProject] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Sidebar and layout state
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? JSON.parse(saved) : !isMobile;
  });
  const [isCenterOpen, setIsCenterOpen] = useState(() => {
    const saved = localStorage.getItem('centerOpen');
    return saved !== null ? JSON.parse(saved) : !isMobile;
  });

  // Shared content state
  const [isSharedContentExpanded, setIsSharedContentExpanded] = useState(() => {
    const saved = localStorage.getItem('sharedContentExpanded');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Feedback modal state
  const { isOpen: isFeedbackModalOpen, onOpen: openFeedbackModal, onClose: closeFeedbackModal } = useDisclosure({ defaultIsOpen: false });

  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();

  // Safe useAuth call with error boundary
  let authResult;
  try {
    authResult = useAuth();
  } catch (error) {
    console.error('useAuth error:', error);
    authResult = { logout: () => {}, user: null };
  }
  const { logout, user } = authResult;

  // Ensure user is a valid object
  const safeUser = user && typeof user === 'object' ? user : null;

  // Safe useProjects call with error boundary
  let projectsResult;
  try {
    projectsResult = useProjects();
  } catch (error) {
    console.error('useProjects error:', error);
    projectsResult = {
      projects: [],
      sharedProjects: [],
      loading: false,
      sharedLoading: false,
      error: null,
      sharedError: null,
      dismissError: () => {},
      dismissSharedError: () => {},
      loadProjects: () => {},
      loadSharedProjects: () => {},
      refreshSharedProjects: () => {},
      createProject: () => {},
      updateProject: () => {},
      deleteProject: () => {},
    };
  }
  const {
    projects,
    sharedProjects,
    loading: projectsLoading,
    sharedLoading: sharedProjectsLoading,
    error: projectsError,
    sharedError: sharedProjectsError,
    dismissError: dismissProjectsError,
    dismissSharedError: dismissSharedProjectsError,
    loadProjects,
    loadSharedProjects,
    refreshSharedProjects,
    createProject,
    updateProject,
    deleteProject,
  } = projectsResult;

  // Ensure projects and sharedProjects are always arrays with proper validation
  const safeProjects = Array.isArray(projects)
    ? projects.filter(project =>
        project &&
        typeof project === 'object' &&
        project._id &&
        typeof project._id === 'string' &&
        project.name &&
        typeof project.name === 'string'
      )
    : [];
  const safeSharedProjects = Array.isArray(sharedProjects)
    ? sharedProjects.filter(project =>
        project &&
        typeof project === 'object' &&
        project._id &&
        typeof project._id === 'string' &&
        project.name &&
        typeof project.name === 'string'
      )
    : [];


  // Safe useClients call
  let clientsResult;
  try {
    clientsResult = useClients();
  } catch (error) {
    console.error('useClients error:', error);
    clientsResult = {
      clients: [],
      loadClients: () => {},
    };
  }
  const {
    clients: clientsData,
    loadClients,
  } = clientsResult;

  // Safe useTasks call
  let tasksResult;
  try {
    tasksResult = useTasks();
  } catch (error) {
    console.error('useTasks error:', error);
    tasksResult = {
      sharedTasks: [],
      sharedLoading: false,
      sharedError: null,
      dismissSharedError: () => {},
      loadSharedTasks: () => {},
      refreshSharedTasks: () => {},
    };
  }
  const {
    sharedTasks,
    sharedLoading: sharedTasksLoading,
    sharedError: sharedTasksError,
    dismissSharedError: dismissSharedTasksError,
    loadSharedTasks,
    refreshSharedTasks,
  } = tasksResult;

  // Ensure sharedTasks is always an array
  const safeSharedTasks = Array.isArray(sharedTasks) ? sharedTasks : [];

  // Toggle functions with localStorage persistence
  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    localStorage.setItem('sidebarOpen', JSON.stringify(newState));
  };

  const toggleCenter = () => {
    const newState = !isCenterOpen;
    setIsCenterOpen(newState);
    localStorage.setItem('centerOpen', JSON.stringify(newState));
  };

  // Shared content handlers
  const toggleSharedContentExpanded = () => {
    const newExpandedState = !isSharedContentExpanded;
    setIsSharedContentExpanded(newExpandedState);
    localStorage.setItem('sharedContentExpanded', JSON.stringify(newExpandedState));
  };

  const handleSharedProjectClick = (project) => {
    // Navigate to dashboard with project filter
    navigate('/dashboard', { state: { selectedProject: project.name } });
  };

  const handleSharedTaskClick = (task) => {
    // Navigate to dashboard with task selected
    navigate('/dashboard', { state: { selectedTask: task._id } });
  };

  const refreshSharedContent = async () => {
    try {
      await Promise.all([
        refreshSharedProjects(true),
        refreshSharedTasks(true)
      ]);
      toast({
        title: 'Success',
        description: 'Shared content refreshed',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refresh shared content',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Load clients when component mounts
  useEffect(() => {
    const loadClientsData = async () => {
      try {
        setClientsLoading(true);
        await loadClients();
      } catch (error) {
        console.error('Failed to load clients:', error);
        // Ensure clients is always an array even if loading fails
        setClients([]);
      } finally {
        setClientsLoading(false);
      }
    };

    loadClientsData();
  }, [loadClients]);

  // Update local clients state when clients data changes
  useEffect(() => {
    if (clientsData) {
      setClients(Array.isArray(clientsData) ? clientsData : []);
    }
  }, [clientsData]);

  // Ensure clients is always an array
  const safeClients = Array.isArray(clients) ? clients : [];

  const handleCreateProject = async () => {
    if (!newProject.name || typeof newProject.name !== 'string' || !newProject.name.trim()) {
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
      setCreating(true);
      await createProject(newProject);
      setNewProject({ name: '', description: '', clientId: '' });
      setIsCreateModalOpen(false);
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
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateProject = async () => {
    if (!editingProject || !editingProject.name || typeof editingProject.name !== 'string' || !editingProject.name.trim()) {
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
      setUpdating(true);



      await updateProject(editingProject._id, editingProject);
      setEditingProject(null);
      setIsEditModalOpen(false);
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
        description: error.message || 'Failed to update project',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      setDeleting(true);
      await deleteProject(projectToDelete._id);
      setProjectToDelete(null);
      setIsDeleteModalOpen(false);
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
        description: error.message || 'Failed to delete project',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDeleting(false);
    }
  };

  const openEditModal = (project) => {
    if (!project || !project._id) return;

    setEditingProject({
      ...project,
      clientId: project.clientId?._id || project.clientId || ''
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (project) => {
    if (!project || !project._id) return;

    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
  };

    const getClientName = (clientId) => {
    if (!clientId) return 'No client assigned';

    // Handle both populated client object and client ID string
    if (typeof clientId === 'object' && clientId !== null) {
      // Prioritize company name over contact name
      return clientId.company || clientId.name || 'Unknown client';
    }

    // If it's a string ID, try to find the client in the clients array
    if (typeof clientId === 'string') {
      const client = safeClients.find(c => c && c._id === clientId);
      return client ? (client.company || client.name) : 'Unknown client';
    }

    // Handle any other type (number, boolean, etc.) by converting to string
    if (clientId !== null && clientId !== undefined) {
      try {
        // Check if it's a primitive type that can be safely converted
        if (typeof clientId === 'string' || typeof clientId === 'number' || typeof clientId === 'boolean') {
          return String(clientId);
        }
        // If it's an object or other complex type, return a safe fallback
        return 'Unknown client';
      } catch (error) {
        return 'Unknown client';
      }
    }

    return 'Unknown client';
  };

  const resetToAllTasks = () => {
    navigate('/dashboard');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      // Logout error handled silently
    }
  };

  const bgColor = colorMode === 'light' ? 'white' : 'gray.800';
  const borderColor = colorMode === 'light' ? 'gray.200' : 'gray.700';
  const textColor = colorMode === 'light' ? 'gray.800' : 'white';

  return (
    <Box minH="100vh" bg={colorMode === 'dark' ? 'gray.900' : 'gray.50'}>
      <Flex h="100vh" overflow="hidden">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          isCenterOpen={isCenterOpen}
          colorMode={colorMode}
          dayTasks={{}}
          expandedDays={{}}
          getCurrentDay={() => ''}
          toggleSidebar={toggleSidebar}
          handleDayClick={() => {}}
          handleWeeklyTaskClick={() => {}}
          toggleTaskCompleted={() => {}}
          renderFileAttachmentIndicator={() => null}
          // Shared content props
          sharedTasks={safeSharedTasks}
          sharedProjects={safeSharedProjects}
          sharedTasksLoading={sharedTasksLoading}
          sharedProjectsLoading={sharedProjectsLoading}
          sharedTasksError={sharedTasksError}
          sharedProjectsError={sharedProjectsError}
          isSharedContentExpanded={isSharedContentExpanded}
          toggleSharedContentExpanded={toggleSharedContentExpanded}
          onSharedTaskClick={handleSharedTaskClick}
          onSharedProjectClick={handleSharedProjectClick}
          refreshSharedContent={refreshSharedContent}
          dismissSharedTasksError={dismissSharedTasksError}
          // Navigation props
          resetToAllTasks={resetToAllTasks}
          isProUser={safeUser?.userType === 'pro'}
        />

        <Flex flex="1" direction="column">
          <TopBar
            colorMode={colorMode}
            toggleColorMode={toggleColorMode}
            isOnline={true}
            currentView="projects"
            searchTerm=""
            handleSearch={() => {}}
            resetToAllTasks={resetToAllTasks}
            isSidebarOpen={isSidebarOpen}
            isCenterOpen={isCenterOpen}
            onLogout={handleLogout}
          />

          <Box flex="1" overflowY="auto" p={4} mb={{ base: "80px", md: "60px" }}>
            {/* Content */}
            <Box maxW="1200px" mx="auto">
              {/* Error Alert */}
              {projectsError && typeof projectsError === 'string' && (
                <DismissibleAlert
                  status="error"
                  title="Projects Error!"
                  description={projectsError}
                  onDismiss={dismissProjectsError}
                  mb={4}
                />
              )}

              {/* Projects Grid */}
              {projectsLoading === true ? (
                <Flex justify="center" align="center" py={20}>
                  <VStack spacing={4}>
                    <Spinner size="xl" color="blue.500" />
                    <Text color={textColor}>Loading projects...</Text>
                  </VStack>
                </Flex>
              ) : safeProjects.length === 0 ? (
                <Box textAlign="center" py={20}>
                  <VStack spacing={4}>
                    <SettingsIcon size="60px" color="gray.400" />
                    <Heading size="md" color="gray.500">No projects yet</Heading>
                    <Text color="gray.400">Create your first project to get started</Text>
                    <Button
                      leftIcon={<AddIcon />}
                      colorScheme="blue"
                      onClick={() => setIsCreateModalOpen(true)}
                    >
                      Create Project
                    </Button>
                  </VStack>
                </Box>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {safeProjects.filter(project => project && typeof project === 'object' && project._id).map((project) => (
                    <Box
                      key={project._id}
                      bg={bgColor}
                      border="1px"
                      borderColor={borderColor}
                      borderRadius="lg"
                      p={6}
                      _hover={{ shadow: 'md' }}
                      transition="all 0.2s"
                    >
                      <VStack align="stretch" spacing={4}>
                        {/* Project Header */}
                        <Flex justify="space-between" align="start">
                          <VStack align="start" spacing={1} flex={1}>
                            <Heading size="md" color={textColor} noOfLines={1}>
                              {typeof project?.name === 'string' ? project.name : 'Unnamed Project'}
                            </Heading>
                            <Text fontSize="sm" color="gray.500">
                              {getClientName(project?.clientId)}
                            </Text>
                          </VStack>
                          <HStack spacing={2}>
                            <Tooltip label="Edit project">
                              <IconButton
                                icon={<EditIcon />}
                                size="sm"
                                variant="ghost"
                                onClick={() => openEditModal(project)}
                                aria-label="Edit project"
                              />
                            </Tooltip>
                            <Tooltip label="Delete project">
                              <IconButton
                                icon={<DeleteIcon />}
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => openDeleteModal(project)}
                                aria-label="Delete project"
                              />
                            </Tooltip>
                          </HStack>
                        </Flex>

                        {/* Project Description */}
                        {project?.description && typeof project.description === 'string' && (
                          <Text fontSize="sm" color="gray.600" noOfLines={3}>
                            {project.description}
                          </Text>
                        )}

                        {/* Project Status */}
                        <HStack justify="space-between">
                          <Badge
                            colorScheme={project?.isOffline ? 'orange' : 'green'}
                            size="sm"
                          >
                            {project?.isOffline ? 'Offline' : 'Active'}
                          </Badge>
                          <Text fontSize="xs" color="gray.500">
                            Created {project?.createdAt && typeof project.createdAt === 'string' ? new Date(project.createdAt).toLocaleDateString() : 'Unknown date'}
                          </Text>
                        </HStack>

                        {/* Action Buttons */}
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            variant="outline"
                            leftIcon={<StarIcon />}
                            onClick={() => navigate('/tasks', { state: { selectedProject: typeof project?.name === 'string' ? project.name : 'Unnamed Project' } })}
                            flex={1}
                          >
                            View Tasks
                          </Button>
                          <Tooltip label="Project details">
                            <IconButton
                              icon={<ExternalLinkIcon />}
                              size="sm"
                              variant="outline"
                              onClick={() => navigate('/dashboard')}
                              aria-label="Project details"
                            />
                          </Tooltip>
                        </HStack>
                      </VStack>
                    </Box>
                  ))}
                </SimpleGrid>
              )}
            </Box>
          </Box>

          <BottomNav
            isSidebarOpen={isSidebarOpen}
            isCenterOpen={isCenterOpen}
            isAddMode={false}
            isFooterOpen={isFeedbackModalOpen}
            toggleSidebar={toggleSidebar}
            toggleCenter={toggleCenter}
            handleAddTask={() => {}}
            handleAddProject={() => setIsCreateModalOpen(true)}
            handleAddClient={() => {}}
            toggleDetail={() => {}}
            toggleFooter={openFeedbackModal}
            handleMobileTaskEdit={() => {}}
            isMobileTaskEditOpen={false}
          />
        </Flex>
      </Flex>

      <MobileBackdropOverlay
        isOpen={isSidebarOpen && isMobile}
        onClose={toggleSidebar}
      />

      {/* Create Project Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Project</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Project Name</FormLabel>
                <Input
                  value={typeof newProject.name === 'string' ? newProject.name : ''}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="Enter project name"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Description (Optional)</FormLabel>
                <Textarea
                  value={typeof newProject.description === 'string' ? newProject.description : ''}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Enter project description"
                  rows={3}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Client (Optional)</FormLabel>
                <Select
                  value={typeof newProject.clientId === 'string' ? newProject.clientId : ''}
                  onChange={(e) => setNewProject({ ...newProject, clientId: e.target.value })}
                  placeholder="Select a client"
                >
                  {safeClients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.company || client.name} {client.company && client.name ? `(${client.name})` : ''}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <Flex justify="flex-end" p={4} gap={3}>
            <Button onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button
              colorScheme="blue"
              onClick={handleCreateProject}
              isLoading={creating}
              loadingText="Creating..."
            >
              Create Project
            </Button>
          </Flex>
        </ModalContent>
      </Modal>

      {/* Edit Project Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Project</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Project Name</FormLabel>
                <Input
                  value={typeof editingProject?.name === 'string' ? editingProject.name : ''}
                  onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                  placeholder="Enter project name"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Description (Optional)</FormLabel>
                <Textarea
                  value={typeof editingProject?.description === 'string' ? editingProject.description : ''}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  placeholder="Enter project description"
                  rows={3}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Client (Optional)</FormLabel>
                <Select
                  value={typeof editingProject?.clientId === 'string' ? editingProject.clientId : ''}
                  onChange={(e) => setEditingProject({ ...editingProject, clientId: e.target.value })}
                  placeholder="Select a client"
                >
                  <option value="">No client assigned</option>
                  {safeClients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.company || client.name} {client.company && client.name ? `(${client.name})` : ''}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <Flex justify="flex-end" p={4} gap={3}>
            <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button
              colorScheme="blue"
              onClick={handleUpdateProject}
              isLoading={updating}
              loadingText="Updating..."
            >
              Update Project
            </Button>
          </Flex>
        </ModalContent>
      </Modal>

      {/* Delete Project Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Project</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text>
              Are you sure you want to delete "{typeof projectToDelete?.name === 'string' ? projectToDelete.name : 'this project'}"? This action cannot be undone.
            </Text>
          </ModalBody>
          <Flex justify="flex-end" p={4} gap={3}>
            <Button onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button
              colorScheme="red"
              onClick={handleDeleteProject}
              isLoading={deleting}
              loadingText="Deleting..."
            >
              Delete Project
            </Button>
          </Flex>
        </ModalContent>
      </Modal>

      {/* Feedback Modal */}
      <FeedbackModal isOpen={isFeedbackModalOpen} onClose={closeFeedbackModal} />
    </Box>
  );
}
