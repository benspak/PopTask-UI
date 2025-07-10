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

const CompanyList = () => {
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  const { logout, user } = useAuth();

  // TopBar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCenterOpen, setIsCenterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
  const [verifiedFilter, setVerifiedFilter] = useState('');
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
    console.log('Companies state updated:', companies);
    console.log('Companies length:', companies.length);
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
      verified: verifiedFilter
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
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleCenter = () => setIsCenterOpen(!isCenterOpen);
  const handleTopBarSearch = (value) => setSearchQuery(value);
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

  return (
    <Box minH="100vh" bg={colorMode === 'dark' ? 'gray.900' : 'gray.50'}>
      <Flex h="100vh" overflow="hidden">
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

          <Box flex="1" overflowY="auto" p={4}>
            <Box maxW="4xl" mx="auto">
              <Flex justify="space-between" align="center" mb={6}>
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
                  <Heading size="lg" color="white">Companies</Heading>
                </HStack>
                <Button
                  leftIcon={<AddIcon />}
                  colorScheme="blue"
                  onClick={onCreateOpen}
                >
                  Add Company
                </Button>
              </Flex>

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

                      <Select
                        placeholder="Filter by verification"
                        value={verifiedFilter}
                        onChange={(e) => setVerifiedFilter(e.target.value)}
                      >
                        <option value="true">Verified</option>
                        <option value="false">Not Verified</option>
                      </Select>

                      <Button
                        leftIcon={<SettingsIcon />}
                        onClick={handleSearch}
                        colorScheme="blue"
                        variant="outline"
                      >
                        Apply Filters
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
                          <Tooltip label="Not Verified">
                            <Badge colorScheme="gray" variant="outline">
                              <CloseIcon />
                            </Badge>
                          </Tooltip>
                        )}
                      </HStack>
                      {company.industry && (
                        <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                          {company.industry}
                        </Badge>
                      )}
                    </Box>
                  </HStack>
                </Flex>
              </CardHeader>

                      <CardBody pt={0}>
                        <VStack align="stretch" spacing={3}>
                          {company.description && (
                            <Text fontSize="sm" color="white" noOfLines={2}>
                              {company.description}
                            </Text>
                          )}

                          <VStack align="stretch" spacing={2}>
                            {company.location.city || company.location.country ? (
                              <HStack spacing={2} fontSize="sm">
                                <AtSignIcon color="white" />
                                <Text color="white">
                                  {[company.location.city, company.location.state, company.location.country]
                                    .filter(Boolean)
                                    .join(', ')}
                                </Text>
                              </HStack>
                            ) : null}

                            {company.website && (
                              <HStack spacing={2} fontSize="sm">
                                <ExternalLinkIcon color="white" />
                                <Text color="white" noOfLines={1}>
                                  {company.website}
                                </Text>
                              </HStack>
                            )}

                            <HStack spacing={2} fontSize="sm">
                              <StarIcon color="white" />
                              <Text color="white">
                                {company.size} employees
                              </Text>
                            </HStack>

                            {company.founded && (
                              <HStack spacing={2} fontSize="sm">
                                <CalendarIcon color="white" />
                                <Text color="white">
                                  Founded {company.founded}
                                </Text>
                              </HStack>
                            )}
                          </VStack>
                        </VStack>
                      </CardBody>

                      <CardFooter pt={0}>
                        <Flex w="full" justify="space-between" align="center">
                          <HStack spacing={2}>
                            <IconButton
                              icon={<EditIcon />}
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(company)}
                              aria-label="Edit company"
                            />
                            <IconButton
                              icon={<DeleteIcon />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => handleDeleteClick(company)}
                              aria-label="Delete company"
                            />
                            {company.isVerified && (
                              <IconButton
                                icon={<LinkIcon />}
                                size="sm"
                                variant="ghost"
                                colorScheme="purple"
                                onClick={async () => {
                                  const result = await generatePublicLink(company._id);
                                  if (result.success) {
                                    try {
                                      await navigator.clipboard.writeText(result.data.publicUrl);
                                      toast({
                                        title: 'Public Link Copied',
                                        description: `Public link for "${company.name}" copied to clipboard.`,
                                        status: 'success',
                                        duration: 5000,
                                        isClosable: true,
                                      });
                                    } catch (err) {
                                      toast({
                                        title: 'Link Generated',
                                        description: `Public link: ${result.data.publicUrl}`,
                                        status: 'success',
                                        duration: 10000,
                                        isClosable: true,
                                      });
                                    }
                                  } else {
                                    toast({
                                      title: 'Error Generating Link',
                                      description: result.error || 'Failed to generate public link for this company.',
                                      status: 'error',
                                      duration: 5000,
                                      isClosable: true,
                                    });
                                  }
                                }}
                                aria-label="Share company"
                              />
                            )}
                          </HStack>

                          {!company.isVerified && company.contact.email && (
                            <Button
                              size="sm"
                              colorScheme="green"
                              variant="outline"
                              leftIcon={<EmailIcon />}
                              onClick={() => handleRequestVerification(company)}
                            >
                              Request Verification
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
                      {searchTerm || industryFilter || sizeFilter || verifiedFilter
                        ? 'Try adjusting your search criteria'
                        : 'Create your first company to get started'}
                    </Text>
                    {!searchTerm && !industryFilter && !sizeFilter && !verifiedFilter && (
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
                  <ModalCloseButton />
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
        </Flex>
      </Flex>
    </Box>
  );
};

export default CompanyList;
