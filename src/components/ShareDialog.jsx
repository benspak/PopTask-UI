import React, { useState, useEffect } from 'react';
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
  const [sharedUsernames, setSharedUsernames] = useState([]);
  const [usernameInput, setUsernameInput] = useState('');

  // Initialize state when item changes or modal opens
  useEffect(() => {
    const initializeShareData = async () => {
      if (item && item._id) {
        try {
          // Fetch the latest item data to ensure we have up-to-date sharing information
          let response;
          if (type === 'task') {
            response = await apiService.getTask(item._id);
          } else {
            response = await apiService.getProject(item._id);
          }

          const updatedItem = response.data;

          // Initialize shared usernames from the updated item
          const existingUsernames = updatedItem.sharedUsernames || [];
          setSharedUsernames(existingUsernames);

          // Initialize share URL if the item is already shared
          if (updatedItem.isShared && updatedItem.shareToken) {
            const baseUrl = window.location.origin;
            const shareUrl = `${baseUrl}/shared/${type}/${updatedItem.shareToken}`;
            setShareUrl(shareUrl);
          } else {
            setShareUrl('');
          }
        } catch (error) {
          console.error('Failed to fetch latest item data:', error);
          // Fallback to using the provided item data
          const existingUsernames = item.sharedUsernames || [];
          setSharedUsernames(existingUsernames);

          if (item.isShared && item.shareToken) {
            const baseUrl = window.location.origin;
            const shareUrl = `${baseUrl}/shared/${type}/${item.shareToken}`;
            setShareUrl(shareUrl);
          } else {
            setShareUrl('');
          }
        }
      } else {
        // Reset state when no item
        setSharedUsernames([]);
        setShareUrl('');
      }
    };

    initializeShareData();
  }, [item, type]);

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
        response = await apiService.createTaskShareLink(item._id, sharedUsernames);
      } else {
        response = await apiService.createProjectShareLink(item._id, sharedUsernames);
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

  const addUsername = () => {
    const username = usernameInput.trim().toLowerCase();
    if (username && !sharedUsernames.includes(username)) {
      setSharedUsernames([...sharedUsernames, username]);
      setUsernameInput('');
    }
  };

  const removeUsername = (usernameToRemove) => {
    setSharedUsernames(sharedUsernames.filter(username => username !== usernameToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addUsername();
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Copied!',
        description: 'Share link copied to clipboard',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const openShareLink = () => {
    window.open(shareUrl, '_blank');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Share {type === 'task' ? 'Task' : 'Project'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Username Input */}
            <Box>
              <Text fontSize="sm" mb={2} color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
                Add usernames to share with
              </Text>
              <HStack>
                <Input
                  placeholder="Enter username"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <IconButton
                  icon={<AddIcon />}
                  onClick={addUsername}
                  colorScheme="blue"
                  aria-label="Add username"
                />
              </HStack>
              <Text fontSize="xs" mt={1} color={colorMode === 'light' ? 'gray.500' : 'gray.400'}>
                Press Enter or click the + button to add
              </Text>
            </Box>

            {/* Username Tags */}
            {sharedUsernames.length > 0 && (
              <Wrap spacing={2}>
                {sharedUsernames.map((username) => (
                  <WrapItem key={username}>
                    <Tag size="sm" colorScheme="blue" borderRadius="full">
                      <TagLabel>{username}</TagLabel>
                      <TagCloseButton onClick={() => removeUsername(username)} />
                    </Tag>
                  </WrapItem>
                ))}
              </Wrap>
            )}

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
                      <Tooltip label="Copy link">
                        <IconButton
                          h="1.75rem"
                          size="sm"
                          icon={copied ? <CheckIcon /> : <CopyIcon />}
                          onClick={copyToClipboard}
                          colorScheme={copied ? 'green' : 'blue'}
                        />
                      </Tooltip>
                      <Tooltip label="Open link">
                        <IconButton
                          h="1.75rem"
                          size="sm"
                          icon={<ExternalLinkIcon />}
                          onClick={openShareLink}
                          colorScheme="blue"
                        />
                      </Tooltip>
                    </HStack>
                  </InputRightElement>
                </InputGroup>
              </Box>
            )}

            {/* Info Alert */}
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <AlertDescription>
                Only users with the specified usernames will be able to edit this {type}.
                Anyone with the link can view it.
              </AlertDescription>
            </Alert>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            {shareUrl && (
              <Button
                variant="outline"
                onClick={handleDisableSharing}
                isLoading={loading}
              >
                Disable Sharing
              </Button>
            )}
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            {!shareUrl && (
              <Button
                colorScheme="blue"
                onClick={handleCreateShare}
                isLoading={loading}
                loadingText="Creating..."
              >
                Create Share Link
              </Button>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ShareDialog;
