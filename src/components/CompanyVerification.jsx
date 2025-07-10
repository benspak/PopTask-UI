import React, { useState, useEffect, useRef } from 'react';
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
  Icon
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
import { useCompanies } from '../hooks/useCompanies';
import { useNavigate, useParams } from 'react-router-dom';

const CompanyVerification = () => {
  const { token } = useParams();
  const { verifyCompany } = useCompanies();
  const navigate = useNavigate();
  const toast = useToast();
  const toastShownRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [company, setCompany] = useState(null);
  const [error, setError] = useState(null);
  const [verified, setVerified] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const handleVerification = async () => {
      if (!token) {
        setError('No verification token provided');
        setLoading(false);
        return;
      }

      try {
        const result = await verifyCompany(token);

        if (result.success) {
          setCompany(result.data);
          setVerified(true);
          if (!toastShownRef.current) {
            toast({
              title: 'Company Verified!',
              description: 'The company has been successfully verified.',
              status: 'success',
              duration: 5000,
              isClosable: true,
            });
            toastShownRef.current = true;
          }
        } else {
          setError(result.error || 'Failed to verify company');
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to verify company');
      } finally {
        setLoading(false);
      }
    };

    handleVerification();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, verifyCompany, toast]);

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <Center minH="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Verifying company...</Text>
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
                Verification Failed
              </Text>
              <Alert status="error">
                <AlertIcon />
                {error}
              </Alert>
              <Text fontSize="sm" color="gray.500">
                The verification link may be invalid or expired. Please contact the company owner for a new verification link.
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

  if (verified && company) {
    return (
      <Center minH="100vh" p={4}>
        <Card maxW="2xl" w="full" bg={cardBg}>
          <CardHeader textAlign="center">
            <VStack spacing={4}>
                             <Icon as={CheckCircleIcon} w={16} h={16} color="green.500" />
              <Text fontSize="2xl" fontWeight="bold" color="green.500">
                Company Verified Successfully!
              </Text>
              <Badge colorScheme="green" variant="solid" fontSize="md">
                Verified Company
              </Badge>
            </VStack>
          </CardHeader>

          <CardBody>
            <VStack spacing={6} align="stretch">
              {/* Company Information */}
              <Box>
                <Text fontSize="xl" fontWeight="bold" mb={2}>
                  {company.name}
                </Text>
                {company.description && (
                  <Text color="gray.600" mb={4}>
                    {company.description}
                  </Text>
                )}

                <VStack align="stretch" spacing={3}>
                  {company.industry && (
                    <HStack>
                      <Badge colorScheme="blue" variant="subtle">
                        {company.industry}
                      </Badge>
                    </HStack>
                  )}

                                     {company.location.city || company.location.country ? (
                     <HStack spacing={2}>
                       <AtSignIcon color="gray.500" />
                       <Text color="gray.600">
                         {[company.location.city, company.location.state, company.location.country]
                           .filter(Boolean)
                           .join(', ')}
                       </Text>
                     </HStack>
                   ) : null}

                                     {company.contact.email && (
                     <HStack spacing={2}>
                       <EmailIcon color="gray.500" />
                       <Text color="gray.600">
                         {company.contact.email}
                       </Text>
                     </HStack>
                   )}

                                     {company.contact.phone && (
                     <HStack spacing={2}>
                       <PhoneIcon color="gray.500" />
                       <Text color="gray.600">
                         {company.contact.phone}
                       </Text>
                     </HStack>
                   )}

                                     {company.website && (
                     <HStack spacing={2}>
                       <ExternalLinkIcon color="gray.500" />
                       <Link href={company.website} isExternal color="blue.500">
                         {company.website}
                         <Icon as={ExternalLinkIcon} ml={1} />
                       </Link>
                     </HStack>
                   )}

                                     <HStack spacing={2}>
                     <StarIcon color="gray.500" />
                     <Text color="gray.600">
                       {company.size} employees
                     </Text>
                   </HStack>

                                     {company.founded && (
                     <HStack spacing={2}>
                       <CalendarIcon color="gray.500" />
                       <Text color="gray.600">
                         Founded {company.founded}
                       </Text>
                     </HStack>
                   )}
                </VStack>
              </Box>

              <Divider />

              {/* Social Media Links */}
              {(company.social.linkedin || company.social.twitter || company.social.facebook) && (
                <Box>
                  <Text fontSize="lg" fontWeight="semibold" mb={3}>
                    Social Media
                  </Text>
                  <HStack spacing={4} wrap="wrap">
                    {company.social.linkedin && (
                      <Link href={company.social.linkedin} isExternal>
                        <Button size="sm" colorScheme="blue" variant="outline">
                          LinkedIn
                        </Button>
                      </Link>
                    )}
                    {company.social.twitter && (
                      <Link href={company.social.twitter} isExternal>
                        <Button size="sm" colorScheme="blue" variant="outline">
                          Twitter
                        </Button>
                      </Link>
                    )}
                    {company.social.facebook && (
                      <Link href={company.social.facebook} isExternal>
                        <Button size="sm" colorScheme="blue" variant="outline">
                          Facebook
                        </Button>
                      </Link>
                    )}
                  </HStack>
                </Box>
              )}

              <Divider />

              {/* Verification Details */}
              <Box>
                <Text fontSize="lg" fontWeight="semibold" mb={3}>
                  Verification Details
                </Text>
                <VStack align="stretch" spacing={2}>
                  <HStack justify="space-between">
                    <Text color="gray.600">Verified At:</Text>
                    <Text fontWeight="medium">
                      {new Date(company.verifiedAt).toLocaleString()}
                    </Text>
                  </HStack>
                  {company.verifiedBy && (
                    <HStack justify="space-between">
                      <Text color="gray.600">Verified By:</Text>
                      <Text fontWeight="medium">
                        {company.verifiedBy.firstName} {company.verifiedBy.lastName}
                      </Text>
                    </HStack>
                  )}
                </VStack>
              </Box>

              <Divider />

              {/* Success Message */}
              <Alert status="success">
                <AlertIcon />
                <VStack align="start" spacing={1}>
                  <Text fontWeight="semibold">
                    What happens now?
                  </Text>
                  <Text fontSize="sm">
                    • This company is now marked as verified on PopTask
                  </Text>
                  <Text fontSize="sm">
                    • It will appear in search results with a verified badge
                  </Text>
                  <Text fontSize="sm">
                    • Other users will trust this company's legitimacy
                  </Text>
                </VStack>
              </Alert>

              {/* Action Buttons */}
              <HStack spacing={4} justify="center">
                                 <Button
                   leftIcon={<ArrowBackIcon />}
                   onClick={handleGoHome}
                   variant="outline"
                 >
                   Go Home
                 </Button>
                <Button
                  onClick={handleGoToDashboard}
                  colorScheme="blue"
                >
                  Go to Dashboard
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </Center>
    );
  }

  return null;
};

export default CompanyVerification;
