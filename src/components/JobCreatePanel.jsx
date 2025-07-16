import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Select,
  Textarea,
  Card,
  CardBody,
  CardHeader,
  Heading,
  FormControl,
  FormLabel,
  FormErrorMessage,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Switch,
  Tag,
  TagLabel,
  TagCloseButton,
  InputGroup,
  InputLeftElement,
  useToast,
  Alert,
  AlertIcon,
  Spinner,
  Divider,
  SimpleGrid,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@chakra-ui/react';
import { AddIcon, CloseIcon } from '@chakra-ui/icons';
import { useJobs } from '../hooks/useJobs';
import { useCompanies } from '../hooks/useCompanies';
import { useAuth } from '../contexts/AuthContext';

const JobCreatePanel = ({ isOpen, onClose, onSuccess }) => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { createJob, loading, error } = useJobs();
  const { companies, fetchCompanies, loading: companiesLoading } = useCompanies();
  const toast = useToast();

  // Handle authentication loading state
  if (authLoading) {
    return null; // Don't render anything while auth is loading
  }

  // Handle unauthenticated state
  if (!isAuthenticated) {
    return null; // Don't render anything if not authenticated
  }



  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    companyId: '',
    location: {
      type: 'onsite',
      city: '',
      state: '',
      country: ''
    },
    salary: {
      min: '',
      max: '',
      currency: 'USD',
      period: 'yearly',
      isNegotiable: false
    },
    type: 'full-time',
    level: 'mid',
    category: 'other',
    skills: [],
    benefits: [],
    tags: [],
    applicationSettings: {
      allowEmailApplications: true,
      applicationEmail: '',
      requireCoverLetter: false,
      requirePortfolio: false,
      maxApplications: 100
    },
    expiresAt: ''
  });

  const [newSkill, setNewSkill] = useState('');
  const [newBenefit, setNewBenefit] = useState('');
  const [newTag, setNewTag] = useState('');

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Fetch companies when component mounts - only user's own companies for job posting
  useEffect(() => {
    fetchCompanies({ includeVerified: false });
  }, [fetchCompanies]);



  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        requirements: '',
        responsibilities: '',
        companyId: '',
        location: {
          type: 'onsite',
          city: '',
          state: '',
          country: ''
        },
        salary: {
          min: '',
          max: '',
          currency: 'USD',
          period: 'yearly',
          isNegotiable: false
        },
        type: 'full-time',
        level: 'mid',
        category: 'other',
        skills: [],
        benefits: [],
        tags: [],
        applicationSettings: {
          allowEmailApplications: true,
          applicationEmail: '',
          requireCoverLetter: false,
          requirePortfolio: false,
          maxApplications: 100
        },
        expiresAt: ''
      });
    }
  }, [isOpen]);

  // Set first company as default if no company is selected and companies are available
  useEffect(() => {
    if (companies.length > 0 && !formData.companyId && !companiesLoading) {
      setFormData(prev => ({ ...prev, companyId: companies[0]._id }));
    }
  }, [companies, formData.companyId, companiesLoading]);

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
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleAddBenefit = () => {
    if (newBenefit.trim() && !formData.benefits.includes(newBenefit.trim())) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()]
      }));
      setNewBenefit('');
    }
  };

  const handleRemoveBenefit = (benefit) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter(b => b !== benefit)
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = async () => {
    try {
      // Create a clean copy of the data for API submission
      const jobData = {
        title: formData.title,
        description: formData.description,
        companyId: formData.companyId,
        type: formData.type,
        level: formData.level,
        category: formData.category,
        skills: formData.skills,
        benefits: formData.benefits,
        tags: formData.tags,
        location: {
          type: formData.location.type
        },
        salary: {
          currency: formData.salary.currency,
          period: formData.salary.period,
          isNegotiable: formData.salary.isNegotiable
        },
        applicationSettings: {
          allowEmailApplications: formData.applicationSettings.allowEmailApplications,
          requireCoverLetter: formData.applicationSettings.requireCoverLetter,
          requirePortfolio: formData.applicationSettings.requirePortfolio,
          maxApplications: formData.applicationSettings.maxApplications
        }
      };

      // Only add optional fields if they have values
      if (formData.requirements && formData.requirements.trim()) {
        jobData.requirements = formData.requirements.trim();
      }
      if (formData.responsibilities && formData.responsibilities.trim()) {
        jobData.responsibilities = formData.responsibilities.trim();
      }
      if (formData.location.city && formData.location.city.trim()) {
        jobData.location.city = formData.location.city.trim();
      }
      if (formData.location.state && formData.location.state.trim()) {
        jobData.location.state = formData.location.state.trim();
      }
      if (formData.location.country && formData.location.country.trim()) {
        jobData.location.country = formData.location.country.trim();
      }
      if (formData.salary.min && formData.salary.min.trim()) {
        jobData.salary.min = parseFloat(formData.salary.min);
      }
      if (formData.salary.max && formData.salary.max.trim()) {
        jobData.salary.max = parseFloat(formData.salary.max);
      }
      if (formData.applicationSettings.applicationEmail && formData.applicationSettings.applicationEmail.trim()) {
        jobData.applicationSettings.applicationEmail = formData.applicationSettings.applicationEmail.trim();
      }
      if (formData.expiresAt) {
        jobData.expiresAt = new Date(formData.expiresAt).toISOString();
      }



      const createdJob = await createJob(jobData);

      if (createdJob) {
        toast({
          title: 'Job created successfully',
          description: 'Your job posting has been created and saved as a draft.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        onSuccess?.(createdJob);
        onClose();

        // Reset form
        setFormData({
          title: '',
          description: '',
          requirements: '',
          responsibilities: '',
          companyId: companies[0]?._id || '',
          location: {
            type: 'onsite',
            city: '',
            state: '',
            country: ''
          },
          salary: {
            min: '',
            max: '',
            currency: 'USD',
            period: 'yearly',
            isNegotiable: false
          },
          type: 'full-time',
          level: 'mid',
          category: 'other',
          skills: [],
          benefits: [],
          tags: [],
          applicationSettings: {
            allowEmailApplications: true,
            applicationEmail: '',
            requireCoverLetter: false,
            requirePortfolio: false,
            maxApplications: 100
          },
          expiresAt: ''
        });
      }
    } catch (err) {
      console.error('Job creation error:', err);
      console.error('Error response:', err.response?.data);

      let errorMessage = 'Failed to create job posting.';

      if (err.response?.data?.details) {
        // Handle validation errors
        const validationErrors = err.response.data.details;
        errorMessage = `Validation errors: ${validationErrors.map(e => e.msg).join(', ')}`;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast({
        title: 'Error creating job',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const isFormValid = () => {
    return (
      formData.title.trim() &&
      formData.description.trim() &&
      formData.companyId
    );
  };

  if (user?.userType !== 'pro' && user?.userType !== 'admin') {
    return (
      <Alert status="warning">
        <AlertIcon />
        <Text>Pro membership required to post jobs. Current user type: {user?.userType || 'unknown'}</Text>
      </Alert>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Post New Job</ModalHeader>
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {error && (
              <Alert status="error">
                <AlertIcon />
                {error}
              </Alert>
            )}

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <Heading size="md">Basic Information</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Job Title</FormLabel>
                    <Input
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g., Senior Software Engineer"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Company</FormLabel>
                    <Select
                      value={formData.companyId}
                      onChange={(e) => handleInputChange('companyId', e.target.value)}
                      isDisabled={companiesLoading}
                      placeholder="Select a company"
                    >
                      {companiesLoading ? (
                        <option value="">Loading companies...</option>
                      ) : companies.length === 0 ? (
                        <option value="">No companies available</option>
                      ) : (
                        companies.map(company => (
                          <option key={company._id} value={company._id}>
                            {company.name}
                          </option>
                        ))
                      )}
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Job Description</FormLabel>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                      rows={4}
                    />
                  </FormControl>

                  <SimpleGrid columns={[1, 2]} spacing={4} w="full">
                    <FormControl>
                      <FormLabel>Requirements</FormLabel>
                      <Textarea
                        value={formData.requirements}
                        onChange={(e) => handleInputChange('requirements', e.target.value)}
                        placeholder="List the key requirements for this position..."
                        rows={3}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Responsibilities</FormLabel>
                      <Textarea
                        value={formData.responsibilities}
                        onChange={(e) => handleInputChange('responsibilities', e.target.value)}
                        placeholder="Outline the main responsibilities..."
                        rows={3}
                      />
                    </FormControl>
                  </SimpleGrid>
                </VStack>
              </CardBody>
            </Card>

            {/* Job Details */}
            <Card>
              <CardHeader>
                <Heading size="md">Job Details</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4}>
                  <SimpleGrid columns={[1, 2, 3]} spacing={4} w="full">
                    <FormControl>
                      <FormLabel>Job Type</FormLabel>
                      <Select
                        value={formData.type}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                      >
                        <option value="full-time">Full Time</option>
                        <option value="part-time">Part Time</option>
                        <option value="contract">Contract</option>
                        <option value="internship">Internship</option>
                        <option value="freelance">Freelance</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Experience Level</FormLabel>
                      <Select
                        value={formData.level}
                        onChange={(e) => handleInputChange('level', e.target.value)}
                      >
                        <option value="entry">Entry</option>
                        <option value="junior">Junior</option>
                        <option value="mid">Mid</option>
                        <option value="senior">Senior</option>
                        <option value="lead">Lead</option>
                        <option value="executive">Executive</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Category</FormLabel>
                      <Select
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                      >
                        <option value="engineering">Engineering</option>
                        <option value="design">Design</option>
                        <option value="marketing">Marketing</option>
                        <option value="sales">Sales</option>
                        <option value="product">Product</option>
                        <option value="operations">Operations</option>
                        <option value="finance">Finance</option>
                        <option value="hr">HR</option>
                        <option value="legal">Legal</option>
                        <option value="customer-support">Customer Support</option>
                        <option value="data-science">Data Science</option>
                        <option value="devops">DevOps</option>
                        <option value="qa">QA</option>
                        <option value="content">Content</option>
                        <option value="other">Other</option>
                      </Select>
                    </FormControl>
                  </SimpleGrid>

                  <Divider />

                  <SimpleGrid columns={[1, 2]} spacing={4} w="full">
                    <FormControl>
                      <FormLabel>Location Type</FormLabel>
                      <Select
                        value={formData.location.type}
                        onChange={(e) => handleInputChange('location.type', e.target.value)}
                      >
                        <option value="remote">Remote</option>
                        <option value="onsite">On-site</option>
                        <option value="hybrid">Hybrid</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>City</FormLabel>
                      <Input
                        value={formData.location.city}
                        onChange={(e) => handleInputChange('location.city', e.target.value)}
                        placeholder="City"
                      />
                    </FormControl>
                  </SimpleGrid>

                  <SimpleGrid columns={[1, 2]} spacing={4} w="full">
                    <FormControl>
                      <FormLabel>State/Province</FormLabel>
                      <Input
                        value={formData.location.state}
                        onChange={(e) => handleInputChange('location.state', e.target.value)}
                        placeholder="State or Province"
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
                </VStack>
              </CardBody>
            </Card>

            {/* Compensation */}
            <Card>
              <CardHeader>
                <Heading size="md">Compensation & Benefits</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4}>
                  <SimpleGrid columns={[1, 2, 2]} spacing={4} w="full">
                    <FormControl>
                      <FormLabel>Minimum Salary</FormLabel>
                      <NumberInput
                        value={formData.salary.min}
                        onChange={(value) => handleInputChange('salary.min', value)}
                        min={0}
                      >
                        <NumberInputField placeholder="0" />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Maximum Salary</FormLabel>
                      <NumberInput
                        value={formData.salary.max}
                        onChange={(value) => handleInputChange('salary.max', value)}
                        min={0}
                      >
                        <NumberInputField placeholder="0" />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Currency</FormLabel>
                      <Select
                        value={formData.salary.currency}
                        onChange={(e) => handleInputChange('salary.currency', e.target.value)}
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="CAD">CAD</option>
                        <option value="AUD">AUD</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Period</FormLabel>
                      <Select
                        value={formData.salary.period}
                        onChange={(e) => handleInputChange('salary.period', e.target.value)}
                      >
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </Select>
                    </FormControl>
                  </SimpleGrid>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Salary is negotiable</FormLabel>
                    <Switch
                      isChecked={formData.salary.isNegotiable}
                      onChange={(e) => handleInputChange('salary.isNegotiable', e.target.checked)}
                    />
                  </FormControl>

                  <Divider />

                  <FormControl>
                    <FormLabel>Benefits</FormLabel>
                    <HStack>
                      <Input
                        value={newBenefit}
                        onChange={(e) => setNewBenefit(e.target.value)}
                        placeholder="Add a benefit (e.g., Health Insurance)"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddBenefit()}
                      />
                      <Button onClick={handleAddBenefit} leftIcon={<AddIcon />}>
                        Add
                      </Button>
                    </HStack>
                    <HStack spacing={2} mt={2} flexWrap="wrap">
                      {formData.benefits.map((benefit, index) => (
                        <Tag key={index} size="md" colorScheme="green">
                          <TagLabel>{benefit}</TagLabel>
                          <TagCloseButton onClick={() => handleRemoveBenefit(benefit)} />
                        </Tag>
                      ))}
                    </HStack>
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>

            {/* Skills & Tags */}
            <Card>
              <CardHeader>
                <Heading size="md">Skills & Tags</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4}>
                  <FormControl>
                    <FormLabel>Required Skills</FormLabel>
                    <HStack>
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill (e.g., React, Python)"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                      />
                      <Button onClick={handleAddSkill} leftIcon={<AddIcon />}>
                        Add
                      </Button>
                    </HStack>
                    <HStack spacing={2} mt={2} flexWrap="wrap">
                      {formData.skills.map((skill, index) => (
                        <Tag key={index} size="md" colorScheme="blue">
                          <TagLabel>{skill}</TagLabel>
                          <TagCloseButton onClick={() => handleRemoveSkill(skill)} />
                        </Tag>
                      ))}
                    </HStack>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Tags</FormLabel>
                    <HStack>
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a tag (e.g., remote, startup)"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      />
                      <Button onClick={handleAddTag} leftIcon={<AddIcon />}>
                        Add
                      </Button>
                    </HStack>
                    <HStack spacing={2} mt={2} flexWrap="wrap">
                      {formData.tags.map((tag, index) => (
                        <Tag key={index} size="md" colorScheme="purple">
                          <TagLabel>{tag}</TagLabel>
                          <TagCloseButton onClick={() => handleRemoveTag(tag)} />
                        </Tag>
                      ))}
                    </HStack>
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>

            {/* Application Settings */}
            <Card>
              <CardHeader>
                <Heading size="md">Application Settings</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4}>
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Allow email applications</FormLabel>
                    <Switch
                      isChecked={formData.applicationSettings.allowEmailApplications}
                      onChange={(e) => handleInputChange('applicationSettings.allowEmailApplications', e.target.checked)}
                    />
                  </FormControl>

                  {formData.applicationSettings.allowEmailApplications && (
                    <FormControl>
                      <FormLabel>Application Email</FormLabel>
                      <Input
                        value={formData.applicationSettings.applicationEmail}
                        onChange={(e) => handleInputChange('applicationSettings.applicationEmail', e.target.value)}
                        placeholder="jobs@company.com"
                        type="email"
                      />
                    </FormControl>
                  )}

                  <SimpleGrid columns={[1, 2]} spacing={4} w="full">
                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb="0">Require cover letter</FormLabel>
                      <Switch
                        isChecked={formData.applicationSettings.requireCoverLetter}
                        onChange={(e) => handleInputChange('applicationSettings.requireCoverLetter', e.target.checked)}
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb="0">Require portfolio</FormLabel>
                      <Switch
                        isChecked={formData.applicationSettings.requirePortfolio}
                        onChange={(e) => handleInputChange('applicationSettings.requirePortfolio', e.target.checked)}
                      />
                    </FormControl>
                  </SimpleGrid>

                  <FormControl>
                    <FormLabel>Maximum Applications</FormLabel>
                    <NumberInput
                      value={formData.applicationSettings.maxApplications}
                      onChange={(value) => handleInputChange('applicationSettings.maxApplications', value)}
                      min={1}
                      max={1000}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Expiration Date (Optional)</FormLabel>
                    <Input
                      value={formData.expiresAt}
                      onChange={(e) => handleInputChange('expiresAt', e.target.value)}
                      type="datetime-local"
                    />
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={loading}
              loadingText="Creating..."
              isDisabled={!isFormValid()}
            >
              Create Job Posting
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default JobCreatePanel;
