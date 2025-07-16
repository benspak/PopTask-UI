import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Input,
  List,
  ListItem,
  Spinner,
  Heading,
  VStack,
  HStack,
  Text,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  IconButton,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Flex,
  Badge,
  Select,
  Checkbox,
  Divider,
  useColorMode,
  useBreakpointValue,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, AddIcon, ChevronLeftIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { useClients } from '../hooks/useClients';
import apiService from '../services/api';
import ClientLimitsDisplay from './ClientLimitsDisplay';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import MobileBackdropOverlay from './MobileBackdropOverlay';
import FeedbackModal from './FeedbackModal';
import { useAuth } from '../contexts/AuthContext';

export default function ClientList() {
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Initialize sidebar state from localStorage
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? JSON.parse(saved) : !isMobile;
  });

  // Initialize center panel state from localStorage
  const [isCenterOpen, setIsCenterOpen] = useState(() => {
    const saved = localStorage.getItem('centerOpen');
    return saved !== null ? JSON.parse(saved) : !isMobile;
  });

  const { clients, loading, error, loadClients, createClient, updateClient, deleteClient } = useClients();
  const [newClient, setNewClient] = useState({ name: '', email: '', company: '', notes: '' });
  const [editingClient, setEditingClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

  const toast = useToast();
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen: isCreateOpen, onOpen: openCreate, onClose: closeCreate } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: openEdit, onClose: closeEdit } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: openDelete, onClose: closeDelete } = useDisclosure();
  const { isOpen: isFeedbackModalOpen, onOpen: openFeedbackModal, onClose: closeFeedbackModal } = useDisclosure();
  const { logout, user } = useAuth();

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

  // TopBar state
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  // Load projects when create modal opens
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setProjectsLoading(true);
        const response = await apiService.getProjects();
        const projectsData = response?.data || [];
        setProjects(projectsData);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load projects',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setProjectsLoading(false);
      }
    };

    if (isCreateOpen) {
      loadProjects();
      setSelectedProjects([]);
    }
  }, [isCreateOpen, toast]);

  // Debug logging removed for production

  const handleAdd = async () => {
    if (!newClient.name.trim()) {
      toast({ title: 'Name is required', status: 'warning' });
      return;
    }
    setAdding(true);
    try {
      // Create the client first
      const result = await createClient(newClient);

      // If projects are selected, assign them to the client
      if (selectedProjects.length > 0) {
        try {
          await apiService.assignProjectsToClient(result._id, selectedProjects);
          toast({
            title: 'Client added with projects',
            description: `${selectedProjects.length} project(s) assigned to client`,
            status: 'success'
          });
        } catch (assignError) {
          toast({
            title: 'Client added but project assignment failed',
            description: 'You can assign projects later in the project details',
            status: 'warning'
          });
        }
      } else {
        toast({ title: 'Client added', status: 'success' });
      }

      setNewClient({ name: '', email: '', company: '', notes: '' });
      setSelectedProjects([]);
      closeCreate();
      // Refresh the client list to show the newly added client
      loadClients();
    } catch (error) {
      // Handle limit errors specifically
      if (error.isLimitError || error.message?.includes('Client limit reached')) {
        toast({
          title: 'Client limit reached',
          status: 'error',
          description: 'Basic users can only create up to 3 clients. Upgrade to Pro for unlimited clients.',
          duration: 6000,
          isClosable: true
        });
      } else {
        toast({ title: 'Failed to add client', status: 'error', description: error.message });
      }
    } finally {
      setAdding(false);
    }
  };

  const handleEdit = async () => {
    if (!editingClient || !editingClient.name.trim()) {
      toast({ title: 'Name is required', status: 'warning' });
      return;
    }
    setUpdating(true);
    try {
      await updateClient(editingClient._id, editingClient);
      toast({ title: 'Client updated', status: 'success' });
      closeEdit();
      setEditingClient(null);
      loadClients();
    } catch (error) {
      toast({ title: 'Failed to update client', status: 'error', description: error.message });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!clientToDelete) return;

    setDeleting(true);
    try {
      await deleteClient(clientToDelete._id);
      toast({ title: 'Client deleted', status: 'success' });
      closeDelete();
      setClientToDelete(null);
      loadClients();
    } catch (error) {
      toast({ title: 'Failed to delete client', status: 'error', description: error.message });
    } finally {
      setDeleting(false);
    }
  };

  const openEditModal = (client) => {
    setEditingClient({ ...client });
    openEdit();
  };

  const openDeleteModal = (client) => {
    setClientToDelete(client);
    openDelete();
  };

  // TopBar handlers
  const handleSearch = (value) => setSearchQuery(value);
  const resetToAllTasks = () => navigate('/dashboard');
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      toast({ title: 'Logout failed', status: 'error' });
    }
  };

  return (
    <Box minH="100vh" bg={colorMode === 'dark' ? 'gray.900' : 'gray.50'}>
      <Flex h="100vh" overflow="hidden">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          isCenterOpen={isCenterOpen}
          colorMode={colorMode}
          dayTasks={() => []}
          expandedDays={{}}
          getCurrentDay={() => new Date()}
          toggleSidebar={toggleSidebar}
          handleDayClick={() => {}}
          handleWeeklyTaskClick={() => {}}
          toggleTaskCompleted={() => {}}
          renderFileAttachmentIndicator={() => null}
          // Shared content props
          sharedTasks={[]}
          sharedProjects={[]}
          sharedTasksLoading={false}
          sharedProjectsLoading={false}
          sharedTasksError={null}
          sharedProjectsError={null}
          isSharedContentExpanded={false}
          toggleSharedContentExpanded={() => {}}
          onSharedTaskClick={() => {}}
          onSharedProjectClick={() => {}}
          refreshSharedContent={() => {}}
          dismissSharedTasksError={() => {}}
          // Navigation props
          resetToAllTasks={resetToAllTasks}
          isProUser={user?.userType === 'pro'}
        />

        <Flex flex="1" direction="column">
          <TopBar
            colorMode={colorMode}
            toggleColorMode={toggleColorMode}
            isOnline={true}
            currentView="clients"
            searchTerm={searchQuery}
            handleSearch={handleSearch}
            resetToAllTasks={resetToAllTasks}
            isSidebarOpen={isSidebarOpen}
            isCenterOpen={isCenterOpen}
            onLogout={handleLogout}
          />

          <Box flex="1" overflowY="auto" p={4} mb={{ base: "80px", md: "60px" }}>
            <Box maxW="4xl" mx="auto">

      {/* Client Limits Display */}
      <ClientLimitsDisplay showNotification={true} />

      {error && (
        <Box bg="red.500" color="white" p={3} borderRadius="md" mb={4}>
          {error}
        </Box>
      )}

      {loading ? (
        <Flex justify="center" p={8}>
          <Spinner size="xl" color="white" />
        </Flex>
      ) : (
        <Box>
          {!clients || clients.length === 0 ? (
            <Box textAlign="center" p={8}>
              <Text color="gray.400" fontSize="lg">No clients yet.</Text>
              <Text color="gray.500" fontSize="sm" mt={2}>
                Click "Add Client" to create your first client.
              </Text>
            </Box>
          ) : (
            <VStack spacing={3} align="stretch">
              {clients.filter(client => client && typeof client === 'object' && client._id).map(client => (
                <Box
                  key={client._id}
                  bg="gray.800"
                  p={4}
                  borderRadius="md"
                  border="1px solid"
                  borderColor="gray.700"
                  _hover={{ borderColor: "gray.600" }}
                >
                  <Flex justify="space-between" align="start">
                    <Box flex="1">
                      <HStack spacing={3} mb={2}>
                        <Text fontWeight="bold" color="white" fontSize="lg">
                          {typeof client.name === 'string' ? client.name : 'Unnamed Client'}
                        </Text>
                        {client.company && typeof client.company === 'string' && (
                          <Badge colorScheme="blue" variant="subtle">
                            {client.company}
                          </Badge>
                        )}
                      </HStack>

                      {client.email && typeof client.email === 'string' && (
                        <Text fontSize="sm" color="gray.300" mb={1}>
                          📧 {client.email}
                        </Text>
                      )}

                      {client.notes && typeof client.notes === 'string' && (
                        <Text fontSize="sm" color="gray.400" mt={2}>
                          📝 {client.notes}
                        </Text>
                      )}
                    </Box>

                    <HStack spacing={2}>
                      <IconButton
                        icon={<EditIcon />}
                        size="sm"
                        variant="ghost"
                        colorScheme="blue"
                        onClick={() => openEditModal(client)}
                        aria-label="Edit client"
                      />
                      <IconButton
                        icon={<DeleteIcon />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => openDeleteModal(client)}
                        aria-label="Delete client"
                      />
                    </HStack>
                  </Flex>
                </Box>
              ))}
            </VStack>
          )}
        </Box>
      )}

      {/* Create Client Modal */}
      <Modal isOpen={isCreateOpen} onClose={closeCreate} isCentered size="lg">
        <ModalOverlay />
        <ModalContent bg="gray.800">
          <ModalHeader color="white">Add New Client</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              {/* Client Information */}
              <VStack spacing={3} align="stretch">
                <Text fontSize="sm" fontWeight="medium" color="white">Client Information</Text>
                <Input
                  placeholder="Name *"
                  value={newClient.name}
                  onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                  bg="gray.700"
                  color="white"
                  borderColor="gray.600"
                  _focus={{ borderColor: "blue.400" }}
                />
                <Input
                  placeholder="Email"
                  value={newClient.email}
                  onChange={e => setNewClient({ ...newClient, email: e.target.value })}
                  bg="gray.700"
                  color="white"
                  borderColor="gray.600"
                  _focus={{ borderColor: "blue.400" }}
                />
                <Input
                  placeholder="Company"
                  value={newClient.company}
                  onChange={e => setNewClient({ ...newClient, company: e.target.value })}
                  bg="gray.700"
                  color="white"
                  borderColor="gray.600"
                  _focus={{ borderColor: "blue.400" }}
                />
                <Input
                  placeholder="Notes"
                  value={newClient.notes}
                  onChange={e => setNewClient({ ...newClient, notes: e.target.value })}
                  bg="gray.700"
                  color="white"
                  borderColor="gray.600"
                  _focus={{ borderColor: "blue.400" }}
                />
              </VStack>

              <Divider borderColor="gray.600" />

              {/* Project Assignment */}
              <VStack spacing={3} align="stretch">
                <Text fontSize="sm" fontWeight="medium" color="white">Assign Projects (Optional)</Text>
                {projectsLoading ? (
                  <Box textAlign="center" py={4}>
                    <Spinner size="sm" color="white" />
                    <Text fontSize="sm" color="gray.400" mt={2}>Loading projects...</Text>
                  </Box>
                ) : projects.length === 0 ? (
                  <Box textAlign="center" py={4}>
                    <Text fontSize="sm" color="gray.400">No projects available to assign</Text>
                  </Box>
                ) : (
                  <VStack spacing={2} align="stretch" maxH="200px" overflowY="auto">
                    {projects.map((project) => (
                      <Checkbox
                        key={project._id}
                        isChecked={selectedProjects.includes(project._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProjects(prev => [...prev, project._id]);
                          } else {
                            setSelectedProjects(prev => prev.filter(id => id !== project._id));
                          }
                        }}
                        color="white"
                        _checked={{ color: "blue.400" }}
                      >
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" fontWeight="medium">{project.name}</Text>
                          {project.description && (
                            <Text fontSize="xs" color="gray.400">{project.description}</Text>
                          )}
                        </VStack>
                      </Checkbox>
                    ))}
                  </VStack>
                )}
                {selectedProjects.length > 0 && (
                  <Text fontSize="xs" color="blue.400">
                    {selectedProjects.length} project(s) selected
                  </Text>
                )}
              </VStack>

              <HStack spacing={3} justify="flex-end">
                <Button onClick={closeCreate} variant="ghost" color="white">
                  Cancel
                </Button>
                <Button
                  onClick={handleAdd}
                  colorScheme="blue"
                  isLoading={adding}
                  loadingText="Creating..."
                >
                  Add Client
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Edit Client Modal */}
      <Modal isOpen={isEditOpen} onClose={closeEdit} isCentered>
        <ModalOverlay />
        <ModalContent bg="gray.800">
          <ModalHeader color="white">Edit Client</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody pb={6}>
            {editingClient && (
              <VStack spacing={3}>
                <Input
                  placeholder="Name *"
                  value={editingClient.name || ''}
                  onChange={e => setEditingClient({ ...editingClient, name: e.target.value })}
                  bg="gray.700"
                  color="white"
                  borderColor="gray.600"
                  _focus={{ borderColor: "blue.400" }}
                />
                <Input
                  placeholder="Email"
                  value={editingClient.email || ''}
                  onChange={e => setEditingClient({ ...editingClient, email: e.target.value })}
                  bg="gray.700"
                  color="white"
                  borderColor="gray.600"
                  _focus={{ borderColor: "blue.400" }}
                />
                <Input
                  placeholder="Company"
                  value={editingClient.company || ''}
                  onChange={e => setEditingClient({ ...editingClient, company: e.target.value })}
                  bg="gray.700"
                  color="white"
                  borderColor="gray.600"
                  _focus={{ borderColor: "blue.400" }}
                />
                <Input
                  placeholder="Notes"
                  value={editingClient.notes || ''}
                  onChange={e => setEditingClient({ ...editingClient, notes: e.target.value })}
                  bg="gray.700"
                  color="white"
                  borderColor="gray.600"
                  _focus={{ borderColor: "blue.400" }}
                />
                <HStack spacing={3} w="full" justify="flex-end">
                  <Button onClick={closeEdit} variant="ghost">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleEdit}
                    colorScheme="blue"
                    isLoading={updating}
                  >
                    Update Client
                  </Button>
                </HStack>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

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
            handleAddProject={() => {}}
            handleAddClient={openCreate}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog isOpen={isDeleteOpen} onClose={closeDelete}>
        <AlertDialogOverlay>
          <AlertDialogContent bg="gray.800">
            <AlertDialogHeader color="white">
              Delete Client
            </AlertDialogHeader>
            <AlertDialogBody color="gray.300">
              Are you sure you want to delete "{clientToDelete?.name}"? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button onClick={closeDelete} variant="ghost">
                Cancel
              </Button>
              <Button
                colorScheme="red"
                ml={3}
                onClick={handleDelete}
                isLoading={deleting}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={closeFeedbackModal}
      />
    </Box>
  );
};

