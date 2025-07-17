import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  List,
  ListItem,
  Heading,
  Flex,
  VStack,
  HStack,
  Text,
  useToast,
  Spinner,
  useColorMode,
  useDisclosure,
  useBreakpointValue,
} from '@chakra-ui/react';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import apiService from '../services/api';
import { useNavigate } from 'react-router-dom';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import FeedbackModal from './FeedbackModal';
import Sidebar from './Sidebar';
import MobileBackdropOverlay from './MobileBackdropOverlay';
import { useAuth } from '../contexts/AuthContext';

export default function InvoiceCreatePanel() {
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const { logout, user } = useAuth();
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Sidebar and layout state
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? JSON.parse(saved) : !isMobile;
  });
  const [isCenterOpen, setIsCenterOpen] = useState(() => {
    const saved = localStorage.getItem('centerOpen');
    return saved !== null ? JSON.parse(saved) : !isMobile;
  });

  // TopBar state
  const [searchQuery, setSearchQuery] = useState('');

  // Feedback modal state
  const { isOpen: isFeedbackModalOpen, onOpen: openFeedbackModal, onClose: closeFeedbackModal } = useDisclosure({ defaultIsOpen: false });

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

  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clientId, setClientId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [lineItems, setLineItems] = useState([]);
  const [newItem, setNewItem] = useState({ description: '', hours: 0, rate: 0 });
  const [total, setTotal] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [importingTasks, setImportingTasks] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [clientsRes, projectsRes] = await Promise.all([
          apiService.getClients(),
          apiService.getProjects()
        ]);

        // The API service already extracts the data property, so responses are the arrays directly
        const clientsData = clientsRes || [];
        const projectsData = projectsRes || [];

        setClients(clientsData || []);
        setProjects(projectsData || []);

        // Check for state from navigation (e.g., from project detail)
        const state = window.history.state?.usr;
        if (state) {
          if (state.projectId) setProjectId(state.projectId);
          if (state.clientId) setClientId(state.clientId);
          if (state.lineItems) setLineItems(state.lineItems);
        }
          } catch (error) {
        setError('Failed to load data. Please try again.');
        toast({ title: 'Failed to load data', status: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);

  useEffect(() => {
    const sum = lineItems.reduce((acc, item) => acc + (item.hours * item.rate), 0);
    setTotal(sum);
  }, [lineItems]);

  useEffect(() => {
    // If projectId is set but clientId is not, try to set clientId from project
    if (projectId && !clientId && projects.length > 0) {
      const proj = projects.find(p => p._id === projectId);
      if (proj && proj.clientId) {
        // Handle both populated clientId object and string clientId
        const projectClientId = proj.clientId._id || proj.clientId;
        setClientId(projectClientId);
      }
    }
  }, [projectId, clientId, projects]);

  const addLineItem = () => {
    if (!newItem.description.trim()) return;
    setLineItems([...lineItems, { ...newItem, amount: newItem.hours * newItem.rate }]);
    setNewItem({ description: '', hours: 0, rate: 0 });
  };

  const updateLineItem = (idx, field, value) => {
    setLineItems(items => items.map((item, i) => i === idx ? { ...item, [field]: value, amount: field === 'hours' || field === 'rate' ? (field === 'hours' ? value : item.hours) * (field === 'rate' ? value : item.rate) : item.amount } : item));
  };

  const removeLineItem = (idx) => {
    setLineItems(items => items.filter((_, i) => i !== idx));
  };

  const importTasksFromProject = async () => {
    if (!projectId) {
      toast({ title: 'Please select a project first', status: 'warning' });
      return;
    }

    try {
      setImportingTasks(true);

      let tasksResponse;
      let projectName;

      if (projectId === 'general') {
        // Handle general tasks (tasks without a specific project)
        console.log('Fetching general tasks...');
        const allTasksResponse = await apiService.getTasks();
        const allTasks = Array.isArray(allTasksResponse) ? allTasksResponse : (allTasksResponse?.data || []);

        console.log('All tasks fetched:', allTasks.length);

        // Filter tasks that belong to general project (either project is "general" or null/undefined)
        tasksResponse = allTasks.filter(task =>
          !task.project ||
          task.project === 'general' ||
          task.project.toLowerCase() === 'general'
        );

        projectName = 'General Tasks';
        console.log('General tasks filtered:', tasksResponse.length);
      } else {
        // Handle specific projects
        const selectedProject = projects.find(p => p._id === projectId);
        if (!selectedProject) {
          toast({ title: 'Project not found', status: 'error' });
          return;
        }

        console.log('Selected project:', selectedProject);
        console.log('Project name:', selectedProject.name);

        console.log('Fetching tasks for project:', selectedProject.name);
        tasksResponse = await apiService.getTasks({ project: selectedProject.name });
        tasksResponse = Array.isArray(tasksResponse) ? tasksResponse : (tasksResponse?.data || []);
        projectName = selectedProject.name;
        console.log('Tasks for project:', tasksResponse.length);
      }

      if (tasksResponse.length === 0) {
        toast({ title: 'No tasks found for this project', status: 'info' });
        return;
      }

      console.log('Tasks with time tracking:', tasksResponse.filter(t => t.timeTracking && t.timeTracking.totalTime > 0).length);

      // Convert tasks to line items with time tracking data
      const newLineItems = tasksResponse
        .filter(task => task.timeTracking && task.timeTracking.totalTime > 0) // Only include tasks with time tracking
        .map(task => ({
          description: task.title,
          hours: (task.timeTracking.totalTime || 0) / 3600, // Convert seconds to hours
          rate: 0, // Default rate, user can edit
          amount: 0 // Will be calculated based on hours * rate
        }));

      if (newLineItems.length === 0) {
        toast({ title: 'No tasks with time tracking found for this project', status: 'info' });
        return;
      }

      // Replace existing line items with imported ones
      setLineItems(newLineItems);

      toast({
        title: `Imported ${newLineItems.length} tasks from ${projectName}`,
        status: 'success'
      });
    } catch (error) {
      console.error('Error importing tasks:', error);
      toast({
        title: 'Failed to import tasks',
        description: error.message || 'Please try again',
        status: 'error'
      });
    } finally {
      setImportingTasks(false);
    }
  };

  const handleSubmit = async () => {
    if (!clientId || !projectId || lineItems.length === 0) {
      toast({ title: 'Client, project, and at least one line item required', status: 'warning' });
      return;
    }
    setSubmitting(true);
    try {
      const response = await apiService.createInvoice({
        clientId,
        projectId,
        lineItems,
        total
      });
      toast({ title: 'Invoice created successfully!', status: 'success' });
      navigate('/invoices');
    } catch (error) {
      console.error('Invoice creation error:', error);
      toast({
        title: 'Failed to create invoice',
        description: error.message || 'Please try again',
        status: 'error'
      });
    } finally {
      setSubmitting(false);
    }
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

  if (loading) {
    return (
      <Box minH="100vh" bg={colorMode === 'dark' ? 'gray.900' : 'gray.50'}>
        <Flex h="100vh" overflow="hidden">
          <Flex flex="1" direction="column">
            <TopBar
              colorMode={colorMode}
              toggleColorMode={toggleColorMode}
              isOnline={true}
              currentView="invoices"
              searchTerm={searchQuery}
              handleSearch={() => {}}
              resetToAllTasks={resetToAllTasks}
              isSidebarOpen={isSidebarOpen}
              isCenterOpen={isCenterOpen}
              onLogout={handleLogout}
            />
            <Box flex="1" overflowY="auto" p={4}>
              <Box maxW="lg" mx="auto" mt={8} p={4} textAlign="center">
                <Spinner size="xl" color="white" />
                <Text color="white" mt={4}>Loading...</Text>
              </Box>
            </Box>
          </Flex>
        </Flex>
      </Box>
    );
  }

  if (error) {
    return (
      <Box minH="100vh" bg={colorMode === 'dark' ? 'gray.900' : 'gray.50'}>
        <Flex h="100vh" overflow="hidden">
          <Flex flex="1" direction="column">
            <TopBar
              colorMode={colorMode}
              toggleColorMode={toggleColorMode}
              isOnline={true}
              currentView="invoices"
              searchTerm={searchQuery}
              handleSearch={handleSearch}
              resetToAllTasks={resetToAllTasks}
              isSidebarOpen={isSidebarOpen}
              isCenterOpen={isCenterOpen}
              onLogout={handleLogout}
            />
            <Box flex="1" overflowY="auto" p={4}>
              <Box maxW="lg" mx="auto" mt={8} p={4} textAlign="center">
                <Text color="red.300" mb={4}>{error}</Text>
                <Button onClick={() => window.location.reload()} colorScheme="blue">
                  Retry
                </Button>
              </Box>
            </Box>
          </Flex>
        </Flex>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={colorMode === 'dark' ? 'gray.900' : 'gray.50'}>
      <Flex h="100vh" overflow="hidden">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          isCenterOpen={isCenterOpen}
          colorMode={colorMode}
          dayTasks={() => ({})}
          expandedDays={{}}
          getCurrentDay={() => ''}
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
            currentView="invoices"
            searchTerm={searchQuery}
            handleSearch={handleSearch}
            resetToAllTasks={resetToAllTasks}
            isSidebarOpen={isSidebarOpen}
            isCenterOpen={isCenterOpen}
            onLogout={handleLogout}
          />

          <Box flex="1" overflowY="auto" p={4}>
            <Box maxW="lg" mx="auto" borderWidth={1} borderRadius="md" boxShadow="md" bg="gray.800" p={4}>
              <HStack justify="space-between" mb={4}>
                <HStack spacing={4} align="center">
                  <Button
                    leftIcon={<ChevronLeftIcon />}
                    variant="ghost"
                    onClick={() => navigate('/invoices')}
                    color="gray.300"
                    _hover={{ bg: 'gray.700' }}
                  >
                    Back
                  </Button>
                  <Heading size="md" color="white">Create Invoice</Heading>
                </HStack>
              </HStack>

              <VStack spacing={2} align="stretch" mb={4}>
                <Select placeholder="Select client" value={clientId} onChange={e => setClientId(e.target.value)} bg="gray.700" color="white">
                  {(clients || []).map(client => (
                    <option key={client._id} value={client._id}>{client.company || client.name} {client.company && client.name ? `(${client.name})` : ''}</option>
                  ))}
                </Select>
                <Select placeholder="Select project" value={projectId} onChange={e => setProjectId(e.target.value)} bg="gray.700" color="white">
                  <option value="general">General Tasks</option>
                  {(projects || []).filter(p => {
                    // Handle both populated clientId object and string clientId
                    const projectClientId = p.clientId?._id || p.clientId;
                    return !clientId || projectClientId === clientId;
                  }).map(project => (
                    <option key={project._id} value={project._id}>{project.name}</option>
                  ))}
                </Select>

                {/* Import Tasks Button */}
                {projectId && (
                  <Button
                    onClick={importTasksFromProject}
                    isLoading={importingTasks}
                    loadingText="Importing tasks..."
                    colorScheme="blue"
                    variant="outline"
                    size="sm"
                    w="fit-content"
                  >
                    Import Tasks from Project
                  </Button>
                )}

                <HStack gap={2} mb={1}>
                  <Text color="gray.300" fontSize="sm" w="180px">Task Name</Text>
                  <Text color="gray.300" fontSize="sm" w="120px">Hours</Text>
                  <Text color="gray.300" fontSize="sm" w="120px">Rate</Text>
                </HStack>
                {lineItems.map((item, idx) => (
                  <HStack key={idx} gap={2} mb={2} wrap="wrap">
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={e => updateLineItem(idx, 'description', e.target.value)}
                      bg="gray.700" color="white"
                      w="180px"
                    />
                    <Input
                      value={item.hours || 0}
                      onChange={e => updateLineItem(idx, 'hours', Number(e.target.value))}
                      placeholder="Hours"
                      bg="gray.700"
                      color="white"
                      w="120px"
                    />
                    <NumberInput value={item.rate} min={0} onChange={val => updateLineItem(idx, 'rate', Number(val))} w="120px">
                      <NumberInputField placeholder="Rate" />
                    </NumberInput>
                    <Button onClick={() => removeLineItem(idx)} colorScheme="red" size="sm">Remove</Button>
                  </HStack>
                ))}
                <Flex gap={2} mb={2} wrap="wrap">
                  <Input
                    placeholder="Description"
                    value={newItem.description}
                    onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                    bg="gray.700" color="white"
                    w="180px"
                  />
                  <Input
                    value={newItem.hours}
                    onChange={e => setNewItem({ ...newItem, hours: Number(e.target.value) })}
                    placeholder="Hours"
                    bg="gray.700"
                    color="white"
                    w="120px"
                  />
                  <NumberInput value={newItem.rate} min={0} onChange={val => setNewItem({ ...newItem, rate: Number(val) })} w="120px">
                    <NumberInputField placeholder="Rate" />
                  </NumberInput>
                  <Button onClick={addLineItem} colorScheme="blue">Add</Button>
                </Flex>
                <Box fontWeight="bold" mb={2} color="white">Total: ${total.toFixed(2)}</Box>
                <Button onClick={handleSubmit} colorScheme="green" isLoading={submitting}>
                  Create Invoice
                </Button>
              </VStack>
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

      <FeedbackModal isOpen={isFeedbackModalOpen} onClose={closeFeedbackModal} />
    </Box>
  );
};
