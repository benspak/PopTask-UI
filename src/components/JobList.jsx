import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Badge,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Heading,
  Flex,
  Spacer,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Alert,
  AlertIcon,
  Spinner,
  Divider,
  Tag,
  TagLabel,
  TagCloseButton,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Switch,
  SimpleGrid,
  useColorModeValue,
  useColorMode,
  useBreakpointValue
} from '@chakra-ui/react';
import {
  ChevronDownIcon,
  SearchIcon,
  AddIcon,
  EditIcon,
  DeleteIcon,
  ViewIcon,
  ExternalLinkIcon,
  CalendarIcon,
  AtSignIcon,
  StarIcon
} from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../hooks/useJobs';
import { useCompanies } from '../hooks/useCompanies';
import { useAuth } from '../contexts/AuthContext';
import JobCreatePanel from './JobCreatePanel';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import MobileBackdropOverlay from './MobileBackdropOverlay';
import FeedbackModal from './FeedbackModal';

const JobList = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { logout, user, isAuthenticated, isLoading } = useAuth();
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Handle authentication loading state
  if (isLoading) {
    return (
      <Box p={6} textAlign="center">
        <Spinner size="xl" />
        <Text mt={4}>Loading...</Text>
      </Box>
    );
  }

  // Handle unauthenticated state
  if (!isAuthenticated) {
    return (
      <Box p={6}>
        <Alert status="error">
          <AlertIcon />
          <Text>Please log in to access job postings.</Text>
        </Alert>
      </Box>
    );
  }

  const navigate = useNavigate();

  // TopBar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? JSON.parse(saved) : !isMobile;
  });
  const [isCenterOpen, setIsCenterOpen] = useState(() => {
    const saved = localStorage.getItem('centerOpen');
    return saved !== null ? JSON.parse(saved) : !isMobile;
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Feedback modal state
  const { isOpen: isFeedbackModalOpen, onOpen: openFeedbackModal, onClose: closeFeedbackModal } = useDisclosure({ defaultIsOpen: false });

  const { jobs, loading, error, pagination, fetchJobs, deleteJob, updateJobStatus } = useJobs();
  const { companies, fetchCompanies } = useCompanies();
  const toast = useToast();
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    type: '',
    level: '',
    locationType: '',
    status: '',
    companyId: ''
  });
  const [selectedJob, setSelectedJob] = useState(null);
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    fetchJobs(filters);
  }, [filters]);

  // Fetch companies when component mounts
  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // TopBar handlers
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
  const handleTopBarSearch = (value) => setSearchQuery(value);
  const resetToAllTasks = () => navigate('/dashboard');
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      toast({ title: 'Logout failed', status: 'error' });
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleDeleteJob = async (jobId) => {
    const success = await deleteJob(jobId);
    if (success) {
      toast({
        title: 'Job deleted',
        description: 'The job has been deleted successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    const updatedJob = await updateJobStatus(jobId, newStatus);
    if (updatedJob) {
      toast({
        title: 'Status updated',
        description: `Job status changed to ${newStatus}.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'green';
      case 'draft': return 'gray';
      case 'paused': return 'yellow';
      case 'closed': return 'red';
      case 'archived': return 'purple';
      default: return 'gray';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'full-time': return 'blue';
      case 'part-time': return 'green';
      case 'contract': return 'orange';
      case 'internship': return 'purple';
      case 'freelance': return 'teal';
      default: return 'gray';
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'entry': return 'green';
      case 'junior': return 'blue';
      case 'mid': return 'yellow';
      case 'senior': return 'orange';
      case 'lead': return 'purple';
      case 'executive': return 'red';
      default: return 'gray';
    }
  };

  const formatSalary = (salary) => {
    if (!salary.min && !salary.max) return 'Not specified';

    const format = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: salary.currency || 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    if (salary.min && salary.max) {
      return `${format(salary.min)} - ${format(salary.max)}`;
    } else if (salary.min) {
      return `${format(salary.min)}+`;
    } else if (salary.max) {
      return `Up to ${format(salary.max)}`;
    }

    return 'Not specified';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (user?.userType !== 'pro' && user?.userType !== 'admin') {
    return (
      <Box p={6}>
        <Alert status="warning">
          <AlertIcon />
          <Text>Pro membership required to manage job postings.</Text>
        </Alert>
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
          getCurrentDay={() => 'Monday'}
          toggleSidebar={toggleSidebar}
          handleDayClick={() => {}}
          handleWeeklyTaskClick={() => {}}
          toggleTaskCompleted={() => {}}
          renderFileAttachmentIndicator={() => null}
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
          resetToAllTasks={() => navigate('/dashboard')}
          isProUser={user?.userType === 'pro'}
        />

        <Flex flex="1" direction="column">
          <TopBar
            colorMode={colorMode}
            toggleColorMode={toggleColorMode}
            isOnline={true}
            currentView="jobs"
            searchTerm={searchQuery}
            handleSearch={handleTopBarSearch}
            resetToAllTasks={resetToAllTasks}
            isSidebarOpen={isSidebarOpen}
            isCenterOpen={isCenterOpen}
            onLogout={handleLogout}
          />

          <Box flex="1" overflowY="auto" p={4} mb={{ base: "80px", md: "60px" }}>
            <Box maxW="4xl" mx="auto">
              <VStack spacing={6} align="stretch">
                {/* Header */}
                <Flex justify="space-between" align="center">
                  {/* Removed title and button as requested */}
                </Flex>

                {/* Filters */}
                <Card>
                  <CardBody>
                    <VStack spacing={4}>
                      <HStack spacing={4} w="full">
                        <InputGroup>
                          <InputLeftElement pointerEvents="none">
                            <SearchIcon color="gray.300" />
                          </InputLeftElement>
                          <Input
                            placeholder="Search jobs..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                          />
                        </InputGroup>
                        <Select
                          placeholder="Category"
                          value={filters.category}
                          onChange={(e) => handleFilterChange('category', e.target.value)}
                        >
                          <option value="technology">Technology</option>
                          <option value="marketing">Marketing</option>
                          <option value="sales">Sales</option>
                          <option value="design">Design</option>
                          <option value="engineering">Engineering</option>
                          <option value="product">Product</option>
                          <option value="operations">Operations</option>
                          <option value="finance">Finance</option>
                          <option value="hr">Human Resources</option>
                          <option value="other">Other</option>
                        </Select>
                        <Select
                          placeholder="Type"
                          value={filters.type}
                          onChange={(e) => handleFilterChange('type', e.target.value)}
                        >
                          <option value="full-time">Full-time</option>
                          <option value="part-time">Part-time</option>
                          <option value="contract">Contract</option>
                          <option value="internship">Internship</option>
                          <option value="freelance">Freelance</option>
                        </Select>
                        <Select
                          placeholder="Level"
                          value={filters.level}
                          onChange={(e) => handleFilterChange('level', e.target.value)}
                        >
                          <option value="entry">Entry</option>
                          <option value="junior">Junior</option>
                          <option value="mid">Mid</option>
                          <option value="senior">Senior</option>
                          <option value="lead">Lead</option>
                          <option value="executive">Executive</option>
                        </Select>
                      </HStack>
                      <HStack spacing={4} w="full">
                        <Select
                          placeholder="Location Type"
                          value={filters.locationType}
                          onChange={(e) => handleFilterChange('locationType', e.target.value)}
                        >
                          <option value="remote">Remote</option>
                          <option value="onsite">On-site</option>
                          <option value="hybrid">Hybrid</option>
                        </Select>
                        <Select
                          placeholder="Status"
                          value={filters.status}
                          onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="paused">Paused</option>
                          <option value="closed">Closed</option>
                          <option value="archived">Archived</option>
                        </Select>
                        <Select
                          placeholder="Company"
                          value={filters.companyId}
                          onChange={(e) => handleFilterChange('companyId', e.target.value)}
                        >
                          {companies.map(company => (
                            <option key={company._id} value={company._id}>
                              {company.name}
                            </option>
                          ))}
                        </Select>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Error Alert */}
                {error && (
                  <Alert status="error">
                    <AlertIcon />
                    {error}
                  </Alert>
                )}

                {/* Loading State */}
                {loading && (
                  <Flex justify="center" p={8}>
                    <Spinner size="lg" />
                  </Flex>
                )}

                {/* Jobs List */}
                {!loading && (
                  <VStack spacing={4} align="stretch">
                    {jobs.length === 0 ? (
                      <Card>
                        <CardBody>
                          <Text textAlign="center" color="gray.500">
                            No jobs found. Create your first job posting!
                          </Text>
                        </CardBody>
                      </Card>
                    ) : (
                      jobs.map(job => (
                        <Card key={job._id} border="1px" borderColor={borderColor}>
                          <CardHeader>
                            <Flex justify="space-between" align="start">
                              <VStack align="start" spacing={2}>
                                <Heading size="md">{job.title}</Heading>
                                <HStack spacing={2}>
                                  <Badge colorScheme={getStatusColor(job.status)}>
                                    {job.status}
                                  </Badge>
                                  <Badge colorScheme={getTypeColor(job.type)}>
                                    {job.type}
                                  </Badge>
                                  <Badge colorScheme={getLevelColor(job.level)}>
                                    {job.level}
                                  </Badge>
                                </HStack>
                              </VStack>
                              <Menu>
                                <MenuButton
                                  as={IconButton}
                                  icon={<ChevronDownIcon />}
                                  variant="ghost"
                                  size="sm"
                                />
                                <MenuList>
                                  <MenuItem icon={<ViewIcon />} onClick={() => setSelectedJob(job)}>
                                    View Details
                                  </MenuItem>
                                  <MenuItem icon={<EditIcon />}>
                                    Edit Job
                                  </MenuItem>
                                  <MenuItem
                                    icon={<DeleteIcon />}
                                    color="red.500"
                                    onClick={() => handleDeleteJob(job._id)}
                                  >
                                    Delete Job
                                  </MenuItem>
                                </MenuList>
                              </Menu>
                            </Flex>
                          </CardHeader>
                          <CardBody>
                            <VStack align="start" spacing={3}>
                              <Text noOfLines={3} color="gray.600">
                                {job.description}
                              </Text>
                              <HStack spacing={4} wrap="wrap">
                                {job.location && (
                                  <HStack spacing={1}>
                                    <AtSignIcon boxSize={3} color="gray.400" />
                                    <Text fontSize="sm" color="gray.600">
                                      {job.location.city && job.location.state
                                        ? `${job.location.city}, ${job.location.state}`
                                        : job.location.type === 'remote'
                                        ? 'Remote'
                                        : 'Location not specified'}
                                    </Text>
                                  </HStack>
                                )}
                                {job.salary && (job.salary.min || job.salary.max) && (
                                  <HStack spacing={1}>
                                    <StarIcon boxSize={3} color="gray.400" />
                                    <Text fontSize="sm" color="gray.600">
                                      {formatSalary(job.salary)}
                                    </Text>
                                  </HStack>
                                )}
                                {job.createdAt && (
                                  <HStack spacing={1}>
                                    <CalendarIcon boxSize={3} color="gray.400" />
                                    <Text fontSize="sm" color="gray.600">
                                      Posted {formatDate(job.createdAt)}
                                    </Text>
                                  </HStack>
                                )}
                              </HStack>
                              {job.skills && job.skills.length > 0 && (
                                <HStack spacing={2} wrap="wrap">
                                  {job.skills.slice(0, 5).map((skill, index) => (
                                    <Tag key={index} size="sm" colorScheme="blue">
                                      <TagLabel>{skill}</TagLabel>
                                    </Tag>
                                  ))}
                                  {job.skills.length > 5 && (
                                    <Text fontSize="xs" color="gray.500">
                                      +{job.skills.length - 5} more
                                    </Text>
                                  )}
                                </HStack>
                              )}
                            </VStack>
                          </CardBody>
                          <CardFooter>
                            <HStack spacing={2}>
                              <Select
                                size="sm"
                                value={job.status}
                                onChange={(e) => handleStatusChange(job._id, e.target.value)}
                                w="auto"
                              >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="paused">Paused</option>
                                <option value="closed">Closed</option>
                                <option value="archived">Archived</option>
                              </Select>
                              <Button
                                size="sm"
                                variant="outline"
                                leftIcon={<ExternalLinkIcon />}
                                onClick={() => window.open(`/jobs/${job.slug}`, '_blank')}
                              >
                                View Public
                              </Button>
                            </HStack>
                          </CardFooter>
                        </Card>
                      ))
                    )}
                  </VStack>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <Flex justify="center" mt={6}>
                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        disabled={pagination.page === 1}
                        onClick={() => handleFilterChange('page', pagination.page - 1)}
                      >
                        Previous
                      </Button>
                      <Text fontSize="sm">
                        Page {pagination.page} of {pagination.pages}
                      </Text>
                      <Button
                        size="sm"
                        disabled={pagination.page === pagination.pages}
                        onClick={() => handleFilterChange('page', pagination.page + 1)}
                      >
                        Next
                      </Button>
                    </HStack>
                  </Flex>
                )}
              </VStack>
            </Box>
          </Box>

          <BottomNav
            isSidebarOpen={isSidebarOpen}
            isAddMode={showCreatePanel}
            isFooterOpen={isFeedbackModalOpen}
            toggleSidebar={toggleSidebar}
            handleAddTask={() => setShowCreatePanel(true)}
            handleAddProject={() => setShowCreatePanel(true)}
            handleAddClient={() => setShowCreatePanel(true)}
            toggleFooter={openFeedbackModal}
          />
        </Flex>
      </Flex>

      {/* Mobile backdrop overlay */}
      <MobileBackdropOverlay
        isOpen={isSidebarOpen}
        onClose={toggleSidebar}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={closeFeedbackModal}
      />

      {/* Job Create Panel */}
      <JobCreatePanel
        isOpen={showCreatePanel}
        onClose={() => setShowCreatePanel(false)}
        onSuccess={() => {
          setShowCreatePanel(false);
          fetchJobs(filters);
        }}
      />
    </Box>
  );
};

export default JobList;
