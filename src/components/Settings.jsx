import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Avatar,
  useToast,
  Card,
  CardBody,
  Divider,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  IconButton,
  Center,
  Spinner,
  useColorModeValue,
  Flex,
  Image,
} from '@chakra-ui/react';
import {
  EditIcon,
  CheckIcon,
  CloseIcon,
  AddIcon,
} from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

const Settings = () => {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    displayName: '',
    username: '',
    biography: '',
    profilePicture: '',
  });

  // Validation state
  const [errors, setErrors] = useState({});
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(null);
  const [isEmailAvailable, setIsEmailAvailable] = useState(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        displayName: user.displayName || '',
        username: user.username || '',
        biography: user.biography || '',
        profilePicture: user.profilePicture || '',
      });
    }
  }, [user]);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear validation errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Check username availability
    if (field === 'username' && value.length >= 3) {
      checkUsernameAvailability(value);
    }

    // Check email availability
    if (field === 'email' && value.includes('@')) {
      checkEmailAvailability(value);
    }
  };

  // Check if username is available
  const checkUsernameAvailability = async (username) => {
    if (username === user?.username) {
      setIsUsernameAvailable(true);
      return;
    }

    try {
      // This would need to be implemented in the backend
      // For now, we'll just check if it's not empty
      setIsUsernameAvailable(username.length >= 3);
    } catch (error) {
      setIsUsernameAvailable(false);
    }
  };

  // Check if email is available
  const checkEmailAvailability = async (email) => {
    if (email === user?.email) {
      setIsEmailAvailable(true);
      return;
    }

    try {
      // This would need to be implemented in the backend
      // For now, we'll just check if it's a valid email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setIsEmailAvailable(emailRegex.test(email));
    } catch (error) {
      setIsEmailAvailable(false);
    }
  };

    // Handle avatar upload
  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please select a JPEG, PNG, or GIF image.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsUploading(true);

        try {
      // Upload avatar to server
      const result = await apiService.uploadAvatar(file);

      // Update the profile picture in the form with the data URL from server
      setFormData(prev => ({ ...prev, profilePicture: result.data.dataUrl }));

      // Also update the profile picture in the database immediately
      await apiService.updateProfilePicture(result.data.dataUrl);

      // Refresh user data to show the new avatar
      await refreshUser();

      toast({
        title: 'Avatar uploaded',
        description: 'Your avatar has been uploaded successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload avatar. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, underscores, and hyphens';
    }

    if (formData.biography && formData.biography.length > 500) {
      newErrors.biography = 'Biography cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

    // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      // Create a copy of formData without the profilePicture to avoid the large payload issue
      const { profilePicture, ...profileData } = formData;

      // Update profile without the picture first
      await apiService.updateProfile(profileData);

      // If there's a new profile picture, update it separately
      if (profilePicture && profilePicture !== user?.profilePicture) {
        await apiService.updateProfilePicture(profilePicture);
      }

      // Refresh user data
      await refreshUser();

      setShowSuccess(true);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update profile. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Center h="50vh">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading settings...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box maxW="800px" mx="auto" p={6}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" color={textColor} mb={2}>
            Account Settings
          </Heading>
          <Text color={mutedTextColor}>
            Manage your profile information and preferences
          </Text>
        </Box>

        {/* Success Alert */}
        {showSuccess && (
          <Alert status="success" borderRadius="md">
            <AlertIcon />
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>
              Your profile has been updated successfully.
            </AlertDescription>
          </Alert>
        )}

        {/* Profile Card */}
        <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={6} align="stretch">
              {/* Avatar Section */}
              <Box>
                <FormLabel fontWeight="semibold" color={textColor}>
                  Profile Picture
                </FormLabel>
                <HStack spacing={4} align="center">
                  <Avatar
                    size="xl"
                    src={formData.profilePicture || user?.profilePicture}
                    name={user?.displayName || user?.firstName}
                    bg="blue.500"
                  />
                  <VStack align="start" spacing={2}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      style={{ display: 'none' }}
                      id="avatar-upload"
                    />
                    <label htmlFor="avatar-upload">
                      <Button
                        as="span"
                        size="sm"
                        colorScheme="blue"
                        variant="outline"
                        leftIcon={<AddIcon />}
                        isLoading={isUploading}
                        loadingText="Uploading..."
                      >
                        {formData.profilePicture ? 'Change Avatar' : 'Upload Avatar'}
                      </Button>
                    </label>
                    <Text fontSize="sm" color={mutedTextColor}>
                      JPEG, PNG, or GIF. Max 5MB.
                    </Text>
                  </VStack>
                </HStack>
              </Box>

              <Divider />

              {/* User Type Badge */}
              <Box>
                <Text fontSize="sm" color={mutedTextColor} mb={2}>
                  Account Type
                </Text>
                <Badge
                  colorScheme={user?.userType === 'pro' ? 'green' : 'blue'}
                  variant="subtle"
                  fontSize="sm"
                >
                  {user?.userType === 'pro' ? 'Pro User' : 'Basic User'}
                </Badge>
              </Box>

              <Divider />

              {/* Form */}
              <Box as="form" onSubmit={handleSubmit}>
                <VStack spacing={4} align="stretch">
                  {/* Name Fields */}
                  <HStack spacing={4}>
                    <FormControl isInvalid={!!errors.firstName}>
                      <FormLabel fontWeight="semibold" color={textColor}>
                        First Name
                      </FormLabel>
                      <Input
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="Enter your first name"
                        bg={useColorModeValue('white', 'gray.700')}
                        borderColor={borderColor}
                      />
                      {errors.firstName && (
                        <Text color="red.500" fontSize="sm" mt={1}>
                          {errors.firstName}
                        </Text>
                      )}
                    </FormControl>

                    <FormControl isInvalid={!!errors.lastName}>
                      <FormLabel fontWeight="semibold" color={textColor}>
                        Last Name
                      </FormLabel>
                      <Input
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Enter your last name"
                        bg={useColorModeValue('white', 'gray.700')}
                        borderColor={borderColor}
                      />
                      {errors.lastName && (
                        <Text color="red.500" fontSize="sm" mt={1}>
                          {errors.lastName}
                        </Text>
                      )}
                    </FormControl>
                  </HStack>

                  {/* Display Name */}
                  <FormControl isInvalid={!!errors.displayName}>
                    <FormLabel fontWeight="semibold" color={textColor}>
                      Display Name
                    </FormLabel>
                    <Input
                      value={formData.displayName}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      placeholder="Enter your display name"
                      bg={useColorModeValue('white', 'gray.700')}
                      borderColor={borderColor}
                    />
                    {errors.displayName && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {errors.displayName}
                      </Text>
                    )}
                  </FormControl>

                  {/* Email */}
                  <FormControl isInvalid={!!errors.email}>
                    <FormLabel fontWeight="semibold" color={textColor}>
                      Email Address
                    </FormLabel>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter your email address"
                      bg={useColorModeValue('white', 'gray.700')}
                      borderColor={borderColor}
                    />
                    {errors.email && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {errors.email}
                      </Text>
                    )}
                    {isEmailAvailable === false && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        This email is already in use
                      </Text>
                    )}
                  </FormControl>

                  {/* Username */}
                  <FormControl isInvalid={!!errors.username}>
                    <FormLabel fontWeight="semibold" color={textColor}>
                      Username
                    </FormLabel>
                    <Input
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      placeholder="Enter your username"
                      bg={useColorModeValue('white', 'gray.700')}
                      borderColor={borderColor}
                    />
                    {errors.username && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {errors.username}
                      </Text>
                    )}
                    {isUsernameAvailable === false && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        This username is already taken
                      </Text>
                    )}
                    {isUsernameAvailable === true && formData.username !== user?.username && (
                      <Text color="green.500" fontSize="sm" mt={1}>
                        Username is available
                      </Text>
                    )}
                  </FormControl>

                  {/* Biography */}
                  <FormControl isInvalid={!!errors.biography}>
                    <FormLabel fontWeight="semibold" color={textColor}>
                      Biography
                    </FormLabel>
                    <Textarea
                      value={formData.biography}
                      onChange={(e) => handleInputChange('biography', e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      bg={useColorModeValue('white', 'gray.700')}
                      borderColor={borderColor}
                    />
                    {errors.biography && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {errors.biography}
                      </Text>
                    )}
                    <Text fontSize="sm" color={mutedTextColor} mt={1}>
                      {formData.biography.length}/500 characters
                    </Text>
                  </FormControl>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    isLoading={isSaving}
                    loadingText="Saving..."
                    mt={4}
                  >
                    Save Changes
                  </Button>
                </VStack>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default Settings;
