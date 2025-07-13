import React, { useEffect, useState } from 'react';
import { Box, Spinner, Heading, List, ListItem, VStack, HStack, Text, Badge, Button, useToast, IconButton, useColorMode, Flex, useDisclosure, useBreakpointValue } from '@chakra-ui/react';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import apiService from '../services/api';
import { useNavigate } from 'react-router-dom';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import FeedbackModal from './FeedbackModal';
import Sidebar from './Sidebar';
import MobileBackdropOverlay from './MobileBackdropOverlay';
import { useAuth } from '../contexts/AuthContext';

export const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  // TopBar handlers - defined early to avoid hoisting issues
  const handleSearch = (value) => setSearchQuery(value);
  const resetToAllTasks = () => navigate('/dashboard');
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast({ title: 'Logout failed', status: 'error' });
    }
  };

  const handleCreateInvoice = () => {
    navigate('/invoices/create');
  };

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
                <Text color="white" mt={4}>Loading invoices...</Text>
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

          <BottomNav
            isSidebarOpen={isSidebarOpen}
            isCenterOpen={isCenterOpen}
            isAddMode={false}
            isFooterOpen={isFeedbackModalOpen}
            toggleSidebar={toggleSidebar}
            toggleCenter={toggleCenter}
            handleAddTask={handleCreateInvoice}
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
