import React from 'react';
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
} from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext';

const Homepage = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { login, register } = useAuth();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');
  const accentColor = useColorModeValue('blue.500', 'blue.300');
  const cardBg = useColorModeValue('gray.50', 'gray.800');

  const features = [
    {
      icon: CalendarIcon,
      title: 'Smart Calendar View',
      description: 'Organize tasks by day of the week with our intuitive calendar interface. See your workload at a glance and plan efficiently.',
      benefit: 'Save 2-3 hours per week on task planning'
    },
    {
      icon: StarIcon,
      title: 'Project Management',
      description: 'Group tasks by projects with color-coded organization. Keep related work together and track progress seamlessly.',
      benefit: 'Reduce project coordination time by 40%'
    },
    {
      icon: AtSignIcon,
      title: 'Team Collaboration',
      description: 'Share tasks and projects with team members. Real-time updates keep everyone on the same page.',
      benefit: 'Cut meeting time in half with better visibility'
    },
    {
      icon: CheckIcon,
      title: 'Task Automation',
      description: 'AI-powered task suggestions and smart tagging. Let our system help you organize and prioritize work.',
      benefit: 'Automate 30% of routine task management'
    },
    {
      icon: TimeIcon,
      title: 'Time Tracking',
      description: 'Built-in time tracking helps you understand where time goes. Identify bottlenecks and optimize workflows.',
      benefit: 'Identify and eliminate 25% of time waste'
    },
    {
      icon: InfoIcon,
      title: 'ROI Analytics',
      description: 'Track productivity improvements and time savings. See the real business impact of better task management.',
      benefit: 'Measure and prove productivity gains'
    }
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
            Stop Wasting Time on
            <Text as="span" color={accentColor}> Task Management</Text>
          </Heading>
          <Text fontSize="xl" color={useColorModeValue('gray.600', 'gray.300')} maxW="2xl">
            PopTask is the simplest way to organize tasks and get more done.
            Teams save 10+ hours per week with our streamlined approach.
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
                Everything You Need, Nothing You Don't
              </Heading>
              <Text fontSize="lg" color={useColorModeValue('gray.600', 'gray.300')} maxW="2xl">
                We built PopTask to do one thing really well: help you organize tasks and get more done.
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

      {/* ROI Calculator Section */}
      <Box py={20} bg={bgColor}>
        <Container maxW="7xl">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center">
              <Heading size="xl" color={textColor}>
                See the Impact
              </Heading>
              <Text fontSize="lg" color={useColorModeValue('gray.600', 'gray.300')}>
                How much time could your team save?
              </Text>
            </VStack>

            <Box
              bg={cardBg}
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
                    10 people
                  </Text>
                </VStack>
                <VStack spacing={4}>
                  <Text fontSize="lg" fontWeight="bold" color={textColor}>
                    Time Saved
                  </Text>
                  <Text fontSize="3xl" color="green.500" fontWeight="bold">
                    10 hrs/week
                  </Text>
                </VStack>
                <VStack spacing={4}>
                  <Text fontSize="lg" fontWeight="bold" color={textColor}>
                    Annual Savings
                  </Text>
                  <Text fontSize="3xl" color="green.500" fontWeight="bold">
                    $156,000
                  </Text>
                </VStack>
              </SimpleGrid>
              <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')} textAlign="center" mt={6}>
                Based on average hourly rate of $30 and 10 hours saved per week per employee
              </Text>
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
                        <Text fontSize="sm" color={textColor}>Up to 10 tasks</Text>
                      </HStack>
                      <HStack spacing={3}>
                        <Icon as={CheckCircleIcon} color="green.500" boxSize={4} />
                        <Text fontSize="sm" color={textColor}>Basic task management</Text>
                      </HStack>
                      <HStack spacing={3}>
                        <Icon as={CheckCircleIcon} color="green.500" boxSize={4} />
                        <Text fontSize="sm" color={textColor}>Mobile responsive</Text>
                      </HStack>
                      <HStack spacing={3}>
                        <Icon as={CheckCircleIcon} color="green.500" boxSize={4} />
                        <Text fontSize="sm" color={textColor}>Email support</Text>
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
                      $50
                    </Text>
                    <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')}>
                      per month
                    </Text>
                    <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')} fontWeight="medium">
                      for teams of 10 or less
                    </Text>
                  </VStack>

                  <VStack spacing={4} align="start" w="full">
                    <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.300')}>
                      Everything you need for your team
                    </Text>
                    <VStack spacing={3} align="start" w="full">
                      <HStack spacing={3}>
                        <Icon as={CheckCircleIcon} color="green.500" boxSize={4} />
                        <Text fontSize="sm" color={textColor}>Unlimited tasks</Text>
                      </HStack>
                      <HStack spacing={3}>
                        <Icon as={CheckCircleIcon} color="green.500" boxSize={4} />
                        <Text fontSize="sm" color={textColor}>All features included</Text>
                      </HStack>
                      <HStack spacing={3}>
                        <Icon as={CheckCircleIcon} color="green.500" boxSize={4} />
                        <Text fontSize="sm" color={textColor}>Project organization</Text>
                      </HStack>
                      <HStack spacing={3}>
                        <Icon as={CheckCircleIcon} color="green.500" boxSize={4} />
                        <Text fontSize="sm" color={textColor}>Priority support</Text>
                      </HStack>
                      <HStack spacing={3}>
                        <Icon as={CheckCircleIcon} color="green.500" boxSize={4} />
                        <Text fontSize="sm" color={textColor}>Team collaboration</Text>
                      </HStack>
                      <HStack spacing={3}>
                        <Icon as={CheckCircleIcon} color="green.500" boxSize={4} />
                        <Text fontSize="sm" color={textColor}>Advanced analytics</Text>
                      </HStack>
                      <HStack spacing={3}>
                        <Icon as={CheckCircleIcon} color="green.500" boxSize={4} />
                        <Text fontSize="sm" color={textColor}>Up to 10 team members</Text>
                      </HStack>
                    </VStack>
                  </VStack>

                  <Button
                    colorScheme="blue"
                    w="full"
                    onClick={handleSignup}
                    rightIcon={<ArrowForwardIcon />}
                  >
                    Start Pro Trial
                  </Button>
                </VStack>
              </Box>
            </SimpleGrid>

            <VStack spacing={4} textAlign="center">
              <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')}>
                All plans include a 30 day moneyback guarantee. Cancel anytime.
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
              Stop juggling tasks in your head. Get organized and focused with PopTask.
              Start free and see the difference in minutes.
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
                Simple task management that actually works
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
