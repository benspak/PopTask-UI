import React, { useEffect, useState } from 'react';
import { Box, Button, Input, Select, NumberInput, NumberInputField, List, ListItem, Heading, Flex, VStack, HStack, Text, useToast, Spinner } from '@chakra-ui/react';
import apiService from '../services/api';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatHoursToTime, parseTimeToHours } from '../utils/timeFormat';

export const InvoiceCreatePanel = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
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

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [clientsRes, projectsRes] = await Promise.all([
          apiService.getClients(),
          apiService.getProjects()
        ]);

        // Handle backend response format: { success: true, data: [...], count: ... }
        const clientsData = clientsRes?.data || [];
        const projectsData = projectsRes?.data || [];

        // Debug logging
        console.log('Clients response:', clientsRes);
        console.log('Projects response:', projectsRes);
        console.log('Clients data:', clientsData);
        console.log('Projects data:', projectsData);

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
      <Box maxW="lg" mx="auto" mt={8} p={4} textAlign="center">
        <Spinner size="xl" color="white" />
        <Text color="white" mt={4}>Loading...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box maxW="lg" mx="auto" mt={8} p={4} textAlign="center">
        <Text color="red.300" mb={4}>{error}</Text>
        <Button onClick={() => window.location.reload()} colorScheme="blue">
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box maxW="lg" mx="auto" mt={8} p={4} borderWidth={1} borderRadius="md" boxShadow="md" bg="gray.800">
      <Heading size="md" mb={4} color="white">Create Invoice</Heading>
      <VStack spacing={2} align="stretch" mb={4}>
        <Select placeholder="Select client" value={clientId} onChange={e => setClientId(e.target.value)} bg="gray.700" color="white">
          {(clients || []).map(client => (
            <option key={client._id} value={client._id}>{client.company || client.name}</option>
          ))}
        </Select>
        <Select placeholder="Select project" value={projectId} onChange={e => setProjectId(e.target.value)} bg="gray.700" color="white">
          {(projects || []).filter(p => {
            // Handle both populated clientId object and string clientId
            const projectClientId = p.clientId?._id || p.clientId;
            const shouldShow = !clientId || projectClientId === clientId;
            console.log(`Project ${p.name}: clientId=${projectClientId}, selectedClientId=${clientId}, shouldShow=${shouldShow}`);
            return shouldShow;
          }).map(project => (
            <option key={project._id} value={project._id}>{project.name}</option>
          ))}
        </Select>
        <HStack gap={2} mb={1}>
          <Text color="gray.300" fontSize="sm" w="180px">Task Name</Text>
          <Text color="gray.300" fontSize="sm" w="120px">Hours</Text>
          <Text color="gray.300" fontSize="sm" w="120px">Rate</Text>
        </HStack>
        <List spacing={2} mb={2}>
          {(lineItems || []).map((item, idx) => (
            <ListItem key={idx}>
              <HStack>
                <Input value={item.description || ''} onChange={e => updateLineItem(idx, 'description', e.target.value)} bg="gray.700" color="white" w="180px" />
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
                  bg="gray.700"
                  color="white"
                  w="100px"
                />
                <NumberInput value={item.rate || 0} min={0} onChange={val => updateLineItem(idx, 'rate', Number(val))} w="100px">
                  <NumberInputField placeholder="Rate" />
                </NumberInput>
                <Text color="gray.200">${((item.hours || 0) * (item.rate || 0)).toFixed(2)}</Text>
                <Button size="xs" colorScheme="red" onClick={() => removeLineItem(idx)}>Remove</Button>
              </HStack>
            </ListItem>
          ))}
        </List>
        <Flex gap={2} mb={2} wrap="wrap">
          <Input
            placeholder="Description"
            value={newItem.description}
            onChange={e => setNewItem({ ...newItem, description: e.target.value })}
            bg="gray.700" color="white"
            w="180px"
          />
          <Input
            value={newItemTimeInput}
            onChange={e => handleTimeChange(
              e.target.value,
              (hours) => setNewItem({ ...newItem, hours }),
              (input) => setNewItemTimeInput(input)
            )}
            placeholder="00:00"
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
        <Button onClick={handleSubmit} colorScheme="green" isLoading={submitting} alignSelf="flex-end">
          Create Invoice
        </Button>
      </VStack>
    </Box>
  );
};
