import React, { useEffect, useState } from 'react';
import {
  Box,
  Spinner,
  Heading,
  VStack,
  Text,
  Badge,
  Button,
  HStack,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  useColorMode,
  IconButton,
  Flex,
  useBreakpointValue,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import apiService from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { formatHoursToTime } from '../utils/timeFormat';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import MobileBackdropOverlay from './MobileBackdropOverlay';
import { useAuth } from '../contexts/AuthContext';

export const InvoiceDetail = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const { logout, user } = useAuth();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paying, setPaying] = useState(false);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();

  // Sidebar and layout state
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? JSON.parse(saved) : !isMobile;
  });
  const [isCenterOpen, setIsCenterOpen] = useState(() => {
    const saved = localStorage.getItem('centerOpen');
    return saved !== null ? JSON.parse(saved) : !isMobile;
  });

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

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      toast({ title: 'Logout failed', status: 'error' });
    }
  };

  const handleBack = () => {
    navigate('/invoices');
  };

  const resetToAllTasks = () => navigate('/dashboard');

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getInvoice(invoiceId);
        const invoiceData = response?.data || response;
        setInvoice(invoiceData);
      } catch (error) {
        let errorMessage = 'Failed to load invoice';

        if (error.response) {
          // Server responded with error status
          if (error.response.status === 404) {
            errorMessage = 'Invoice not found';
          } else if (error.response.status === 401) {
            errorMessage = 'Authentication required';
          } else if (error.response.status === 500) {
            errorMessage = 'Server error - please try again';
          }
        } else if (error.request) {
          // Network error
          errorMessage = 'Network error - please check your connection';
        }

        setError(errorMessage);
        toast({ title: errorMessage, status: 'error' });
      } finally {
        setLoading(false);
      }
    };

    if (invoiceId) {
      loadInvoice();
    }
  }, [invoiceId, toast]);

  const handlePayNow = async () => {
    setPaying(true);
    try {
      const response = await apiService.createPaymentLink(invoiceId);
      const paymentUrl = response?.url || response?.data?.url;
      if (paymentUrl) {
        window.open(paymentUrl, '_blank');
      } else {
        throw new Error('No payment URL received');
      }
    } catch (error) {
      toast({ title: 'Failed to create payment link', status: 'error' });
    } finally {
      setPaying(false);
    }
  };

  const handleSendEmail = async () => {
    setSending(true);
    try {
      await apiService.sendInvoiceEmail(invoiceId);
      toast({
        title: 'Invoice sent successfully!',
        description: 'The invoice has been sent to your client with a payment link.',
        status: 'success',
        duration: 5000,
        isClosable: true
      });
    } catch (error) {
      let errorMessage = 'Failed to send invoice';

      if (error.message?.includes('Client email is required')) {
        errorMessage = 'Client email is required to send invoice. Please add an email to your client.';
      } else if (error.message?.includes('No payment link')) {
        errorMessage = 'Payment link could not be created. Please try again.';
      } else if (error.message?.includes('Invoice not found')) {
        errorMessage = 'Invoice not found. Please refresh the page.';
      }

      toast({
        title: 'Failed to send invoice',
        description: errorMessage,
        status: 'error',
        duration: 6000,
        isClosable: true
      });
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiService.deleteInvoice(invoiceId);
      toast({ title: 'Invoice deleted', status: 'success' });
      navigate('/invoices');
    } catch (error) {
      toast({ title: 'Failed to delete invoice', status: 'error' });
    } finally {
      setDeleting(false);
      onClose();
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
              searchTerm=""
              handleSearch={() => {}}
              resetToAllTasks={resetToAllTasks}
              isSidebarOpen={isSidebarOpen}
              isCenterOpen={isCenterOpen}
              onLogout={handleLogout}
            />
            <Box flex="1" display="flex" alignItems="center" justifyContent="center">
              <VStack spacing={4}>
                <Spinner size="xl" color={colorMode === 'light' ? 'gray.600' : 'white'} />
                <Text color={colorMode === 'light' ? 'gray.600' : 'white'}>Loading invoice...</Text>
              </VStack>
            </Box>
          </Flex>
        </Flex>
      </Box>
    );
  }

  if (error || !invoice) {
    return (
      <Box minH="100vh" bg={colorMode === 'dark' ? 'gray.900' : 'gray.50'}>
        <Flex h="100vh" overflow="hidden">
          <Flex flex="1" direction="column">
            <TopBar
              colorMode={colorMode}
              toggleColorMode={toggleColorMode}
              isOnline={true}
              currentView="invoices"
              searchTerm=""
              handleSearch={() => {}}
              resetToAllTasks={resetToAllTasks}
              isSidebarOpen={isSidebarOpen}
              isCenterOpen={isCenterOpen}
              onLogout={handleLogout}
            />
            <Box flex="1" display="flex" alignItems="center" justifyContent="center">
              <VStack spacing={4}>
                <Text color="red.300" mb={4}>{error || 'Invoice not found'}</Text>
                <Button onClick={() => window.location.reload()} colorScheme="blue">
                  Retry
                </Button>
              </VStack>
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
          {/* TopBar */}
          <TopBar
            colorMode={colorMode}
            toggleColorMode={toggleColorMode}
            isOnline={true}
            currentView="invoices"
            searchTerm=""
            handleSearch={() => {}}
            resetToAllTasks={resetToAllTasks}
            isSidebarOpen={isSidebarOpen}
            isCenterOpen={isCenterOpen}
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
                    Invoice Details
                  </Heading>
                  <Text color={colorMode === 'light' ? 'gray.600' : 'gray.300'}>
                    View and manage your invoice
                  </Text>
                </Box>
              </Flex>

              {/* Invoice Content */}
              <Box borderWidth={1} borderRadius="md" boxShadow="md" bg={colorMode === 'light' ? 'white' : 'gray.800'} p={6}>
                <VStack align="start" spacing={2} mb={4}>
                  <Box>
                    <Text color={colorMode === 'light' ? 'gray.800' : 'white'} fontWeight="bold">Client:</Text>
                    <Text color={colorMode === 'light' ? 'gray.800' : 'white'} ml={4}>{invoice.clientId?.company || 'No Company'}</Text>
                    <Text color={colorMode === 'light' ? 'gray.600' : 'gray.300'} ml={4} fontSize="sm">{invoice.clientId?.name || 'No Contact Name'}</Text>
                  </Box>
                  <Text color={colorMode === 'light' ? 'gray.800' : 'white'}><b>Project:</b> {invoice.projectId?.name || 'No Project'}</Text>
                  <Text color={colorMode === 'light' ? 'gray.800' : 'white'}><b>Total:</b> ${invoice.total?.toFixed(2) || '0.00'}</Text>
                  <Badge colorScheme={invoice.status === 'paid' ? 'green' : invoice.status === 'sent' ? 'yellow' : 'gray'}>{invoice.status || 'draft'}</Badge>
                  <Box w="100%">
                    <Text color={colorMode === 'light' ? 'gray.600' : 'gray.300'} fontWeight="bold" mb={3}>Line Items:</Text>
                    {invoice.lineItems && invoice.lineItems.length > 0 ? (
                      <TableContainer>
                        <Table variant="simple" size="sm">
                          <Thead>
                            <Tr>
                              <Th color={colorMode === 'light' ? 'gray.600' : 'gray.300'} fontSize="sm">Description</Th>
                              <Th color={colorMode === 'light' ? 'gray.600' : 'gray.300'} fontSize="sm" textAlign="center">Time</Th>
                              <Th color={colorMode === 'light' ? 'gray.600' : 'gray.300'} fontSize="sm" textAlign="center">Rate</Th>
                              <Th color={colorMode === 'light' ? 'gray.600' : 'gray.300'} fontSize="sm" textAlign="right">Amount</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {invoice.lineItems.map((item, idx) => (
                              <Tr key={idx}>
                                <Td color={colorMode === 'light' ? 'gray.700' : 'gray.200'} fontSize="sm">{item.description}</Td>
                                <Td color={colorMode === 'light' ? 'gray.700' : 'gray.200'} fontSize="sm" textAlign="center">{formatHoursToTime(item.hours)}</Td>
                                <Td color={colorMode === 'light' ? 'gray.700' : 'gray.200'} fontSize="sm" textAlign="center">${item.rate || 0}/h</Td>
                                <Td color={colorMode === 'light' ? 'gray.700' : 'gray.200'} fontSize="sm" textAlign="right">${((item.hours || 0) * (item.rate || 0)).toFixed(2)}</Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Text color={colorMode === 'light' ? 'gray.500' : 'gray.400'}>No line items.</Text>
                    )}
                  </Box>
                </VStack>
                <HStack spacing={4} flexWrap="wrap">
                  {invoice.status !== 'paid' && (
                    <Button colorScheme="blue" onClick={handlePayNow} isLoading={paying}>Pay Now</Button>
                  )}
                  <Button colorScheme="green" onClick={handleSendEmail} isLoading={sending}>Send Invoice Email</Button>
                  <Button colorScheme="yellow" onClick={() => navigate(`/invoices/${invoiceId}/edit`)}>Edit Invoice</Button>
                  <Button colorScheme="red" variant="outline" onClick={onOpen}>Delete Invoice</Button>
                </HStack>
              </Box>
            </Box>
          </Box>
        </Flex>
      </Flex>

      <MobileBackdropOverlay
        isOpen={isSidebarOpen && isMobile}
        onClose={toggleSidebar}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg={colorMode === 'light' ? 'white' : 'gray.800'} color={colorMode === 'light' ? 'gray.800' : 'white'}>
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
