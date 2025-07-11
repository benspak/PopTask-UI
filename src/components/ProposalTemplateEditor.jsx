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
  FormErrorMessage,
  Input,
  Textarea,
  Select,
  useToast,
  useColorModeValue,
  Box,
  Text,
  Divider,
  IconButton,
  Badge,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  TagCloseButton,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Checkbox,
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
  useDisclosure,
  Collapse,
} from '@chakra-ui/react';
import {
  AddIcon,
  CloseIcon,
  EditIcon,
  InfoIcon,
  QuestionIcon,
} from '@chakra-ui/icons';
import apiService from '../services/api';

// Simple rich text editor component (we'll use a textarea for now, can be enhanced with react-quill later)
const RichTextEditor = ({ value, onChange, placeholder }) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.300', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');

  return (
    <Box>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        minH="300px"
        bg={bgColor}
        borderColor={borderColor}
        color={textColor}
        _focus={{
          borderColor: 'blue.500',
          boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
        }}
      />
      <Text fontSize="xs" color="gray.500" mt={1}>
        Use {{variableName}} syntax to add variables. Example: {{clientName}}, {{projectName}}
      </Text>
    </Box>
  );
};

const ProposalTemplateEditor = ({ isOpen, onClose, template, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    content: '',
    variables: [],
    isPublic: false,
    tags: [],
    estimatedValue: 0,
    estimatedHours: 0
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newVariable, setNewVariable] = useState({
    name: '',
    description: '',
    defaultValue: '',
    required: false
  });

  const toast = useToast();
  const { isOpen: isVariableOpen, onToggle: onVariableToggle } = useDisclosure();

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
      setFormData({
        title: template.title || '',
        description: template.description || '',
        category: template.category || 'other',
        content: template.content || '',
        variables: template.variables || [],
        isPublic: template.isPublic || false,
        tags: template.tags || [],
        estimatedValue: template.estimatedValue || 0,
        estimatedHours: template.estimatedHours || 0
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'other',
        content: '',
        variables: [],
        isPublic: false,
        tags: [],
        estimatedValue: 0,
        estimatedHours: 0
      });
    }
    setErrors({});
  }, [template]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (formData.variables.some(v => !v.name.trim())) {
      newErrors.variables = 'All variables must have a name';
    }

    const duplicateVariables = formData.variables.filter((v, index, arr) =>
      arr.findIndex(v2 => v2.name === v.name) !== index
    );

    if (duplicateVariables.length > 0) {
      newErrors.variables = 'Variable names must be unique';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        content: formData.content.trim(),
        variables: formData.variables.filter(v => v.name.trim())
      };

      if (template) {
        await apiService.put(`/api/proposal-templates/${template._id}`, payload);
        toast({
          title: 'Success',
          description: 'Template updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await apiService.post('/api/proposal-templates', payload);
        toast({
          title: 'Success',
          description: 'Template created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Failed to save template:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save template',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleAddTag = () => {
    const tag = newTag.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddVariable = () => {
    if (newVariable.name.trim()) {
      setFormData(prev => ({
        ...prev,
        variables: [...prev.variables, { ...newVariable }]
      }));
      setNewVariable({
        name: '',
        description: '',
        defaultValue: '',
        required: false
      });
      onVariableToggle();
    }
  };

  const handleRemoveVariable = (index) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index)
    }));
  };

  const handleVariableChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.map((v, i) =>
        i === index ? { ...v, [field]: value } : v
      )
    }));
  };

  const extractVariablesFromContent = () => {
    const variableRegex = /\{\{(\w+)\}\}/g;
    const matches = [...formData.content.matchAll(variableRegex)];
    const variables = [...new Set(matches.map(match => match[1]))];

    return variables.map(name => ({
      name,
      description: '',
      defaultValue: '',
      required: false
    }));
  };

  const handleExtractVariables = () => {
    const extractedVariables = extractVariablesFromContent();
    setFormData(prev => ({
      ...prev,
      variables: [...prev.variables, ...extractedVariables.filter(v =>
        !prev.variables.some(existing => existing.name === v.name)
      )]
    }));

    toast({
      title: 'Variables Extracted',
      description: `Found ${extractedVariables.length} variables in content`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <ModalHeader color={textColor}>
          {template ? 'Edit Template' : 'Create New Template'}
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <Tabs>
            <TabList>
              <Tab>Basic Info</Tab>
              <Tab>Content</Tab>
              <Tab>Variables</Tab>
              <Tab>Settings</Tab>
            </TabList>

            <TabPanels>
              {/* Basic Info Tab */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired isInvalid={!!errors.title}>
                    <FormLabel>Template Title</FormLabel>
                    <Input
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter template title"
                    />
                    <FormErrorMessage>{errors.title}</FormErrorMessage>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Brief description of this template"
                      rows={3}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                    >
                      {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Tags</FormLabel>
                    <VStack spacing={2} align="stretch">
                      <HStack>
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Add a tag"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                        />
                        <Button size="sm" onClick={handleAddTag}>
                          <AddIcon />
                        </Button>
                      </HStack>
                      {formData.tags.length > 0 && (
                        <Wrap>
                          {formData.tags.map((tag, index) => (
                            <WrapItem key={index}>
                              <Tag size="md" colorScheme="blue">
                                <TagLabel>{tag}</TagLabel>
                                <TagCloseButton onClick={() => handleRemoveTag(tag)} />
                              </Tag>
                            </WrapItem>
                          ))}
                        </Wrap>
                      )}
                    </VStack>
                  </FormControl>
                </VStack>
              </TabPanel>

              {/* Content Tab */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <Flex justify="space-between" align="center">
                    <Text fontSize="lg" fontWeight="bold">
                      Template Content
                    </Text>
                    <Button
                      size="sm"
                      leftIcon={<InfoIcon />}
                      onClick={handleExtractVariables}
                      variant="outline"
                    >
                      Extract Variables
                    </Button>
                  </Flex>

                  <Alert status="info">
                    <AlertIcon />
                    <AlertDescription>
                      Use {'{{variableName}}'} syntax to add variables that can be replaced when generating proposals.
                    </AlertDescription>
                  </Alert>

                  <FormControl isRequired isInvalid={!!errors.content}>
                    <FormLabel>Content</FormLabel>
                    <RichTextEditor
                      value={formData.content}
                      onChange={(value) => handleInputChange('content', value)}
                      placeholder="Enter your proposal template content here..."
                    />
                    <FormErrorMessage>{errors.content}</FormErrorMessage>
                  </FormControl>
                </VStack>
              </TabPanel>

              {/* Variables Tab */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <Flex justify="space-between" align="center">
                    <Text fontSize="lg" fontWeight="bold">
                      Template Variables
                    </Text>
                    <Button
                      size="sm"
                      leftIcon={<AddIcon />}
                      onClick={onVariableToggle}
                    >
                      Add Variable
                    </Button>
                  </Flex>

                  {formData.variables.length === 0 ? (
                    <Alert status="info">
                      <AlertIcon />
                      <AlertDescription>
                        No variables defined. Add variables to make your template dynamic.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <VStack spacing={3} align="stretch">
                      {formData.variables.map((variable, index) => (
                        <Box key={index} p={4} borderWidth={1} borderRadius="md" borderColor={borderColor}>
                          <Flex justify="space-between" align="start" mb={3}>
                            <VStack spacing={2} align="stretch" flex={1}>
                              <HStack>
                                <Input
                                  value={variable.name}
                                  onChange={(e) => handleVariableChange(index, 'name', e.target.value)}
                                  placeholder="Variable name"
                                  size="sm"
                                />
                                <Checkbox
                                  isChecked={variable.required}
                                  onChange={(e) => handleVariableChange(index, 'required', e.target.checked)}
                                  size="sm"
                                >
                                  Required
                                </Checkbox>
                              </HStack>
                              <Input
                                value={variable.description}
                                onChange={(e) => handleVariableChange(index, 'description', e.target.value)}
                                placeholder="Description (optional)"
                                size="sm"
                              />
                              <Input
                                value={variable.defaultValue}
                                onChange={(e) => handleVariableChange(index, 'defaultValue', e.target.value)}
                                placeholder="Default value (optional)"
                                size="sm"
                              />
                            </VStack>
                            <IconButton
                              icon={<CloseIcon />}
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveVariable(index)}
                              colorScheme="red"
                            />
                          </Flex>
                        </Box>
                      ))}
                    </VStack>
                  )}

                  {errors.variables && (
                    <Alert status="error">
                      <AlertIcon />
                      <AlertDescription>{errors.variables}</AlertDescription>
                    </Alert>
                  )}

                  {/* Add Variable Form */}
                  <Collapse in={isVariableOpen}>
                    <Box p={4} borderWidth={1} borderRadius="md" borderColor={borderColor}>
                      <VStack spacing={3} align="stretch">
                        <Text fontWeight="bold">Add New Variable</Text>
                        <Input
                          value={newVariable.name}
                          onChange={(e) => setNewVariable(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Variable name"
                        />
                        <Input
                          value={newVariable.description}
                          onChange={(e) => setNewVariable(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Description (optional)"
                        />
                        <Input
                          value={newVariable.defaultValue}
                          onChange={(e) => setNewVariable(prev => ({ ...prev, defaultValue: e.target.value }))}
                          placeholder="Default value (optional)"
                        />
                        <Checkbox
                          isChecked={newVariable.required}
                          onChange={(e) => setNewVariable(prev => ({ ...prev, required: e.target.checked }))}
                        >
                          Required variable
                        </Checkbox>
                        <HStack>
                          <Button size="sm" onClick={handleAddVariable}>
                            Add Variable
                          </Button>
                          <Button size="sm" variant="outline" onClick={onVariableToggle}>
                            Cancel
                          </Button>
                        </HStack>
                      </VStack>
                    </Box>
                  </Collapse>
                </VStack>
              </TabPanel>

              {/* Settings Tab */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>Estimated Value ($)</FormLabel>
                    <NumberInput
                      value={formData.estimatedValue}
                      onChange={(value) => handleInputChange('estimatedValue', Number(value))}
                      min={0}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Estimated Hours</FormLabel>
                    <NumberInput
                      value={formData.estimatedHours}
                      onChange={(value) => handleInputChange('estimatedHours', Number(value))}
                      min={0}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel>
                      <HStack>
                        <Text>Make Template Public</Text>
                        <Tooltip label="Public templates can be used by other users">
                          <QuestionIcon />
                        </Tooltip>
                      </HStack>
                    </FormLabel>
                    <Checkbox
                      isChecked={formData.isPublic}
                      onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                    >
                      Allow other users to use this template
                    </Checkbox>
                  </FormControl>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={loading}
              loadingText="Saving..."
            >
              {template ? 'Update Template' : 'Create Template'}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProposalTemplateEditor;
