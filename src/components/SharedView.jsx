import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
import { useAuth } from '../contexts/AuthContext';

const SharedView = () => {
  const { type, token } = useParams();
  const { colorMode } = useColorMode();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);



  useEffect(() => {
    // Load shared data regardless of authentication status
    // The backend now allows unauthenticated access to shared content
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

      if (response && response.data) {
        // The API returns { task: {...}, sharePermission: "...", shareStats: {...} }
        // or { project: {...}, tasks: [...], projectStats: {...}, sharePermission: "...", shareStats: {...} }
        const itemData = response.data[type]; // response.data.task or response.data.project
        const sharePermission = response.data.sharePermission;
        const shareStats = response.data.shareStats;

        // For projects, also get tasks and projectStats
        const tasks = response.data.tasks || [];
        const projectStats = response.data.projectStats || null;

        setData({
          [type]: itemData,
          tasks: tasks,
          projectStats: projectStats,
          sharePermission: sharePermission,
          shareStats: shareStats
        });
        setEditData(itemData);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error loading shared data:', error);
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

      // Handle the response structure properly
      if (response && response.data) {
        // For shared content, the response might be the item directly or wrapped
        const updatedItem = response.data[type] || response.data;
        setData({ [type]: updatedItem, sharePermission: data.sharePermission, shareStats: data.shareStats });
        setEditData(updatedItem);
      }
      setIsEditing(false);

      toast({
        title: 'Updated successfully',
        description: 'The shared content has been updated.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating shared content:', error);

      // Check if it's an authentication error and redirect
      if (error.message && error.message.includes('Authentication required')) {
        const currentUrl = location.pathname + location.search;
        navigate('/login', {
          state: {
            from: currentUrl,
            message: 'Please sign in to edit this shared content'
          },
          replace: true
        });
        return;
      }

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



  // Error boundary - catch any unexpected errors
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

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading shared content...</Text>
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
  const hasEmailAccess = data.hasEmailAccess || false;
  const shareStats = data.shareStats;

  // Add safety check for missing item
  if (!item) {
    return (
      <Box p={6}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Data Error</AlertTitle>
          <AlertDescription>The shared content data is missing or corrupted.</AlertDescription>
        </Alert>
      </Box>
    );
  }

  try {
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
                <Badge colorScheme={hasEmailAccess ? 'green' : 'blue'}>
                  {hasEmailAccess ? 'Editable' : 'Read-only'}
                </Badge>
                {hasEmailAccess && (
                  <Badge colorScheme="orange" variant="subtle">
                    Email Access
                  </Badge>
                )}
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
              {hasEmailAccess && (
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
              <Text fontSize="sm" fontWeight="medium" mb={2} color="white">
                Share Information
              </Text>
              <HStack spacing={4} fontSize="xs" color="white">
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
            hasEmailAccess={hasEmailAccess}
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
            hasEmailAccess={hasEmailAccess}
            tasks={data.tasks || []}
            projectStats={data.projectStats}
          />
        )}
      </Box>
    );
  } catch (renderError) {
    console.error('Error rendering SharedView:', renderError);
    return (
      <Box p={6}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Render Error</AlertTitle>
          <AlertDescription>An unexpected error occurred while displaying the shared content.</AlertDescription>
        </Alert>
      </Box>
    );
  }
};

const SharedTaskView = ({ task, isEditing, editData, setEditData, onSave, onCancel, saving, permission, hasEmailAccess, formatFileSize }) => {
  const { colorMode } = useColorMode();

  // Add safety checks
  if (!task) {
    return (
      <Box p={4}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Task Error</AlertTitle>
          <AlertDescription>Task data is missing or corrupted.</AlertDescription>
        </Alert>
      </Box>
    );
  }

  // Ensure editData has safe defaults
  const safeEditData = {
    title: editData?.title || task.title || '',
    description: editData?.description || task.description || '',
    project: editData?.project || task.project || '',
    dueDate: editData?.dueDate || task.dueDate || '',
    tags: editData?.tags || task.tags || [],
    completed: editData?.completed !== undefined ? editData.completed : task.completed || false
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Title */}
      <Box>
        <Text fontSize="sm" mb={2} color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
          Title
        </Text>
        {isEditing ? (
          <Input
            value={safeEditData.title}
            onChange={(e) => setEditData({ ...safeEditData, title: e.target.value })}
            placeholder="Task title"
            size="lg"
          />
        ) : (
          <Text fontSize="lg" fontWeight="medium">
            {task.title || 'Untitled Task'}
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
            value={safeEditData.description}
            onChange={(e) => setEditData({ ...safeEditData, description: e.target.value })}
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
            value={safeEditData.project}
            onChange={(e) => setEditData({ ...safeEditData, project: e.target.value })}
            placeholder="Project name"
          />
        ) : (
          <Badge colorScheme="blue" variant="subtle">
            {task.project || 'General'}
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
            value={safeEditData.dueDate}
            onChange={(e) => setEditData({ ...safeEditData, dueDate: e.target.value })}
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
                value={safeEditData.tags[index] || ''}
                onChange={(e) => {
                  const newTags = [...safeEditData.tags];
                  newTags[index] = e.target.value;
                  setEditData({ ...safeEditData, tags: newTags });
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
            isChecked={safeEditData.completed}
            onChange={(e) => setEditData({ ...safeEditData, completed: e.target.checked })}
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
      {isEditing && hasEmailAccess && (
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

const SharedProjectView = ({ project, isEditing, editData, setEditData, onSave, onCancel, saving, permission, hasEmailAccess, tasks = [], projectStats }) => {
  const { colorMode } = useColorMode();

  if (!project) return null;

  // Utility function to format time in seconds to readable format
  const formatTime = (seconds) => {
    if (!seconds || seconds === 0) return '0s';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Name */}
      <Box>
        <Text fontSize="sm" mb={2} color="white">
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
          <Text fontSize="lg" fontWeight="medium" color="white">
            {project.name}
          </Text>
        )}
      </Box>

      {/* Description */}
      <Box>
        <Text fontSize="sm" mb={2} color="white">
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
          <Text color="white">
            {project.description || 'No description'}
          </Text>
        )}
      </Box>

      {/* Color */}
      <Box>
        <Text fontSize="sm" mb={2} color="white">
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
            <Text color="white">
              {project.color}
            </Text>
          </HStack>
        )}
      </Box>

      {/* Project Statistics and Time Summary */}
      {projectStats && (
        <Box p={4} border="1px" borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'} borderRadius="md" bg={colorMode === 'light' ? 'gray.50' : 'gray.700'}>
          <Text fontSize="md" fontWeight="semibold" mb={3} color="white">Project Statistics</Text>
          <VStack spacing={3} align="stretch">
            <HStack justify="space-between">
              <Text fontSize="sm" color="white">Total Tasks</Text>
              <Text fontSize="sm" fontWeight="medium" color="white">{projectStats.totalTasks}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="sm" color="white">Completed Tasks</Text>
              <Text fontSize="sm" fontWeight="medium" color="white">{projectStats.completedTasks}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="sm" color="white">Pending Tasks</Text>
              <Text fontSize="sm" fontWeight="medium" color="white">{projectStats.pendingTasks}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="sm" color="white">Completion Rate</Text>
              <Text fontSize="sm" fontWeight="medium" color="white">{projectStats.completionRate}%</Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="sm" color="white">Total Time Tracked</Text>
              <Text fontSize="sm" fontWeight="medium" color="white">{formatTime(projectStats.totalTimeTracked)}</Text>
            </HStack>
          </VStack>
        </Box>
      )}

      {/* Tasks List */}
      {tasks && tasks.length > 0 && (
        <Box>
          <Text fontSize="sm" mb={3} color="white">
            Tasks ({tasks.length})
          </Text>
          <VStack spacing={2} align="stretch">
            {tasks.map((task, index) => (
              <Box
                key={task._id || index}
                p={3}
                border="1px"
                borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
                borderRadius="md"
                bg={colorMode === 'light' ? 'white' : 'gray.800'}
              >
                <HStack justify="space-between" align="start">
                  <VStack align="start" spacing={1} flex={1}>
                    <Text fontSize="sm" fontWeight="medium" color="white">
                      {task.title}
                    </Text>
                    {task.description && (
                      <Text fontSize="xs" color="white" noOfLines={2}>
                        {task.description}
                      </Text>
                    )}
                    <HStack spacing={2}>
                      <Badge
                        size="sm"
                        colorScheme={task.completed ? 'green' : 'blue'}
                        variant="subtle"
                      >
                        {task.completed ? 'Completed' : 'Pending'}
                      </Badge>
                      {task.timeTracking?.totalTime > 0 && (
                        <Badge size="sm" colorScheme="purple" variant="subtle">
                          {formatTime(task.timeTracking.totalTime)}
                        </Badge>
                      )}
                    </HStack>
                  </VStack>
                </HStack>
              </Box>
            ))}
          </VStack>
        </Box>
      )}

      {/* Edit Actions */}
      {isEditing && hasEmailAccess && (
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
