import React, { useState, useEffect } from 'react';
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
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
} from '@chakra-ui/react';
import { AddIcon, CloseIcon, ChevronDownIcon, EditIcon } from '@chakra-ui/icons';

const TeamEditPanel = ({ isOpen, onClose, team, onUpdateTeam, loading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    settings: {
      allowMemberInvites: true,
      requireApproval: false,
      defaultRole: 'member'
    }
  });
  const [memberInput, setMemberInput] = useState({ email: '', role: 'member' });
  const [errors, setErrors] = useState({});

  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');

  // Initialize form data when team changes
  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name || '',
        description: team.description || '',
        settings: {
          allowMemberInvites: team.settings?.allowMemberInvites ?? true,
          requireApproval: team.settings?.requireApproval ?? false,
          defaultRole: team.settings?.defaultRole ?? 'member'
        }
      });
    }
  }, [team]);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

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

  const addMember = async () => {
    const email = memberInput.email.trim();
    if (!email) return;

    // Check if member already exists
    if (team.members.some(member => member.user.email === email)) {
      toast({
        title: 'Error',
        description: 'This member is already in the team',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await onUpdateTeam(team._id, {
        action: 'addMember',
        memberData: { email, role: memberInput.role }
      });
      setMemberInput({ email: '', role: 'member' });
    } catch (error) {
    }
  };

  const removeMember = async (userId) => {
    try {
      await onUpdateTeam(team._id, {
        action: 'removeMember',
        userId
      });
    } catch (error) {
    }
  };

  const updateMemberRole = async (userId, role) => {
    try {
      await onUpdateTeam(team._id, {
        action: 'updateMemberRole',
        userId,
        role
      });
    } catch (error) {
    }
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
      await onUpdateTeam(team._id, {
        action: 'updateTeam',
        teamData: formData
      });
      onClose();
    } catch (error) {
    }
  };

  const handleCancel = () => {
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

  if (!team) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <ModalHeader color={textColor}>Edit Team</ModalHeader>
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

            {/* Team Settings */}
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" fontWeight="medium" color={textColor}>
                Team Settings
              </Text>

              <SimpleGrid columns={2} spacing={4}>
                <FormControl>
                  <FormLabel color={textColor}>Default Role</FormLabel>
                  <Select
                    value={formData.settings.defaultRole}
                    onChange={(e) => handleInputChange('settings.defaultRole', e.target.value)}
                    bg={useColorModeValue('white', 'gray.700')}
                    color={textColor}
                    borderColor={borderColor}
                    _focus={{ borderColor: 'blue.500' }}
                  >
                    <option value="member">Member</option>
                    <option value="viewer">Viewer</option>
                  </Select>
                </FormControl>
              </SimpleGrid>
            </VStack>

            <Divider borderColor={borderColor} />

            {/* Team Members */}
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" fontWeight="medium" color={textColor}>
                Team Members ({team.members.length})
              </Text>

              <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')}>
                Add new team members by email.
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
              {team.members.length > 0 && (
                <VStack spacing={2} align="stretch">
                  <Wrap spacing={2}>
                    {team.members.map((member) => (
                      <WrapItem key={member.user._id}>
                        <Badge
                          colorScheme={member.role === 'admin' ? 'red' : member.role === 'member' ? 'blue' : 'gray'}
                          variant="subtle"
                          px={3}
                          py={1}
                          borderRadius="full"
                        >
                          <HStack spacing={2}>
                            <Avatar
                              size="xs"
                              name={`${member.user.firstName} ${member.user.lastName}`}
                              src={member.user.profilePicture}
                            />
                            <Text fontSize="xs">
                              {member.user.firstName} {member.user.lastName}
                            </Text>
                            <Text fontSize="xs" textTransform="uppercase">
                              {member.role}
                            </Text>
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                icon={<EditIcon />}
                                size="xs"
                                variant="ghost"
                                aria-label="Edit member role"
                              />
                              <MenuList>
                                <MenuItem onClick={() => updateMemberRole(member.user._id, 'admin')}>
                                  Make Admin
                                </MenuItem>
                                <MenuItem onClick={() => updateMemberRole(member.user._id, 'member')}>
                                  Make Member
                                </MenuItem>
                                <MenuItem onClick={() => updateMemberRole(member.user._id, 'viewer')}>
                                  Make Viewer
                                </MenuItem>
                                <Divider />
                                <MenuItem
                                  onClick={() => removeMember(member.user._id)}
                                  color="red.500"
                                >
                                  Remove Member
                                </MenuItem>
                              </MenuList>
                            </Menu>
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
              loadingText="Updating..."
              isDisabled={!formData.name.trim()}
            >
              Update Team
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TeamEditPanel;
