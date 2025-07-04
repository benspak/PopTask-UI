import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Select,
  Input,
  InputGroup,
  InputRightElement,
  Box,
  useColorMode,
  useToast,
  Badge,
  Divider,
  Alert,
  AlertIcon,
  AlertDescription,
  Spinner,
  IconButton,
  Tooltip,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { CopyIcon, CheckIcon, ExternalLinkIcon, AddIcon } from '@chakra-ui/icons';
import apiService from '../services/api';

const ShareDialog = ({ isOpen, onClose, type, item, onShareCreated }) => {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [allowedEmails, setAllowedEmails] = useState([]);
  const [emailInput, setEmailInput] = useState('');

  const handleCreateShare = async () => {
    if (!item || !item._id) {
      toast({
        title: 'Error',
        description: 'No item selected for sharing',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);

      let response;
      if (type === 'task') {
        response = await apiService.createTaskShareLink(item._id, allowedEmails);
      } else {
        response = await apiService.createProjectShareLink(item._id, allowedEmails);
      }

      setShareUrl(response.data.shareUrl);

      toast({
        title: 'Share link created',
        description: 'Your share link has been generated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      if (onShareCreated) {
        onShareCreated(response.data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create share link',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisableSharing = async () => {
    if (!item || !item._id) return;

    try {
      setLoading(true);

      if (type === 'task') {
        await apiService.disableTaskSharing(item._id);
      } else {
        await apiService.disableProjectSharing(item._id);
      }

      setShareUrl('');

      toast({
        title: 'Sharing disabled',
        description: 'The share link has been disabled',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      if (onShareCreated) {
        onShareCreated({ shareUrl: '' });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to disable sharing',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await apiService.copyToClipboard(shareUrl);
      setCopied(true);
      toast({
        title: 'Link copied',
        description: 'Share URL copied to clipboard',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Failed to copy link to clipboard',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const openShareUrl = () => {
    window.open(shareUrl, '_blank');
  };

  const handleClose = () => {
    setShareUrl('');
    setCopied(false);
    setAllowedEmails([]);
    setEmailInput('');
    onClose();
  };

  const addEmail = () => {
    const email = emailInput.trim().toLowerCase();
    if (email && !allowedEmails.includes(email)) {
      setAllowedEmails([...allowedEmails, email]);
      setEmailInput('');
    }
  };

  const removeEmail = (emailToRemove) => {
    setAllowedEmails(allowedEmails.filter(email => email !== emailToRemove));
  };

  const handleEmailKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addEmail();
    }
  };

  const isCurrentlyShared = item && item.isShared && item.shareToken;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Share {type === 'task' ? 'Task' : 'Project'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Item Info */}
            <Box p={4} bg={colorMode === 'light' ? 'gray.50' : 'gray.700'} borderRadius="md">
              <Text fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.400'} mb={1}>
                {type === 'task' ? 'Task' : 'Project'} Name
              </Text>
              <Text fontWeight="medium">
                {type === 'task' ? item?.title : item?.name}
              </Text>
            </Box>

            {/* Current Share Status */}
            {isCurrentlyShared && (
              <Alert status="info">
                <AlertIcon />
                <AlertDescription>
                  This {type} is currently shared publicly. Anyone with the link can view it.
                </AlertDescription>
              </Alert>
            )}

            {/* Share Statistics */}
            {isCurrentlyShared && item.shareViewCount !== undefined && (
              <Box p={4} bg={colorMode === 'light' ? 'blue.50' : 'blue.900'} borderRadius="md">
                <Text fontSize="sm" fontWeight="medium" mb={2} color={colorMode === 'light' ? 'blue.800' : 'blue.200'}>
                  Share Statistics
                </Text>
                <VStack align="start" spacing={1}>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="xs" color={colorMode === 'light' ? 'blue.600' : 'blue.300'}>
                      Views:
                    </Text>
                    <Text fontSize="xs" fontWeight="medium" color={colorMode === 'light' ? 'blue.800' : 'blue.200'}>
                      {item.shareViewCount || 0}
                    </Text>
                  </HStack>
                  {item.shareCreatedAt && (
                    <HStack justify="space-between" w="full">
                      <Text fontSize="xs" color={colorMode === 'light' ? 'blue.600' : 'blue.300'}>
                        Created:
                      </Text>
                      <Text fontSize="xs" color={colorMode === 'light' ? 'blue.800' : 'blue.200'}>
                        {new Date(item.shareCreatedAt).toLocaleDateString()}
                      </Text>
                    </HStack>
                  )}
                  {item.lastViewedAt && (
                    <HStack justify="space-between" w="full">
                      <Text fontSize="xs" color={colorMode === 'light' ? 'blue.600' : 'blue.300'}>
                        Last viewed:
                      </Text>
                      <Text fontSize="xs" color={colorMode === 'light' ? 'blue.800' : 'blue.200'}>
                        {new Date(item.lastViewedAt).toLocaleDateString()}
                      </Text>
                    </HStack>
                  )}
                  {item.shareExpiresAt && (
                    <HStack justify="space-between" w="full">
                      <Text fontSize="xs" color={colorMode === 'light' ? 'blue.600' : 'blue.300'}>
                        Expires:
                      </Text>
                      <Text fontSize="xs" color={colorMode === 'light' ? 'blue.800' : 'blue.200'}>
                        {new Date(item.shareExpiresAt).toLocaleDateString()}
                      </Text>
                    </HStack>
                  )}
                </VStack>
              </Box>
            )}

            {/* Email Access Control */}
            <Box>
              <Text fontSize="sm" mb={2} color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
                Grant Edit Access to Specific Users
              </Text>
              <Text fontSize="xs" color={colorMode === 'light' ? 'gray.500' : 'gray.400'} mb={2}>
                Add email addresses to allow specific users to edit this {type} (optional)
              </Text>

              {/* Email Input */}
              <HStack mb={3}>
                <Input
                  placeholder="Enter email address"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyPress={handleEmailKeyPress}
                  disabled={loading}
                />
                <Button
                  size="sm"
                  onClick={addEmail}
                  disabled={!emailInput.trim() || loading}
                  leftIcon={<AddIcon />}
                >
                  Add
                </Button>
              </HStack>

              {/* Email Tags */}
              {allowedEmails.length > 0 && (
                <Wrap spacing={2}>
                  {allowedEmails.map((email) => (
                    <WrapItem key={email}>
                      <Tag size="sm" colorScheme="blue" borderRadius="full">
                        <TagLabel>{email}</TagLabel>
                        <TagCloseButton onClick={() => removeEmail(email)} />
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              )}
            </Box>

            {/* Share URL Display */}
            {shareUrl && (
              <Box>
                <Text fontSize="sm" mb={2} color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
                  Share Link
                </Text>
                <InputGroup>
                  <Input
                    value={shareUrl}
                    isReadOnly
                    pr="4.5rem"
                    bg={colorMode === 'light' ? 'gray.100' : 'gray.600'}
                  />
                  <InputRightElement width="4.5rem">
                    <HStack spacing={1}>
                      <Tooltip label="Open link">
                        <IconButton
                          icon={<ExternalLinkIcon />}
                          onClick={openShareUrl}
                          size="sm"
                          variant="ghost"
                          aria-label="Open share link"
                        />
                      </Tooltip>
                      <Tooltip label={copied ? 'Copied!' : 'Copy link'}>
                        <IconButton
                          icon={copied ? <CheckIcon /> : <CopyIcon />}
                          onClick={copyToClipboard}
                          size="sm"
                          variant="ghost"
                          aria-label="Copy share link"
                          colorScheme={copied ? 'green' : 'blue'}
                        />
                      </Tooltip>
                    </HStack>
                  </InputRightElement>
                </InputGroup>
                <Text fontSize="xs" color={colorMode === 'light' ? 'gray.500' : 'gray.400'} mt={1}>
                  Share this link with others to give them view access. Only users with their email addresses added above can edit.
                </Text>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            {isCurrentlyShared && (
              <Button
                onClick={handleDisableSharing}
                colorScheme="red"
                variant="outline"
                isLoading={loading}
              >
                Disable Sharing
              </Button>
            )}
            {!shareUrl ? (
              <Button
                onClick={handleCreateShare}
                colorScheme="blue"
                isLoading={loading}
                loadingText="Creating..."
              >
                Create Share Link
              </Button>
            ) : (
              <Button onClick={handleClose}>
                Done
              </Button>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ShareDialog;