export const ClientCreateModal = ({ isOpen, onClose, onClientAdded }) => {
  const [newClient, setNewClient] = useState({ name: '', email: '', company: '', notes: '' });
  const [projects, setProjects] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const toast = useToast();

  // Load projects when modal opens
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setProjectsLoading(true);
        const response = await apiService.getProjects();
        const projectsData = response?.data || [];
        setProjects(projectsData);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load projects',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setProjectsLoading(false);
      }
    };

    if (isOpen) {
      loadProjects();
      setSelectedProjects([]);
    }
  }, [isOpen, toast]);

  const handleAdd = async () => {
    if (!newClient.name.trim()) {
      toast({ title: 'Name is required', status: 'warning' });
      return;
    }
    setAdding(true);
    try {
      // Create the client first
      const result = await apiService.createClient(newClient);

      // If projects are selected, assign them to the client
      if (selectedProjects.length > 0) {
        try {
          await apiService.assignProjectsToClient(result._id, selectedProjects);
          toast({
            title: 'Client added with projects',
            description: `${selectedProjects.length} project(s) assigned to client`,
            status: 'success'
          });
        } catch (assignError) {
          console.error('Failed to assign projects:', assignError);
          toast({
            title: 'Client added but project assignment failed',
            description: 'You can assign projects later in the project details',
            status: 'warning'
          });
        }
      } else {
        toast({ title: 'Client added', status: 'success' });
      }

      setNewClient({ name: '', email: '', company: '', notes: '' });
      setSelectedProjects([]);
      onClose();
      // Call the callback to refresh the client list
      if (onClientAdded) {
        onClientAdded(result);
      }
    } catch (error) {
      // Handle limit errors specifically
      if (error.isLimitError || error.message?.includes('Client limit reached')) {
        toast({
          title: 'Client limit reached',
          status: 'error',
          description: 'Basic users can only create up to 3 clients. Upgrade to Pro for unlimited clients.',
          duration: 6000,
          isClosable: true
        });
      } else {
        toast({ title: 'Failed to add client', status: 'error', description: error.message });
      }
    } finally {
      setAdding(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent bg="gray.800">
        <ModalHeader color="white">Add New Client</ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            {/* Client Information */}
            <VStack spacing={3} align="stretch">
              <Text fontSize="sm" fontWeight="medium" color="white">Client Information</Text>
              <Input
                placeholder="Name *"
                value={newClient.name}
                onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                bg="gray.700"
                color="white"
                borderColor="gray.600"
                _focus={{ borderColor: "blue.400" }}
              />
              <Input
                placeholder="Email"
                value={newClient.email}
                onChange={e => setNewClient({ ...newClient, email: e.target.value })}
                bg="gray.700"
                color="white"
                borderColor="gray.600"
                _focus={{ borderColor: "blue.400" }}
              />
              <Input
                placeholder="Company"
                value={newClient.company}
                onChange={e => setNewClient({ ...newClient, company: e.target.value })}
                bg="gray.700"
                color="white"
                borderColor="gray.600"
                _focus={{ borderColor: "blue.400" }}
              />
              <Input
                placeholder="Notes"
                value={newClient.notes}
                onChange={e => setNewClient({ ...newClient, notes: e.target.value })}
                bg="gray.700"
                color="white"
                borderColor="gray.600"
                _focus={{ borderColor: "blue.400" }}
              />
            </VStack>

            <Divider borderColor="gray.600" />

            {/* Project Assignment */}
            <VStack spacing={3} align="stretch">
              <Text fontSize="sm" fontWeight="medium" color="white">Assign Projects (Optional)</Text>
              {projectsLoading ? (
                <Box textAlign="center" py={4}>
                  <Spinner size="sm" color="white" />
                  <Text fontSize="sm" color="gray.400" mt={2}>Loading projects...</Text>
                </Box>
              ) : projects.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <Text fontSize="sm" color="gray.400">No projects available to assign</Text>
                </Box>
              ) : (
                <VStack spacing={2} align="stretch" maxH="200px" overflowY="auto">
                  {projects.map((project) => (
                    <Checkbox
                      key={project._id}
                      isChecked={selectedProjects.includes(project._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProjects(prev => [...prev, project._id]);
                        } else {
                          setSelectedProjects(prev => prev.filter(id => id !== project._id));
                        }
                      }}
                      color="white"
                      _checked={{ color: "blue.400" }}
                    >
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="medium">{project.name}</Text>
                        {project.description && (
                          <Text fontSize="xs" color="gray.400">{project.description}</Text>
                        )}
                      </VStack>
                    </Checkbox>
                  ))}
                </VStack>
              )}
              {selectedProjects.length > 0 && (
                <Text fontSize="xs" color="blue.400">
                  {selectedProjects.length} project(s) selected
                </Text>
              )}
            </VStack>

            <HStack spacing={3} justify="flex-end">
              <Button onClick={onClose} variant="ghost" color="white">
                Cancel
              </Button>
              <Button
                onClick={handleAdd}
                colorScheme="blue"
                isLoading={adding}
                loadingText="Creating..."
              >
                Add Client
              </Button>
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
