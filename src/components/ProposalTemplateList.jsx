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
  useToast,
  useColorModeValue,
  Badge,
  Divider,
  Spinner,
  Alert,
  AlertIcon,
  AlertDescription,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Flex,
  Spacer,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  TagCloseButton,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import {
  AddIcon,
  SearchIcon,
  EditIcon,
  DeleteIcon,
  CopyIcon,
  ViewIcon,
  StarIcon,
  TimeIcon,
} from '@chakra-ui/icons';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import apiService from '../services/api';
import ProposalTemplateEditor from './ProposalTemplateEditor';
import ProposalTemplateViewer from './ProposalTemplateViewer';
import BottomNav from './BottomNav';
import FeedbackModal from './FeedbackModal';

const ProposalTemplateList = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showPublic, setShowPublic] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const toast = useToast();
  const { isOpen: isEditorOpen, onOpen: onEditorOpen, onClose: onEditorClose } = useDisclosure();
  const { isOpen: isViewerOpen, onOpen: onViewerOpen, onClose: onViewerClose } = useDisclosure();

  // TopBar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCenterOpen, setIsCenterOpen] = useState(false);

  // Feedback modal state
  const { isOpen: isFeedbackModalOpen, onOpen: openFeedbackModal, onClose: closeFeedbackModal } = useDisclosure({ defaultIsOpen: false });

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'web-development', label: 'Web Development' },
    { value: 'mobile-development', label: 'Mobile Development' },
    { value: 'design', label: 'Design' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    loadTemplates();
  }, [searchQuery, selectedCategory, showPublic, currentPage]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12
      });

      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);

      const endpoint = showPublic ? '/api/proposal-templates/public' : '/api/proposal-templates';
      const response = await apiService.get(`${endpoint}?${params}`);

      if (response.success) {
        setTemplates(response.data);
        setTotalPages(response.pagination.pages);
      }
    } catch (error) {
      setError('Failed to load templates');
      toast({
        title: 'Error',
        description: 'Failed to load templates',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    onEditorOpen();
  };

  const handleEditTemplate = (template) => {
    setSelectedTemplate(template);
    onEditorOpen();
  };

  const handleViewTemplate = (template) => {
    setSelectedTemplate(template);
    onViewerOpen();
  };

  const handleDeleteTemplate = async (templateId) => {
    try {
      const response = await apiService.delete(`/api/proposal-templates/${templateId}`);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Template deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        loadTemplates();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDuplicateTemplate = async (templateId) => {
    try {
      const response = await apiService.post(`/api/proposal-templates/${templateId}/duplicate`);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Template duplicated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        loadTemplates();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to duplicate template',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEditorSuccess = () => {
    onEditorClose();
    loadTemplates();
  };

  const getCategoryColor = (category) => {
    const colors = {
      'web-development': 'blue',
      'mobile-development': 'green',
      'design': 'purple',
      'consulting': 'orange',
      'marketing': 'pink',
      'maintenance': 'gray',
      'other': 'teal'
    };
    return colors[category] || 'gray';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && templates.length === 0) {
    return (
      <Box p={6}>
        <Flex justify="center" align="center" minH="200px">
          <Spinner size="xl" />
        </Flex>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color={textColor}>
              Proposal Templates
            </Text>
            <Text fontSize="sm" color={mutedTextColor}>
              Create and manage proposal templates for your projects
            </Text>
          </Box>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={handleCreateTemplate}
          >
            Create Template
          </Button>
        </Flex>

        {/* Filters */}
        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4}>
              <HStack spacing={4} w="full">
                <InputGroup>
                  <Input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <InputRightElement>
                    <SearchIcon color={mutedTextColor} />
                  </InputRightElement>
                </InputGroup>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  w="200px"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </Select>
                <Button
                  variant={showPublic ? 'solid' : 'outline'}
                  onClick={() => setShowPublic(!showPublic)}
                  size="sm"
                >
                  {showPublic ? 'My Templates' : 'Public Templates'}
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert status="error">
            <AlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Templates Grid */}
        {templates.length === 0 && !loading ? (
          <Card bg={bgColor} borderColor={borderColor}>
            <CardBody>
              <VStack spacing={4} py={8}>
                <Text fontSize="lg" color={mutedTextColor}>
                  No templates found
                </Text>
                <Text fontSize="sm" color={mutedTextColor} textAlign="center">
                  {showPublic
                    ? 'No public templates available at the moment.'
                    : 'Create your first proposal template to get started.'
                  }
                </Text>
                {!showPublic && (
                  <Button
                    leftIcon={<AddIcon />}
                    colorScheme="blue"
                    onClick={handleCreateTemplate}
                  >
                    Create Your First Template
                  </Button>
                )}
              </VStack>
            </CardBody>
          </Card>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {templates.map((template) => (
              <Card key={template._id} bg={bgColor} borderColor={borderColor}>
                <CardHeader pb={2}>
                  <Flex justify="space-between" align="start">
                    <Box flex={1}>
                      <Text fontSize="lg" fontWeight="bold" color={textColor} noOfLines={2}>
                        {template.title}
                      </Text>
                      <Badge colorScheme={getCategoryColor(template.category)} size="sm" mt={2}>
                        {categories.find(c => c.value === template.category)?.label || template.category}
                      </Badge>
                    </Box>
                    <HStack spacing={1}>
                      {template.isPublic && (
                        <Tooltip label="Public Template">
                          <StarIcon color="yellow.400" />
                        </Tooltip>
                      )}
                      <Menu>
                        <MenuButton as={IconButton} icon={<EditIcon />} size="sm" variant="ghost" />
                        <MenuList>
                          <MenuItem onClick={() => handleViewTemplate(template)}>
                            <ViewIcon mr={2} />
                            View
                          </MenuItem>
                          {!showPublic && (
                            <>
                              <MenuItem onClick={() => handleEditTemplate(template)}>
                                <EditIcon mr={2} />
                                Edit
                              </MenuItem>
                              <MenuItem onClick={() => handleDuplicateTemplate(template._id)}>
                                <CopyIcon mr={2} />
                                Duplicate
                              </MenuItem>
                              <MenuItem onClick={() => handleDeleteTemplate(template._id)} color="red.500">
                                <DeleteIcon mr={2} />
                                Delete
                              </MenuItem>
                            </>
                          )}
                        </MenuList>
                      </Menu>
                    </HStack>
                  </Flex>
                </CardHeader>

                <CardBody pt={0}>
                  <VStack spacing={3} align="stretch">
                    <Text fontSize="sm" color={mutedTextColor} noOfLines={3}>
                      {template.description || 'No description provided'}
                    </Text>

                    {template.tags && template.tags.length > 0 && (
                      <Wrap>
                        {template.tags.slice(0, 3).map((tag, index) => (
                          <WrapItem key={index}>
                            <Tag size="sm" colorScheme="blue">
                              <TagLabel>{tag}</TagLabel>
                            </Tag>
                          </WrapItem>
                        ))}
                        {template.tags.length > 3 && (
                          <WrapItem>
                            <Tag size="sm" colorScheme="gray">
                              <TagLabel>+{template.tags.length - 3}</TagLabel>
                            </Tag>
                          </WrapItem>
                        )}
                      </Wrap>
                    )}

                    <HStack spacing={4} fontSize="sm" color={mutedTextColor}>
                      {template.estimatedValue > 0 && (
                        <HStack spacing={1}>
                          <Text fontWeight="bold" color="green.500">$</Text>
                          <Text>${template.estimatedValue.toLocaleString()}</Text>
                        </HStack>
                      )}
                      {template.estimatedHours > 0 && (
                        <HStack spacing={1}>
                          <TimeIcon />
                          <Text>{template.estimatedHours}h</Text>
                        </HStack>
                      )}
                      {template.usageCount > 0 && (
                        <Text>Used {template.usageCount} times</Text>
                      )}
                    </HStack>
                  </VStack>
                </CardBody>

                <CardFooter pt={0}>
                  <Text fontSize="xs" color={mutedTextColor}>
                    Updated {formatDate(template.updatedAt)}
                  </Text>
                </CardFooter>
              </Card>
            ))}
          </SimpleGrid>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Flex justify="center" mt={6}>
            <HStack spacing={2}>
              <Button
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Text fontSize="sm" color={mutedTextColor}>
                Page {currentPage} of {totalPages}
              </Text>
              <Button
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </HStack>
          </Flex>
        )}
      </VStack>

      {/* Template Editor Modal */}
      <ProposalTemplateEditor
        isOpen={isEditorOpen}
        onClose={onEditorClose}
        template={selectedTemplate}
        onSuccess={handleEditorSuccess}
      />

      {/* Template Viewer Modal */}
      <ProposalTemplateViewer
        isOpen={isViewerOpen}
        onClose={onViewerClose}
        template={selectedTemplate}
      />

      <BottomNav
        isSidebarOpen={isSidebarOpen}
        isCenterOpen={isCenterOpen}
        isAddMode={false}
        isFooterOpen={isFeedbackModalOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        toggleCenter={() => setIsCenterOpen(!isCenterOpen)}
        handleAddTask={() => {}}
        handleAddProject={() => {}}
        handleAddClient={() => {}}
        toggleDetail={() => {}}
        toggleFooter={openFeedbackModal}
        handleMobileTaskEdit={() => {}}
        isMobileTaskEditOpen={false}
      />

      <FeedbackModal isOpen={isFeedbackModalOpen} onClose={closeFeedbackModal} />
    </Box>
  );
};

export default ProposalTemplateList;
