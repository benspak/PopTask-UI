import React, { useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Icon,
  SimpleGrid,
  Container,
  Badge,
  useColorMode,
  useColorModeValue,
  Image,
  Link,
  IconButton,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import {
  CheckIcon,
  CheckCircleIcon,
  TimeIcon,
  InfoIcon,
  AtSignIcon,
  CalendarIcon,
  StarIcon,
  ArrowForwardIcon,
  SunIcon,
  MoonIcon,
  ViewIcon,
  TriangleDownIcon,
  SettingsIcon,
  LockIcon,
} from '@chakra-ui/icons';
import { Input } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

const Homepage = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { login, register, user } = useAuth();
  const toast = useToast();
  const [isCreatingPaymentLink, setIsCreatingPaymentLink] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [anonymousEmail, setAnonymousEmail] = useState('');

  const bgColor = useColorModeValue('white', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');
  const accentColor = useColorModeValue('blue.500', 'blue.300');
  const cardBg = useColorModeValue('gray.50', 'gray.800');

  const features = [
    {
      icon: CalendarIcon,
      title: 'Calendar & Project Organization',
      description: 'Organize tasks by day of the week with our intuitive calendar interface. See your workload at a glance and plan efficiently.',
      benefit: 'Save 2-3 hours per week on task planning'
    },
    {
      icon: ViewIcon,
      title: 'Company Verification & Management',
      description: 'Create and verify company profiles with public sharing. Build trust with verified badges and secure token-based sharing.',
      benefit: 'Establish credibility and trust with clients'
    },
    {
      icon: SettingsIcon,
      title: 'Client & Project Management',
      description: 'Manage clients and associate projects with comprehensive contact tracking. Keep related work together and track progress seamlessly.',
      benefit: 'Reduce project coordination time by 40%'
    },
    {
      icon: TriangleDownIcon,
      title: 'Professional Invoicing & Payments',
      description: 'Convert time tracking into professional invoices with Stripe payment integration. Get paid faster with automated payment collection.',
      benefit: 'Save 4-5 hours per month on invoicing'
    },
    {
      icon: AtSignIcon,
      title: 'Task & Project Sharing',
      description: 'Share tasks and projects with team members via public links. Real-time updates keep everyone on the same page.',
      benefit: 'Cut meeting time in half with better visibility'
    },
    {
      icon: TimeIcon,
      title: 'Professional Time Tracking',
      description: 'Built-in time tracking with session management helps you understand where time goes. Identify bottlenecks and optimize workflows.',
      benefit: 'Identify and eliminate 25% of time waste'
    },
  ];

  // const testimonials = [
  //   {
  //     name: 'Sarah Chen',
  //     role: 'Product Manager',
  //     company: 'TechFlow Inc.',
  //     quote: 'PopTask saved our team 15 hours per week. The calendar view alone made our sprint planning 3x faster.',
  //     savings: '$45,000/year'
  //   },
  //   {
  //     name: 'Marcus Rodriguez',
  //     role: 'Operations Director',
  //     company: 'ScaleUp Solutions',
  //     quote: 'We reduced project delays by 60% and our team is finally on the same page. Game changer.',
  //     savings: '$78,000/year'
  //   },
  //   {
  //     name: 'Emily Watson',
  //     role: 'CEO',
  //     company: 'StartupXYZ',
  //     quote: 'The ROI was immediate. We\'re saving $2,400 per month in lost productivity. Best investment we made.',
  //     savings: '$28,800/year'
  //   }
  // ];

  const handleSignup = () => {
    // Navigate to signup page
    window.location.href = '/register';
  };

  const handleLogin = () => {
    // Navigate to login page
    window.location.href = '/login';
  };

  const handleGetProNow = async () => {
    // If user is not logged in and we haven't shown email input yet, show it
    if (!user && !showEmailInput) {
      setShowEmailInput(true);
      return;
    }

    setIsCreatingPaymentLink(true);

    try {
      // If user is logged in, use their email, otherwise use anonymous email or undefined
      const userEmail = user?.email || (anonymousEmail.trim() || undefined);

      const response = await apiService.createPaymentLink('subscription', userEmail);

      if (response.success && response.url) {
        // Redirect to Stripe checkout
        window.location.href = response.url;
      } else {
        toast({
          title: 'Payment Link Error',
          description: response.message || 'Failed to create payment link',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Payment link creation error:', error);

      // Provide more specific error messages
      let errorMessage = 'Failed to create payment link. Please try again.';

      if (error.message && error.message.includes('Invalid email address')) {
        errorMessage = 'Please log in or provide a valid email address to continue.';
      } else if (error.status === 429) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (error.status === 500) {
        errorMessage = 'Payment service temporarily unavailable. Please try again later.';
      }

      toast({
        title: 'Payment Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsCreatingPaymentLink(false);
    }
  };

  return (
    <Box bg={bgColor} minH="100vh">
      {/* Navigation */}
      <Box
        position="sticky"
        top={0}
        zIndex={1000}
        bg={bgColor}
        borderBottom="1px"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
        backdropFilter="blur(10px)"
      >
        <Container maxW="7xl" py={4}>
          <Flex justify="space-between" align="center">
            <HStack spacing={8}>
              <Heading size="lg" color={accentColor}>
                PopTask
              </Heading>
              <HStack spacing={6} display={{ base: 'none', md: 'flex' }}>
                <Link href="#features" color={textColor} _hover={{ color: accentColor }}>
                  Features
                </Link>
                <Link href="#pricing" color={textColor} _hover={{ color: accentColor }}>
                  Pricing
                </Link>
                <Link href="/changelog" color={textColor} _hover={{ color: accentColor }}>
                  Changelog
                </Link>
                {/* <Link href="#testimonials" color={textColor} _hover={{ color: accentColor }}>
                  Success Stories
                </Link> */}
              </HStack>
            </HStack>
            <HStack spacing={4}>
              <Text
                fontSize="sm"
                fontWeight="medium"
                color={colorMode === 'light' ? 'gray.600' : 'gray.300'}
                textAlign="right"
                minW="120px"
              >
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </Text>
              <IconButton
                icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
                variant="ghost"
                onClick={toggleColorMode}
                aria-label="Toggle color mode"
              />
              <Button variant="ghost" onClick={handleLogin}>
                Login
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Hero Section */}
      <Container maxW="7xl" py={20}>
        <VStack spacing={8} textAlign="center">
          <Badge colorScheme="blue" px={4} py={2} borderRadius="full" fontSize="sm">
            Simple • Fast • Effective
          </Badge>
          <Heading
            size="2xl"
            color={textColor}
            maxW="4xl"
            lineHeight="1.2"
          >
            Complete Business Management Platform
            <Text as="span" color={accentColor}> for Teams & Freelancers</Text>
          </Heading>
          <Text fontSize="xl" color={useColorModeValue('gray.600', 'gray.300')} maxW="2xl">
            Task management, time tracking, company verification, client management, and professional invoicing with payment collection. Everything you need to run your business efficiently.
          </Text>
          <HStack spacing={4} pt={4}>
            <Button
              size="lg"
              colorScheme="blue"
              onClick={handleSignup}
              rightIcon={<ArrowForwardIcon />}
            >
              Get Started Free
            </Button>
          </HStack>
        </VStack>
      </Container>

      {/* Features Section */}
      <Box id="features" py={20} bg={cardBg}>
        <Container maxW="7xl">
          <VStack spacing={16}>
            <VStack spacing={4} textAlign="center">
              <Heading size="xl" color={textColor}>
                Complete Business Solution
              </Heading>
              <Text fontSize="lg" color={useColorModeValue('gray.600', 'gray.300')} maxW="2xl">
                From task management to payment collection. Everything you need to organize, track, invoice, and get paid.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
              {features.map((feature, index) => (
                <Box
                  key={index}
                  bg={bgColor}
                  p={8}
                  borderRadius="xl"
                  boxShadow="lg"
                  border="1px"
                  borderColor={useColorModeValue('gray.200', 'gray.700')}
                  _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }}
                  transition="all 0.3s"
                >
                  <VStack spacing={4} align="start">
                    <Box
                      p={3}
                      bg={accentColor}
                      color="white"
                      borderRadius="lg"
                    >
                      <Icon as={feature.icon} boxSize={6} />
                    </Box>
                    <Heading size="md" color={textColor}>
                      {feature.title}
                    </Heading>
                    <Text color={useColorModeValue('gray.600', 'gray.300')}>
                      {feature.description}
                    </Text>
                    <Badge colorScheme="green" variant="subtle">
                      {feature.benefit}
                    </Badge>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Business Management Suite Section */}
      <Box py={20} bg={bgColor}>
        <Container maxW="7xl">
          <VStack spacing={16}>
            <VStack spacing={4} textAlign="center">
              <Badge colorScheme="purple" px={4} py={2} borderRadius="full" fontSize="sm">
                New in v2.5.0
              </Badge>
              <Heading size="xl" color={textColor}>
                Business Management Suite
              </Heading>
              <Text fontSize="lg" color={useColorModeValue('gray.600', 'gray.300')} maxW="3xl">
                Professional tools for company verification, client management, and automated invoicing with payment collection.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={12} maxW="6xl" w="full">
              {/* Company Verification */}
              <Box
                bg={cardBg}
                p={8}
                borderRadius="xl"
                border="1px"
                borderColor={useColorModeValue('gray.200', 'gray.700')}
              >
                <VStack spacing={6} align="start">
                  <HStack spacing={4}>
                    <Box
                      p={3}
                      bg="purple.500"
                      color="white"
                      borderRadius="lg"
                    >
                      <Icon as={ViewIcon} boxSize={6} />
                    </Box>
                    <VStack spacing={1} align="start">
                      <Heading size="md" color={textColor}>
                        Company Verification
                      </Heading>
                      <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')}>
                        Build trust with verified company profiles
                      </Text>
                    </VStack>
                  </HStack>

                  <VStack spacing={4} align="start" w="full">
                    <HStack spacing={3}>
                      <Icon as={CheckCircleIcon} color="green.500" boxSize={4} />
                      <Text fontSize="sm" color={textColor}>Email-based verification system</Text>
                    </HStack>
                    <HStack spacing={3}>
                      <Icon as={CheckCircleIcon} color="green.500" boxSize={4} />
                      <Text fontSize="sm" color={textColor}>Public company profiles with verification badges</Text>
                    </HStack>
                    <HStack spacing={3}>
                      <Icon as={CheckCircleIcon} color="green.500" boxSize={4} />
                      <Text fontSize="sm" color={textColor}>Company logo upload and management</Text>
                    </HStack>
                    <HStack spacing={3}>
                      <Icon as={CheckCircleIcon} color="green.500" boxSize={4} />
                      <Text fontSize="sm" color={textColor}>Industry categorization and location tracking</Text>
                    </HStack>
                    <HStack spacing={3}>
                      <Icon as={CheckCircleIcon} color="green.500" boxSize={4} />
                      <Text fontSize="sm" color={textColor}>Secure token-based company sharing</Text>
                    </HStack>
                  </VStack>
                </VStack>
              </Box>

              {/* Professional Invoicing */}
              <Box
                bg={cardBg}
                p={8}
                borderRadius="xl"
                border="1px"
                borderColor={useColorModeValue('gray.200', 'gray.700')}
              >
                <VStack spacing={6} align="start">
                  <HStack spacing={4}>
                    <Box
                      p={3}
                      bg="green.500"
                      color="white"
                      borderRadius="lg"
                    >
                      <Icon as={TriangleDownIcon} boxSize={6} />
                    </Box>
                    <VStack spacing={1} align="start">
                      <Heading size="md" color={textColor}>
                        Professional Invoicing
                      </Heading>
                      <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')}>
                        Automated invoicing with payment collection
                      </Text>
                    </VStack>
                  </HStack>

                  <VStack spacing={4} align="start" w="full">
                    <HStack spacing={3}>
                      <Icon as={CheckCircleIcon} color="green.500" boxSize={4} />
                      <Text fontSize="sm" color={textColor}>Convert time tracking to invoices</Text>
                    </HStack>
                    <HStack spacing={3}>
                      <Icon as={CheckCircleIcon} color="green.500" boxSize={4} />
                      <Text fontSize="sm" color={textColor}>Stripe payment integration</Text>
                    </HStack>
                    <HStack spacing={3}>
                      <Icon as={CheckCircleIcon} color="green.500" boxSize={4} />
                      <Text fontSize="sm" color={textColor}>Professional invoice email delivery</Text>
                    </HStack>
                    <HStack spacing={3}>
                      <Icon as={CheckCircleIcon} color="green.500" boxSize={4} />
                      <Text fontSize="sm" color={textColor}>Real-time payment status tracking</Text>
                    </HStack>
                    <HStack spacing={3}>
                      <Icon as={CheckCircleIcon} color="green.500" boxSize={4} />
                      <Text fontSize="sm" color={textColor}>Automated payment webhook processing</Text>
                    </HStack>
                  </VStack>
                </VStack>
              </Box>
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* ROI Calculator Section */}
      <Box py={20} bg={cardBg}>
        <Container maxW="7xl">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center">
              <Heading size="xl" color={textColor}>
                See the Impact
              </Heading>
              <Text fontSize="lg" color={useColorModeValue('gray.600', 'gray.300')}>
                How much time and money could your team save?
              </Text>
            </VStack>

            <Box
              bg={bgColor}
              p={8}
              borderRadius="xl"
              border="1px"
              borderColor={useColorModeValue('gray.200', 'gray.700')}
              maxW="4xl"
              w="full"
            >
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
                <VStack spacing={4}>
                  <Text fontSize="lg" fontWeight="bold" color={textColor}>
                    Team Size
                  </Text>
                  <Text fontSize="3xl" color={accentColor} fontWeight="bold">
                    5 people
                  </Text>
                </VStack>
                <VStack spacing={4}>
                  <Text fontSize="lg" fontWeight="bold" color={textColor}>
                    Time Saved
                  </Text>
                  <Text fontSize="3xl" color="green.500" fontWeight="bold">
                    3-5 hrs/week
                  </Text>
                </VStack>
                <VStack spacing={4}>
                  <Text fontSize="lg" fontWeight="bold" color={textColor}>
                    Annual Savings
                  </Text>
                  <Text fontSize="3xl" color="green.500" fontWeight="bold">
                    $91,000
                  </Text>
                </VStack>
              </SimpleGrid>
              <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')} textAlign="center" mt={6}>
                Based on average hourly rate of $35 and 4 hours saved per week per employee
              </Text>
            </Box>
          </VStack>
        </Container>
      </Box>

      {/* Project Invoicing Teaser Section */}
      <Box py={20} bg={bgColor}>
        <Container maxW="7xl">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center">
              <Badge colorScheme="purple" px={4} py={2} borderRadius="full" fontSize="sm">
                Pro Users
              </Badge>
              <Heading size="xl" color={textColor}>
                Professional Invoicing & Payment Collection
              </Heading>
              <Text fontSize="lg" color={useColorModeValue('gray.600', 'gray.300')} maxW="3xl">
                Transform your time tracking into professional invoices that get you paid faster.
                Automated payment collection with Stripe integration saves hours every month.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={12} maxW="6xl" w="full">
              {/* Left Column - Feature Showcase */}
              <VStack spacing={8} align="start">
                <Heading size="lg" color={textColor}>
                  Complete Business Workflow
                </Heading>

                {/* Feature Grid */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
                  <Box
                    bg={cardBg}
                    p={6}
                    borderRadius="xl"
                    border="1px"
                    borderColor={useColorModeValue('gray.200', 'gray.700')}
                    _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                    transition="all 0.3s"
                  >
                    <VStack spacing={4} align="start">
                      <Box
                        p={3}
                        bg="purple.500"
                        color="white"
                        borderRadius="lg"
                      >
                        <Icon as={TimeIcon} boxSize={5} />
                      </Box>
                      <VStack spacing={2} align="start">
                        <Text fontWeight="semibold" color={textColor} fontSize="md">
                          Time-to-Invoice Automation
                        </Text>
                        <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.300')}>
                          Convert tracked time into professional invoices in seconds
                        </Text>
                      </VStack>
                    </VStack>
                  </Box>

                  <Box
                    bg={cardBg}
                    p={6}
                    borderRadius="xl"
                    border="1px"
                    borderColor={useColorModeValue('gray.200', 'gray.700')}
                    _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                    transition="all 0.3s"
                  >
                    <VStack spacing={4} align="start">
                      <Box
                        p={3}
                        bg="green.500"
                        color="white"
                        borderRadius="lg"
                      >
                        <Icon as={CheckIcon} boxSize={5} />
                      </Box>
                      <VStack spacing={2} align="start">
                        <Text fontWeight="semibold" color={textColor} fontSize="md">
                          One-Click Payment Collection
                        </Text>
                        <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.300')}>
                          Stripe-powered payment links get you paid instantly
                        </Text>
                      </VStack>
                    </VStack>
                  </Box>

                  <Box
                    bg={cardBg}
                    p={6}
                    borderRadius="xl"
                    border="1px"
                    borderColor={useColorModeValue('gray.200', 'gray.700')}
                    _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                    transition="all 0.3s"
                  >
                    <VStack spacing={4} align="start">
                      <Box
                        p={3}
                        bg="blue.500"
                        color="white"
                        borderRadius="lg"
                      >
                        <Icon as={ViewIcon} boxSize={5} />
                      </Box>
                      <VStack spacing={2} align="start">
                        <Text fontWeight="semibold" color={textColor} fontSize="md">
                          Company Verification
                        </Text>
                        <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.300')}>
                          Build trust with verified company profiles and badges
                        </Text>
                      </VStack>
                    </VStack>
                  </Box>

                  <Box
                    bg={cardBg}
                    p={6}
                    borderRadius="xl"
                    border="1px"
                    borderColor={useColorModeValue('gray.200', 'gray.700')}
                    _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                    transition="all 0.3s"
                  >
                    <VStack spacing={4} align="start">
                      <Box
                        p={3}
                        bg="orange.500"
                        color="white"
                        borderRadius="lg"
                      >
                        <Icon as={LockIcon} boxSize={5} />
                      </Box>
                      <VStack spacing={2} align="start">
                        <Text fontWeight="semibold" color={textColor} fontSize="md">
                          Real-time Status Tracking
                        </Text>
                        <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.300')}>
                          Real-time tracking of invoice status and payments
                        </Text>
                      </VStack>
                    </VStack>
                  </Box>
                </SimpleGrid>
              </VStack>

              {/* Right Column - ROI Calculator & CTA */}
              <VStack spacing={8} align="stretch">
                {/* ROI Calculator */}
                <Box
                  bg={cardBg}
                  p={8}
                  borderRadius="xl"
                  border="1px"
                  borderColor={useColorModeValue('gray.200', 'gray.700')}
                  boxShadow="lg"
                >
                  <VStack spacing={6}>
                    <Heading size="md" color={textColor} textAlign="center">
                      Your Business ROI Calculator
                    </Heading>

                    <SimpleGrid columns={2} spacing={6} w="full">
                      <VStack spacing={3}>
                        <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')} textAlign="center">
                          Time Saved Monthly
                        </Text>
                        <Text fontSize="3xl" color="green.500" fontWeight="bold" textAlign="center">
                          4.5 hrs
                        </Text>
                        <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')} textAlign="center">
                          vs manual invoicing
                        </Text>
                      </VStack>

                      <VStack spacing={3}>
                        <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')} textAlign="center">
                          Annual Savings
                        </Text>
                        <Text fontSize="3xl" color="green.500" fontWeight="bold" textAlign="center">
                          $2,340
                        </Text>
                        <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')} textAlign="center">
                          at $35/hour rate
                        </Text>
                      </VStack>

                      <VStack spacing={3}>
                        <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')} textAlign="center">
                          Pro Plan Cost
                        </Text>
                        <Text fontSize="2xl" color="purple.500" fontWeight="bold" textAlign="center">
                          $180/year
                        </Text>
                        <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')} textAlign="center">
                          $15/month per user
                        </Text>
                      </VStack>

                      <VStack spacing={3}>
                        <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')} textAlign="center">
                          Net ROI
                        </Text>
                        <Text fontSize="3xl" color="green.500" fontWeight="bold" textAlign="center">
                          13x
                        </Text>
                        <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')} textAlign="center">
                          return on investment
                        </Text>
                      </VStack>
                    </SimpleGrid>

                    <Box
                      bg="green.50"
                      p={4}
                      borderRadius="lg"
                      border="1px"
                      borderColor="green.200"
                      w="full"
                    >
                      <Text fontSize="sm" color="green.800" textAlign="center" fontWeight="medium">
                        💰 You save $2,160 more than you spend annually
                      </Text>
                    </Box>
                  </VStack>
                </Box>

                {/* CTA Section */}
                <VStack spacing={6} p={8} bg={accentColor} borderRadius="xl" textAlign="center">
                  <VStack spacing={4}>
                    <Heading size="md" color="white">
                      Ready to Get Paid Faster?
                    </Heading>
                  </VStack>

                  <VStack spacing={4} w="full">
                    <Button
                      size="lg"
                      bg="white"
                      color={accentColor}
                      _hover={{ bg: 'gray.100' }}
                      onClick={handleGetProNow}
                      rightIcon={isCreatingPaymentLink ? <Spinner size="sm" /> : <ArrowForwardIcon />}
                      isLoading={isCreatingPaymentLink}
                      loadingText="Setting up..."
                      w="full"
                    >
                      Get Pro Now</Button>
                    <Text fontSize="xs" color="blue.100">
                      30-day money-back guarantee • Cancel anytime
                    </Text>
                  </VStack>
                </VStack>
              </VStack>
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Box id="pricing" py={20} bg={cardBg}>
        <Container maxW="7xl">
          <VStack spacing={16}>
            <VStack spacing={4} textAlign="center">
              <Heading size="xl" color={textColor}>
                Simple, Transparent Pricing
              </Heading>
              <Text fontSize="lg" color={useColorModeValue('gray.600', 'gray.300')} maxW="2xl">
                Start free, upgrade when you're ready. No hidden fees, no surprises.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} maxW="4xl" w="full">
              {/* Free Plan */}
              <Box
                bg={bgColor}
                p={8}
                borderRadius="xl"
                border="1px"
                borderColor={useColorModeValue('gray.200', 'gray.700')}
                textAlign="center"
                position="relative"
              >
                <VStack spacing={6}>
                  <VStack spacing={2}>
                    <Text fontSize="lg" fontWeight="semibold" color={textColor}>
                      Free
                    </Text>
                    <Text fontSize="3xl" fontWeight="bold" color={textColor}>
                      $0
                    </Text>
                    <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')}>
                      Forever
                    </Text>
                  </VStack>

                  <VStack spacing={4} align="start" w="full">
                    <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.300')}>
                      Perfect for getting started
                    </Text>
                    <VStack spacing={3} align="start" w="full">
                      <HStack spacing={3}>
                        <Icon as={CheckCircleIcon} color="green.500" boxSize={4} />
                        <Text fontSize="sm" color={textColor}>Up to 3 clients</Text>
                      </HStack>
                      <HStack spacing={3}>
                        <Icon as={CheckCircleIcon} color="green.500" boxSize={4} />
                        <Text fontSize="sm" color={textColor}>Up to 5 projects</Text>
                      </HStack>
                      <HStack spacing={3}>
                        <Icon as={CheckCircleIcon} color="green.500" boxSize={4} />
                        <Text fontSize="sm" color={textColor}>Up to 10 tasks</Text>
                      </HStack>
                      <HStack spacing={3}>
                        <Icon as={CheckCircleIcon} color="green.500" boxSize={4} />
                        <Text fontSize="sm" color={textColor}>Time tracking</Text>
                      </HStack>
                      <HStack spacing={3}>
                        <Icon as={CheckCircleIcon} color="green.500" boxSize={4} />
                        <Text fontSize="sm" color={textColor}>Manual invoicing</Text>
                      </HStack>
                      <HStack spacing={3}>
                        <Icon as={CheckCircleIcon} color="green.500" boxSize={4} />
                        <Text fontSize="sm" color={textColor}>In app feedback</Text>
                      </HStack>

                    </VStack>
                  </VStack>

                  <Button
                    variant="outline"
                    colorScheme="blue"
                    w="full"
                    onClick={handleSignup}
                  >
                    Get Started Free
                  </Button>
                </VStack>
              </Box>

              {/* Pro Plan */}
              <Box
                bg={bgColor}
                p={8}
                borderRadius="xl"
                border="2px"
                borderColor={accentColor}
                textAlign="center"
                position="relative"
                _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }}
                transition="all 0.3s"
              >
                <Badge
                  colorScheme="blue"
                  position="absolute"
                  top={-3}
                  left="50%"
                  transform="translateX(-50%)"
                  px={3}
                  py={1}
                  borderRadius="full"
                  fontSize="sm"
                >
                  Most Popular
                </Badge>

                <VStack spacing={6}>
                  <VStack spacing={2}>
                    <Text fontSize="lg" fontWeight="semibold" color={textColor}>
                      Pro
                    </Text>
                    <Text fontSize="3xl" fontWeight="bold" color={accentColor}>
                      $15
                    </Text>
                    <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')}>
                      per user/month
                    </Text>
                  </VStack>

                  <VStack spacing={4} align="start" w="full">
                    <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.300')}>
                      Everything you need for your team
                    </Text>
                    <VStack spacing={3} align="start" w="full">
                      <HStack spacing={3}>
                        <Icon as={CheckCircleIcon} color="green.500" boxSize={4} />
                        <Text fontSize="sm" color={textColor}>Unlimited tasks, projects and clients</Text>
                      </HStack>
                      <HStack spacing={3}>
                        <Icon as={CheckCircleIcon} color="green.500" boxSize={4} />
                        <Text fontSize="sm" color={textColor}>Company verification & management</Text>
                      </HStack>
                      <HStack spacing={3}>
                        <Icon as={CheckCircleIcon} color="green.500" boxSize={4} />
                        <Text fontSize="sm" color={textColor}>Professional invoicing with Stripe</Text>
                      </HStack>
                      <HStack spacing={3}>
                        <Icon as={CheckCircleIcon} color="green.500" boxSize={4} />
                        <Text fontSize="sm" color={textColor}>Automated payment collection</Text>
                      </HStack>
                      <HStack spacing={3}>
                        <Icon as={CheckCircleIcon} color="green.500" boxSize={4} />
                        <Text fontSize="sm" color={textColor}>Priority support</Text>
                      </HStack>
                    </VStack>
                  </VStack>

                  {showEmailInput && !user ? (
                    <VStack spacing={3} w="full">
                      <Input
                        placeholder="Enter your email address"
                        value={anonymousEmail}
                        onChange={(e) => setAnonymousEmail(e.target.value)}
                        type="email"
                        size="md"
                      />
                      <Button
                        colorScheme="blue"
                        w="full"
                        onClick={handleGetProNow}
                        rightIcon={isCreatingPaymentLink ? <Spinner size="sm" /> : <ArrowForwardIcon />}
                        isLoading={isCreatingPaymentLink}
                        loadingText="Creating..."
                        isDisabled={!anonymousEmail.trim()}
                      >
                        Get Pro Now
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowEmailInput(false)}
                      >
                        Cancel
                      </Button>
                    </VStack>
                  ) : (
                    <Button
                      colorScheme="blue"
                      w="full"
                      onClick={handleGetProNow}
                      rightIcon={isCreatingPaymentLink ? <Spinner size="sm" /> : <ArrowForwardIcon />}
                      isLoading={isCreatingPaymentLink}
                      loadingText="Creating..."
                    >
                      Get Pro Now
                    </Button>
                  )}
                </VStack>
              </Box>
            </SimpleGrid>

            <VStack spacing={4} textAlign="center">
              <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')}>
                Pro plans include a 30 day money back guarantee.
              </Text>
              <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')}>
                Need a custom plan for your team? <Link color="blue.500" href="https://x.com/benvspak" isExternal>Contact us</Link>
              </Text>
            </VStack>
          </VStack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={20} bg={accentColor}>
        <Container maxW="7xl">
          <VStack spacing={8} textAlign="center">
            <Heading size="xl" color="white">
              Ready to Get More Done?
            </Heading>
            <Text fontSize="lg" color="blue.100" maxW="2xl">
              Complete business management solution for freelancers and small teams. Stop juggling tasks in your head.
              Get organized, track time, manage clients, and get paid with PopTask. Start free and see the difference in minutes.
            </Text>
            <HStack spacing={4}>
              <Button
                size="lg"
                bg="white"
                color={accentColor}
                _hover={{ bg: 'gray.100' }}
                onClick={handleSignup}
                rightIcon={<ArrowForwardIcon />}
              >
                Start Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                color="white"
                borderColor="white"
                _hover={{ bg: 'whiteAlpha.200' }}
                onClick={handleLogin}
              >
                Login
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Footer */}
      <Box py={12} bg={useColorModeValue('gray.50', 'gray.800')}>
        <Container maxW="7xl">
          <Flex
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align={{ base: 'center', md: 'center' }}
            spacing={8}
          >
            <VStack spacing={4} align={{ base: 'center', md: 'start' }}>
              <Heading size="md" color={accentColor}>
                PopTask
              </Heading>
              <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                Complete business management that actually works
              </Text>
            </VStack>
            <HStack spacing={6}>
              <Link href="#features" color={useColorModeValue('gray.600', 'gray.400')} _hover={{ color: accentColor }}>
                Features
              </Link>
              <Link href="#pricing" color={useColorModeValue('gray.600', 'gray.400')} _hover={{ color: accentColor }}>
                Pricing
              </Link>
              <Link href="/changelog" color={useColorModeValue('gray.600', 'gray.400')} _hover={{ color: accentColor }}>
                Changelog
              </Link>
              {/* <Link href="#testimonials" color={useColorModeValue('gray.600', 'gray.400')} _hover={{ color: accentColor }}>
                Success Stories
              </Link> */}
            </HStack>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
};

export default Homepage;
