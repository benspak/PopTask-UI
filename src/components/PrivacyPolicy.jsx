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

const PrivacyPolicy = () => {
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
              Privacy Policy
            </Heading>

            <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
              Last updated: {new Date().toLocaleDateString()}
            </Text>

            <VStack spacing={6} align="start" w="full">
              <Box>
                <Heading size="md" color={textColor} mb={3}>
                  1. Information We Collect
                </Heading>
                <Text color={textColor} lineHeight="1.6" mb={3}>
                  We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.
                </Text>
                <Text color={textColor} lineHeight="1.6">
                  <strong>Account Information:</strong> Name, email address, password, and profile information.<br/>
                  <strong>Usage Data:</strong> Information about how you use our services, including tasks, projects, time tracking, and invoicing data.<br/>
                  <strong>Payment Information:</strong> Billing details and payment method information (processed securely through our payment partners).<br/>
                  <strong>Communication Data:</strong> Messages, feedback, and support requests you send to us.
                </Text>
              </Box>

              <Box>
                <Heading size="md" color={textColor} mb={3}>
                  2. How We Use Your Information
                </Heading>
                <Text color={textColor} lineHeight="1.6">
                  We use the information we collect to: provide, maintain, and improve our services; process payments and transactions; communicate with you about your account and services; send you updates and marketing communications (with your consent); respond to your questions and support requests; detect and prevent fraud and abuse.
                </Text>
              </Box>

              <Box>
                <Heading size="md" color={textColor} mb={3}>
                  3. Information Sharing
                </Heading>
                <Text color={textColor} lineHeight="1.6">
                  We do not sell, trade, or otherwise transfer your personal information to third parties except as described in this policy. We may share information with: service providers who help us operate our services; payment processors for billing purposes; legal authorities when required by law; and other users when you choose to share content through our platform.
                </Text>
              </Box>

              <Box>
                <Heading size="md" color={textColor} mb={3}>
                  4. Data Security
                </Heading>
                <Text color={textColor} lineHeight="1.6">
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                </Text>
              </Box>

              <Box>
                <Heading size="md" color={textColor} mb={3}>
                  5. Data Retention
                </Heading>
                <Text color={textColor} lineHeight="1.6">
                  We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy. You may request deletion of your account and associated data at any time.
                </Text>
              </Box>

              <Box>
                <Heading size="md" color={textColor} mb={3}>
                  6. Your Rights
                </Heading>
                <Text color={textColor} lineHeight="1.6">
                  You have the right to: access and update your personal information; delete your account and associated data; opt out of marketing communications; request a copy of your data; and lodge a complaint with relevant authorities if you believe we have violated your privacy rights.
                </Text>
              </Box>

              <Box>
                <Heading size="md" color={textColor} mb={3}>
                  7. Cookies and Tracking
                </Heading>
                <Text color={textColor} lineHeight="1.6">
                  We use cookies and similar technologies to enhance your experience, analyze usage patterns, and provide personalized content. You can control cookie settings through your browser preferences.
                </Text>
              </Box>

              <Box>
                <Heading size="md" color={textColor} mb={3}>
                  8. Third-Party Services
                </Heading>
                <Text color={textColor} lineHeight="1.6">
                  Our services may integrate with third-party services (such as payment processors and analytics tools). These services have their own privacy policies, and we encourage you to review them.
                </Text>
              </Box>

              <Box>
                <Heading size="md" color={textColor} mb={3}>
                  9. International Data Transfers
                </Heading>
                <Text color={textColor} lineHeight="1.6">
                  Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this policy.
                </Text>
              </Box>

              <Box>
                <Heading size="md" color={textColor} mb={3}>
                  10. Children's Privacy
                </Heading>
                <Text color={textColor} lineHeight="1.6">
                  Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.
                </Text>
              </Box>

              <Box>
                <Heading size="md" color={textColor} mb={3}>
                  11. Changes to This Policy
                </Heading>
                <Text color={textColor} lineHeight="1.6">
                  We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on our website and updating the "Last updated" date.
                </Text>
              </Box>

              <Box>
                <Heading size="md" color={textColor} mb={3}>
                  12. Contact Us
                </Heading>
                <Text color={textColor} lineHeight="1.6">
                  If you have any questions about this privacy policy or our data practices, please contact us at privacy@popvia.com.
                </Text>
              </Box>
            </VStack>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
};

export default PrivacyPolicy;
