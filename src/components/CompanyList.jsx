import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Select,
  IconButton,
  Badge,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Flex,
  Spacer,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  SimpleGrid,
  Tooltip,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  useColorMode,
  Heading,
  Image
} from '@chakra-ui/react';
import {
  AddIcon,
  SearchIcon,
  EditIcon,
  DeleteIcon,
  CheckCircleIcon,
  CloseIcon,
  EmailIcon,
  ExternalLinkIcon,
  PhoneIcon,
  AtSignIcon,
  StarIcon,
  CalendarIcon,
  ViewIcon,
  SettingsIcon,
  ChevronLeftIcon,
  LinkIcon
} from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCompanies } from '../hooks/useCompanies';
import CompanyCreatePanel from './CompanyCreatePanel';
import CompanyEditPanel from './CompanyEditPanel';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';
import MobileBackdropOverlay from './MobileBackdropOverlay';
import FeedbackModal from './FeedbackModal';

const CompanyList = () => {
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  const { logout, user } = useAuth();

  // TopBar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isCenterOpen, setIsCenterOpen] = useState(() => {
    const saved = localStorage.getItem('centerOpen');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Feedback modal state
  const { isOpen: isFeedbackModalOpen, onOpen: openFeedbackModal, onClose: closeFeedbackModal } = useDisclosure({ defaultIsOpen: false });

  const {
    companies,
    loading,
    error,
    pagination,
    fetchCompanies,
    deleteCompany,
    requestVerification,
    generatePublicLink,
    clearError
  } = useCompanies();

  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const toast = useToast();
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.700');

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    // Companies state updated
  }, [companies]);

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      clearError();
    }
  }, [error, toast, clearError]);

  const handleSearch = () => {
    fetchCompanies({
      search: searchTerm,
      industry: industryFilter,
      size: sizeFilter,
      includeVerified: true // Always include verified companies from all users
    });
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    const result = await deleteCompany(deleteConfirm._id);
    if (result.success) {
      toast({
        title: 'Success',
        description: 'Company deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onDeleteClose();
      setDeleteConfirm(null);
    }
  };

  const handleRequestVerification = async (company) => {
    const result = await requestVerification(company._id);
    if (result.success) {
      toast({
        title: 'Verification Email Sent',
        description: 'A verification email has been sent to the company contact email.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleEdit = (company) => {
    setSelectedCompany(company);
    onEditOpen();
  };

  const handleDeleteClick = (company) => {
    setDeleteConfirm(company);
    onDeleteOpen();
  };

  const generatePublicUrl = (company) => {
    if (!company.isVerified || !company.publicToken) {
      return null;
    }
    const companySlug = company.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    return `/company/${companySlug}/${company.publicToken}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getSizeColor = (size) => {
    const colors = {
      '1-10': 'green',
      '11-50': 'blue',
      '51-200': 'purple',
      '201-500': 'orange',
      '500+': 'red'
    };
    return colors[size] || 'gray';
  };

  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Retail',
    'Manufacturing',
    'Consulting',
    'Real Estate',
    'Entertainment',
    'Non-profit',
    'Other'
  ];

  const sizes = ['1-10', '11-50', '51-200', '201-500', '500+'];

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
            currentView="companies"
            searchTerm={searchQuery}
            handleSearch={handleTopBarSearch}
            resetToAllTasks={resetToAllTasks}
            isSidebarOpen={isSidebarOpen}
            isCenterOpen={isCenterOpen}
            onLogout={handleLogout}
          />

          <Box flex="1" overflowY="auto" p={4} mb={{ base: "80px", md: "60px" }}>
            <Box maxW="4xl" mx="auto">
              {/* Search and Filters */}
              <Card bg={cardBg} mb={4}>
                <CardBody>
                  <VStack spacing={4}>
                    <HStack w="full" spacing={4}>
                      <Input
                        placeholder="Search companies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      />
                      <IconButton
                        icon={<SearchIcon />}
                        onClick={handleSearch}
                        colorScheme="blue"
                        aria-label="Search"
                      />
                    </HStack>

                    <HStack w="full" spacing={4}>
                      <Select
                        placeholder="Filter by industry"
                        value={industryFilter}
                        onChange={(e) => setIndustryFilter(e.target.value)}
                      >
                        {industries.map(industry => (
                          <option key={industry} value={industry}>
                            {industry}
                          </option>
                        ))}
                      </Select>

                      <Select
                        placeholder="Filter by size"
                        value={sizeFilter}
                        onChange={(e) => setSizeFilter(e.target.value)}
                      >
                        {sizes.map(size => (
                          <option key={size} value={size}>
                            {size} employees
                          </option>
                        ))}
                      </Select>

                      <Button
                        onClick={handleSearch}
                        colorScheme="blue"
                        variant="outline"
                      >
                        Filter
                      </Button>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Loading State */}
              {loading && (
                <Center py={8}>
                  <Spinner size="lg" />
                </Center>
              )}

              {/* Error State */}
              {error && (
                <Alert status="error" mb={4}>
                  <AlertIcon />
                  {error}
                </Alert>
              )}

              {/* Companies Grid */}
              {!loading && companies.length > 0 && (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {companies.map((company) => (
                    <Card key={company._id} bg={cardBg} border="1px" borderColor={borderColor}>
                      <CardHeader pb={2}>
                        <Flex align="center" justify="space-between">
                          <HStack spacing={3} align="center" flex="1">
                            {company.logo && company.logo.dataUrl ? (
                              <Image
                                src={company.logo.dataUrl}
                                alt={`${company.name} logo`}
                                boxSize="40px"
                                objectFit="contain"
                                borderRadius="md"
                                border="1px solid"
                                borderColor="gray.200"
                                fallbackSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxMEMxNC40NzcgMTAgMTAgMTQuNDc3IDEwIDIwQzEwIDI1LjUyMyAxNC40NzcgMzAgMjAgMzBDMjUuNTIzIDMwIDMwIDI1LjUyMyAzMCAyMEMzMCAxNC40NzcgMjAgMTBaIiBmaWxsPSIjOUI5QkFCIi8+Cjwvc3ZnPgo="
                              />
                            ) : (
                              <Box
                                boxSize="40px"
                                bg="gray.100"
                                borderRadius="md"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                border="1px solid"
                                borderColor="gray.200"
                              >
                                <Text fontSize="xs" color="gray.500" fontWeight="bold">
                                  {company.name.charAt(0).toUpperCase()}
                                </Text>
                              </Box>
                            )}
                            <Box flex="1">
                              <HStack spacing={2} mb={2}>
                                <Text fontWeight="bold" fontSize="lg" noOfLines={1}>
                                  {company.name}
                                </Text>
                                {company.isVerified ? (
                                  <Tooltip label="Verified Company">
                                    <Badge colorScheme="green" variant="solid">
                                      <CheckCircleIcon />
                                    </Badge>
                                  </Tooltip>
                                ) : (
                                  <Tooltip label="Not Verified - Hidden from default view">
                                    <Badge colorScheme="gray" variant="solid">
                                      <CloseIcon />
                                    </Badge>
                                  </Tooltip>
                                )}
                              </HStack>
                              {company.industry && (
                                <Text fontSize="sm" color="gray.500" noOfLines={1}>
                                  {company.industry}
                                </Text>
                              )}
                            </Box>
                          </HStack>
                        </Flex>
                      </CardHeader>

                      <CardBody pt={0}>
                        {company.description && (
                          <Text fontSize="sm" color="gray.600" mb={3} noOfLines={2}>
                            {company.description}
                          </Text>
                        )}

                        <VStack spacing={2} align="stretch">
                          {company.size && (
                            <HStack spacing={2}>
                              <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                Size:
                              </Text>
                              <Badge colorScheme={getSizeColor(company.size)} variant="subtle" fontSize="xs">
                                {company.size} employees
                              </Badge>
                            </HStack>
                          )}

                          {company.location && (company.location.city || company.location.country) && (
                            <HStack spacing={2}>
                              <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                Location:
                              </Text>
                              <Text fontSize="xs" color="gray.600">
                                {[company.location.city, company.location.state, company.location.country].filter(Boolean).join(', ')}
                              </Text>
                            </HStack>
                          )}

                          {company.contact && company.contact.email && (
                            <HStack spacing={2}>
                              <EmailIcon boxSize={3} color="gray.400" />
                              <Text fontSize="xs" color="gray.600" noOfLines={1}>
                                {company.contact.email}
                              </Text>
                            </HStack>
                          )}

                          {company.website && (
                            <HStack spacing={2}>
                              <ExternalLinkIcon boxSize={3} color="gray.400" />
                              <Text fontSize="xs" color="gray.600" noOfLines={1}>
                                {company.website}
                              </Text>
                            </HStack>
                          )}

                          {company.founded && (
                            <HStack spacing={2}>
                              <CalendarIcon boxSize={3} color="gray.400" />
                              <Text fontSize="xs" color="gray.600">
                                Founded {company.founded}
                              </Text>
                            </HStack>
                          )}
                        </VStack>
                      </CardBody>

                      <CardFooter pt={0}>
                        <Flex w="full" justify="space-between" align="center">
                          <HStack spacing={2}>
                            <IconButton
                              size="sm"
                              icon={<EditIcon />}
                              onClick={() => handleEdit(company)}
                              colorScheme="blue"
                              variant="ghost"
                              aria-label="Edit company"
                            />
                            <IconButton
                              size="sm"
                              icon={<DeleteIcon />}
                              onClick={() => handleDeleteClick(company)}
                              colorScheme="red"
                              variant="ghost"
                              aria-label="Delete company"
                            />
                            {!company.isVerified && (
                              <IconButton
                                size="sm"
                                icon={<EmailIcon />}
                                onClick={() => handleRequestVerification(company)}
                                colorScheme="orange"
                                variant="ghost"
                                aria-label="Request verification"
                              />
                            )}
                          </HStack>
                          {company.isVerified && generatePublicUrl(company) && (
                            <Button
                              size="sm"
                              colorScheme="blue"
                              variant="outline"
                              leftIcon={<ViewIcon />}
                              onClick={() => navigate(generatePublicUrl(company))}
                            >
                              View Public Page
                            </Button>
                          )}
                        </Flex>
                      </CardFooter>
                    </Card>
                  ))}
                </SimpleGrid>
              )}

              {/* Empty State */}
              {!loading && companies.length === 0 && (
                <Center py={12}>
                  <VStack spacing={4}>
                    <Text fontSize="lg" color="gray.500">
                      No companies found
                    </Text>
                    <Text color="gray.400" textAlign="center">
                      {searchTerm || industryFilter || sizeFilter
                        ? 'Try adjusting your search criteria'
                        : 'Create your first company to get started'}
                    </Text>
                    {!searchTerm && !industryFilter && !sizeFilter && (
                      <Button colorScheme="blue" onClick={onCreateOpen}>
                        Add Your First Company
                      </Button>
                    )}
                  </VStack>
                </Center>
              )}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <Flex justify="center" mt={6}>
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      variant="outline"
                      isDisabled={pagination.page === 1}
                      onClick={() => fetchCompanies({ page: pagination.page - 1 })}
                    >
                      Previous
                    </Button>
                    <Text fontSize="sm">
                      Page {pagination.page} of {pagination.pages}
                    </Text>
                    <Button
                      size="sm"
                      variant="outline"
                      isDisabled={pagination.page === pagination.pages}
                      onClick={() => fetchCompanies({ page: pagination.page + 1 })}
                    >
                      Next
                    </Button>
                  </HStack>
                </Flex>
              )}

              {/* Create Company Modal */}
              <CompanyCreatePanel
                isOpen={isCreateOpen}
                onClose={onCreateClose}
                onSuccess={() => {
                  onCreateClose();
                  fetchCompanies();
                }}
              />

              {/* Edit Company Modal */}
              {selectedCompany && (
                <CompanyEditPanel
                  isOpen={isEditOpen}
                  onClose={onEditClose}
                  company={selectedCompany}
                  onSuccess={() => {
                    onEditClose();
                    setSelectedCompany(null);
                    fetchCompanies();
                  }}
                />
              )}

              {/* Delete Confirmation Modal */}
              <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>Delete Company</ModalHeader>
                  <ModalBody>
                    <Text>
                      Are you sure you want to delete "{deleteConfirm?.name}"? This action cannot be undone.
                    </Text>
                  </ModalBody>
                  <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onDeleteClose}>
                      Cancel
                    </Button>
                    <Button colorScheme="red" onClick={handleDelete}>
                      Delete
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            </Box>
          </Box>

          <BottomNav
            isSidebarOpen={isSidebarOpen}
            isAddMode={isCreateOpen}
            isFooterOpen={isFeedbackModalOpen}
            toggleSidebar={toggleSidebar}
            handleAddTask={onCreateOpen}
            handleAddProject={onCreateOpen}
            handleAddClient={onCreateOpen}
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
    </Box>
  );
};

export default CompanyList;
