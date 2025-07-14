import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Select,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Heading,
  Flex,
  Badge,
  Tag,
  TagLabel,
  useToast,
  Alert,
  AlertIcon,
  Spinner,
  Divider,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Textarea,
  useDisclosure,
  Link,
  Image,
  SimpleGrid
} from '@chakra-ui/react';
import {
  SearchIcon,
  CalendarIcon,
  StarIcon,
  ExternalLinkIcon,
  EmailIcon
} from '@chakra-ui/icons';
import { useJobs } from '../hooks/useJobs';

const PublicJobBoard = () => {
  const { jobs, loading, error, pagination, fetchPublicJobs, applyForJob } = useJobs();
  const toast = useToast();
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    type: '',
    level: '',
    locationType: '',
    companyId: ''
  });
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicationData, setApplicationData] = useState({
    name: '',
    email: '',
    phone: '',
    coverLetter: '',
    portfolio: ''
  });
  const { isOpen, onOpen, onClose } = useDisclosure();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    fetchPublicJobs(filters);
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApply = (job) => {
    setSelectedJob(job);
    setApplicationData({
      name: '',
      email: '',
      phone: '',
      coverLetter: '',
      portfolio: ''
    });
    onOpen();
  };

  const handleSubmitApplication = async () => {
    try {
      const success = await applyForJob(selectedJob._id, applicationData);

      if (success) {
        toast({
          title: 'Application submitted',
          description: 'Your application has been submitted successfully.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        onClose();
        setSelectedJob(null);
      }
    } catch (err) {
      toast({
        title: 'Application failed',
        description: err.message || 'Failed to submit application.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
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

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <Heading size="xl" mb={2}>Find Your Next Opportunity</Heading>
          <Text fontSize="lg" color="gray.600">
            Discover amazing job opportunities from top companies
          </Text>
        </Box>

        {/* Filters */}
        <Card>
          <CardBody>
            <VStack spacing={4}>
              <HStack spacing={4} w="full">
                <Input
                  placeholder="Search jobs..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  leftIcon={<SearchIcon />}
                />
                <Select
                  placeholder="Category"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
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
                <Select
                  placeholder="Type"
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
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
                  placeholder="Company"
                  value={filters.companyId}
                  onChange={(e) => handleFilterChange('companyId', e.target.value)}
                >
                  {/* Company options would be populated from API */}
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
                    No jobs found matching your criteria.
                  </Text>
                </CardBody>
              </Card>
            ) : (
              jobs.map(job => (
                <Card key={job._id} border="1px" borderColor={borderColor} _hover={{ shadow: 'md' }}>
                  <CardHeader>
                    <Flex justify="space-between" align="start">
                      <VStack align="start" spacing={2} flex={1}>
                        <Heading size="md">{job.title}</Heading>
                        <HStack spacing={2}>
                          <Badge colorScheme={getTypeColor(job.type)}>
                            {job.type}
                          </Badge>
                          <Badge colorScheme={getLevelColor(job.level)}>
                            {job.level}
                          </Badge>
                          {job.location.type === 'remote' && (
                            <Badge colorScheme="green">Remote</Badge>
                          )}
                        </HStack>
                      </VStack>
                      <Button
                        colorScheme="blue"
                        size="sm"
                        onClick={() => handleApply(job)}
                      >
                        Apply Now
                      </Button>
                    </Flex>
                  </CardHeader>
                  <CardBody>
                    <VStack align="start" spacing={3}>
                      <HStack spacing={4}>
                        <HStack>
                          <AtSignIcon />
                          <Text fontSize="sm" fontWeight="medium">{job.companyId?.name}</Text>
                        </HStack>
                        <HStack>
                          <AtSignIcon />
                          <Text fontSize="sm">
                            {job.location.type === 'remote' ? 'Remote' :
                             `${job.location.city || ''} ${job.location.state || ''}`.trim() || 'Location not specified'}
                          </Text>
                        </HStack>
                        <HStack>
                          <CalendarIcon />
                          <Text fontSize="sm">
                            Posted {formatDate(job.publishedAt)}
                          </Text>
                        </HStack>
                      </HStack>

                      <Text noOfLines={3} color="gray.600">
                        {job.description}
                      </Text>

                      <HStack spacing={2}>
                        <Text fontSize="sm" fontWeight="medium">Salary:</Text>
                        <Text fontSize="sm">{formatSalary(job.salary)}</Text>
                      </HStack>

                      {job.skills && job.skills.length > 0 && (
                        <HStack spacing={2} flexWrap="wrap">
                          <Text fontSize="sm" fontWeight="medium">Skills:</Text>
                          {job.skills.slice(0, 5).map((skill, index) => (
                            <Tag key={index} size="sm" colorScheme="blue">
                              <TagLabel>{skill}</TagLabel>
                            </Tag>
                          ))}
                          {job.skills.length > 5 && (
                            <Text fontSize="sm" color="gray.500">
                              +{job.skills.length - 5} more
                            </Text>
                          )}
                        </HStack>
                      )}

                      {job.benefits && job.benefits.length > 0 && (
                        <HStack spacing={2} flexWrap="wrap">
                          <Text fontSize="sm" fontWeight="medium">Benefits:</Text>
                          {job.benefits.slice(0, 3).map((benefit, index) => (
                            <Tag key={index} size="sm" colorScheme="green">
                              <TagLabel>{benefit}</TagLabel>
                            </Tag>
                          ))}
                          {job.benefits.length > 3 && (
                            <Text fontSize="sm" color="gray.500">
                              +{job.benefits.length - 3} more
                            </Text>
                          )}
                        </HStack>
                      )}
                    </VStack>
                  </CardBody>
                  <CardFooter>
                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<ExternalLinkIcon />}
                        onClick={() => window.open(`/jobs/${job.slug}`, '_blank')}
                      >
                        View Full Details
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        onClick={() => handleApply(job)}
                      >
                        Apply Now
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

      {/* Application Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Apply for {selectedJob?.title}</ModalHeader>
          <ModalBody>
            {selectedJob && (
              <VStack spacing={4}>
                <Box>
                  <Text fontWeight="medium">{selectedJob.companyId?.name}</Text>
                  <Text fontSize="sm" color="gray.600">{selectedJob.title}</Text>
                </Box>

                <FormControl isRequired>
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    value={applicationData.name}
                    onChange={(e) => setApplicationData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your full name"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    value={applicationData.email}
                    onChange={(e) => setApplicationData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your.email@example.com"
                    type="email"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Phone Number</FormLabel>
                  <Input
                    value={applicationData.phone}
                    onChange={(e) => setApplicationData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                  />
                </FormControl>

                {selectedJob.applicationSettings?.requireCoverLetter && (
                  <FormControl>
                    <FormLabel>Cover Letter</FormLabel>
                    <Textarea
                      value={applicationData.coverLetter}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, coverLetter: e.target.value }))}
                      placeholder="Tell us why you're interested in this position..."
                      rows={4}
                    />
                  </FormControl>
                )}

                {selectedJob.applicationSettings?.requirePortfolio && (
                  <FormControl>
                    <FormLabel>Portfolio URL</FormLabel>
                    <Input
                      value={applicationData.portfolio}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, portfolio: e.target.value }))}
                      placeholder="https://your-portfolio.com"
                      type="url"
                    />
                  </FormControl>
                )}

                {selectedJob.applicationSettings?.allowEmailApplications && selectedJob.applicationSettings?.applicationEmail && (
                  <Alert status="info">
                    <AlertIcon />
                    <Text fontSize="sm">
                      You can also apply directly via email: {selectedJob.applicationSettings.applicationEmail}
                    </Text>
                  </Alert>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleSubmitApplication}
                isDisabled={!applicationData.name || !applicationData.email}
              >
                Submit Application
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PublicJobBoard;
