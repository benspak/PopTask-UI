import React, { useEffect, useState } from 'react';
import { Box, Spinner, Heading, List, ListItem, VStack, HStack, Text, Badge, Button, useToast, IconButton, useColorMode, Flex } from '@chakra-ui/react';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import apiService from '../services/api';
import { useNavigate } from 'react-router-dom';
import TopBar from './TopBar';
import { useAuth } from '../contexts/AuthContext';

export const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const { logout } = useAuth();

  // TopBar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCenterOpen, setIsCenterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

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
                  <IconButton
                    icon={<ChevronLeftIcon />}
                    aria-label="Go back"
                    onClick={() => navigate('/dashboard')}
                    size="sm"
                    variant="ghost"
                    color="gray.300"
                    _hover={{ bg: 'gray.700' }}
                  />
                  <Heading size="md" color="white">Invoices</Heading>
                </HStack>
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
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};
