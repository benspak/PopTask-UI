import React, { useState, useRef } from 'react';
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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
  Spinner,
  Text,
  Divider,
  Box,
  SimpleGrid,
  useColorModeValue,
  Image,
  IconButton,
  Center
} from '@chakra-ui/react';
import { AddIcon, CloseIcon } from '@chakra-ui/icons';
import { useCompanies } from '../hooks/useCompanies';
import apiService from '../services/api';
import { validateCompanyEmail } from '../utils/domainValidation';

const CompanyCreatePanel = ({ isOpen, onClose, onSuccess }) => {
  const { createCompany } = useCompanies();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    industry: '',
    size: '1-10',
    founded: '',
    location: {
      city: '',
      state: '',
      country: ''
    },
    contact: {
      email: '',
      phone: ''
    },
    social: {
      linkedin: '',
      twitter: '',
      facebook: ''
    },
    logo: {
      dataUrl: '',
      filename: '',
      originalName: '',
      mimetype: '',
      size: 0
    }
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef();

  const [errors, setErrors] = useState({});

  const bgColor = useColorModeValue('white', 'gray.800');

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

  const sizes = [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-500', label: '201-500 employees' },
    { value: '500+', label: '500+ employees' }
  ];

  const currentYear = new Date().getFullYear();

  const handleLogoUpload = async (file) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please select a JPEG, PNG, GIF, or WebP image file.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: 'Logo file must be less than 5MB.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setUploadingLogo(true);
    try {
      const result = await apiService.uploadLogo(file);

      if (result.success) {
        setFormData(prev => ({
          ...prev,
          logo: result.data
        }));
        setLogoPreview(result.data.dataUrl);
        setLogoFile(file);

        toast({
          title: 'Logo uploaded successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload logo',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleLogoUpload(file);
    }
  };

  const removeLogo = () => {
    setFormData(prev => ({
      ...prev,
      logo: {
        dataUrl: '',
        filename: '',
        originalName: '',
        mimetype: '',
        size: 0
      }
    }));
    setLogoPreview('');
    setLogoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    }

    if (formData.website && !formData.website.startsWith('http')) {
      newErrors.website = 'Website must start with http:// or https://';
    }

    // Validate email using domain validation
    if (formData.contact.email) {
      const emailValidation = validateCompanyEmail(formData.contact.email, formData.website);
      if (!emailValidation.isValid) {
        newErrors.contactEmail = emailValidation.message;
      }
    }

    if (formData.founded && (formData.founded < 1800 || formData.founded > currentYear)) {
      newErrors.founded = `Founded year must be between 1800 and ${currentYear}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await createCompany(formData);

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Company created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        // Reset form
        setFormData({
          name: '',
          description: '',
          website: '',
          industry: '',
          size: '1-10',
          founded: '',
          location: {
            city: '',
            state: '',
            country: ''
          },
          contact: {
            email: '',
            phone: ''
          },
          social: {
            linkedin: '',
            twitter: '',
            facebook: ''
          },
          logo: {
            dataUrl: '',
            filename: '',
            originalName: '',
            mimetype: '',
            size: 0
          }
        });
        setLogoPreview('');
        setLogoFile(null);
        setErrors({});

        onSuccess();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to create company',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create company',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <ModalHeader>Create New Company</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Basic Information */}
            <Box>
              <VStack spacing={4}>
                {/* Logo Upload */}
                <Box>
                  <VStack spacing={4} align="stretch">
                    {logoPreview ? (
                      <Box>
                        <HStack justify="space-between" mb={2}>
                          <Text fontSize="sm" color="gray.600">Logo Preview</Text>
                          <IconButton
                            icon={<CloseIcon />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={removeLogo}
                            aria-label="Remove logo"
                          />
                        </HStack>
                        <Center>
                          <Image
                            src={logoPreview}
                            alt="Company logo"
                            maxH="200px"
                            maxW="200px"
                            objectFit="contain"
                            borderRadius="md"
                            border="1px solid"
                            borderColor="gray.200"
                          />
                        </Center>
                      </Box>
                    ) : (
                      <FormControl>
                        <FormLabel>Upload Logo</FormLabel>
                        <Input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          onChange={handleFileSelect}
                          disabled={uploadingLogo}
                        />
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          Maximum file size: 5MB. Supported formats: JPEG, PNG, GIF, WebP
                        </Text>
                      </FormControl>
                    )}

                    {uploadingLogo && (
                      <HStack>
                        <Spinner size="sm" />
                        <Text fontSize="sm">Uploading logo...</Text>
                      </HStack>
                    )}
                  </VStack>
                </Box>

                <FormControl isRequired isInvalid={!!errors.name}>
                  <FormLabel>Company Name</FormLabel>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter company name"
                  />
                  <FormErrorMessage>{errors.name}</FormErrorMessage>
                </FormControl>

                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Brief description of the company"
                    rows={3}
                  />
                </FormControl>

                <FormControl isInvalid={!!errors.website}>
                  <FormLabel>Website</FormLabel>
                  <Input
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://example.com"
                  />
                  <FormErrorMessage>{errors.website}</FormErrorMessage>
                </FormControl>

                <SimpleGrid columns={2} spacing={4} w="full">
                  <FormControl>
                    <FormLabel>Industry</FormLabel>
                    <Select
                      value={formData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      placeholder="Select industry"
                    >
                      {industries.map(industry => (
                        <option key={industry} value={industry}>
                          {industry}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Company Size</FormLabel>
                    <Select
                      value={formData.size}
                      onChange={(e) => handleInputChange('size', e.target.value)}
                    >
                      {sizes.map(size => (
                        <option key={size.value} value={size.value}>
                          {size.label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </SimpleGrid>

                <FormControl isInvalid={!!errors.founded}>
                  <FormLabel>Founded Year</FormLabel>
                  <NumberInput
                    value={formData.founded}
                    onChange={(value) => handleInputChange('founded', value)}
                    min={1800}
                    max={currentYear}
                  >
                    <NumberInputField placeholder="e.g., 2020" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <FormErrorMessage>{errors.founded}</FormErrorMessage>
                </FormControl>
              </VStack>
            </Box>

            <Divider />

            {/* Location */}
            <Box>
              <Text fontSize="lg" fontWeight="semibold" mb={4}>
                Location
              </Text>

              <SimpleGrid columns={3} spacing={4}>
                <FormControl>
                  <FormLabel>City</FormLabel>
                  <Input
                    value={formData.location.city}
                    onChange={(e) => handleInputChange('location.city', e.target.value)}
                    placeholder="City"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>State/Province</FormLabel>
                  <Input
                    value={formData.location.state}
                    onChange={(e) => handleInputChange('location.state', e.target.value)}
                    placeholder="State"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Country</FormLabel>
                  <Input
                    value={formData.location.country}
                    onChange={(e) => handleInputChange('location.country', e.target.value)}
                    placeholder="Country"
                  />
                </FormControl>
              </SimpleGrid>
            </Box>

            <Divider />

            {/* Contact Information */}
            <Box>
              <Text fontSize="lg" fontWeight="semibold" mb={4}>
                Contact Information
              </Text>

              <VStack spacing={4}>
                <FormControl isInvalid={!!errors.contactEmail}>
                  <FormLabel>Contact Email</FormLabel>
                  <Input
                    value={formData.contact.email}
                    onChange={(e) => handleInputChange('contact.email', e.target.value)}
                    placeholder="contact@company.com"
                    type="email"
                  />
                  <FormErrorMessage>{errors.contactEmail}</FormErrorMessage>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Must be a company email address (not Gmail, Hotmail, etc.) and match your website domain
                  </Text>
                </FormControl>

                <FormControl>
                  <FormLabel>Phone Number</FormLabel>
                  <Input
                    value={formData.contact.phone}
                    onChange={(e) => handleInputChange('contact.phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </FormControl>
              </VStack>
            </Box>

            <Divider />

            {/* Social Media */}
            <Box>
              <Text fontSize="lg" fontWeight="semibold" mb={4}>
                Social Media (Optional)
              </Text>

              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>LinkedIn</FormLabel>
                  <Input
                    value={formData.social.linkedin}
                    onChange={(e) => handleInputChange('social.linkedin', e.target.value)}
                    placeholder="https://linkedin.com/company/..."
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Twitter</FormLabel>
                  <Input
                    value={formData.social.twitter}
                    onChange={(e) => handleInputChange('social.twitter', e.target.value)}
                    placeholder="https://twitter.com/..."
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Facebook</FormLabel>
                  <Input
                    value={formData.social.facebook}
                    onChange={(e) => handleInputChange('social.facebook', e.target.value)}
                    placeholder="https://facebook.com/..."
                  />
                </FormControl>
              </VStack>
            </Box>


          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={loading}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={loading}
            loadingText="Creating..."
            leftIcon={loading ? <Spinner size="sm" /> : null}
          >
            Create Company
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CompanyCreatePanel;
