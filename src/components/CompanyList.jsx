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
    const sizeColors = {
      '1-10': 'green',
      '11-50': 'blue',
      '51-200': 'purple',
      '201-500': 'orange',
      '500+': 'red'
    };
    return sizeColors[size] || 'gray';
  };

  // Check if current user owns the company
  const isCompanyOwner = (company) => {
    if (!user || !company.createdBy) return false;
    return company.createdBy === user._id || company.createdBy === user._id.toString();
  };

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

  const handleTopBarSearch = (value) => setSearchQuery(value);
  const resetToAllTasks = () => navigate('/dashboard');
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      // Logout error handled silently
    }
  };

  return (
    <Box minH="100vh" bg={bgColor}>
      <Flex>
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
          user={user}
          onLogout={handleLogout}
          colorMode={colorMode}
          toggleColorMode={toggleColorMode}
        />

        {/* Main Content */}
        <Flex flex="1" direction="column">
          {/* TopBar */}
          <TopBar
            isSidebarOpen={isSidebarOpen}
            isCenterOpen={isCenterOpen}
            onToggleSidebar={toggleSidebar}
            onToggleCenter={toggleCenter}
            searchQuery={searchQuery}
            onSearchChange={handleTopBarSearch}
            onResetToAllTasks={resetToAllTasks}
            onLogout={handleLogout}
            user={user}
            colorMode={colorMode}
            toggleColorMode={toggleColorMode}
          />

          {/* Main Content Area */}
          <Box flex="1" p={4}>
            <Box maxW="7xl" mx="auto">
              {/* Header */}
              <Flex justify="space-between" align="center" mb={6}>
                <VStack align="start" spacing={1}>
                  <Heading size="lg" color={useColorModeValue('gray.800', 'white')}>
                    Companies
                  </Heading>
                  <Text color={useColorModeValue('gray.600', 'gray.400')}>
                    Manage your companies and discover verified companies
                  </Text>
                </VStack>
                <Button
                  leftIcon={<AddIcon />}
                  colorScheme="blue"
                  onClick={onCreateOpen}
                >
                  Add Company
                </Button>
              </Flex>

              {/* Info Alert */}
              <Alert status="info" mb={6}>
                <AlertIcon />
                <VStack align="start" spacing={1}>
                  <Text fontWeight="semibold">
                    Company Permissions
                  </Text>
                  <Text fontSize="sm">
                    • You can edit and delete only your own companies (marked with "OWNED" badge)
                  </Text>
                  <Text fontSize="sm">
                    • Verified companies from other users are shown for reference (marked with "OTHER" badge)
                  </Text>
                  <Text fontSize="sm">
                    • All users can view public pages of verified companies
                  </Text>
                </VStack>
              </Alert>

              {/* Search and Filters */}
              <Card mb={6} bg={cardBg}>
                <CardBody>
                  <VStack spacing={4}>
                    <HStack w="full" spacing={4}>
                      <Input
                        placeholder="Search companies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      />
                      <Button colorScheme="blue" onClick={handleSearch}>
                        Search
                      </Button>
                    </HStack>
                    <HStack w="full" spacing={4}>
                      <Select
                        placeholder="All Industries"
                        value={industryFilter}
                        onChange={(e) => setIndustryFilter(e.target.value)}
                      >
                        <option value="Technology">Technology</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Finance">Finance</option>
                        <option value="Education">Education</option>
                        <option value="Retail">Retail</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Consulting">Consulting</option>
                        <option value="Real Estate">Real Estate</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Non-profit">Non-profit</option>
                        <option value="Other">Other</option>
                      </Select>
                      <Select
                        placeholder="All Sizes"
                        value={sizeFilter}
                        onChange={(e) => setSizeFilter(e.target.value)}
                      >
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="500+">500+ employees</option>
                      </Select>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Companies Grid */}
              {loading ? (
                <Center py={12}>
                  <VStack spacing={4}>
                    <Spinner size="xl" />
                    <Text>Loading companies...</Text>
                  </VStack>
                </Center>
              ) : companies.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {companies.map((company) => {
                    const isOwner = isCompanyOwner(company);
                    return (
                      <Card key={company._id} bg={cardBg} border="1px solid" borderColor={borderColor}>
                        <CardHeader pb={2}>
                          <HStack spacing={3}>
                            {company.logo?.dataUrl ? (
                              <Image
                                src={company.logo.dataUrl}
                                alt={company.name}
                                boxSize="40px"
                                borderRadius="md"
                                objectFit="cover"
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
                                {/* Ownership indicator */}
                                {isOwner ? (
                                  <Tooltip label="Your Company">
                                    <Badge colorScheme="blue" variant="solid">
                                      <Text fontSize="xs">OWNED</Text>
                                    </Badge>
                                  </Tooltip>
                                ) : (
                                  <Tooltip label="Other User's Company">
                                    <Badge colorScheme="gray" variant="outline">
                                      <Text fontSize="xs">OTHER</Text>
                                    </Badge>
                                  </Tooltip>
                                )}
                              </HStack>
                              {company.industry && (
                                <Badge colorScheme={getSizeColor(company.size)} variant="subtle" mb={1}>
                                  {company.industry}
                                </Badge>
                              )}
                              {company.size && (
                                <Badge colorScheme="gray" variant="subtle">
                                  {company.size} employees
                                </Badge>
                              )}
                            </Box>
                          </HStack>
                        </CardHeader>

                        <CardBody pt={0}>
                          <VStack spacing={3} align="stretch">
                            {company.description && (
                              <Text fontSize="sm" color="white" noOfLines={2}>
                                {company.description}
                              </Text>
                            )}

                            {company.location?.city && (
                              <HStack spacing={2}>
                                <AtSignIcon boxSize={3} color="gray.400" />
                                <Text fontSize="xs" color="white" noOfLines={1}>
                                  {[company.location.city, company.location.state, company.location.country]
                                    .filter(Boolean)
                                    .join(', ')}
                                </Text>
                              </HStack>
                            )}

                            {company.contact?.email && (
                              <HStack spacing={2}>
                                <EmailIcon boxSize={3} color="gray.400" />
                                <Text fontSize="xs" color="white" noOfLines={1}>
                                  {company.contact.email}
                                </Text>
                              </HStack>
                            )}

                            {company.website && (
                              <HStack spacing={2}>
                                <ExternalLinkIcon boxSize={3} color="gray.400" />
                                <Text fontSize="xs" color="white" noOfLines={1}>
                                  {company.website}
                                </Text>
                              </HStack>
                            )}

                            {company.founded && (
                              <HStack spacing={2}>
                                <CalendarIcon boxSize={3} color="gray.400" />
                                <Text fontSize="xs" color="white">
                                  Founded {company.founded}
                                </Text>
                              </HStack>
                            )}
                          </VStack>
                        </CardBody>

                        <CardFooter pt={0}>
                          <Flex w="full" justify="space-between" align="center">
                            <HStack spacing={2}>
                              {/* Only show edit/delete buttons if user owns the company */}
                              {isOwner ? (
                                <>
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
                                </>
                              ) : (
                                <Text fontSize="xs" color="gray.500">
                                  Read-only access
                                </Text>
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
                    );
                  })}
                </SimpleGrid>
              ) : (
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
