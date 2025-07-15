import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Input,
  Textarea,
  Select,
  VStack,
  HStack,
  IconButton,
  useColorMode,
  useToast,
  Collapse,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Divider,
  Image,
  Link,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  useBreakpointValue,
  Checkbox,
  Tag,
  SimpleGrid,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Tooltip,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon, AddIcon, EditIcon, ChatIcon, DownloadIcon, DeleteIcon, WarningIcon, CalendarIcon, StarIcon, CheckCircleIcon, SunIcon, MoonIcon, InfoIcon, SettingsIcon, AttachmentIcon, CloseIcon, HamburgerIcon, LinkIcon } from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext';
import { useTasks } from '../hooks/useTasks';
import { useProjects } from '../hooks/useProjects';
import { useClients } from '../hooks/useClients';
import apiService, { OfflineNotifications } from '../services/api';
import SharedView from './SharedView';
import ShareDialog from './ShareDialog';
import BottomNav from './BottomNav';
import MobileBackdropOverlay from './MobileBackdropOverlay';
import FooterPromptPanel from './FooterPromptPanel';
import TaskList from './TaskList';

import Sidebar from './Sidebar';
import TaskDetailPanel from './TaskDetailPanel';
import ProjectCreatePanel from './ProjectCreatePanel';
import TaskCreatePanel from './TaskCreatePanel';
import ProjectDetailPanel from './ProjectDetailPanel';
import FeedbackModal from './FeedbackModal';
import RightSidebar from './RightSidebar';

import { ClientCreateModal } from './ClientList';
import TopBar from './TopBar';

