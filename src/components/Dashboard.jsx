import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  useColorMode,
  useToast,
  Spinner,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardBody,
  CardHeader,
  Icon,
  useBreakpointValue,
  Badge,
  useDisclosure,
} from '@chakra-ui/react';
import {
  CheckCircleIcon,
  TimeIcon,
  StarIcon,
  CalendarIcon,
  AtSignIcon,
  DownloadIcon,
  ViewIcon,
  EditIcon,
  SettingsIcon,
  AddIcon,
  ExternalLinkIcon,
} from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext';
import { useDashboardData } from '../hooks/useDashboardData';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';
import MobileBackdropOverlay from './MobileBackdropOverlay';
import FeedbackModal from './FeedbackModal';

export default function Dashboard() {
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const toast = useToast();

  // Initialize sidebar state from localStorage
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? JSON.parse(saved) : !isMobile;
  });

  // Initialize center panel state from localStorage
  const [isCenterOpen, setIsCenterOpen] = useState(() => {
    const saved = localStorage.getItem('centerOpen');
    return saved !== null ? JSON.parse(saved) : !isMobile;
  });

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

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      // Logout error handled silently
    }
  };

  // Use optimized dashboard data hook
  const {
    tasks: backendTasks,
    projects,
    sharedTasks,
    sharedProjects,
    clients,
    companies,
    loading: dashboardLoading,
    error: dashboardError,
    isOffline,
    dismissError,
    refreshData
  } = useDashboardData();



  // Calculate dashboard stats
  const totalTasks = backendTasks?.length || 0;
  const completedTasks = backendTasks?.filter(task => task.completed)?.length || 0;
  const pendingTasks = totalTasks - completedTasks;
  const totalProjects = projects?.length || 0;
  const totalClients = clients?.length || 0;
  const totalCompanies = companies?.length || 0;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const quickActions = [
    {
      title: 'Create Task',
      icon: AddIcon,
      color: 'blue',
      href: '/tasks',
      description: 'Add a new task to your list'
    },
    {
      title: 'Create Project',
      icon: SettingsIcon,
      color: 'green',
      href: '/projects',
      description: 'Start a new project'
    },
    {
      title: 'Add Client',
      icon: AtSignIcon,
      color: 'purple',
      href: '/clients',
      description: 'Add a new client'
    },
    {
      title: 'Create Invoice',
      icon: DownloadIcon,
      color: 'orange',
      href: '/invoices',
      description: 'Generate an invoice'
    },
    ...(user?.userType === 'pro' ? [{
      title: 'Post Job',
      icon: ExternalLinkIcon,
      color: 'cyan',
      href: '/jobs/manage',
      description: 'Post a new job opening'
    }] : []),
    {
      title: 'View Tasks',
      icon: CheckCircleIcon,
      color: 'teal',
      href: '/tasks',
      description: 'Manage your tasks'
    },
    {
      title: 'Settings',
      icon: SettingsIcon,
      color: 'gray',
      href: '/settings',
      description: 'Configure your account'
    }
  ];

  const recentTasks = backendTasks?.slice(0, 5) || [];

  return (
    <Box minH="100vh" bg={colorMode === 'dark' ? 'gray.900' : 'gray.50'}>
      <Flex h="100vh" overflow="hidden">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          isCenterOpen={isCenterOpen}
          colorMode={colorMode}
          dayTasks={() => ({})}
          expandedDays={{}}
          getCurrentDay={() => 'Monday'}
          toggleSidebar={toggleSidebar}
          handleDayClick={() => {}}
          handleWeeklyTaskClick={() => {}}
          toggleTaskCompleted={() => {}}
          renderFileAttachmentIndicator={() => null}
          sharedTasks={sharedTasks}
          sharedProjects={sharedProjects}
          sharedTasksLoading={dashboardLoading}
          sharedProjectsLoading={dashboardLoading}
          sharedTasksError={dashboardError}
          sharedProjectsError={dashboardError}
          isSharedContentExpanded={false}
          toggleSharedContentExpanded={() => {}}
          onSharedTaskClick={() => {}}
          onSharedProjectClick={() => {}}
          refreshSharedContent={refreshData}
          dismissSharedTasksError={dismissError}
          resetToAllTasks={() => window.location.href = '/tasks'}
          isProUser={user?.userType === 'pro'}
        />

        <Flex flex="1" direction="column">
          <TopBar
            colorMode={colorMode}
            toggleColorMode={toggleColorMode}
            isOnline={true}
            currentView="dashboard"
            searchTerm=""
            handleSearch={() => {}}
            resetToAllTasks={() => {}}
            isSidebarOpen={isSidebarOpen}
            isCenterOpen={isCenterOpen}
            onLogout={handleLogout}
          />

          <Box flex="1" overflowY="auto" p={4} mb={{ base: "80px", md: "60px" }}>
            <VStack spacing={6} align="stretch">
              {/* Welcome Section */}
              <Box>
                <Heading size="lg" color={colorMode === 'light' ? 'gray.800' : 'white'} mb={2}>
                  Welcome back, {user?.firstName || user?.username || 'User'}!
                </Heading>
                <Text color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
                  Here's what's happening with your tasks and projects today.
                </Text>

                {/* Error Display */}
                {dashboardError && (
                  <Box mt={4} p={3} bg="red.50" border="1px solid" borderColor="red.200" borderRadius="md">
                    <Text color="red.800" fontSize="sm">
                      Error: {dashboardError}
                    </Text>
                    <Button size="sm" mt={2} colorScheme="red" variant="outline" onClick={refreshData}>
                      Retry
                    </Button>
                  </Box>
                )}

                {/* Loading State */}
                {dashboardLoading && (
                  <Box mt={4} p={3} bg="blue.50" border="1px solid" borderColor="blue.200" borderRadius="md">
                    <Flex align="center" gap={2}>
                      <Spinner size="sm" />
                      <Text color="blue.800" fontSize="sm">
                        Loading dashboard data...
                      </Text>
                    </Flex>
                  </Box>
                )}
              </Box>

              {/* Stats Grid */}
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                <Card>
                  <CardBody>
                    <Stat>
                      <StatLabel>Projects</StatLabel>
                      <StatNumber>{totalProjects}</StatNumber>
                      <StatHelpText>
                        <StatArrow type="increase" />
                        Active projects
                      </StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody>
                    <Stat>
                      <StatLabel>Total Tasks</StatLabel>
                      <StatNumber>{totalTasks}</StatNumber>
                      <StatHelpText>
                        <StatArrow type="increase" />
                        23.36%
                      </StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <Stat>
                      <StatLabel>Completed</StatLabel>
                      <StatNumber>{completedTasks}</StatNumber>
                      <StatHelpText>
                        <StatArrow type="increase" />
                        {completionRate}% rate
                      </StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <Stat>
                      <StatLabel>Pending</StatLabel>
                      <StatNumber>{pendingTasks}</StatNumber>
                      <StatHelpText>
                        <StatArrow type="decrease" />
                        {totalTasks > 0 ? Math.round((pendingTasks / totalTasks) * 100) : 0}% remaining
                      </StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>
              </SimpleGrid>

              {/* Quick Actions */}
              <Box>
                <Heading size="md" mb={4} color={colorMode === 'light' ? 'gray.800' : 'white'}>
                  Quick Actions
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {quickActions.map((action, index) => (
                    <Card
                      key={index}
                      cursor="pointer"
                      _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                      transition="all 0.2s"
                      onClick={() => window.location.href = action.href}
                    >
                      <CardBody>
                        <HStack spacing={3}>
                          <Icon as={action.icon} color={`${action.color}.500`} boxSize={6} />
                          <VStack align="start" spacing={1} flex={1}>
                            <Text fontWeight="semibold" color={colorMode === 'light' ? 'gray.800' : 'white'}>
                              {action.title}
                            </Text>
                            <Text fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
                              {action.description}
                            </Text>
                          </VStack>
                        </HStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              </Box>

              {/* Recent Tasks */}
              <Box>
                <Heading size="md" mb={4} color={colorMode === 'light' ? 'gray.800' : 'white'}>
                  Recent Tasks
                </Heading>
                <Card>
                  <CardBody>
                    {dashboardLoading ? (
                      <Flex justify="center" p={4}>
                        <Spinner />
                      </Flex>
                    ) : recentTasks.length > 0 ? (
                      <VStack align="stretch" spacing={3}>
                        {recentTasks.map((task, index) => (
                          <HStack key={index} justify="space-between" p={2} borderRadius="md" _hover={{ bg: colorMode === 'light' ? 'gray.50' : 'gray.700' }}>
                            <HStack spacing={3}>
                              <Icon as={CheckCircleIcon} color={task.completed ? 'green.500' : 'gray.400'} boxSize={4} />
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="medium" color={colorMode === 'light' ? 'gray.800' : 'white'}>
                                  {task.title}
                                </Text>
                                {task.project && (
                                  <Text fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
                                    Project: {task.project}
                                  </Text>
                                )}
                              </VStack>
                            </HStack>
                            <Badge colorScheme={task.completed ? 'green' : 'yellow'} variant="subtle">
                              {task.completed ? 'Completed' : 'Pending'}
                            </Badge>
                          </HStack>
                        ))}
                      </VStack>
                    ) : (
                      <Text color={colorMode === 'light' ? 'gray.600' : 'gray.400'} textAlign="center" p={4}>
                        No tasks yet. Create your first task to get started!
                      </Text>
                    )}
                  </CardBody>
                </Card>
              </Box>



              {/* Summary Stats */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Card>
                  <CardHeader>
                    <Heading size="sm" color={colorMode === 'light' ? 'gray.800' : 'white'}>
                      Business Overview
                    </Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack align="stretch" spacing={3}>
                      <HStack justify="space-between">
                        <Text>Clients</Text>
                        <Text fontWeight="semibold">{totalClients}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>Companies</Text>
                        <Text fontWeight="semibold">{totalCompanies}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>Active Projects</Text>
                        <Text fontWeight="semibold">{totalProjects}</Text>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <Heading size="sm" color={colorMode === 'light' ? 'gray.800' : 'white'}>
                      Task Progress
                    </Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack align="stretch" spacing={3}>
                      <HStack justify="space-between">
                        <Text>Completion Rate</Text>
                        <Text fontWeight="semibold">{completionRate}%</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>Tasks Due Today</Text>
                        <Text fontWeight="semibold">
                          {backendTasks?.filter(task => {
                            const today = new Date().toISOString().split('T')[0];
                            return task.dueDate === today && !task.completed;
                          })?.length || 0}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>Overdue Tasks</Text>
                        <Text fontWeight="semibold" color="red.500">
                          {backendTasks?.filter(task => {
                            const today = new Date();
                            const dueDate = new Date(task.dueDate);
                            return dueDate < today && !task.completed;
                          })?.length || 0}
                        </Text>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </VStack>
          </Box>

          <BottomNav
            isSidebarOpen={isSidebarOpen}
            isCenterOpen={isCenterOpen}
            isAddMode={false}
            isFooterOpen={isFeedbackModalOpen}
            toggleSidebar={toggleSidebar}
            toggleCenter={toggleCenter}
            handleAddTask={() => window.location.href = '/tasks'}
            handleAddProject={() => window.location.href = '/projects'}
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
}
