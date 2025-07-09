import React, { useEffect, useState } from 'react';
import { Box, Spinner, Heading, List, ListItem, VStack, HStack, Text, Badge, Button, useToast } from '@chakra-ui/react';
import apiService from '../services/api';
import { useNavigate } from 'react-router-dom';

export const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getInvoices();
        const invoicesData = Array.isArray(response) ? response : (response?.data || []);
        setInvoices(invoicesData || []);
      } catch (error) {
        console.error('Error loading invoices:', error);
        setError('Failed to load invoices');
        toast({ title: 'Failed to load invoices', status: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadInvoices();
  }, [toast]);

  if (loading) {
    return (
      <Box maxW="lg" mx="auto" mt={8} p={4} textAlign="center">
        <Spinner size="xl" color="white" />
        <Text color="white" mt={4}>Loading invoices...</Text>
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
      <HStack justify="space-between" mb={4}>
        <Heading size="md" color="white">Invoices</Heading>
        <Button
          colorScheme="green"
          onClick={() => navigate('/invoices/create')}
          size="sm"
        >
          Create Invoice
        </Button>
      </HStack>
      <List spacing={3}>
        {invoices.length === 0 ? (
          <Text color="gray.400">No invoices yet.</Text>
        ) : (
          invoices.map(inv => (
            <ListItem key={inv._id} p={2} borderBottom="1px solid" borderColor="gray.700">
              <HStack justify="space-between">
                <Box>
                  <Text fontWeight="bold" color="white">{inv.clientId?.name || 'No Client'}</Text>
                  <Text fontSize="sm" color="gray.300">{inv.projectId?.name || 'No Project'}</Text>
                  <Text fontSize="sm" color="gray.400">${inv.total?.toFixed(2) || '0.00'}</Text>
                </Box>
                <Badge colorScheme={inv.status === 'paid' ? 'green' : inv.status === 'sent' ? 'yellow' : 'gray'}>{inv.status || 'draft'}</Badge>
                <Button size="sm" colorScheme="blue" onClick={() => navigate(`/invoices/${inv._id}`)}>
                  Details
                </Button>
              </HStack>
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
};
