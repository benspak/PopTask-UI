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
  useColorMode
} from '@chakra-ui/react';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import apiService from '../services/api';
import { useNavigate } from 'react-router-dom';
import TopBar from './TopBar';
import { useAuth } from '../contexts/AuthContext';

export const InvoiceCreatePanel = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const { logout } = useAuth();

  // TopBar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCenterOpen, setIsCenterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

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

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [clientsRes, projectsRes] = await Promise.all([
          apiService.getClients(),
          apiService.getProjects()
        ]);

        // Handle both direct array response and response.data format
        const clientsData = Array.isArray(clientsRes) ? clientsRes : (clientsRes?.data || []);
        const projectsData = Array.isArray(projectsRes) ? projectsRes : (projectsRes?.data || []);

        setClients(clientsData || []);
        setProjects(projectsData || []);
      } catch (error) {
        console.error('Error loading data:', error);
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
      toast({ title: 'Invoice created', status: 'success' });
      navigate(`/invoices/${response.data._id || response._id}`);
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({ title: 'Failed to create invoice', status: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // TopBar handlers
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleCenter = () => setIsCenterOpen(!isCenterOpen);
  const handleSearch = (value) => setSearchQuery(value);
  const resetToAllTasks = () => navigate('/dashboard');
  const openFeedbackModal = () => setIsFeedbackModalOpen(true);
  const closeFeedbackModal = () => setIsFeedbackModalOpen(false);
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
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
              handleSearch={handleSearch}
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

              <VStack spacing={4} align="stretch">
                <Select
                  placeholder="Select client"
                  value={clientId}
                  onChange={e => setClientId(e.target.value)}
                  bg="gray.700"
                  color="white"
                  borderColor="gray.600"
                >
                  {(clients || []).map(client => (
                    <option key={client._id} value={client._id}>{client.name}</option>
                  ))}
                </Select>

                <Select
                  placeholder="Select project"
                  value={projectId}
                  onChange={e => setProjectId(e.target.value)}
                  bg="gray.700"
                  color="white"
                  borderColor="gray.600"
                >
                  {(projects || []).filter(p => {
                    // Handle both populated clientId object and string clientId
                    const projectClientId = p.clientId?._id || p.clientId;
                    return !clientId || projectClientId === clientId;
                  }).map(project => (
                    <option key={project._id} value={project._id}>{project.name}</option>
                  ))}
                </Select>

                <Box>
                  <HStack gap={2} mb={2}>
                    <Text color="gray.300" fontSize="sm" w="180px">Task Name</Text>
                    <Text color="gray.300" fontSize="sm" w="120px">Hours</Text>
                    <Text color="gray.300" fontSize="sm" w="120px">Rate</Text>
                    <Text color="gray.300" fontSize="sm" w="100px">Amount</Text>
                  </HStack>

                  <VStack spacing={2} align="stretch">
                    {lineItems.map((item, idx) => (
                      <HStack key={idx} gap={2}>
                        <Input
                          value={item.description}
                          onChange={e => updateLineItem(idx, 'description', e.target.value)}
                          placeholder="Task description"
                          bg="gray.700"
                          color="white"
                          borderColor="gray.600"
                          w="180px"
                        />
                        <NumberInput
                          value={item.hours}
                          onChange={(value) => updateLineItem(idx, 'hours', parseFloat(value) || 0)}
                          min={0}
                          bg="gray.700"
                          borderColor="gray.600"
                          w="120px"
                        >
                          <NumberInputField color="white" />
                        </NumberInput>
                        <NumberInput
                          value={item.rate}
                          onChange={(value) => updateLineItem(idx, 'rate', parseFloat(value) || 0)}
                          min={0}
                          bg="gray.700"
                          borderColor="gray.600"
                          w="120px"
                        >
                          <NumberInputField color="white" />
                        </NumberInput>
                        <Text color="gray.300" w="100px">${(item.hours * item.rate).toFixed(2)}</Text>
                        <Button
                          size="sm"
                          colorScheme="red"
                          onClick={() => removeLineItem(idx)}
                        >
                          Remove
                        </Button>
                      </HStack>
                    ))}

                    <HStack gap={2}>
                      <Input
                        value={newItem.description}
                        onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                        placeholder="New task description"
                        bg="gray.700"
                        color="white"
                        borderColor="gray.600"
                        w="180px"
                      />
                      <NumberInput
                        value={newItem.hours}
                        onChange={(value) => setNewItem({ ...newItem, hours: parseFloat(value) || 0 })}
                        min={0}
                        bg="gray.700"
                        borderColor="gray.600"
                        w="120px"
                      >
                        <NumberInputField color="white" />
                      </NumberInput>
                      <NumberInput
                        value={newItem.rate}
                        onChange={(value) => setNewItem({ ...newItem, rate: parseFloat(value) || 0 })}
                        min={0}
                        bg="gray.700"
                        borderColor="gray.600"
                        w="120px"
                      >
                        <NumberInputField color="white" />
                      </NumberInput>
                      <Text color="gray.300" w="100px">${(newItem.hours * newItem.rate).toFixed(2)}</Text>
                      <Button
                        size="sm"
                        colorScheme="green"
                        onClick={addLineItem}
                        isDisabled={!newItem.description.trim()}
                      >
                        Add
                      </Button>
                    </HStack>
                  </VStack>
                </Box>

                <Box p={4} bg="gray.700" borderRadius="md">
                  <Text color="white" fontSize="lg" fontWeight="bold">
                    Total: ${total.toFixed(2)}
                  </Text>
                </Box>

                <Button
                  colorScheme="blue"
                  onClick={handleSubmit}
                  isLoading={submitting}
                  isDisabled={!clientId || !projectId || lineItems.length === 0}
                  size="lg"
                >
                  Create Invoice
                </Button>
              </VStack>
            </Box>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};
