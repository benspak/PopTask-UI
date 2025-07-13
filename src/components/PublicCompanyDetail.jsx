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
  useColorMode
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
  ArrowBackIcon
} from '@chakra-ui/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useCompanies } from '../hooks/useCompanies';
import TopBar from './TopBar';

const PublicCompanyDetail = () => {
  const { slug, token } = useParams();
  const { getPublicCompany } = useCompanies();
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode } = useColorMode();

  // TopBar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCenterOpen, setIsCenterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);
  const [error, setError] = useState(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.300');

  useEffect(() => {
    const fetchCompany = async () => {
      if (!token || !slug) {
        setError('No company token or slug provided');
        setLoading(false);
        return;
      }

      try {
        const result = await getPublicCompany(slug, token);

        if (result.success) {
          setCompany(result.data);
        } else {
          setError(result.error || 'Company not found or not verified');
        }
      } catch (err) {
        setError('Failed to fetch company details');
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [slug, token, getPublicCompany]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <Center minH="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading company details...</Text>
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
                Company Not Found
              </Text>
              <Alert status="error">
                <AlertIcon />
                {error}
              </Alert>
              <Text fontSize="sm" color={mutedTextColor}>
                The company you're looking for may not exist or may not be publicly available.
              </Text>
              <Button
                leftIcon={<ArrowBackIcon />}
                onClick={handleGoHome}
                colorScheme="blue"
              >
                Go Home
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Center>
    );
  }

  if (!company) {
    return (
      <Center minH="100vh">
        <Card maxW="md" w="full" bg={cardBg}>
          <CardBody>
            <VStack spacing={6} textAlign="center">
              <Icon as={CloseIcon} w={12} h={12} color="red.500" />
              <Text fontSize="xl" fontWeight="bold" color="red.500">
                Company Not Found
              </Text>
              <Text fontSize="sm" color={mutedTextColor}>
                The company you're looking for could not be found.
              </Text>
              <Button
                leftIcon={<ArrowBackIcon />}
                onClick={handleGoHome}
                colorScheme="blue"
              >
                Go Home
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Center>
    );
  }

  return (
    <Box minH="100vh" bg={bgColor}>
      <TopBar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isCenterOpen={isCenterOpen}
        setIsCenterOpen={setIsCenterOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={setSearchQuery}
        onResetToAllTasks={() => navigate('/dashboard')}
        onLogout={() => navigate('/')}
      />
      <Center py={8}>
        <VStack spacing={8} maxW="4xl" w="full" px={4}>
          {/* Header */}
          <Card w="full" bg={cardBg}>
            <CardHeader textAlign="center">
              <VStack spacing={4}>
                <HStack spacing={4} align="center">
                  {company.logo && company.logo.dataUrl ? (
                    <Image
                      src={company.logo.dataUrl}
                      alt={`${company.name} logo`}
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
                        {company.name.charAt(0).toUpperCase()}
                      </Text>
                    </Box>
                  )}
                  <VStack align="start" spacing={2}>
                    <Heading size="lg" color={textColor}>
                      {company.name}
                    </Heading>
                    <HStack spacing={2}>
                      {company.isVerified ? (
                        <Badge colorScheme="green" variant="solid" size="lg">
                          <HStack spacing={1}>
                            <CheckCircleIcon />
                            <Text>Verified Company</Text>
                          </HStack>
                        </Badge>
                      ) : (
                        <Badge colorScheme="gray" variant="outline" size="lg">
                          <HStack spacing={1}>
                            <CloseIcon />
                            <Text>Not Verified</Text>
                          </HStack>
                        </Badge>
                      )}
                      {company.industry && (
                        <Badge colorScheme="blue" variant="subtle">
                          {company.industry}
                        </Badge>
                      )}
                    </HStack>
                  </VStack>
                </HStack>
              </VStack>
            </CardHeader>
          </Card>

          {/* Company Details */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} w="full">
            {/* Main Information */}
            <Card bg={cardBg}>
              <CardHeader>
                <Heading size="md" color={textColor}>
                  Company Information
                </Heading>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  {company.description && (
                    <Box>
                      <Text fontWeight="semibold" color={textColor} mb={2}>
                        About
                      </Text>
                      <Text color={mutedTextColor} lineHeight="tall">
                        {company.description}
                      </Text>
                    </Box>
                  )}

                  <Divider />

                  <SimpleGrid columns={2} spacing={4}>
                    <Stat>
                      <StatLabel color={mutedTextColor}>Company Size</StatLabel>
                      <StatNumber color={textColor}>
                        <HStack spacing={2}>
                          <StarIcon />
                          <Text>{company.size} employees</Text>
                        </HStack>
                      </StatNumber>
                    </Stat>

                    {company.founded && (
                      <Stat>
                        <StatLabel color={mutedTextColor}>Founded</StatLabel>
                        <StatNumber color={textColor}>
                          <HStack spacing={2}>
                            <CalendarIcon />
                            <Text>{company.founded}</Text>
                          </HStack>
                        </StatNumber>
                      </Stat>
                    )}
                  </SimpleGrid>

                  {(company.location.city || company.location.country) && (
                    <>
                      <Divider />
                      <Box>
                        <Text fontWeight="semibold" color={textColor} mb={2}>
                          Location
                        </Text>
                        <HStack spacing={2} color={mutedTextColor}>
                          <AtSignIcon />
                          <Text>
                            {[company.location.city, company.location.state, company.location.country]
                              .filter(Boolean)
                              .join(', ')}
                          </Text>
                        </HStack>
                      </Box>
                    </>
                  )}

                  {company.website && (
                    <>
                      <Divider />
                      <Box>
                        <Text fontWeight="semibold" color={textColor} mb={2}>
                          Website
                        </Text>
                        <Link href={company.website} isExternal>
                          <HStack spacing={2} color="blue.500">
                            <ExternalLinkIcon />
                            <Text>{company.website}</Text>
                          </HStack>
                        </Link>
                      </Box>
                    </>
                  )}
                </VStack>
              </CardBody>
            </Card>

            {/* Contact Information */}
            <Card bg={cardBg}>
              <CardHeader>
                <Heading size="md" color={textColor}>
                  Contact Information
                </Heading>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  {company.contact.phone && (
                    <Box>
                      <Text fontWeight="semibold" color={textColor} mb={2}>
                        Phone
                      </Text>
                      <HStack spacing={2} color={mutedTextColor}>
                        <PhoneIcon />
                        <Text>{company.contact.phone}</Text>
                      </HStack>
                    </Box>
                  )}

                  {/* Social Media Links */}
                  {(company.social?.linkedin || company.social?.twitter || company.social?.facebook) && (
                    <>
                      <Divider />
                      <Box>
                        <Text fontWeight="semibold" color={textColor} mb={2}>
                          Social Media
                        </Text>
                        <VStack align="stretch" spacing={2}>
                          {company.social?.linkedin && (
                            <Link href={company.social.linkedin} isExternal>
                              <HStack spacing={2} color="blue.500">
                                <Text>LinkedIn</Text>
                                <ExternalLinkIcon />
                              </HStack>
                            </Link>
                          )}
                          {company.social?.twitter && (
                            <Link href={company.social.twitter} isExternal>
                              <HStack spacing={2} color="blue.400">
                                <Text>Twitter</Text>
                                <ExternalLinkIcon />
                              </HStack>
                            </Link>
                          )}
                          {company.social?.facebook && (
                            <Link href={company.social.facebook} isExternal>
                              <HStack spacing={2} color="blue.600">
                                <Text>Facebook</Text>
                                <ExternalLinkIcon />
                              </HStack>
                            </Link>
                          )}
                        </VStack>
                      </Box>
                    </>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Action Buttons */}
          <Card bg={cardBg}>
            <CardBody>
              <HStack spacing={4} justify="center">
                <Button
                  leftIcon={<ArrowBackIcon />}
                  onClick={handleGoHome}
                  colorScheme="blue"
                  variant="outline"
                >
                  Go Home
                </Button>
                <Button
                  onClick={handleGoToDashboard}
                  colorScheme="blue"
                >
                  View Dashboard
                </Button>
              </HStack>
            </CardBody>
          </Card>
        </VStack>
      </Center>
    </Box>
  );
};

export default PublicCompanyDetail;
