import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Avatar,
  Badge,
  Card,
  CardBody,
  Divider,
  Center,
  Spinner,
  Button,
  IconButton,
  useColorModeValue,
  Flex,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import {
  ArrowBackIcon,
  ExternalLinkIcon,
} from '@chakra-ui/icons';
import apiService from '../services/api';

const PublicProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiService.getPublicProfile(username);
        setProfile(response.user);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError(error.message || 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username]);

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <Center h="50vh">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading profile...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Box maxW="800px" mx="auto" p={6}>
        <VStack spacing={6} align="stretch">
          <Button
            leftIcon={<ArrowBackIcon />}
            variant="ghost"
            onClick={handleBack}
            alignSelf="flex-start"
          >
            Back
          </Button>

          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertTitle>Profile Not Found</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        </VStack>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box maxW="800px" mx="auto" p={6}>
        <VStack spacing={6} align="stretch">
          <Button
            leftIcon={<ArrowBackIcon />}
            variant="ghost"
            onClick={handleBack}
            alignSelf="flex-start"
          >
            Back
          </Button>

          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <AlertTitle>Profile Not Found</AlertTitle>
            <AlertDescription>
              The user profile you're looking for doesn't exist.
            </AlertDescription>
          </Alert>
        </VStack>
      </Box>
    );
  }

  return (
    <Box maxW="800px" mx="auto" p={6}>
      <VStack spacing={6} align="stretch">
        {/* Back Button */}
        <Button
          leftIcon={<ArrowBackIcon />}
          variant="ghost"
          onClick={handleBack}
          alignSelf="flex-start"
        >
          Back
        </Button>

        {/* Profile Card */}
        <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={6} align="stretch">
              {/* Profile Header */}
              <Flex direction={{ base: 'column', md: 'row' }} align="center" gap={6}>
                <Avatar
                  size="2xl"
                  src={profile.profilePicture}
                  name={profile.displayName || profile.firstName}
                  bg="blue.500"
                />

                <VStack align={{ base: 'center', md: 'start' }} spacing={3} flex={1}>
                  <VStack align={{ base: 'center', md: 'start' }} spacing={1}>
                    <Heading size="lg" color={textColor}>
                      {profile.displayName || `${profile.firstName} ${profile.lastName}`}
                    </Heading>
                    <Text color={mutedTextColor} fontSize="lg">
                      @{profile.username}
                    </Text>
                  </VStack>

                  <HStack spacing={3}>
                    <Badge
                      colorScheme={profile.userType === 'pro' ? 'green' : 'blue'}
                      variant="subtle"
                      fontSize="sm"
                    >
                      {profile.userType === 'pro' ? 'Pro User' : 'Basic User'}
                    </Badge>

                    {profile.isEmailVerified && (
                      <Badge colorScheme="green" variant="subtle" fontSize="sm">
                        Verified
                      </Badge>
                    )}
                  </HStack>
                </VStack>
              </Flex>

              <Divider />

              {/* Biography */}
              {profile.biography && (
                <Box>
                  <Text fontWeight="semibold" color={textColor} mb={3}>
                    About
                  </Text>
                  <Text color={textColor} lineHeight="tall">
                    {profile.biography}
                  </Text>
                </Box>
              )}

              {/* Profile Info */}
              <Box>
                <Text fontWeight="semibold" color={textColor} mb={3}>
                  Profile Information
                </Text>
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between">
                    <Text color={mutedTextColor}>Name:</Text>
                    <Text color={textColor} fontWeight="medium">
                      {profile.firstName} {profile.lastName}
                    </Text>
                  </HStack>

                  <HStack justify="space-between">
                    <Text color={mutedTextColor}>Display Name:</Text>
                    <Text color={textColor} fontWeight="medium">
                      {profile.displayName}
                    </Text>
                  </HStack>

                  <HStack justify="space-between">
                    <Text color={mutedTextColor}>Username:</Text>
                    <Text color={textColor} fontWeight="medium">
                      @{profile.username}
                    </Text>
                  </HStack>

                  <HStack justify="space-between">
                    <Text color={mutedTextColor}>Member Since:</Text>
                    <Text color={textColor} fontWeight="medium">
                      {new Date(profile.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Text>
                  </HStack>
                </VStack>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default PublicProfile;
