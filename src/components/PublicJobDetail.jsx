import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  Badge,
  Divider,
  useToast,
  useColorModeValue,
  Link,
  Icon,
  Image,
  Flex,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorMode,
  useBreakpointValue,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Tag,
  TagLabel,
  useDisclosure as useModalDisclosure
} from '@chakra-ui/react';
import {
  CheckCircleIcon,
  CloseIcon,
  EmailIcon,
  ExternalLinkIcon,
  PhoneIcon,
  AtSignIcon,
  StarIcon,
  CalendarIcon,
  ArrowBackIcon,
  TimeIcon,
  ViewIcon
} from '@chakra-ui/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useJobs } from '../hooks/useJobs';
import { useAuth } from '../contexts/AuthContext';

const PublicJobDetail = () => {
  const { slug } = useParams();
  const { getPublicJob, applyForJob } = useJobs();
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode } = useColorMode();

  // Application modal state
  const { isOpen: isApplicationModalOpen, onOpen: openApplicationModal, onClose: closeApplicationModal } = useModalDisclosure();

  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  const [applicationData, setApplicationData] = useState({
    name: '',
    email: '',
    phone: '',
    coverLetter: '',
    portfolio: ''
  });

  const bgColor = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.300');

  useEffect(() => {
    const fetchJob = async () => {
      if (!slug) {
        setError('No job slug provided');
        setLoading(false);
        return;
      }

      try {
        const result = await getPublicJob(slug);

        if (result) {
          setJob(result);
        } else {
          setError('Job not found or not publicly available');
        }
      } catch (err) {
        setError('Failed to fetch job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [slug, getPublicJob]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoToJobs = () => {
    navigate('/jobs');
  };

  const handleApply = () => {
    setApplicationData({
      name: '',
      email: '',
      phone: '',
      coverLetter: '',
      portfolio: ''
    });
    openApplicationModal();
  };

  const handleSubmitApplication = async () => {
    try {
      const success = await applyForJob(job._id, applicationData);

      if (success) {
        toast({
          title: 'Application submitted',
          description: 'Your application has been submitted successfully.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        closeApplicationModal();
      } else {
        toast({
          title: 'Application failed',
          description: 'Failed to submit application. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
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
    if (!dateString) return 'Recently';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Center minH="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading job details...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Center minH="100vh">
        <Card maxW="md" w="full" bg={cardBg}>
          <CardBody>
            <VStack spacing={6} textAlign="center">
              <Icon as={CloseIcon} w={12} h={12} color="red.500" />
              <Text fontSize="xl" fontWeight="bold" color="red.500">
                Job Not Found
              </Text>
              <Alert status="error">
                <AlertIcon />
                {error}
              </Alert>
              <Text fontSize="sm" color={mutedTextColor}>
                The job you're looking for may not exist or may not be publicly available.
              </Text>
              <HStack spacing={3}>
                <Button
                  leftIcon={<ArrowBackIcon />}
                  onClick={handleGoToJobs}
                  colorScheme="blue"
                >
                  Browse Jobs
                </Button>
                <Button
                  leftIcon={<ArrowBackIcon />}
                  onClick={handleGoHome}
                  variant="outline"
                >
                  Go Home
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </Center>
    );
  }

  if (!job) {
    return (
      <Center minH="100vh">
        <Card maxW="md" w="full" bg={cardBg}>
          <CardBody>
            <VStack spacing={6} textAlign="center">
              <Icon as={CloseIcon} w={12} h={12} color="red.500" />
              <Text fontSize="xl" fontWeight="bold" color="red.500">
                Job Not Found
              </Text>
              <Text fontSize="sm" color={mutedTextColor}>
                The job you're looking for could not be found.
              </Text>
              <Button
                leftIcon={<ArrowBackIcon />}
                onClick={handleGoToJobs}
                colorScheme="blue"
              >
                Browse Jobs
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Center>
    );
  }

  return (
    <Box minH="100vh" bg={bgColor}>
      <Box flex="1" overflowY="auto" p={4}>
        <Center py={8}>
          <VStack spacing={8} maxW="4xl" w="full" px={4}>
            {/* Header */}
            <Card w="full" bg={cardBg}>
              <CardHeader>
                <VStack spacing={4} align="start">
                  <HStack spacing={4} align="start" w="full">
                    {job.companyId?.logo && job.companyId.logo.dataUrl ? (
                      <Image
                        src={job.companyId.logo.dataUrl}
                        alt={`${job.companyId.name} logo`}
                        boxSize="80px"
                        objectFit="contain"
                        borderRadius="lg"
                        border="2px solid"
                        borderColor={borderColor}
                      />
                    ) : (
                      <Box
                        boxSize="80px"
                        bg="gray.100"
                        borderRadius="lg"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        border="2px solid"
                        borderColor={borderColor}
                      >
                        <Text fontSize="2xl" color="gray.500" fontWeight="bold">
                          {job.companyId?.name?.charAt(0).toUpperCase() || 'J'}
                        </Text>
                      </Box>
                    )}
                    <VStack align="start" spacing={2} flex={1}>
                      <Heading size="lg" color={textColor}>
                        {job.title}
                      </Heading>
                      <Text fontSize="lg" color={mutedTextColor} fontWeight="medium">
                        {job.companyId?.name}
                      </Text>
                      <HStack spacing={2} flexWrap="wrap">
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
                  </HStack>
                </VStack>
              </CardHeader>
            </Card>

            {/* Job Details */}
            <Card bg={cardBg} w="full">
              <CardHeader>
                <Heading size="md" color={textColor}>
                  Job Details
                </Heading>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing={6}>
                  {/* Description */}
                  <Box>
                    <Text fontWeight="semibold" color={textColor} mb={3}>
                      Description
                    </Text>
                    <Text color={mutedTextColor} lineHeight="tall" whiteSpace="pre-wrap">
                      {job.description}
                    </Text>
                  </Box>

                  <Divider />

                  {/* Requirements */}
                  {job.requirements && (
                    <Box>
                      <Text fontWeight="semibold" color={textColor} mb={3}>
                        Requirements
                      </Text>
                      <Text color={mutedTextColor} lineHeight="tall" whiteSpace="pre-wrap">
                        {job.requirements}
                      </Text>
                    </Box>
                  )}

                  {/* Responsibilities */}
                  {job.responsibilities && (
                    <Box>
                      <Text fontWeight="semibold" color={textColor} mb={3}>
                        Responsibilities
                      </Text>
                      <Text color={mutedTextColor} lineHeight="tall" whiteSpace="pre-wrap">
                        {job.responsibilities}
                      </Text>
                    </Box>
                  )}

                  <Divider />

                  {/* Job Information Grid */}
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <Stat>
                      <StatLabel color={mutedTextColor}>
                        <HStack spacing={2}>
                          <AtSignIcon />
                          <Text>Location</Text>
                        </HStack>
                      </StatLabel>
                      <StatNumber color={textColor}>
                        {job.location.type === 'remote' ? 'Remote' :
                         `${job.location.city || ''} ${job.location.state || ''}`.trim() || 'Location not specified'}
                      </StatNumber>
                    </Stat>

                    <Stat>
                      <StatLabel color={mutedTextColor}>
                        <HStack spacing={2}>
                          <StarIcon />
                          <Text>Salary</Text>
                        </HStack>
                      </StatLabel>
                      <StatNumber color={textColor}>
                        {formatSalary(job.salary)}
                      </StatNumber>
                    </Stat>

                    <Stat>
                      <StatLabel color={mutedTextColor}>
                        <HStack spacing={2}>
                          <CalendarIcon />
                          <Text>Posted</Text>
                        </HStack>
                      </StatLabel>
                      <StatNumber color={textColor}>
                        {formatDate(job.publishedAt)}
                      </StatNumber>
                    </Stat>

                    <Stat>
                      <StatLabel color={mutedTextColor}>
                        <HStack spacing={2}>
                          <TimeIcon />
                          <Text>Category</Text>
                        </HStack>
                      </StatLabel>
                      <StatNumber color={textColor}>
                        {job.category || 'General'}
                      </StatNumber>
                    </Stat>
                  </SimpleGrid>

                  {/* Skills */}
                  {job.skills && job.skills.length > 0 && (
                    <Box>
                      <Text fontWeight="semibold" color={textColor} mb={3}>
                        Required Skills
                      </Text>
                      <HStack spacing={2} flexWrap="wrap">
                        {job.skills.map((skill, index) => (
                          <Tag key={index} size="md" colorScheme="blue">
                            <TagLabel>{skill}</TagLabel>
                          </Tag>
                        ))}
                      </HStack>
                    </Box>
                  )}

                  {/* Benefits */}
                  {job.benefits && job.benefits.length > 0 && (
                    <Box>
                      <Text fontWeight="semibold" color={textColor} mb={3}>
                        Benefits & Perks
                      </Text>
                      <HStack spacing={2} flexWrap="wrap">
                        {job.benefits.map((benefit, index) => (
                          <Tag key={index} size="md" colorScheme="green">
                            <TagLabel>{benefit}</TagLabel>
                          </Tag>
                        ))}
                      </HStack>
                    </Box>
                  )}
                </VStack>
              </CardBody>
            </Card>

            {/* Action Buttons */}
            <Card bg={cardBg} w="full">
              <CardBody>
                <HStack spacing={4} justify="center">
                  <Button
                    leftIcon={<ArrowBackIcon />}
                    onClick={handleGoToJobs}
                    variant="outline"
                    size="lg"
                  >
                    Browse More Jobs
                  </Button>
                  <Button
                    leftIcon={<EmailIcon />}
                    onClick={handleApply}
                    colorScheme="blue"
                    size="lg"
                  >
                    Apply Now
                  </Button>
                </HStack>
              </CardBody>
            </Card>
          </VStack>
        </Center>
      </Box>

      {/* Application Modal */}
      <Modal isOpen={isApplicationModalOpen} onClose={closeApplicationModal} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Apply for {job?.title}</ModalHeader>
          <ModalBody>
            {job && (
              <VStack spacing={4}>
                <Box>
                  <Text fontWeight="medium">{job.companyId?.name}</Text>
                  <Text fontSize="sm" color="gray.600">{job.title}</Text>
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

                {job.applicationSettings?.requireCoverLetter && (
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

                {job.applicationSettings?.requirePortfolio && (
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

                {job.applicationSettings?.allowEmailApplications && job.applicationSettings?.applicationEmail && (
                  <Alert status="info">
                    <AlertIcon />
                    <Text fontSize="sm">
                      You can also apply directly via email: {job.applicationSettings.applicationEmail}
                    </Text>
                  </Alert>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={closeApplicationModal}>
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

export default PublicJobDetail;
