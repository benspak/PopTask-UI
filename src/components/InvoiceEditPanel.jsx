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
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure
} from '@chakra-ui/react';
import apiService from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { formatHoursToTime, parseTimeToHours } from '../utils/timeFormat';

export const InvoiceEditPanel = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();

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
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [clientsRes, projectsRes, invoiceRes] = await Promise.all([
          apiService.getClients(),
          apiService.getProjects(),
          apiService.getInvoice(invoiceId)
        ]);

        // Handle both direct array response and response.data format
        const clientsData = Array.isArray(clientsRes) ? clientsRes : (clientsRes?.data || []);
        const projectsData = Array.isArray(projectsRes) ? projectsRes : (projectsRes?.data || []);
        const invoiceData = invoiceRes?.data || invoiceRes;

        setClients(clientsData || []);
        setProjects(projectsData || []);

        // Set invoice data
        if (invoiceData) {
          setClientId(invoiceData.clientId?._id || invoiceData.clientId || '');
          setProjectId(invoiceData.projectId?._id || invoiceData.projectId || '');
          setLineItems(invoiceData.lineItems || []);
          setTotal(invoiceData.total || 0);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load data. Please try again.');
        toast({ title: 'Failed to load data', status: 'error' });
      } finally {
        setLoading(false);
      }
    };

    if (invoiceId) {
      loadData();
    }
  }, [invoiceId, toast]);

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
      await apiService.updateInvoice(invoiceId, {
        clientId,
        projectId,
        lineItems,
        total
      });
      toast({ title: 'Invoice updated', status: 'success' });
      navigate(`/invoices/${invoiceId}`);
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast({ title: 'Failed to update invoice', status: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiService.deleteInvoice(invoiceId);
      toast({ title: 'Invoice deleted', status: 'success' });
      navigate('/invoices');
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast({ title: 'Failed to delete invoice', status: 'error' });
    } finally {
      setDeleting(false);
      onClose();
    }
  };

  if (loading) {
    return (
      <Box maxW="lg" mx="auto" mt={8} p={4} textAlign="center">
        <Spinner size="xl" color="white" />
        <Text color="white" mt={4}>Loading invoice...</Text>
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
      <Heading size="md" mb={4} color="white">Edit Invoice</Heading>
      <VStack spacing={2} align="stretch" mb={4}>
        <Select placeholder="Select client" value={clientId} onChange={e => setClientId(e.target.value)} bg="gray.700" color="white">
          {(clients || []).map(client => (
            <option key={client._id} value={client._id}>{client.name}</option>
          ))}
        </Select>
        <Select placeholder="Select project" value={projectId} onChange={e => setProjectId(e.target.value)} bg="gray.700" color="white">
          {(projects || []).filter(p => {
            // Handle both populated clientId object and string clientId
            const projectClientId = p.clientId?._id || p.clientId;
            return !clientId || projectClientId === clientId;
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
                  value={formatHoursToTime(item.hours || 0)}
                  onChange={e => {
                    const timeValue = e.target.value;
                    if (timeValue.match(/^\d{0,2}:\d{0,2}$/)) {
                      updateLineItem(idx, 'hours', parseTimeToHours(timeValue));
                    }
                  }}
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
            value={formatHoursToTime(newItem.hours || 0)}
            onChange={e => {
              const timeValue = e.target.value;
              if (timeValue.match(/^\d{0,2}:\d{0,2}$/)) {
                setNewItem({ ...newItem, hours: parseTimeToHours(timeValue) });
              }
            }}
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
        <HStack spacing={4}>
          <Button onClick={handleSubmit} colorScheme="green" isLoading={submitting}>
            Update Invoice
          </Button>
          <Button onClick={onOpen} colorScheme="red" variant="outline">
            Delete Invoice
          </Button>
          <Button onClick={() => navigate(`/invoices/${invoiceId}`)} colorScheme="gray" variant="outline">
            Cancel
          </Button>
        </HStack>
      </VStack>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg="gray.800" color="white">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Invoice
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this invoice? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3} isLoading={deleting}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};
