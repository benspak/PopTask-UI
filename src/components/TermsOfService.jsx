import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  useColorModeValue,
  Link,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';

const TermsOfService = () => {
  const bgColor = useColorModeValue('white', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');
  const accentColor = useColorModeValue('blue.500', 'blue.300');

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="4xl">
        <VStack spacing={8} align="start">
          <HStack spacing={4}>
            <Button
              leftIcon={<ArrowBackIcon />}
              variant="ghost"
              onClick={() => window.history.back()}
            >
              Back
            </Button>
          </HStack>

          <VStack spacing={6} align="start" w="full">
            <Heading size="xl" color={textColor}>
              Terms of Service
            </Heading>

            <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
              Last updated: {new Date().toLocaleDateString()}
            </Text>

            <VStack spacing={6} align="start" w="full">
              <Box>
                <Heading size="md" color={textColor} mb={3}>
                  1. Acceptance of Terms
                </Heading>
                <Text color={textColor} lineHeight="1.6">
                  By accessing and using PopVia ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </Text>
              </Box>

              <Box>
                <Heading size="md" color={textColor} mb={3}>
                  2. Description of Service
                </Heading>
                <Text color={textColor} lineHeight="1.6">
                  PopVia provides task management, time tracking, invoicing, and project management tools for freelancers and small businesses. The Service includes web-based applications and related services.
                </Text>
              </Box>

              <Box>
                <Heading size="md" color={textColor} mb={3}>
                  3. User Accounts
                </Heading>
                <Text color={textColor} lineHeight="1.6">
                  You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account or password.
                </Text>
              </Box>

              <Box>
                <Heading size="md" color={textColor} mb={3}>
                  4. Payment Terms
                </Heading>
                <Text color={textColor} lineHeight="1.6">
                  Pro subscriptions are billed monthly or annually. You may cancel your subscription at any time. Refunds are provided within 30 days of purchase if you're not satisfied with our service.
                </Text>
              </Box>

              <Box>
                <Heading size="md" color={textColor} mb={3}>
                  5. Acceptable Use
                </Heading>
                <Text color={textColor} lineHeight="1.6">
                  You agree not to use the Service to: (a) violate any laws or regulations; (b) infringe upon the rights of others; (c) transmit harmful, offensive, or inappropriate content; (d) attempt to gain unauthorized access to the Service.
                </Text>
              </Box>

              <Box>
                <Heading size="md" color={textColor} mb={3}>
                  6. Data and Privacy
                </Heading>
                <Text color={textColor} lineHeight="1.6">
                  Your data is important to us. We collect, use, and protect your information as described in our Privacy Policy. You retain ownership of your content, and we will not share your data with third parties without your consent.
                </Text>
              </Box>

              <Box>
                <Heading size="md" color={textColor} mb={3}>
                  7. Service Availability
                </Heading>
                <Text color={textColor} lineHeight="1.6">
                  We strive to maintain high availability but cannot guarantee uninterrupted service. We may perform maintenance that temporarily affects service availability.
                </Text>
              </Box>

              <Box>
                <Heading size="md" color={textColor} mb={3}>
                  8. Limitation of Liability
                </Heading>
                <Text color={textColor} lineHeight="1.6">
                  PopVia shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service.
                </Text>
              </Box>

              <Box>
                <Heading size="md" color={textColor} mb={3}>
                  9. Termination
                </Heading>
                <Text color={textColor} lineHeight="1.6">
                  We may terminate or suspend your account and access to the Service at any time, with or without cause, with or without notice. You may cancel your account at any time.
                </Text>
              </Box>

              <Box>
                <Heading size="md" color={textColor} mb={3}>
                  10. Changes to Terms
                </Heading>
                <Text color={textColor} lineHeight="1.6">
                  We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the Service.
                </Text>
              </Box>

              <Box>
                <Heading size="md" color={textColor} mb={3}>
                  11. Contact Information
                </Heading>
                <Text color={textColor} lineHeight="1.6">
                  If you have any questions about these Terms of Service, please contact us at support@popvia.com.
                </Text>
              </Box>
            </VStack>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
};

export default TermsOfService;
