import React, { useEffect, useState } from 'react';
import { Box, Button, Input, Select, NumberInput, NumberInputField, List, ListItem, Heading, Flex, VStack, HStack, Text, useToast, Spinner, IconButton, useColorMode } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import apiService from '../services/api';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatHoursToTime, parseTimeToHours } from '../utils/timeFormat';
import TopBar from './TopBar';
import { useAuth } from '../contexts/AuthContext';

export const InvoiceCreatePanel = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const { logout } = useAuth();
  const prefill = location.state || {};

  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clientId, setClientId] = useState(prefill.clientId || '');
  const [projectId, setProjectId] = useState(prefill.projectId || '');
  const [lineItems, setLineItems] = useState(prefill.lineItems || []);
  const [newItem, setNewItem] = useState({ description: '', hours: 0, rate: 0 });
  const [total, setTotal] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [newItemTimeInput, setNewItemTimeInput] = useState('00:00');
  const [editingTimeInputs, setEditingTimeInputs] = useState({});

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast({ title: 'Logout failed', status: 'error' });
    }
  };

  const handleBack = () => {
    navigate('/invoices');
  };

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
    setNewItemTimeInput('00:00');
  };

  const updateLineItem = (idx, field, value) => {
    setLineItems(items => items.map((item, i) => i === idx ? { ...item, [field]: value, amount: field === 'hours' || field === 'rate' ? (field === 'hours' ? value : item.hours) * (field === 'rate' ? value : item.rate) : item.amount } : item));
  };

  const removeLineItem = (idx) => {
    setLineItems(items => items.filter((_, i) => i !== idx));
  };

  // Helper function to handle time input changes
  const handleTimeChange = (value, setHoursFunction, setInputFunction) => {
    // Allow empty input for better UX
    if (!value || value === '') {
      setHoursFunction(0);
      setInputFunction('00:00');
      return;
    }

    // Allow partial input like "1:" or "1:3" or "1:30"
    if (/^\d{0,2}:\d{0,2}$/.test(value)) {
      const [hours, minutes] = value.split(':').map(part => part === '' ? 0 : parseInt(part) || 0);

      // Validate hours and minutes
      if (hours >= 0 && hours <= 99 && minutes >= 0 && minutes <= 59) {
        const totalHours = hours + (minutes / 60);
        setHoursFunction(totalHours);
        setInputFunction(value);
      }
    }
  };

  // Helper function to format time input for display
  const formatTimeInput = (hours) => {
    if (!hours || hours === 0) return '00:00';

    const totalMinutes = Math.round(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;

    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (!clientId || !projectId || lineItems.length === 0) {
      toast({ title: 'Client, project, and at least one line item required', status: 'warning' });
      return;
    }
    setSubmitting(true);
    try {
      await apiService.createInvoice({
        clientId,
        projectId,
        lineItems,
        total
      });
      toast({ title: 'Invoice created', status: 'success' });
      navigate('/invoices');
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({ title: 'Failed to create invoice', status: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box h="100vh" display="flex" flexDirection="column">
        <TopBar
          colorMode={colorMode}
          toggleColorMode={toggleColorMode}
          isOnline={true}
          currentView="invoices"
          searchTerm=""
          handleSearch={() => {}}
          resetToAllTasks={() => {}}
          isSidebarOpen={false}
          isCenterOpen={false}
          onLogout={handleLogout}
        />
        <Box flex="1" display="flex" alignItems="center" justifyContent="center">
          <VStack spacing={4}>
            <Spinner size="xl" color={colorMode === 'light' ? 'gray.600' : 'white'} />
            <Text color={colorMode === 'light' ? 'gray.600' : 'white'}>Loading...</Text>
          </VStack>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box h="100vh" display="flex" flexDirection="column">
        <TopBar
          colorMode={colorMode}
          toggleColorMode={toggleColorMode}
          isOnline={true}
          currentView="invoices"
          searchTerm=""
          handleSearch={() => {}}
          resetToAllTasks={() => {}}
          isSidebarOpen={false}
          isCenterOpen={false}
          onLogout={handleLogout}
        />
        <Box flex="1" display="flex" alignItems="center" justifyContent="center">
          <VStack spacing={4}>
            <Text color="red.300" mb={4}>{error}</Text>
            <Button onClick={() => window.location.reload()} colorScheme="blue">
              Retry
            </Button>
          </VStack>
        </Box>
      </Box>
    );
  }

  return (
    <Box h="100vh" display="flex" flexDirection="column">
      {/* TopBar */}
      <TopBar
        colorMode={colorMode}
        toggleColorMode={toggleColorMode}
        isOnline={true}
        currentView="invoices"
        searchTerm=""
        handleSearch={() => {}}
        resetToAllTasks={() => {}}
        isSidebarOpen={false}
        isCenterOpen={false}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <Box flex="1" overflowY="auto" p={6}>
        <Box maxW="lg" mx="auto">
          {/* Header with Back Button */}
          <Flex align="center" gap={4} mb={6}>
            <IconButton
              icon={<ArrowBackIcon />}
              aria-label="Go back to invoices"
              onClick={handleBack}
              size="sm"
              variant="ghost"
              color={colorMode === 'light' ? 'gray.600' : 'gray.300'}
              _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
            />
            <Box>
              <Heading size="lg" color={colorMode === 'light' ? 'gray.800' : 'white'} mb={2}>
                Create Invoice
              </Heading>
              <Text color={colorMode === 'light' ? 'gray.600' : 'gray.300'}>
                Create a new invoice for your client
              </Text>
            </Box>
          </Flex>

          {/* Invoice Form */}
          <Box borderWidth={1} borderRadius="md" boxShadow="md" bg={colorMode === 'light' ? 'white' : 'gray.800'} p={6}>
            <VStack spacing={4} align="stretch">
              <Select
                placeholder="Select client"
                value={clientId}
                onChange={e => setClientId(e.target.value)}
                bg={colorMode === 'light' ? 'gray.100' : 'gray.700'}
                color={colorMode === 'light' ? 'gray.800' : 'white'}
                borderColor={colorMode === 'light' ? 'gray.300' : 'gray.600'}
              >
                {(clients || []).map(client => (
                  <option key={client._id} value={client._id}>{client.company || client.name}</option>
                ))}
              </Select>
              <Select
                placeholder="Select project"
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                bg={colorMode === 'light' ? 'gray.100' : 'gray.700'}
                color={colorMode === 'light' ? 'gray.800' : 'white'}
                borderColor={colorMode === 'light' ? 'gray.300' : 'gray.600'}
              >
                {(projects || []).filter(p => {
                  // Handle both populated clientId object and string clientId
                  const projectClientId = p.clientId?._id || p.clientId;
                  const shouldShow = !clientId || projectClientId === clientId;
                  return shouldShow;
                }).map(project => (
                  <option key={project._id} value={project._id}>{project.name}</option>
                ))}
              </Select>

              <Box>
                <HStack gap={2} mb={2}>
                  <Text color={colorMode === 'light' ? 'gray.600' : 'gray.300'} fontSize="sm" w="180px">Task Name</Text>
                  <Text color={colorMode === 'light' ? 'gray.600' : 'gray.300'} fontSize="sm" w="120px">Hours</Text>
                  <Text color={colorMode === 'light' ? 'gray.600' : 'gray.300'} fontSize="sm" w="120px">Rate</Text>
                </HStack>
                <List spacing={3}>
                  {(lineItems || []).map((item, idx) => (
                    <ListItem key={idx}>
                      <HStack spacing={2}>
                        <Input
                          value={item.description || ''}
                          onChange={e => updateLineItem(idx, 'description', e.target.value)}
                          bg={colorMode === 'light' ? 'gray.50' : 'gray.700'}
                          color={colorMode === 'light' ? 'gray.800' : 'white'}
                          w="180px"
                          borderColor={colorMode === 'light' ? 'gray.300' : 'gray.600'}
                        />
                        <Input
                          value={editingTimeInputs[idx] || formatTimeInput(item.hours || 0)}
                          onChange={e => handleTimeChange(
                            e.target.value,
                            (hours) => updateLineItem(idx, 'hours', hours),
                            (input) => setEditingTimeInputs(prev => ({ ...prev, [idx]: input }))
                          )}
                          onFocus={() => setEditingTimeInputs(prev => ({ ...prev, [idx]: formatTimeInput(item.hours || 0) }))}
                          onBlur={() => setEditingTimeInputs(prev => ({ ...prev, [idx]: undefined }))}
                          placeholder="00:00"
                          bg={colorMode === 'light' ? 'gray.50' : 'gray.700'}
                          color={colorMode === 'light' ? 'gray.800' : 'white'}
                          w="100px"
                          borderColor={colorMode === 'light' ? 'gray.300' : 'gray.600'}
                        />
                        <NumberInput value={item.rate || 0} min={0} onChange={val => updateLineItem(idx, 'rate', Number(val))} w="100px">
                          <NumberInputField
                            placeholder="Rate"
                            bg={colorMode === 'light' ? 'gray.50' : 'gray.700'}
                            color={colorMode === 'light' ? 'gray.800' : 'white'}
                            borderColor={colorMode === 'light' ? 'gray.300' : 'gray.600'}
                          />
                        </NumberInput>
                        <Text color={colorMode === 'light' ? 'gray.700' : 'gray.200'} fontWeight="medium">
                          ${((item.hours || 0) * (item.rate || 0)).toFixed(2)}
                        </Text>
                        <Button size="sm" colorScheme="red" variant="outline" onClick={() => removeLineItem(idx)}>
                          Remove
                        </Button>
                      </HStack>
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Box>
                <HStack spacing={2} mb={3} wrap="wrap">
                  <Input
                    placeholder="Description"
                    value={newItem.description}
                    onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                    bg={colorMode === 'light' ? 'gray.50' : 'gray.700'}
                    color={colorMode === 'light' ? 'gray.800' : 'white'}
                    w="180px"
                    borderColor={colorMode === 'light' ? 'gray.300' : 'gray.600'}
                  />
                  <Input
                    value={newItemTimeInput}
                    onChange={e => handleTimeChange(
                      e.target.value,
                      (hours) => setNewItem({ ...newItem, hours }),
                      (input) => setNewItemTimeInput(input)
                    )}
                    placeholder="00:00"
                    bg={colorMode === 'light' ? 'gray.50' : 'gray.700'}
                    color={colorMode === 'light' ? 'gray.800' : 'white'}
                    w="120px"
                    borderColor={colorMode === 'light' ? 'gray.300' : 'gray.600'}
                  />
                  <NumberInput value={newItem.rate} min={0} onChange={val => setNewItem({ ...newItem, rate: Number(val) })} w="120px">
                    <NumberInputField
                      placeholder="Rate"
                      bg={colorMode === 'light' ? 'gray.50' : 'gray.700'}
                      color={colorMode === 'light' ? 'gray.800' : 'white'}
                      borderColor={colorMode === 'light' ? 'gray.300' : 'gray.600'}
                    />
                  </NumberInput>
                  <Button onClick={addLineItem} colorScheme="blue" size="sm">
                    Add Item
                  </Button>
                </HStack>
              </Box>

              <Box>
                <Text fontWeight="bold" fontSize="lg" color={colorMode === 'light' ? 'gray.800' : 'white'} mb={4}>
                  Total: ${total.toFixed(2)}
                </Text>
                <Button onClick={handleSubmit} colorScheme="green" isLoading={submitting} size="lg" w="full">
                  Create Invoice
                </Button>
              </Box>
            </VStack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
