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
  useDisclosure
} from '@chakra-ui/react';
import apiService from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { formatHoursToTime } from '../utils/timeFormat';

export const InvoiceDetail = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paying, setPaying] = useState(false);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Loading invoice:', invoiceId);
        const response = await apiService.getInvoice(invoiceId);
        const invoiceData = response?.data || response;
        console.log('Invoice data:', invoiceData);
        setInvoice(invoiceData);
      } catch (error) {
        console.error('Error loading invoice:', error);
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
      console.error('Error creating payment link:', error);
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
      console.error('Error sending invoice email:', error);
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

  if (error || !invoice) {
    return (
      <Box maxW="lg" mx="auto" mt={8} p={4} textAlign="center">
        <Text color="red.300" mb={4}>{error || 'Invoice not found'}</Text>
        <Button onClick={() => window.location.reload()} colorScheme="blue">
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box maxW="lg" mx="auto" mt={8} p={4} borderWidth={1} borderRadius="md" boxShadow="md" bg="gray.800">
      <Heading size="md" mb={4} color="white">Invoice Details</Heading>
      <VStack align="start" spacing={2} mb={4}>
        <Text color="white"><b>Client:</b> {invoice.clientId?.name || 'No Client'}</Text>
        <Text color="white"><b>Project:</b> {invoice.projectId?.name || 'No Project'}</Text>
        <Text color="white"><b>Total:</b> ${invoice.total?.toFixed(2) || '0.00'}</Text>
        <Badge colorScheme={invoice.status === 'paid' ? 'green' : invoice.status === 'sent' ? 'yellow' : 'gray'}>{invoice.status || 'draft'}</Badge>
        <Box w="100%">
          <Text color="gray.300" fontWeight="bold" mb={3}>Line Items:</Text>
          {invoice.lineItems && invoice.lineItems.length > 0 ? (
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th color="gray.300" fontSize="sm">Description</Th>
                    <Th color="gray.300" fontSize="sm" textAlign="center">Time</Th>
                    <Th color="gray.300" fontSize="sm" textAlign="center">Rate</Th>
                    <Th color="gray.300" fontSize="sm" textAlign="right">Amount</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {invoice.lineItems.map((item, idx) => (
                    <Tr key={idx}>
                      <Td color="gray.200" fontSize="sm">{item.description}</Td>
                      <Td color="gray.200" fontSize="sm" textAlign="center">{formatHoursToTime(item.hours)}</Td>
                      <Td color="gray.200" fontSize="sm" textAlign="center">${item.rate || 0}/h</Td>
                      <Td color="gray.200" fontSize="sm" textAlign="right">${((item.hours || 0) * (item.rate || 0)).toFixed(2)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          ) : (
            <Text color="gray.400">No line items.</Text>
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
