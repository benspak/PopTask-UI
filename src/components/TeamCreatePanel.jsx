import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  Select,
  useToast,
  Spinner,
  Text,
  Divider,
  Box,
  SimpleGrid,
  useColorModeValue,
  IconButton,
  Badge,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { AddIcon, CloseIcon } from '@chakra-ui/icons';

const TeamCreatePanel = ({ isOpen, onClose, onCreateTeam, loading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    members: []
  });
  const [memberInput, setMemberInput] = useState({ email: '', role: 'member' });
  const [errors, setErrors] = useState({});

  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleMemberInputChange = (field, value) => {
    setMemberInput(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addMember = () => {
    const email = memberInput.email.trim();
    if (!email) return;

    // Check if member already exists
    if (formData.members.some(member => member.email === email)) {
      toast({
        title: 'Error',
        description: 'This member is already added',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      members: [...prev.members, { ...memberInput, email }]
    }));
    setMemberInput({ email: '', role: 'member' });
  };

  const removeMember = (email) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter(member => member.email !== email)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Team name is required';
    }

    if (formData.name.trim().length > 100) {
      newErrors.name = 'Team name cannot exceed 100 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await onCreateTeam(formData);

      // Reset form
      setFormData({
        name: '',
        description: '',
        members: []
      });
      setMemberInput({ email: '', role: 'member' });
      setErrors({});

      onClose();
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      description: '',
      members: []
    });
    setMemberInput({ email: '', role: 'member' });
    setErrors({});
    onClose();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      handleSubmit();
    } else if (event.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <ModalHeader color={textColor}>Create New Team</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Basic Information */}
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" fontWeight="medium" color={textColor}>
                Team Information
              </Text>

              <FormControl isRequired isInvalid={!!errors.name}>
                <FormLabel color={textColor}>Team Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter team name"
                  onKeyDown={handleKeyDown}
                  autoFocus
                  bg={useColorModeValue('white', 'gray.700')}
                  color={textColor}
                  borderColor={borderColor}
                  _focus={{ borderColor: 'blue.500' }}
                />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.description}>
                <FormLabel color={textColor}>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your team (optional)"
                  rows={3}
                  onKeyDown={handleKeyDown}
                  bg={useColorModeValue('white', 'gray.700')}
                  color={textColor}
                  borderColor={borderColor}
                  _focus={{ borderColor: 'blue.500' }}
                />
                <FormErrorMessage>{errors.description}</FormErrorMessage>
              </FormControl>
            </VStack>

            <Divider borderColor={borderColor} />

            {/* Team Members */}
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" fontWeight="medium" color={textColor}>
                Team Members
              </Text>

              <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')}>
                Add team members by email. They will receive an invitation to join.
              </Text>

              <HStack spacing={3}>
                <FormControl>
                  <Input
                    value={memberInput.email}
                    onChange={(e) => handleMemberInputChange('email', e.target.value)}
                    placeholder="Enter member email"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addMember();
                      }
                    }}
                    bg={useColorModeValue('white', 'gray.700')}
                    color={textColor}
                    borderColor={borderColor}
                    _focus={{ borderColor: 'blue.500' }}
                  />
                </FormControl>

                <Select
                  value={memberInput.role}
                  onChange={(e) => handleMemberInputChange('role', e.target.value)}
                  w="120px"
                  bg={useColorModeValue('white', 'gray.700')}
                  color={textColor}
                  borderColor={borderColor}
                  _focus={{ borderColor: 'blue.500' }}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer</option>
                </Select>

                <IconButton
                  icon={<AddIcon />}
                  onClick={addMember}
                  colorScheme="blue"
                  size="md"
                  aria-label="Add member"
                />
              </HStack>

              {/* Member List */}
              {formData.members.length > 0 && (
                <VStack spacing={2} align="stretch">
                  <Text fontSize="sm" fontWeight="medium" color={textColor}>
                    Added Members ({formData.members.length})
                  </Text>
                  <Wrap spacing={2}>
                    {formData.members.map((member, index) => (
                      <WrapItem key={index}>
                        <Badge
                          colorScheme={member.role === 'admin' ? 'red' : member.role === 'member' ? 'blue' : 'gray'}
                          variant="subtle"
                          px={3}
                          py={1}
                          borderRadius="full"
                        >
                          <HStack spacing={2}>
                            <Text fontSize="xs">{member.email}</Text>
                            <Text fontSize="xs" textTransform="uppercase">
                              {member.role}
                            </Text>
                            <IconButton
                              icon={<CloseIcon />}
                              size="xs"
                              variant="ghost"
                              onClick={() => removeMember(member.email)}
                              aria-label="Remove member"
                            />
                          </HStack>
                        </Badge>
                      </WrapItem>
                    ))}
                  </Wrap>
                </VStack>
              )}
            </VStack>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button onClick={handleCancel} variant="ghost">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              colorScheme="blue"
              isLoading={loading}
              loadingText="Creating..."
              isDisabled={!formData.name.trim()}
            >
              Create Team
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TeamCreatePanel;
