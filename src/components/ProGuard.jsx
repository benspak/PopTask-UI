import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Icon,
  useColorModeValue,
  Container,
  Badge,
} from '@chakra-ui/react';
import { StarIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

const ProGuard = ({ children }) => {
  const { user } = useAuth();
  const isProUser = user?.userType === 'pro';

  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const accentColor = useColorModeValue('blue.500', 'blue.300');

  const handleUpgradeToPro = async () => {
    try {
      const response = await apiService.createProPaymentLink('subscription');
      if (response.success && response.url) {
        window.location.href = response.url;
      }
    } catch (error) {
      console.error('Failed to create payment link:', error);
    }
  };

  if (isProUser) {
    return children;
  }

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Container maxW="4xl" py={20}>
        <VStack spacing={8} textAlign="center">
          <Badge colorScheme="orange" px={4} py={2} borderRadius="full" fontSize="sm">
            Pro Feature
          </Badge>

          <VStack spacing={4}>
            <Icon as={StarIcon} boxSize={16} color={accentColor} />
            <Heading size="xl" color={textColor}>
              Pro Feature Access Required
            </Heading>
            <Text fontSize="lg" color={useColorModeValue('gray.600', 'gray.300')} maxW="2xl">
              This feature is exclusively available to Pro users. Upgrade your account to unlock teams,
              proposal templates, and other advanced features.
            </Text>
          </VStack>

          <VStack spacing={6} bg={bgColor} p={8} borderRadius="xl" boxShadow="lg" maxW="2xl" w="full">
            <Heading size="md" color={textColor}>
              Pro Benefits
            </Heading>

            <VStack spacing={4} align="start" w="full">
              <Box>
                <Text fontWeight="semibold" color={textColor}>Teams Management</Text>
                <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                  Create and manage teams with up to 5 members
                </Text>
              </Box>

              <Box>
                <Text fontWeight="semibold" color={textColor}>Proposal Templates</Text>
                <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                  Create professional proposal templates with variables
                </Text>
              </Box>

              <Box>
                <Text fontWeight="semibold" color={textColor}>Unlimited Everything</Text>
                <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                  No limits on tasks, projects, clients, or companies
                </Text>
              </Box>

              <Box>
                <Text fontWeight="semibold" color={textColor}>Priority Support</Text>
                <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                  Get faster support and exclusive features
                </Text>
              </Box>
            </VStack>

            <Button
              size="lg"
              colorScheme="blue"
              onClick={handleUpgradeToPro}
              rightIcon={<ArrowForwardIcon />}
              w="full"
            >
              Upgrade to Pro - $15/month
            </Button>

            <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')}>
              30-day money back guarantee • Cancel anytime
            </Text>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
};

export default ProGuard;
