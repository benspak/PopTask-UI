import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  useToast,
  useColorModeValue,
  Box,
  Text,
  Divider,
  Badge,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  Alert,
  AlertIcon,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  Spacer,
  Tooltip,
  Textarea,
  IconButton,
  useDisclosure,
  Collapse,
  Card,
  CardBody,
  CardHeader,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
} from '@chakra-ui/react';
import {
  CopyIcon,
  DownloadIcon,
  EditIcon,
  InfoIcon,
  CheckIcon,
  CloseIcon,
} from '@chakra-ui/icons';
import apiService from '../services/api';

const ProposalTemplateViewer = ({ isOpen, onClose, template }) => {
  const [variables, setVariables] = useState({});
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');

  const toast = useToast();
  const { isOpen: isVariablesOpen, onToggle: onVariablesToggle } = useDisclosure();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');

  const categories = [
    { value: 'web-development', label: 'Web Development' },
    { value: 'mobile-development', label: 'Mobile Development' },
    { value: 'design', label: 'Design' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    if (template) {
      // Initialize variables with default values
      const initialVariables = {};
      template.variables?.forEach(variable => {
        initialVariables[variable.name] = variable.defaultValue || '';
      });
      setVariables(initialVariables);
      setGeneratedContent('');
    }
  }, [template]);

  const handleVariableChange = (name, value) => {
    setVariables(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateProposal = async () => {
    if (!template) return;

    try {
      setLoading(true);

      const response = await apiService.generateProposalFromTemplate(template._id, {
        variables
      });

      if (response.success) {
        setGeneratedContent(response.data.content);
        setActiveTab('generated');
        toast({
          title: 'Success',
          description: 'Proposal generated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate proposal',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied',
        description: 'Content copied to clipboard',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const downloadProposal = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${template.title}-proposal.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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

  if (!template) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <ModalHeader color={textColor}>
          <VStack align="stretch" spacing={2}>
            <Text fontSize="xl" fontWeight="bold">
              {template.title}
            </Text>
            <HStack spacing={2}>
              <Badge colorScheme={getCategoryColor(template.category)}>
                {categories.find(c => c.value === template.category)?.label || template.category}
              </Badge>
              {template.isPublic && (
                <Badge colorScheme="yellow">Public</Badge>
              )}
            </HStack>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <Tabs value={activeTab} onChange={setActiveTab}>
            <TabList>
              <Tab>Template Info</Tab>
              <Tab>Variables</Tab>
              <Tab>Preview</Tab>
              <Tab>Generated</Tab>
            </TabList>

            <TabPanels>
              {/* Template Info Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <Card bg={bgColor} borderColor={borderColor}>
                    <CardHeader>
                      <Text fontSize="lg" fontWeight="bold">
                        Template Details
                      </Text>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <Box>
                          <Text fontWeight="bold" mb={2}>Description</Text>
                          <Text color={mutedTextColor}>
                            {template.description || 'No description provided'}
                          </Text>
                        </Box>

                        {template.tags && template.tags.length > 0 && (
                          <Box>
                            <Text fontWeight="bold" mb={2}>Tags</Text>
                            <Wrap>
                              {template.tags.map((tag, index) => (
                                <WrapItem key={index}>
                                  <Tag size="md" colorScheme="blue">
                                    <TagLabel>{tag}</TagLabel>
                                  </Tag>
                                </WrapItem>
                              ))}
                            </Wrap>
                          </Box>
                        )}

                        <SimpleGrid columns={2} spacing={4}>
                          {template.estimatedValue > 0 && (
                            <Stat>
                              <StatLabel>Estimated Value</StatLabel>
                              <StatNumber>${template.estimatedValue.toLocaleString()}</StatNumber>
                              <StatHelpText>Project estimate</StatHelpText>
                            </Stat>
                          )}
                          {template.estimatedHours > 0 && (
                            <Stat>
                              <StatLabel>Estimated Hours</StatLabel>
                              <StatNumber>{template.estimatedHours}h</StatNumber>
                              <StatHelpText>Time estimate</StatHelpText>
                            </Stat>
                          )}
                        </SimpleGrid>

                        <Box>
                          <Text fontSize="sm" color={mutedTextColor}>
                            Created: {formatDate(template.createdAt)}
                          </Text>
                          <Text fontSize="sm" color={mutedTextColor}>
                            Updated: {formatDate(template.updatedAt)}
                          </Text>
                          {template.usageCount > 0 && (
                            <Text fontSize="sm" color={mutedTextColor}>
                              Used {template.usageCount} times
                            </Text>
                          )}
                        </Box>
                      </VStack>
                    </CardBody>
                  </Card>
                </VStack>
              </TabPanel>

              {/* Variables Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  {template.variables && template.variables.length > 0 ? (
                    <VStack spacing={4} align="stretch">
                      <Alert status="info">
                        <AlertIcon />
                        <AlertDescription>
                          Fill in the variables below to customize your proposal. Required variables are marked with an asterisk (*).
                        </AlertDescription>
                      </Alert>

                      {template.variables.map((variable, index) => (
                        <FormControl key={index} isRequired={variable.required}>
                          <FormLabel>
                            {variable.name}
                            {variable.required && <Text as="span" color="red.500"> *</Text>}
                          </FormLabel>
                          <Input
                            value={variables[variable.name] || ''}
                            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                            placeholder={variable.description || `Enter ${variable.name}`}
                          />
                          {variable.description && (
                            <Text fontSize="xs" color={mutedTextColor} mt={1}>
                              {variable.description}
                            </Text>
                          )}
                        </FormControl>
                      ))}

                      <Button
                        colorScheme="blue"
                        onClick={generateProposal}
                        isLoading={loading}
                        loadingText="Generating..."
                        size="lg"
                      >
                        Generate Proposal
                      </Button>
                    </VStack>
                  ) : (
                    <Alert status="info">
                      <AlertIcon />
                      <AlertDescription>
                        This template has no variables. You can generate the proposal directly.
                      </AlertDescription>
                    </Alert>
                  )}
                </VStack>
              </TabPanel>

              {/* Preview Tab */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text fontSize="lg" fontWeight="bold" mb={4}>
                      Template Content
                    </Text>
                    <Box
                      p={4}
                      borderWidth={1}
                      borderRadius="md"
                      borderColor={borderColor}
                      bg={useColorModeValue('gray.50', 'gray.700')}
                      minH="400px"
                      maxH="600px"
                      overflowY="auto"
                      whiteSpace="pre-wrap"
                      fontFamily="mono"
                      fontSize="sm"
                    >
                      {template.content}
                    </Box>
                  </Box>

                  {template.variables && template.variables.length > 0 && (
                    <Alert status="info">
                      <AlertIcon />
                      <AlertDescription>
                        This template contains {template.variables.length} variable(s).
                        Go to the Variables tab to fill them in and generate a customized proposal.
                      </AlertDescription>
                    </Alert>
                  )}
                </VStack>
              </TabPanel>

              {/* Generated Tab */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  {generatedContent ? (
                    <>
                      <Flex justify="space-between" align="center">
                        <Text fontSize="lg" fontWeight="bold">
                          Generated Proposal
                        </Text>
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            leftIcon={<CopyIcon />}
                            onClick={() => copyToClipboard(generatedContent)}
                            variant="outline"
                          >
                            Copy
                          </Button>
                          <Button
                            size="sm"
                            leftIcon={<DownloadIcon />}
                            onClick={downloadProposal}
                            variant="outline"
                          >
                            Download
                          </Button>
                        </HStack>
                      </Flex>

                      <Box
                        p={4}
                        borderWidth={1}
                        borderRadius="md"
                        borderColor={borderColor}
                        bg={useColorModeValue('gray.50', 'gray.700')}
                        minH="400px"
                        maxH="600px"
                        overflowY="auto"
                        whiteSpace="pre-wrap"
                        fontFamily="mono"
                        fontSize="sm"
                      >
                        {generatedContent}
                      </Box>
                    </>
                  ) : (
                    <Alert status="info">
                      <AlertIcon />
                      <AlertDescription>
                        No proposal generated yet. Fill in the variables and click "Generate Proposal" to create a customized proposal.
                      </AlertDescription>
                    </Alert>
                  )}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {template.variables && template.variables.length > 0 && (
              <Button
                colorScheme="blue"
                onClick={generateProposal}
                isLoading={loading}
                loadingText="Generating..."
              >
                Generate Proposal
              </Button>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProposalTemplateViewer;