export default function TaskDashboard() {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const location = useLocation();

  // Initialize sidebar state from localStorage
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? JSON.parse(saved) : !isMobile;
  });

  // Initialize center panel state from localStorage
  const [isCenterOpen, setIsCenterOpen] = useState(() => {
    const saved = localStorage.getItem('centerOpen');
    return saved !== null ? JSON.parse(saved) : !isMobile;
  });

  // Initialize right sidebar state from localStorage (only show on desktop)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('rightSidebarOpen');
    return saved !== null ? JSON.parse(saved) : !isMobile;
  });

  const { isOpen: isDetailOpen, onToggle: toggleDetail, onOpen: openDetail } = useDisclosure({ defaultIsOpen: false });
  const { isOpen: isFooterOpen, onToggle: toggleFooter } = useDisclosure({ defaultIsOpen: false });
  const { isOpen: isClientCreateOpen, onOpen: openClientCreate, onClose: closeClientCreate } = useDisclosure();

  // Toggle functions with localStorage persistence
  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    localStorage.setItem('sidebarOpen', JSON.stringify(newState));
  };

  const toggleCenter = () => {
    const newState = !isCenterOpen;
    setIsCenterOpen(newState);
    localStorage.setItem('centerOpen', JSON.stringify(newState));
  };

  const toggleRightSidebar = () => {
    const newState = !isRightSidebarOpen;
    setIsRightSidebarOpen(newState);
    localStorage.setItem('rightSidebarOpen', JSON.stringify(newState));
  };
  const { isOpen: isProjectCreateOpen, onOpen: openProjectCreate, onClose: closeProjectCreate } = useDisclosure({ defaultIsOpen: false });
  const { isOpen: isTaskCreateOpen, onOpen: openTaskCreate, onClose: closeTaskCreate } = useDisclosure({ defaultIsOpen: false });
  const { isOpen: isMobileTaskCreateOpen, onOpen: openMobileTaskCreate, onClose: closeMobileTaskCreate } = useDisclosure({ defaultIsOpen: false });
  const { isOpen: isMobileTaskEditOpen, onOpen: openMobileTaskEdit, onClose: closeMobileTaskEdit } = useDisclosure({ defaultIsOpen: false });
  const { isOpen: isMobileTaskDetailOpen, onOpen: openMobileTaskDetail, onClose: closeMobileTaskDetail } = useDisclosure({ defaultIsOpen: false });
  const { isOpen: isFeedbackModalOpen, onOpen: openFeedbackModal, onClose: closeFeedbackModal } = useDisclosure({ defaultIsOpen: false });
  const { colorMode, toggleColorMode } = useColorMode();
  const { logout, refreshUser, user } = useAuth();

  const {
    tasks: backendTasks,
    sharedTasks,
    loading: tasksLoading,
    sharedLoading: sharedTasksLoading,
    error: tasksError,
    sharedError: sharedTasksError,
    dismissError: dismissTasksError,
    dismissSharedError: dismissSharedTasksError,
    loadTasks,
    loadSharedTasks,
    refreshSharedTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    syncOfflineData
  } = useTasks();

  const {
    projects,
    sharedProjects,
    loading: projectsLoading,
    sharedLoading: sharedProjectsLoading,
    error: projectsError,
    sharedError: sharedProjectsError,
    dismissError: dismissProjectsError,
    dismissSharedError: dismissSharedProjectsError,
    loadProjects,
    loadSharedProjects,
    refreshSharedProjects,
    createProject,
    updateProject,
    deleteProject,
  } = useProjects();

  const {
    clients,
    loading: clientsLoading,
    error: clientsError,
    loadClients,
    createClient,
    updateClient,
    deleteClient,
  } = useClients();

  const [allBackendTasks, setAllBackendTasks] = React.useState([]);

  const [sharedContent, setSharedContent] = React.useState(null);

  // Calendar state
  const [expandedDays, setExpandedDays] = React.useState({});

  const [selectedProject, setSelectedProject] = useState(null);
  const [isProjectDetailModalOpen, setIsProjectDetailModalOpen] = useState(false);

  // Initialize shared content expanded state from localStorage
  const [isSharedContentExpanded, setIsSharedContentExpanded] = useState(() => {
    const saved = localStorage.getItem('sharedContentExpanded');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Add local state for shared projects
  const [localSharedProjects, setLocalSharedProjects] = React.useState(sharedProjects);
  React.useEffect(() => { setLocalSharedProjects(sharedProjects); }, [sharedProjects]);

  // Handle navigation state for project filtering
  useEffect(() => {
    if (location.state?.selectedProject) {
      setSelectedProject(location.state.selectedProject);
    }
  }, [location.state]);

  // Data loading is now handled by the hooks themselves with smart caching
  // No need to manually trigger loads here as they're handled on mount

  // Periodic refresh of shared content (every 5 minutes)
  React.useEffect(() => {
    if (!sharedContent) {
      const interval = setInterval(() => {
        refreshSharedTasks(false); // Don't show notifications for automatic refresh
        refreshSharedProjects(false);
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, [refreshSharedTasks, refreshSharedProjects, sharedContent]);

  React.useEffect(() => {
    if (!sharedContent) {
      // Projects and online status tracking
    }
  }, [projects, sharedContent]);

  React.useEffect(() => {
    if (!sharedContent) {
      setAllBackendTasks(Array.isArray(backendTasks) ? backendTasks : []);
    }
  }, [backendTasks, sharedContent]);

  const transformBackendTasksToLocalFormat = React.useCallback(() => {
    if (!Array.isArray(backendTasks) || backendTasks.length === 0) return {};

    const transformed = {};
    (Array.isArray(backendTasks) ? backendTasks : []).forEach(task => {
      transformed[task.title] = {
        description: task.description,
        expanded: false,
        dueDate: task.dueDate,
        project: task.project,
        tags: task.tags,
        completed: task.completed,
        _id: task._id,
        fileAttachments: task.fileAttachments || []
      };
    });
    return transformed;
  }, [backendTasks]);

  const [localTaskData, setLocalTaskData] = React.useState({});

  React.useEffect(() => {
    setLocalTaskData(transformBackendTasksToLocalFormat());
  }, [transformBackendTasksToLocalFormat]);

  const taskData = localTaskData;

  const checkOnlineStatus = async () => {
    try {
      const isCurrentlyOnline = await apiService.checkServerConnection();
      setIsOnline(isCurrentlyOnline);
    } catch (error) {
      setIsOnline(false);
    }
  };

  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [showOfflineAlert, setShowOfflineAlert] = React.useState(true);
  const toast = useToast();

  const [isShareDialogOpen, setIsShareDialogOpen] = React.useState(false);
  const [shareDialogType, setShareDialogType] = React.useState(null);
  const [shareDialogItem, setShareDialogItem] = React.useState(null);
  const [refreshLimitsTrigger, setRefreshLimitsTrigger] = React.useState(0);

  React.useEffect(() => {
    const path = window.location.pathname;
    const sharedMatch = path.match(/^\/shared\/(task|project)\/([a-f0-9]{32})$/);

    if (sharedMatch) {
      const [, type, token] = sharedMatch;
      setSharedContent({ type, token });
    }
  }, []);

  // Handle browser back/forward navigation
  React.useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const sharedMatch = path.match(/^\/shared\/(task|project)\/([a-f0-9]{32})$/);

      if (sharedMatch) {
        const [, type, token] = sharedMatch;
        setSharedContent({ type, token });
      } else {
        setSharedContent(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToShared = (type, token) => {
    setSharedContent({ type, token });
    window.history.pushState(null, '', `/shared/${type}/${token}`);
  };

  const navigateToMain = () => {
    setSharedContent(null);
    window.history.pushState(null, '', '/tasks');
  };

  // Online status and offline handling
  React.useEffect(() => {
    const handleOnlineStatusChange = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        checkOnlineStatus();
        syncOfflineData();
      }
    };

    const handleOfflineNotification = (type, data) => {
      toast({
        title: 'Offline Action',
        description: `${type} saved locally and will sync when online`,
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    };

    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);
    OfflineNotifications.addListener(handleOfflineNotification);

    // Initial check
    checkOnlineStatus();

    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
      OfflineNotifications.removeListener(handleOfflineNotification);
    };
  }, [syncOfflineData, toast]);

  // Payment success handling
  React.useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        await refreshUser();
        toast({
          title: 'Payment Successful',
          description: 'Your account has been upgraded to Pro!',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        setRefreshLimitsTrigger(prev => prev + 1);
      } catch (error) {
        console.error('Error refreshing user after payment:', error);
      }
    };

    // Listen for payment success events
    window.addEventListener('payment-success', handlePaymentSuccess);
    return () => window.removeEventListener('payment-success', handlePaymentSuccess);
  }, [refreshUser, toast]);

  const ensureThreeTags = (tags) => {
    if (!tags || tags.length < 3) {
      const defaultTags = ['urgent', 'important', 'work'];
      return tags ? [...tags, ...defaultTags.slice(tags.length)] : defaultTags;
    }
    return tags;
  };

  const toMST = (date) => {
    return new Date(date).toLocaleString('en-US', { timeZone: 'America/Denver' });
  };

  const getAllTasksForSearch = () => {
    const allTasks = [];
    Object.keys(taskData).forEach(taskName => {
      allTasks.push({
        title: taskName,
        ...taskData[taskName]
      });
    });
    return allTasks;
  };

  const toggleDay = (day) => {
    setExpandedDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        if (isDetailOpen) {
          toggleDetail();
        }
        if (isTaskCreateOpen) {
          closeTaskCreate();
        }
        if (isProjectCreateOpen) {
          closeProjectCreate();
        }
        if (isMobileTaskCreateOpen) {
          closeMobileTaskCreate();
        }
        if (isMobileTaskEditOpen) {
          closeMobileTaskEdit();
        }
        if (isMobileTaskDetailOpen) {
          closeMobileTaskDetail();
        }
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isDetailOpen, isTaskCreateOpen, isProjectCreateOpen, isMobileTaskCreateOpen, isMobileTaskEditOpen, isMobileTaskDetailOpen]);

  const handleTaskClick = (taskName) => {
    const task = taskData[taskName];
    if (task) {
      setSelectedTask({ title: taskName, ...task });
      if (!isDetailOpen) {
        openDetail();
      }
    }
  };

  const handleTaskSelect = (task) => {
    setSelectedTask(task);
    if (!isDetailOpen) {
      openDetail();
    }
  };

  const handleWeeklyTaskClick = (task) => {
    // Find the task in backendTasks and select it
    const backendTask = backendTasks.find(t => t.title === task.title);
    if (backendTask) {
      setSelectedTask(backendTask);
      if (!isDetailOpen) {
        openDetail();
      }
    }
  };

  const handleFilteredTaskClick = (task) => {
    setSelectedTask(task);
    if (!isDetailOpen) {
      openDetail();
    }
  };

  const getDayOfWeek = (dateString) => {
    const date = new Date(dateString);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  const handleDayClick = (day) => {
    setExpandedDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  const dayTasks = () => {
    const tasksByDay = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    days.forEach(day => {
      tasksByDay[day] = [];
    });

    if (Array.isArray(backendTasks)) {
      backendTasks.forEach(task => {
        if (task.dueDate) {
          const dayOfWeek = getDayOfWeek(task.dueDate);
          if (tasksByDay[dayOfWeek]) {
            tasksByDay[dayOfWeek].push(task);
          }
        }
      });
    }

    return tasksByDay;
  };

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setIsProjectDetailModalOpen(true);
  };

  const handleProjectFilter = (projectName) => {
    setSelectedProject(projectName);
  };

  const handleTagClick = (tag) => {
    setSelectedTag(tag);
  };

  const clearTagFilter = () => {
    setSelectedTag(null);
  };

  const resetToAllTasks = () => {
    setSelectedProject(null);
    setSelectedTag(null);
    setSelectedDay(null);
    setIsFilteredByDay(false);
  };

  const clearDayFilter = () => {
    setSelectedDay(null);
    setIsFilteredByDay(false);
  };

  const clearProjectFilter = () => {
    setSelectedProject(null);
  };

  const onUpdateTask = async () => {
    if (!selectedTask) return;

    try {
      await updateTask(selectedTask._id, selectedTask);
      toast({
        title: 'Task Updated',
        description: 'Task has been updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [isFilteredByDay, setIsFilteredByDay] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleSearch = (searchValue) => {
    setSearchQuery(searchValue);
  };

  const getFilteredTasksBySearch = (tasks) => {
    if (!searchQuery.trim()) return tasks;
    return tasks.filter(task =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.project && task.project.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.tags && task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    );
  };

  const sortTasks = (tasks) => {
    return tasks.sort((a, b) => {
      // Sort by completion status first
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      // Then by due date
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      // Then by creation date
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  };

  const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  const getDueDateCategory = (dueDate) => {
    if (!dueDate) return 'no-due-date';

    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'overdue';
    if (diffDays === 0) return 'due-today';
    if (diffDays <= 7) return 'due-this-week';
    return 'due-later';
  };

  const onDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      await deleteTask(taskToDelete._id);
      setIsDeleteDialogOpen(false);
      setTaskToDelete(null);
      toast({
        title: 'Task Deleted',
        description: 'Task has been deleted successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete task. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const onLeaveTask = async (taskId) => {
    try {
      // This would be implemented in the backend
      toast({
        title: 'Left Task',
        description: 'You have left the shared task.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error leaving task:', error);
      toast({
        title: 'Error',
        description: 'Failed to leave task. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const onLeaveProject = async (projectId) => {
    try {
      // This would be implemented in the backend
      toast({
        title: 'Left Project',
        description: 'You have left the shared project.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error leaving project:', error);
      toast({
        title: 'Error',
        description: 'Failed to leave project. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const toggleTaskCompleted = async (taskName, source = 'today') => {
    try {
      const task = backendTasks.find(t => t.title === taskName);
      if (task) {
        await toggleTaskCompletion(task._id, !task.completed);
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task status. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAddTask = () => {
    if (isMobile) {
      openMobileTaskCreate();
    } else {
      openTaskCreate();
    }
  };

  const handleMobileTaskEdit = () => {
    if (selectedTask) {
      openMobileTaskEdit();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const onDeleteProject = async (projectId) => {
    try {
      await deleteProject(projectId);
      toast({
        title: 'Project Deleted',
        description: 'Project has been deleted successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete project. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAddProject = () => {
    openProjectCreate();
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.filename;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload file. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleFileDelete = async (filename) => {
    try {
      const response = await fetch(`/api/uploads/${filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      toast({
        title: 'File Deleted',
        description: 'File has been deleted successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete file. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const confirmFileDelete = async () => {
    // This would be implemented with a confirmation dialog
    toast({
      title: 'File Deleted',
      description: 'File has been deleted successfully.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const getFileIcon = (mimetype) => {
    if (mimetype.startsWith('image/')) return '🖼️';
    if (mimetype.startsWith('video/')) return '🎥';
    if (mimetype.startsWith('audio/')) return '🎵';
    if (mimetype.includes('pdf')) return '📄';
    if (mimetype.includes('word') || mimetype.includes('document')) return '📝';
    if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) return '📊';
    return '📎';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const loadTaskFiles = async (taskId) => {
    // This would load files for a specific task
    return [];
  };

  const renderFileAttachmentIndicator = (fileAttachments) => {
    if (!fileAttachments || fileAttachments.length === 0) return null;

    return (
      <Tooltip label={`${fileAttachments.length} attachment(s)`}>
        <Icon as={AttachmentIcon} color="blue.500" boxSize={4} />
      </Tooltip>
    );
  };

  const prepareTagsForDisplay = (tags, fileAttachments, taskTitle = null) => {
    const displayTags = tags || [];
    if (fileAttachments && fileAttachments.length > 0) {
      displayTags.push('📎');
    }
    return displayTags;
  };

  const handleShareTask = (task) => {
    setShareDialogType('task');
    setShareDialogItem(task);
    setIsShareDialogOpen(true);
  };

  const handleShareProject = (project) => {
    setShareDialogType('project');
    setShareDialogItem(project);
    setIsShareDialogOpen(true);
  };

  const handleSharedTaskClick = (task) => {
    setSelectedTask(task);
    if (!isDetailOpen) {
      openDetail();
    }
  };

  const handleSharedProjectClick = (project) => {
    setSelectedProject(project);
    setIsProjectDetailModalOpen(true);
  };

  const toggleSharedContentExpanded = () => {
    const newState = !isSharedContentExpanded;
    setIsSharedContentExpanded(newState);
    localStorage.setItem('sharedContentExpanded', JSON.stringify(newState));
  };

  const refreshSharedContent = async () => {
    try {
      await refreshSharedTasks(true);
      await refreshSharedProjects(true);
      toast({
        title: 'Shared Content Refreshed',
        description: 'Shared content has been updated.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error refreshing shared content:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh shared content. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };



  const handleShareDialogClose = () => {
    setIsShareDialogOpen(false);
    setShareDialogType(null);
    setShareDialogItem(null);
  };

  const handleShareCreated = async (shareData) => {
    try {
      const response = await fetch('/api/shares', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(shareData)
      });

      if (!response.ok) {
        throw new Error('Failed to create share');
      }

      const result = await response.json();

      toast({
        title: 'Share Created',
        description: 'Content has been shared successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      handleShareDialogClose();
    } catch (error) {
      console.error('Error creating share:', error);
      toast({
        title: 'Error',
        description: 'Failed to create share. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const testSharing = async () => {
    try {
      const response = await fetch('/api/shares/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Test failed');
      }

      toast({
        title: 'Test Successful',
        description: 'Sharing functionality is working correctly.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error testing sharing:', error);
      toast({
        title: 'Test Failed',
        description: 'Sharing functionality is not working.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (isDetailOpen) {
      toggleDetail();
    }
    setSelectedTask(null);
  };

  if (sharedContent) {
    return (
      <SharedView
        type={sharedContent.type}
        token={sharedContent.token}
        onBack={navigateToMain}
      />
    );
  }

  return (
    <Box minH="100vh" bg={colorMode === 'dark' ? 'gray.900' : 'gray.50'}>
    {!isOnline && showOfflineAlert && (
      <Alert status="warning" variant="solid" position="fixed" top={0} left={0} right={0} zIndex={999}>
        <AlertIcon />
        <Box flex="1">
          <AlertTitle>Offline Mode</AlertTitle>
          <AlertDescription>
            You're currently offline. Changes will be synced when you're back online.
          </AlertDescription>
        </Box>
        <IconButton
          aria-label="Dismiss offline alert"
          icon={<CloseIcon />}
          size="sm"
          variant="ghost"
          color="white"
          _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
          onClick={() => setShowOfflineAlert(false)}
        />
      </Alert>
    )}

    <Flex h="100vh" overflow="hidden">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        isCenterOpen={isCenterOpen}
        colorMode={colorMode}
        toggleSidebar={toggleSidebar}
        // Shared content props
        sharedTasks={sharedTasks}
        sharedProjects={localSharedProjects}
        sharedTasksLoading={sharedTasksLoading}
        sharedProjectsLoading={sharedProjectsLoading}
        sharedTasksError={sharedTasksError}
        sharedProjectsError={sharedProjectsError}
        isSharedContentExpanded={isSharedContentExpanded}
        toggleSharedContentExpanded={toggleSharedContentExpanded}
        onSharedTaskClick={handleSharedTaskClick}
        onSharedProjectClick={handleSharedProjectClick}
        refreshSharedContent={refreshSharedContent}
        dismissSharedTasksError={dismissSharedTasksError}
        // Navigation props
        resetToAllTasks={resetToAllTasks}
        isProUser={user?.userType === 'pro'}
      />

      <Flex flex="1" direction="column">
        <TopBar
          colorMode={colorMode}
          toggleColorMode={toggleColorMode}
          isOnline={isOnline}
          currentView={selectedProject ? 'project' : selectedTag ? 'tag' : isFilteredByDay ? 'day' : 'all'}
          searchTerm={searchQuery}
          handleSearch={handleSearch}
          resetToAllTasks={resetToAllTasks}
          isSidebarOpen={isSidebarOpen}
          isCenterOpen={isCenterOpen}
          isRightSidebarOpen={isRightSidebarOpen}
          toggleRightSidebar={toggleRightSidebar}
          onLogout={handleLogout}
        />

        <Box flex="1" overflowY="auto" p={4} mb={{ base: "80px", md: "60px" }}>
          <TaskList
            tasks={backendTasks}
            loading={tasksLoading}
            error={tasksError}
            selectedTask={selectedTask}
            onTaskSelect={handleTaskSelect}
            onTaskUpdate={updateTask}
            onTaskDelete={deleteTask}
            onShareTask={handleShareTask}
            onTagClick={handleTagClick}
            searchTerm={searchQuery}
            statusFilter="all"
            sortBy="createdAt"
            sortOrder="desc"
            selectedProject={selectedProject}
            selectedTag={selectedTag}
            selectedDay={selectedDay}
            isFilteredByDay={isFilteredByDay}
            isFilteredByTag={selectedTag !== null}
            onClearDayFilter={clearDayFilter}
            onClearProjectFilter={clearProjectFilter}
            onClearTagFilter={clearTagFilter}
            onDismissError={dismissTasksError}
          />
        </Box>

        <BottomNav
          isSidebarOpen={isSidebarOpen}
          isCenterOpen={isCenterOpen}
          isAddMode={isMobileTaskCreateOpen}
          isFooterOpen={isFeedbackModalOpen}
          toggleSidebar={toggleSidebar}
          toggleCenter={toggleCenter}
          handleAddTask={handleAddTask}
          handleAddProject={() => window.location.href = '/projects'}
          handleAddClient={() => {}}
          toggleDetail={toggleDetail}
          toggleFooter={openFeedbackModal}
          handleMobileTaskEdit={handleMobileTaskEdit}
          isMobileTaskEditOpen={isMobileTaskEditOpen}
          isRightSidebarOpen={isRightSidebarOpen}
          toggleRightSidebar={toggleRightSidebar}
        />
      </Flex>

      {/* Desktop Task Detail Panel */}
      <Collapse in={isDetailOpen && !isMobile} animateOpacity>
        <Box
          w="400px"
          bg={colorMode === 'dark' ? 'gray.800' : 'white'}
          borderLeft="1px"
          borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
          overflowY="auto"
          mb="120px"
        >
          <TaskDetailPanel
            task={selectedTask}
            projects={projects}
            onTaskUpdate={updateTask}
            onTaskDelete={deleteTask}
            onLeaveTask={onLeaveTask}
            onClose={toggleDetail}
            onTagClick={handleTagClick}
            isShared={selectedTask?.isSharedWithMe || false}
          />
        </Box>
      </Collapse>

      {/* Desktop Right Sidebar */}
      {!isMobile && isRightSidebarOpen && (
        <RightSidebar
          currentView="tasks"
          colorMode={colorMode}
          dayTasks={dayTasks()}
          expandedDays={expandedDays}
          getCurrentDay={getCurrentDay}
          handleDayClick={handleDayClick}
          handleWeeklyTaskClick={handleWeeklyTaskClick}
          toggleTaskCompleted={toggleTaskCompleted}
          renderFileAttachmentIndicator={renderFileAttachmentIndicator}
        />
      )}
    </Flex>

    <MobileBackdropOverlay
      isOpen={isSidebarOpen && isMobile}
      onClose={toggleSidebar}
    />

    <ShareDialog
      isOpen={isShareDialogOpen}
      onClose={handleShareDialogClose}
      type={shareDialogType}
      item={shareDialogItem}
      onShareCreated={handleShareCreated}
    />

    <ProjectCreatePanel
      isOpen={isProjectCreateOpen}
      onClose={closeProjectCreate}
      onCreateProject={createProject}
      loading={projectsLoading}
    />

    <TaskCreatePanel
      isOpen={isTaskCreateOpen}
      onClose={closeTaskCreate}
      onCreateTask={createTask}
      projects={projects}
      sharedProjects={sharedProjects}
      loading={tasksLoading}
    />

    {/* Mobile Task Create Panel */}
    {isMobileTaskCreateOpen && (
      <Box
        position="fixed"
        top="60px"
        left={0}
        right={0}
        bottom={0}
        zIndex={80}
        bg={colorMode === 'light' ? 'white' : 'gray.800'}
        p={4}
        overflowY="auto"
        boxShadow="lg"
      >
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md" color={colorMode === 'light' ? 'gray.800' : 'white'}>Create New Task</Heading>
          <IconButton
            icon={<CloseIcon />}
            aria-label="Close task creation"
            size="sm"
            variant="ghost"
            onClick={closeMobileTaskCreate}
            color={colorMode === 'light' ? 'gray.600' : 'gray.400'}
            _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
          />
        </Flex>
        <TaskCreatePanel
          isOpen={true}
          onClose={closeMobileTaskCreate}
          onCreateTask={createTask}
          projects={projects}
          sharedProjects={sharedProjects}
          loading={tasksLoading}
        />
      </Box>
    )}

    {/* Mobile Task Edit Panel */}
    {isMobileTaskEditOpen && selectedTask && (
      <Box
        position="fixed"
        top="60px"
        left={0}
        right={0}
        bottom={0}
        zIndex={80}
        bg={colorMode === 'light' ? 'white' : 'gray.800'}
        p={4}
        overflowY="auto"
        boxShadow="lg"
      >

        <TaskDetailPanel
          task={selectedTask}
          projects={projects}
          onTaskUpdate={updateTask}
          onTaskDelete={deleteTask}
          onLeaveTask={onLeaveTask}
          onClose={closeMobileTaskEdit}
          onTagClick={handleTagClick}
          isShared={selectedTask?.isSharedWithMe || false}
        />
      </Box>
    )}

    {/* Mobile Task Detail Panel */}
    {isMobileTaskDetailOpen && selectedTask && (
      <Box
        position="fixed"
        top="60px"
        left={0}
        right={0}
        bottom={0}
        zIndex={80}
        bg={colorMode === 'light' ? 'white' : 'gray.800'}
        p={4}
        overflowY="auto"
        boxShadow="lg"
      >

        <TaskDetailPanel
          task={selectedTask}
          projects={projects}
          onTaskUpdate={updateTask}
          onTaskDelete={deleteTask}
          onLeaveTask={onLeaveTask}
          onClose={closeMobileTaskDetail}
          onTagClick={handleTagClick}
          isShared={selectedTask?.isSharedWithMe || false}
        />
      </Box>
    )}

    <AlertDialog
      isOpen={isDeleteDialogOpen}
      onClose={() => setIsDeleteDialogOpen(false)}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader>Delete Task</AlertDialogHeader>
          <AlertDialogBody>
            Are you sure you want to delete "{taskToDelete?.title}"? This action cannot be undone.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button colorScheme="red" ml={3} onClick={onDeleteTask}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>

    <FeedbackModal
      isOpen={isFeedbackModalOpen}
      onClose={closeFeedbackModal}
    />

    {/* Project Detail Modal */}
    {selectedProject && (
      <ProjectDetailPanel
        project={selectedProject}
        tasks={backendTasks}
        onProjectUpdate={updateProject}
        onProjectDelete={async (projectId) => {
          await deleteProject(projectId);
          setIsProjectDetailModalOpen(false);
          setSelectedProject(null);
        }}
        onLeaveProject={onLeaveProject}
        onClose={() => setIsProjectDetailModalOpen(false)}
        onShareProject={handleShareProject}
        isOpen={isProjectDetailModalOpen}
        isShared={selectedProject?.isSharedWithMe || false}
      />
    )}

    <ClientCreateModal
      isOpen={isClientCreateOpen}
      onClose={closeClientCreate}
      onClientAdded={loadClients}
    />
  </Box>
);
}
