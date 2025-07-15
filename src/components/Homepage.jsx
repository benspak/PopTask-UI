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
  Link,
  IconButton,
  useToast,
  Spinner,
  Image,
} from '@chakra-ui/react';
import {
  CheckIcon,
  CheckCircleIcon,
  TimeIcon,
  CalendarIcon,
  StarIcon,
  ArrowForwardIcon,
  SunIcon,
  MoonIcon,
  ViewIcon,
  TriangleDownIcon,
  SettingsIcon,
  LockIcon,
  EditIcon,
} from '@chakra-ui/icons';
import { Input } from '@chakra-ui/react';
import apiService from '../services/api';
import dashboardImg from '../assets/dashboard-screenshot.png';
import invoicesImg from '../assets/invoices-screenshot.png';
import tasksImg from '../assets/tasks-screenshot.png';

const Homepage = () => {
  const { colorMode, toggleColorMode } = useColorMode();
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
      title: 'Task Management',
      description: 'Organize tasks by day with calendar view',
      benefit: 'Save 2-3 hours/week'
    },
    {
      icon: ViewIcon,
      title: 'Company Verification',
      description: 'Build trust with verified company profiles',
      benefit: 'Establish credibility'
    },
    {
      icon: SettingsIcon,
      title: 'Client Management',
      description: 'Manage clients and track project progress',
      benefit: 'Reduce coordination by 40%'
    },
    {
      icon: TriangleDownIcon,
      title: 'Professional Invoicing',
      description: 'Convert time tracking to invoices',
      benefit: 'Save 4-5 hours/month'
    },
    {
      icon: LockIcon,
      title: 'Secure Sharing',
      description: 'Share tasks and projects with team members',
      benefit: 'Cut meeting time in half'
    },
    {
      icon: TimeIcon,
      title: 'Time Tracking',
      description: 'Built-in time tracking with session management',
      benefit: 'Eliminate 25% time waste'
    },
    {
      icon: ViewIcon,
      title: 'Team Management',
      description: 'Create and manage teams with up to 5 members',
      benefit: 'Improve collaboration by 60%',
      isPro: true
    },
    {
      icon: EditIcon,
      title: 'Proposal Templates',
      description: 'Create professional proposal templates with variables',
      benefit: 'Save 3-4 hours per proposal',
      isPro: true
    },
  ];

  const handleSignup = () => {
    window.location.href = '/register';
  };

  const handleLogin = () => {
    window.location.href = '/login';
  };

  const handleGetProNow = async () => {
    if (!showEmailInput) {
      setShowEmailInput(true);
      return;
    }

    setIsCreatingPaymentLink(true);

    try {
      const userEmail = anonymousEmail.trim() || undefined;
      const response = await apiService.createProPaymentLink('subscription', userEmail);

      if (response.success && response.url) {
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
              <Image
                src={colorMode === 'dark' ? '/logos/logo-dark-mode.svg' : '/logos/logo-light-mode.svg'}
                alt="PopVia"
                height="32px"
                width="auto"
                cursor="pointer"
                onClick={() => window.location.href = '/'}
              />
              <HStack spacing={6} display={{ base: 'none', md: 'flex' }}>
                <Link href="#features" color={textColor} _hover={{ color: accentColor }}>
                  Features
                </Link>
                <Link href="#pricing" color={textColor} _hover={{ color: accentColor }}>
                  Pricing
                </Link>
                <Link href="/jobs" color={textColor} _hover={{ color: accentColor }}>
                  Jobs
                </Link>
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
          <HStack spacing={3}>
            <Badge colorScheme="orange" px={4} py={2} borderRadius="full" fontSize="sm">
              Open BETA
            </Badge>
          </HStack>
          <Heading
            size="2xl"
            color={textColor}
            maxW="4xl"
            lineHeight="1.2"
          >
            Business Management Software
            <Text as="span" color={accentColor}> for Freelancers and Small Businesses</Text>
          </Heading>
          <Text fontSize="xl" color={useColorModeValue('gray.600', 'gray.300')} maxW="2xl">
            Task management, time tracking, invoicing, and payment collection.
          </Text>
          <Text fontSize="md" color={useColorModeValue('gray.500', 'gray.400')} maxW="2xl">
            🚀 Currently in beta - Join early users and help shape the future of business management
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

      {/* Screenshots Section */}
      <Container maxW="7xl" py={10}>
        <VStack spacing={6}>
          <Heading size="lg" color={textColor} textAlign="center">
            See PopVia in Action
          </Heading>
          <Text fontSize="md" color={useColorModeValue('gray.600', 'gray.300')} textAlign="center" maxW="2xl">
            Real screenshots from the app—what you see is what you get.
          </Text>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full">
            <VStack spacing={3}>
              <Image
                src={dashboardImg}
                alt="Dashboard screenshot"
                borderRadius="lg"
                boxShadow="lg"
                w="100%"
                maxH="500px"
                objectFit="contain"
              />
              <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                Dashboard: See your tasks, projects, and progress at a glance.
              </Text>
            </VStack>
            <VStack spacing={3}>
              <Image
                src={invoicesImg}
                alt="Invoices screenshot"
                borderRadius="lg"
                boxShadow="lg"
                w="100%"
                maxH="500px"
                objectFit="contain"
              />
              <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                Invoices: Manage and track your invoices with ease.
              </Text>
            </VStack>
            <VStack spacing={3}>
              <Image
                src={tasksImg}
                alt="Tasks screenshot"
                borderRadius="lg"
                boxShadow="lg"
                w="100%"
                maxH="500px"
                objectFit="contain"
              />
              <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                Tasks: Organize, complete, and track your work efficiently.
              </Text>
            </VStack>
          </SimpleGrid>
        </VStack>
      </Container>

      {/* Features Section */}
      <Box id="features" py={20} bg={cardBg}>
        <Container maxW="7xl">
          <VStack spacing={16}>
            <VStack spacing={4} textAlign="center">
              <Heading size="xl" color={textColor}>
                Need Billing and Collaboration?
              </Heading>
              <Text fontSize="lg" color={useColorModeValue('gray.600', 'gray.300')} maxW="2xl">
                From task management to payment collection.
              </Text>
              <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')} maxW="2xl">
                🧪 Beta features available to early adopters
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
                  position="relative"
                >
                  {feature.isPro && (
                    <Badge
                      colorScheme="blue"
                      position="absolute"
                      top={4}
                      right={4}
                      px={2}
                      py={1}
                      borderRadius="full"
                      fontSize="xs"
                    >
                      <StarIcon boxSize={2} mr={1} />
                      Pro
                    </Badge>
                  )}
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

      {/* ROI Section */}
      <Box py={20} bg={bgColor}>
        <Container maxW="7xl">
          <VStack spacing={8} maxW="4xl" mx="auto">
            <VStack spacing={4} textAlign="center">
              <Heading size="xl" color={textColor}>
                Your Business ROI
              </Heading>
              <Text fontSize="lg" color={useColorModeValue('gray.600', 'gray.300')} maxW="2xl">
                See how much time and money you'll save with PopVia
              </Text>
            </VStack>

            {/* ROI Calculator */}
            <Box
              bg={cardBg}
              p={8}
              borderRadius="xl"
              border="1px"
              borderColor={useColorModeValue('gray.200', 'gray.700')}
              boxShadow="lg"
              w="full"
            >
              <VStack spacing={6}>
                <Heading size="md" color={textColor} textAlign="center">
                  Your Business ROI
                </Heading>

                <VStack spacing={4} w="full">
                  <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.300')} fontWeight="medium">
                    Weekly Time & Revenue Impact:
                  </Text>

                  <SimpleGrid columns={1} spacing={3} w="full">
                    <HStack justify="space-between" w="full">
                      <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>
                        Task Organization & Prioritization
                      </Text>
                      <Text fontSize="xs" color="green.500" fontWeight="medium">
                        +3.5 hrs/week
                      </Text>
                    </HStack>

                    <HStack justify="space-between" w="full">
                      <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>
                        Client Communication & Updates
                      </Text>
                      <Text fontSize="xs" color="green.500" fontWeight="medium">
                        +2.8 hrs/week
                      </Text>
                    </HStack>

                    <HStack justify="space-between" w="full">
                      <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>
                        Invoice Generation & Payment
                      </Text>
                      <Text fontSize="xs" color="green.500" fontWeight="medium">
                        +1.5 hrs/week
                      </Text>
                    </HStack>

                    <HStack justify="space-between" w="full">
                      <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>
                        Project Management & Reporting
                      </Text>
                      <Text fontSize="xs" color="green.500" fontWeight="medium">
                        +1.0 hrs/week
                      </Text>
                    </HStack>
                  </SimpleGrid>

                  <Box
                    bg="green.50"
                    p={3}
                    borderRadius="lg"
                    border="1px"
                    borderColor="green.200"
                    w="full"
                  >
                    <HStack justify="space-between" w="full">
                      <Text fontSize="sm" color="green.800" fontWeight="bold">
                        Total Weekly Time Savings
                      </Text>
                      <Text fontSize="lg" color="green.600" fontWeight="bold">
                        8.8 hrs
                      </Text>
                    </HStack>
                  </Box>
                </VStack>

                <SimpleGrid columns={2} spacing={6} w="full">
                  <VStack spacing={3}>
                    <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')} textAlign="center">
                      Monthly Time Savings
                    </Text>
                    <Text fontSize="3xl" color="green.500" fontWeight="bold" textAlign="center">
                      35.2 hrs
                    </Text>
                    <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')} textAlign="center">
                      vs manual processes
                    </Text>
                  </VStack>

                  <VStack spacing={3}>
                    <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')} textAlign="center">
                      Annual Time Value
                    </Text>
                    <Text fontSize="3xl" color="green.500" fontWeight="bold" textAlign="center">
                      $14,784
                    </Text>
                    <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')} textAlign="center">
                      at $35/hour rate
                    </Text>
                  </VStack>
                </SimpleGrid>
              </VStack>
            </Box>
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
                Start free, upgrade when you're ready. No hidden fees.
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
                    <VStack spacing={3} align="start" w="full">
                      <HStack spacing={3}>
                        <Icon as={CheckCircleIcon} color="green.500" boxSize={4} />
                        <Text fontSize="sm" color={textColor}>Unlimited everything</Text>
                      </HStack>
                      <HStack spacing={3}>
                        <Icon as={CheckCircleIcon} color="green.500" boxSize={4} />
                        <Text fontSize="sm" color={textColor}>Team management</Text>
                      </HStack>
                      <HStack spacing={3}>
                        <Icon as={CheckCircleIcon} color="green.500" boxSize={4} />
                        <Text fontSize="sm" color={textColor}>Proposal templates</Text>
                      </HStack>
                      <HStack spacing={3}>
                        <Icon as={CheckCircleIcon} color="green.500" boxSize={4} />
                        <Text fontSize="sm" color={textColor}>Company verification</Text>
                      </HStack>
                      <HStack spacing={3}>
                        <Icon as={CheckCircleIcon} color="green.500" boxSize={4} />
                        <Text fontSize="sm" color={textColor}>Professional invoicing</Text>
                      </HStack>
                      <HStack spacing={3}>
                        <Icon as={CheckCircleIcon} color="green.500" boxSize={4} />
                        <Text fontSize="sm" color={textColor}>Automated payments</Text>
                      </HStack>
                      <HStack spacing={3}>
                        <Icon as={CheckCircleIcon} color="green.500" boxSize={4} />
                        <Text fontSize="sm" color={textColor}>Priority support</Text>
                      </HStack>
                    </VStack>
                  </VStack>

                  {showEmailInput ? (
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
                Need a custom plan? <Link color={accentColor} href="https://x.com/benvspak" isExternal>Contact us</Link>
              </Text>
            </VStack>
          </VStack>
        </Container>
      </Box>

      {/* Final CTA */}
      <Box py={20} bg={accentColor}>
        <Container maxW="7xl">
          <VStack spacing={8} textAlign="center">
            <Heading size="xl" color="white">
              Ready to Get More Done?
            </Heading>
                          <Text fontSize="lg" color="blue.100" maxW="2xl">
                Complete business management solution for freelancers and small teams. Start free and see the difference.
              </Text>
              <Text fontSize="sm" color="blue.200" maxW="2xl">
                🚀 Beta users get exclusive early access to new features
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
                PopVia
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
              <Link href="/jobs" color={useColorModeValue('gray.600', 'gray.400')} _hover={{ color: accentColor }}>
                Jobs
              </Link>
            </HStack>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
};

export default Homepage;
