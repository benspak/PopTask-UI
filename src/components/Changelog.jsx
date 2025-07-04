import React from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Badge,
  List,
  ListItem,
  ListIcon,
  Divider,
  useColorModeValue,
  Link,
  HStack,
  Icon,
} from '@chakra-ui/react';
import {
  CheckCircleIcon,
  InfoIcon,
  WarningIcon,
  StarIcon,
  ExternalLinkIcon
} from '@chakra-ui/icons';

const Changelog = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'gray.200');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  const changelogData = [
    {
      version: '2.2.0',
      date: 'April 27, 2025',
      title: 'Production-Ready Release',
      description: 'Complete task management platform with enterprise-grade features',
      type: 'major',
      changes: [
        {
          type: 'feature',
          items: [
            'Complete user authentication system with JWT tokens',
            'Email verification and password reset functionality',
            'Project-based task organization with unlimited projects',
            'Advanced task filtering and search capabilities',
            'File upload system with 10MB limit and thumbnails',
            'Task sharing with public links and user permissions',
            'Real-time collaboration features',
            'Progressive Web App (PWA) with offline support',
            'Responsive design optimized for mobile and desktop',
            'Dark theme with modern UI/UX design',
            'User limits and upgrade prompts for monetization',
            'Comprehensive API with rate limiting and security'
          ]
        },
        {
          type: 'improvement',
          items: [
            'Enhanced security with account locking and rate limiting',
            'Improved performance with optimized database queries',
            'Better error handling and user feedback',
            'Streamlined authentication flow with auto-login',
            'Enhanced mobile responsiveness and touch interactions',
            'Optimized bundle size and loading times',
            'Comprehensive logging and monitoring'
          ]
        },
        {
          type: 'fix',
          items: [
            'Fixed authentication token validation issues',
            'Resolved file upload and download problems',
            'Corrected task sharing and permission bugs',
            'Fixed mobile layout and navigation issues',
            'Resolved offline/online synchronization problems',
            'Corrected email verification flow issues'
          ]
        }
      ]
    },
    {
      version: '2.1.0',
      date: 'April 20, 2025',
      title: 'Password Reset & Enhanced Security',
      description: 'Major security improvements and user experience enhancements',
      type: 'major',
      changes: [
        {
          type: 'feature',
          items: [
            'Complete password reset functionality with email verification',
            'Enhanced password strength validation with visual indicators',
            'Improved error handling for authentication flows',
            'Better user feedback for password requirements'
          ]
        },
        {
          type: 'improvement',
          items: [
            'Streamlined authentication process',
            'Enhanced email templates with better styling',
            'Improved form validation and error messages',
            'Better mobile responsiveness for auth pages'
          ]
        },
        {
          type: 'fix',
          items: [
            'Fixed password reset link redirection issue',
            'Resolved authentication token validation problems',
            'Fixed email verification flow bugs',
            'Corrected form submission error handling'
          ]
        }
      ]
    },
    {
      version: '2.0.0',
      date: 'April 15, 2025',
      title: 'Task Management Overhaul',
      description: 'Complete redesign of the task management system with new features',
      type: 'major',
      changes: [
        {
          type: 'feature',
          items: [
            'New calendar view for better task scheduling',
            'Advanced task filtering and search capabilities',
            'Task sharing with external users via secure links',
            'Real-time collaboration features',
            'Project-based task organization',
            'Task priority levels and due date management'
          ]
        },
        {
          type: 'improvement',
          items: [
            'Redesigned user interface with modern dark theme',
            'Improved mobile responsiveness',
            'Enhanced performance and loading times',
            'Better data synchronization across devices'
          ]
        },
        {
          type: 'fix',
          items: [
            'Fixed task creation and editing bugs',
            'Resolved data persistence issues',
            'Corrected timezone handling in calendar view',
            'Fixed sharing link generation problems'
          ]
        }
      ]
    },
    {
      version: '1.5.0',
      date: 'April 10, 2025',
      title: 'User Management & Analytics',
      description: 'Enhanced user management features and productivity analytics',
      type: 'minor',
      changes: [
        {
          type: 'feature',
          items: [
            'User profile management and customization',
            'Productivity analytics and reporting',
            'Team collaboration tools',
            'Advanced user permissions system'
          ]
        },
        {
          type: 'improvement',
          items: [
            'Improved dashboard performance',
            'Enhanced data visualization',
            'Better user onboarding experience'
          ]
        },
        {
          type: 'fix',
          items: [
            'Fixed user profile update issues',
            'Resolved analytics data accuracy problems',
            'Corrected permission system bugs'
          ]
        }
      ]
    },
    {
      version: '1.4.0',
      date: 'March 28, 2025',
      title: 'Email Integration & Notifications',
      description: 'Email verification system and notification improvements',
      type: 'minor',
      changes: [
        {
          type: 'feature',
          items: [
            'Email verification system for new accounts',
            'Email notifications for task updates',
            'Resend email service integration',
            'Customizable notification preferences'
          ]
        },
        {
          type: 'improvement',
          items: [
            'Enhanced email templates',
            'Improved notification delivery system',
            'Better email deliverability'
          ]
        },
        {
          type: 'fix',
          items: [
            'Fixed email verification flow',
            'Resolved notification delivery issues',
            'Corrected email template rendering'
          ]
        }
      ]
    },
    {
      version: '1.3.0',
      date: 'March 15, 2025',
      title: 'API & Backend Improvements',
      description: 'Enhanced backend performance and API reliability',
      type: 'minor',
      changes: [
        {
          type: 'feature',
          items: [
            'Enhanced REST API with better error handling',
            'Rate limiting for improved security',
            'Comprehensive API documentation',
            'Improved data validation'
          ]
        },
        {
          type: 'improvement',
          items: [
            'Better database query optimization',
            'Enhanced error logging and monitoring',
            'Improved API response times'
          ]
        },
        {
          type: 'fix',
          items: [
            'Fixed API authentication issues',
            'Resolved database connection problems',
            'Corrected data validation errors'
          ]
        }
      ]
    },
    {
      version: '1.2.0',
      date: 'March 1, 2025',
      title: 'Authentication & Security',
      description: 'Enhanced security features and authentication system',
      type: 'minor',
      changes: [
        {
          type: 'feature',
          items: [
            'JWT-based authentication system',
            'Account lockout protection',
            'Enhanced password security requirements',
            'Session management improvements'
          ]
        },
        {
          type: 'improvement',
          items: [
            'Better security headers',
            'Improved password hashing',
            'Enhanced login attempt tracking'
          ]
        },
        {
          type: 'fix',
          items: [
            'Fixed authentication token issues',
            'Resolved session persistence problems',
            'Corrected security vulnerability'
          ]
        }
      ]
    },
    {
      version: '1.1.0',
      date: 'February 15, 2025',
      title: 'UI/UX Improvements',
      description: 'User interface enhancements and experience improvements',
      type: 'minor',
      changes: [
        {
          type: 'feature',
          items: [
            'Dark mode support',
            'Responsive design improvements',
            'Enhanced accessibility features',
            'Better loading states and animations'
          ]
        },
        {
          type: 'improvement',
          items: [
            'Improved navigation and layout',
            'Better form design and validation',
            'Enhanced visual feedback'
          ]
        },
        {
          type: 'fix',
          items: [
            'Fixed mobile layout issues',
            'Resolved accessibility problems',
            'Corrected visual inconsistencies'
          ]
        }
      ]
    },
    {
      version: '1.0.0',
      date: 'February 1, 2025',
      title: 'Initial Release',
      description: 'First public release of PopTask',
      type: 'major',
      changes: [
        {
          type: 'feature',
          items: [
            'Basic task creation and management',
            'User registration and login',
            'Simple task list view',
            'Basic project organization',
            'User authentication system',
            'Database integration'
          ]
        },
        {
          type: 'improvement',
          items: [
            'Core application architecture',
            'Basic responsive design',
            'Essential security measures'
          ]
        }
      ]
    }
  ];

  const getVersionBadgeColor = (type) => {
    switch (type) {
      case 'major':
        return 'red';
      case 'minor':
        return 'blue';
      case 'patch':
        return 'green';
      default:
        return 'gray';
    }
  };

  const getChangeIcon = (type) => {
    switch (type) {
      case 'feature':
        return StarIcon;
      case 'improvement':
        return InfoIcon;
      case 'fix':
        return CheckCircleIcon;
      default:
        return InfoIcon;
    }
  };

  const getChangeColor = (type) => {
    switch (type) {
      case 'feature':
        return 'green.500';
      case 'improvement':
        return 'blue.500';
      case 'fix':
        return 'orange.500';
      default:
        return 'gray.500';
    }
  };

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="4xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={4} textAlign="center">
            <Heading size="2xl" color={textColor}>
              Changelog
            </Heading>
            <Text fontSize="lg" color={useColorModeValue('gray.600', 'gray.300')} maxW="2xl">
              Track the latest updates, new features, and improvements to PopTask.
              We're constantly working to make your task management experience better.
            </Text>
          </VStack>

          {/* Changelog Entries */}
          <VStack spacing={6} align="stretch">
            {changelogData.map((release, index) => (
              <Box
                key={release.version}
                bg={cardBg}
                p={6}
                borderRadius="xl"
                border="1px"
                borderColor={borderColor}
                _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                transition="all 0.3s"
              >
                <VStack spacing={4} align="stretch">
                  {/* Version Header */}
                  <HStack justify="space-between" align="flex-start">
                    <VStack align="start" spacing={2}>
                      <HStack spacing={3}>
                        <Badge
                          colorScheme={getVersionBadgeColor(release.type)}
                          fontSize="sm"
                          px={3}
                          py={1}
                          borderRadius="full"
                        >
                          v{release.version}
                        </Badge>
                        <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')}>
                          {release.date}
                        </Text>
                      </HStack>
                      <Heading size="md" color={textColor}>
                        {release.title}
                      </Heading>
                      <Text color={useColorModeValue('gray.600', 'gray.300')}>
                        {release.description}
                      </Text>
                    </VStack>
                  </HStack>

                  <Divider />

                  {/* Changes */}
                  <VStack spacing={4} align="stretch">
                    {release.changes.map((changeGroup, groupIndex) => (
                      <Box key={groupIndex}>
                        <HStack spacing={2} mb={3}>
                          <Icon
                            as={getChangeIcon(changeGroup.type)}
                            color={getChangeColor(changeGroup.type)}
                            boxSize={4}
                          />
                          <Text
                            fontWeight="semibold"
                            color={getChangeColor(changeGroup.type)}
                            textTransform="capitalize"
                          >
                            {changeGroup.type}s
                          </Text>
                        </HStack>
                        <List spacing={2}>
                          {changeGroup.items.map((item, itemIndex) => (
                            <ListItem key={itemIndex} color={textColor}>
                              <ListIcon
                                as={getChangeIcon(changeGroup.type)}
                                color={getChangeColor(changeGroup.type)}
                              />
                              {item}
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    ))}
                  </VStack>
                </VStack>
              </Box>
            ))}
          </VStack>

          {/* Footer */}
          <Box textAlign="center" py={8}>
            <Text color={useColorModeValue('gray.500', 'gray.400')} fontSize="sm">
              Have a feature request or found a bug?{' '}
              <Link
                color="blue.500"
                href="https://x.com/benvspak"
                isExternal
              >
                Contact our support team
                <Icon as={ExternalLinkIcon} mx={1} />
              </Link>
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default Changelog;
