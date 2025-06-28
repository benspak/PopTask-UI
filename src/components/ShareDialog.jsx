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
} from '@chakra-ui/react';
import { CopyIcon, CheckIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import apiService from '../services/api';

const ShareDialog = ({ isOpen, onClose, type, item, onShareCreated }) => {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const [permission, setPermission] = useState('readonly');
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [shareToken, setShareToken] = useState('');
  const [copied, setCopied] = useState(false);

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
        response = await apiService.createTaskShareLink(item._id, permission);
      } else {
        response = await apiService.createProjectShareLink(item._id, permission);
      }

      setShareUrl(response.data.shareUrl);
      setShareToken(response.data.shareToken);

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
      setShareToken('');

      toast({
        title: 'Sharing disabled',
        description: 'The share link has been disabled',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      if (onShareCreated) {
        onShareCreated({ shareUrl: '', shareToken: '' });
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
    setShareToken('');
    setPermission('readonly');
    setCopied(false);
    onClose();
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
                  This {type} is currently shared with {item.sharePermission} permissions.
                </AlertDescription>
              </Alert>
            )}

            {/* Permission Selection */}
            <Box>
              <Text fontSize="sm" mb={2} color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
                Share Permission
              </Text>
              <Select
                value={permission}
                onChange={(e) => setPermission(e.target.value)}
                disabled={loading}
              >
                <option value="readonly">Read-only</option>
                <option value="editable">Editable</option>
              </Select>
              <Text fontSize="xs" color={colorMode === 'light' ? 'gray.500' : 'gray.400'} mt={1}>
                {permission === 'readonly'
                  ? 'Others can view but cannot edit this content'
                  : 'Others can view and edit this content'
                }
              </Text>
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
                  Share this link with others to give them access
                </Text>
              </Box>
            )}

            {/* Share Token (for reference) */}
            {shareToken && (
              <Box>
                <Text fontSize="sm" mb={2} color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
                  Share Token
                </Text>
                <Input
                  value={shareToken}
                  isReadOnly
                  bg={colorMode === 'light' ? 'gray.100' : 'gray.600'}
                  fontSize="xs"
                  fontFamily="mono"
                />
                <Text fontSize="xs" color={colorMode === 'light' ? 'gray.500' : 'gray.400'} mt={1}>
                  This token is used internally to identify the shared content
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
