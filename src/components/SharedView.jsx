import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Textarea,
  Select,
  Badge,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  useColorMode,
  useToast,
  Checkbox,
  Tag,
  Image,
  Link,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { ExternalLinkIcon, CopyIcon, CheckIcon, EditIcon, ViewIcon } from '@chakra-ui/icons';
import apiService from '../services/api';

const SharedView = ({ type, token }) => {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSharedData();
  }, [type, token]);

  const loadSharedData = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (type === 'task') {
        response = await apiService.getSharedTask(token);
      } else {
        response = await apiService.getSharedProject(token);
      }

      setData(response.data);
      setEditData(response.data[type]);
    } catch (error) {
      setError(error.message || 'Failed to load shared content');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      let response;
      if (type === 'task') {
        response = await apiService.updateSharedTask(token, editData);
      } else {
        response = await apiService.updateSharedProject(token, editData);
      }

      setData(response.data);
      setEditData(response.data[type]);
      setIsEditing(false);

      toast({
        title: 'Updated successfully',
        description: 'The shared content has been updated.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update shared content',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData(data[type]);
    setIsEditing(false);
  };

  const copyShareUrl = async () => {
    try {
      await apiService.copyToClipboard(window.location.href);
      toast({
        title: 'Link copied',
        description: 'Share URL copied to clipboard',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading shared content...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={6}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box p={6}>
        <Alert status="warning">
          <AlertIcon />
          <AlertTitle>Not found</AlertTitle>
          <AlertDescription>This shared content is no longer available.</AlertDescription>
        </Alert>
      </Box>
    );
  }

  const item = data[type];
  const permission = data.sharePermission;
  const shareStats = data.shareStats;

  return (
    <Box p={6} maxW="800px" mx="auto">
      {/* Header */}
      <VStack spacing={4} align="stretch" mb={6}>
        <HStack justify="space-between">
          <VStack align="start" spacing={1}>
            <Text fontSize="2xl" fontWeight="bold" color={colorMode === 'light' ? 'gray.800' : 'white'}>
              Shared {type === 'task' ? 'Task' : 'Project'}
            </Text>
            <HStack spacing={2}>
              <Badge colorScheme={permission === 'editable' ? 'green' : 'blue'}>
                {permission === 'editable' ? 'Editable' : 'Read-only'}
              </Badge>
              {shareStats && (
                <Badge colorScheme="purple" variant="subtle">
                  {shareStats.viewCount || 0} views
                </Badge>
              )}
            </HStack>
          </VStack>
          <HStack>
            <Tooltip label="Copy share link">
              <IconButton
                icon={<CopyIcon />}
                onClick={copyShareUrl}
                aria-label="Copy share link"
                size="sm"
              />
            </Tooltip>
            {permission === 'editable' && (
              <Button
                leftIcon={isEditing ? <ViewIcon /> : <EditIcon />}
                onClick={() => setIsEditing(!isEditing)}
                size="sm"
                colorScheme="blue"
                variant="outline"
              >
                {isEditing ? 'View' : 'Edit'}
              </Button>
            )}
          </HStack>
        </HStack>

        {/* Share Statistics */}
        {shareStats && (
          <Box p={3} bg={colorMode === 'light' ? 'gray.50' : 'gray.700'} borderRadius="md">
            <Text fontSize="sm" fontWeight="medium" mb={2} color={colorMode === 'light' ? 'gray.700' : 'gray.300'}>
              Share Information
            </Text>
            <HStack spacing={4} fontSize="xs" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
              {shareStats.shareCreatedAt && (
                <Text>Created: {new Date(shareStats.shareCreatedAt).toLocaleDateString()}</Text>
              )}
              {shareStats.lastViewedAt && (
                <Text>Last viewed: {new Date(shareStats.lastViewedAt).toLocaleDateString()}</Text>
              )}
              {shareStats.shareExpiresAt && (
                <Text>Expires: {new Date(shareStats.shareExpiresAt).toLocaleDateString()}</Text>
              )}
            </HStack>
          </Box>
        )}

        <Divider />
      </VStack>

      {/* Content */}
      {type === 'task' ? (
        <SharedTaskView
          task={item}
          isEditing={isEditing}
          editData={editData}
          setEditData={setEditData}
          onSave={handleSave}
          onCancel={handleCancel}
          saving={saving}
          permission={permission}
          formatFileSize={formatFileSize}
        />
      ) : (
        <SharedProjectView
          project={item}
          isEditing={isEditing}
          editData={editData}
          setEditData={setEditData}
          onSave={handleSave}
          onCancel={handleCancel}
          saving={saving}
          permission={permission}
        />
      )}
    </Box>
  );
};

const SharedTaskView = ({ task, isEditing, editData, setEditData, onSave, onCancel, saving, permission, formatFileSize }) => {
  const { colorMode } = useColorMode();

  if (!task) return null;

  return (
    <VStack spacing={6} align="stretch">
      {/* Title */}
      <Box>
        <Text fontSize="sm" mb={2} color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
          Title
        </Text>
        {isEditing ? (
          <Input
            value={editData.title || ''}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            placeholder="Task title"
            size="lg"
          />
        ) : (
          <Text fontSize="lg" fontWeight="medium">
            {task.title}
          </Text>
        )}
      </Box>

      {/* Description */}
      <Box>
        <Text fontSize="sm" mb={2} color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
          Description
        </Text>
        {isEditing ? (
          <Textarea
            value={editData.description || ''}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            placeholder="Task description"
            rows={4}
          />
        ) : (
          <Text color={colorMode === 'light' ? 'gray.700' : 'gray.300'}>
            {task.description || 'No description'}
          </Text>
        )}
      </Box>

      {/* Project */}
      <Box>
        <Text fontSize="sm" mb={2} color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
          Project
        </Text>
        {isEditing ? (
          <Input
            value={editData.project || ''}
            onChange={(e) => setEditData({ ...editData, project: e.target.value })}
            placeholder="Project name"
          />
        ) : (
          <Badge colorScheme="blue" variant="subtle">
            {task.project}
          </Badge>
        )}
      </Box>

      {/* Due Date */}
      <Box>
        <Text fontSize="sm" mb={2} color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
          Due Date
        </Text>
        {isEditing ? (
          <Input
            type="date"
            value={editData.dueDate || ''}
            onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
          />
        ) : (
          <Text color={colorMode === 'light' ? 'gray.700' : 'gray.300'}>
            {task.dueDate || 'No due date'}
          </Text>
        )}
      </Box>

      {/* Tags */}
      <Box>
        <Text fontSize="sm" mb={2} color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
          Tags
        </Text>
        {isEditing ? (
          <HStack spacing={2}>
            {[0, 1, 2].map((index) => (
              <Input
                key={index}
                value={editData.tags?.[index] || ''}
                onChange={(e) => {
                  const newTags = [...(editData.tags || [])];
                  newTags[index] = e.target.value;
                  setEditData({ ...editData, tags: newTags });
                }}
                placeholder={`Tag ${index + 1}`}
                size="sm"
                maxW="120px"
              />
            ))}
          </HStack>
        ) : (
          <HStack spacing={2}>
            {task.tags && task.tags.length > 0 ? (
              task.tags.map((tag, index) => (
                <Tag key={index} colorScheme="purple" size="sm">
                  {tag}
                </Tag>
              ))
            ) : (
              <Text color={colorMode === 'light' ? 'gray.500' : 'gray.400'} fontSize="sm">
                No tags
              </Text>
            )}
          </HStack>
        )}
      </Box>

      {/* Completion Status */}
      <Box>
        <Text fontSize="sm" mb={2} color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
          Status
        </Text>
        {isEditing ? (
          <Checkbox
            isChecked={editData.completed || false}
            onChange={(e) => setEditData({ ...editData, completed: e.target.checked })}
          >
            Completed
          </Checkbox>
        ) : (
          <Badge colorScheme={task.completed ? 'green' : 'gray'} variant="subtle">
            {task.completed ? 'Completed' : 'Pending'}
          </Badge>
        )}
      </Box>

      {/* File Attachments */}
      {task.fileAttachments && task.fileAttachments.length > 0 && (
        <Box>
          <Text fontSize="sm" mb={2} color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
            Attachments
          </Text>
          <VStack spacing={2} align="stretch">
            {task.fileAttachments.map((file, index) => (
              <HStack key={index} p={3} bg={colorMode === 'light' ? 'gray.50' : 'gray.700'} borderRadius="md">
                <Box flex={1}>
                  <Text fontSize="sm" fontWeight="medium">
                    {file.originalName}
                  </Text>
                  <Text fontSize="xs" color={colorMode === 'light' ? 'gray.500' : 'gray.400'}>
                    {formatFileSize(file.size)}
                  </Text>
                </Box>
                <Button
                  size="sm"
                  leftIcon={<ExternalLinkIcon />}
                  onClick={() => window.open(apiService.getFileUrl(file.filename), '_blank')}
                >
                  Download
                </Button>
              </HStack>
            ))}
          </VStack>
        </Box>
      )}

      {/* Edit Actions */}
      {isEditing && (
        <HStack spacing={3} justify="flex-end">
          <Button onClick={handleCancel} variant="outline">
            Cancel
          </Button>
          <Button onClick={onSave} colorScheme="blue" isLoading={saving}>
            Save Changes
          </Button>
        </HStack>
      )}
    </VStack>
  );
};

const SharedProjectView = ({ project, isEditing, editData, setEditData, onSave, onCancel, saving, permission }) => {
  const { colorMode } = useColorMode();

  if (!project) return null;

  return (
    <VStack spacing={6} align="stretch">
      {/* Name */}
      <Box>
        <Text fontSize="sm" mb={2} color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
          Project Name
        </Text>
        {isEditing ? (
          <Input
            value={editData.name || ''}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            placeholder="Project name"
            size="lg"
          />
        ) : (
          <Text fontSize="lg" fontWeight="medium">
            {project.name}
          </Text>
        )}
      </Box>

      {/* Description */}
      <Box>
        <Text fontSize="sm" mb={2} color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
          Description
        </Text>
        {isEditing ? (
          <Textarea
            value={editData.description || ''}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            placeholder="Project description"
            rows={4}
          />
        ) : (
          <Text color={colorMode === 'light' ? 'gray.700' : 'gray.300'}>
            {project.description || 'No description'}
          </Text>
        )}
      </Box>

      {/* Color */}
      <Box>
        <Text fontSize="sm" mb={2} color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
          Color
        </Text>
        {isEditing ? (
          <Input
            type="color"
            value={editData.color || '#3182ce'}
            onChange={(e) => setEditData({ ...editData, color: e.target.value })}
            w="100px"
          />
        ) : (
          <HStack>
            <Box w="20px" h="20px" borderRadius="full" bg={project.color} />
            <Text color={colorMode === 'light' ? 'gray.700' : 'gray.300'}>
              {project.color}
            </Text>
          </HStack>
        )}
      </Box>

      {/* Edit Actions */}
      {isEditing && (
        <HStack spacing={3} justify="flex-end">
          <Button onClick={onCancel} variant="outline">
            Cancel
          </Button>
          <Button onClick={onSave} colorScheme="blue" isLoading={saving}>
            Save Changes
          </Button>
        </HStack>
      )}
    </VStack>
  );
};

export default SharedView;
