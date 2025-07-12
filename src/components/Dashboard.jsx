import React, { useState } from 'react';
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
import ProjectsPanel from './ProjectsPanel';
import SidebarCalendar from './SidebarCalendar';
import TaskDetailPanel from './TaskDetailPanel';
import ProjectCreatePanel from './ProjectCreatePanel';
import TaskCreatePanel from './TaskCreatePanel';
import ProjectDetailPanel from './ProjectDetailPanel';
import FeedbackModal from './FeedbackModal';
import SharedContentPanel from './SharedContentPanel';
import { ClientCreateModal } from './ClientList';
import TopBar from './TopBar';

export default function Dashboard() {
  const isMobile = useBreakpointValue({ base: true, md: false });

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
      console.error('Failed to check online status:', error);
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
    } else {
      setSharedContent(null);
    }
  }, []);

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
    const path = `/shared/${type}/${token}`;
    window.history.pushState({}, '', path);
    setSharedContent({ type, token });
  };

  const navigateToMain = () => {
    window.history.pushState({}, '', '/dashboard');
    setSharedContent(null);
  };

  React.useEffect(() => {
    const handleOnlineStatusChange = () => {
      const wasOnline = isOnline;
      const isNowOnline = navigator.onLine;
      setIsOnline(isNowOnline);

      // Show offline alert when going offline, hide when coming back online
      if (!isNowOnline && wasOnline) {
        setShowOfflineAlert(true);
      } else if (isNowOnline && !wasOnline) {
        setShowOfflineAlert(false);
      }

      checkOnlineStatus();
    };

    const handleOfflineNotification = (type, data) => {
      const messages = {
        'task-created': 'Task created offline. Will sync when online.',
        'task-updated': 'Task updated offline. Will sync when online.',
        'task-deleted': 'Task deleted offline. Will sync when online.',
        'project-created': 'Project created offline. Will sync when online.',
        'project-updated': 'Project updated offline. Will sync when online.',
        'project-deleted': 'Project deleted offline. Will sync when online.',
      };

      const message = messages[type] || 'Action performed offline. Will sync when online.';

      toast({
        title: 'Offline Mode',
        description: message,
        status: 'info',
        duration: 4000,
        isClosable: true,
      });
    };

    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    OfflineNotifications.addListener(handleOfflineNotification);

    checkOnlineStatus();

    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
      OfflineNotifications.removeListener(handleOfflineNotification);
    };
  }, [toast]);

  // Handle payment success
  React.useEffect(() => {
    const handlePaymentSuccess = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const success = urlParams.get('success');
      const sessionId = urlParams.get('session_id');

      if (success === 'true' && sessionId) {
        try {
          // Verify the payment session
          const result = await apiService.verifyPaymentSession(sessionId);

          if (result.success) {
            toast({
              title: 'Payment Successful!',
              description: 'Welcome to PopTask Pro! You now have unlimited tasks and projects.',
              status: 'success',
              duration: 8000,
              isClosable: true,
            });

            // Refresh user context to get updated user type
            await refreshUser();

            // Clean up URL parameters
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          toast({
            title: 'Payment Verification Error',
            description: 'There was an issue verifying your payment. Please contact support if you were charged.',
            status: 'error',
            duration: 8000,
            isClosable: true,
          });
        }
      }
    };

    handlePaymentSuccess();
  }, [toast, refreshUser]);

  const ensureThreeTags = (tags) => {
    if (!tags || !Array.isArray(tags)) return ['', '', ''];

    const paddedTags = [...tags];
    while (paddedTags.length < 3) {
      paddedTags.push('');
    }
    return paddedTags.slice(0, 3);
  };

  const toMST = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return new Date(d.getTime() - (d.getTimezoneOffset() * 60000));
  };

  const getAllTasksForSearch = () => {
    const allTasks = [];

    if (Array.isArray(backendTasks)) {
      backendTasks.forEach(task => {
        allTasks.push({
          ...task,
          source: 'backend',
          searchText: `${task.title} ${task.description} ${task.tags?.join(' ') || ''} ${task.project || ''}`.toLowerCase()
        });
      });
    }

    return allTasks;
  };

  const [selectedDays, setSelectedDays] = React.useState(new Set());
  const [calendarTasks, setCalendarTasks] = React.useState({});

  const toggleDay = (day) => {
    const newSelectedDays = new Set(selectedDays);
    if (newSelectedDays.has(day)) {
      newSelectedDays.delete(day);
    } else {
      newSelectedDays.add(day);
    }
    setSelectedDays(newSelectedDays);
  };

  React.useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        if (isDetailOpen) {
          toggleDetail();
        }
        if (isFooterOpen) {
          toggleFooter();
        }
        if (isSidebarOpen && isMobile) {
          toggleSidebar();
        }
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isDetailOpen, isFooterOpen, isSidebarOpen, isMobile, toggleDetail, toggleFooter, toggleSidebar]);

  const [selectedTask, setSelectedTask] = React.useState(null);
  const [isEditing, setIsEditing] = React.useState(false);

  const handleTaskClick = (taskName) => {
    const task = taskData[taskName];
    if (task) {
      setSelectedTask({
        title: taskName,
        ...task
      });
      setIsEditing(false);
      if (!isDetailOpen) {
        toggleDetail();
      }
    }
  };

  const handleTaskSelect = (task) => {
    setSelectedTask(task);
    setIsEditing(false);
    if (isMobile) {
      openMobileTaskDetail();
    } else {
      if (!isDetailOpen) {
        toggleDetail();
      }
    }
  };

  const handleWeeklyTaskClick = (task) => {
    setSelectedTask({
      title: task.title,
      description: task.description,
      expanded: false,
      dueDate: task.dueDate,
      project: task.project,
      tags: task.tags,
      completed: task.completed,
      _id: task._id,
      fileAttachments: task.fileAttachments || []
    });
    setIsEditing(false);
    if (isMobile) {
      openMobileTaskDetail();
    } else {
      if (!isDetailOpen) {
        toggleDetail();
      }
    }
  };

  const handleFilteredTaskClick = (task) => {
    setSelectedTask({
      title: task.title,
      description: task.description,
      expanded: false,
      dueDate: task.dueDate,
      project: task.project,
      tags: task.tags,
      completed: task.completed,
      _id: task._id,
      fileAttachments: task.fileAttachments || []
    });
    setIsEditing(false);
    if (isMobile) {
      openMobileTaskDetail();
    } else {
      if (!isDetailOpen) {
        toggleDetail();
      }
    }
  };

  // Utility function to get day of week without timezone issues
  const getDayOfWeek = (dateString) => {
    if (!dateString) return '';
    // Split the date string and take only the date part (YYYY-MM-DD)
    const dateOnly = dateString.split('T')[0];
    const [year, month, day] = dateOnly.split('-');
    // Create date in local timezone by using the date components
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const handleDayClick = (day) => {
    // Set day filtering state
    setIsFilteredByDay(true);
    setSelectedDay(day);

    // Clear other filters
    setSelectedProject(null);
    setSelectedTag(null);

    // Filter tasks by the selected day of the week
    const filteredTasks = Array.isArray(backendTasks) ? backendTasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDayOfWeek = getDayOfWeek(task.dueDate);
      return taskDayOfWeek === day;
    }) : [];

    // Set the filtered tasks to be displayed in the main task list
    setFilteredTasks(filteredTasks);

    // Clear selected task when clicking on a day - don't automatically open detail panel
    setSelectedTask(null);
    if (isDetailOpen) {
      toggleDetail();
    }
  };

    // Calendar helper functions
  const dayTasks = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const tasksByDay = {};

    days.forEach(day => {
      tasksByDay[day] = Array.isArray(backendTasks) ? backendTasks.filter(task => {
        if (!task.dueDate) return false;
        const taskDayOfWeek = getDayOfWeek(task.dueDate);
        return taskDayOfWeek === day;
      }) : [];
    });

    return tasksByDay;
  };

  const [filteredTasks, setFilteredTasks] = React.useState([]);
  const [isFilteredByDay, setIsFilteredByDay] = React.useState(false);
  const [selectedDay, setSelectedDay] = React.useState(null);

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setIsFilteredByDay(false);
    setSelectedDay(null);

    const projectTasks = Array.isArray(backendTasks)
      ? backendTasks.filter(
          task =>
            task.project &&
            project.name &&
            task.project.toLowerCase() === project.name.toLowerCase()
        )
      : [];

    setFilteredTasks(projectTasks);

    if (!isCenterOpen) {
      toggleCenter();
    }
  };

    const handleProjectFilter = (projectName) => {
    setSelectedProject(projectName);
    setIsFilteredByDay(false);
    setSelectedDay(null);

    // Filter tasks by project name (case-insensitive)
    const projectTasks = Array.isArray(backendTasks)
      ? backendTasks.filter(
          task =>
            task.project &&
            projectName &&
            task.project.toLowerCase() === projectName.toLowerCase()
        )
      : [];

    setFilteredTasks(projectTasks);
  };

  const [selectedTag, setSelectedTag] = React.useState(null);

  const handleTagClick = (tag) => {
    setSelectedTag(tag);
    setIsFilteredByDay(false);
    setSelectedDay(null);
    // Filter tasks by the selected tag
    const tasksWithTag = backendTasks.filter(task =>
      task.tags && task.tags.includes(tag)
    );
    setFilteredTasks(tasksWithTag);
  };

  const clearTagFilter = () => {
    setSelectedTag(null);
    setFilteredTasks([]);
  };

  const resetToAllTasks = () => {
    setSelectedProject(null);
    setSelectedTag(null);
    setIsFilteredByDay(false);
    setSelectedDay(null);
    setFilteredTasks([]);
  };

  const clearDayFilter = () => {
    setIsFilteredByDay(false);
    setSelectedDay(null);
    setFilteredTasks([]);
  };

  const clearProjectFilter = () => {
    setSelectedProject(null);
    setFilteredTasks([]);
  };

  const onUpdateTask = async () => {
    if (!selectedTask) return;

    try {
      const updatedTask = {
        title: selectedTask.title,
        description: selectedTask.description,
        dueDate: selectedTask.dueDate,
        project: selectedTask.project,
        tags: selectedTask.tags,
        completed: selectedTask.completed,
        fileAttachments: selectedTask.fileAttachments || []
      };

      if (selectedTask._id) {
        const result = await updateTask(selectedTask._id, updatedTask);
        // Update the selected task with the returned data
        setSelectedTask(result);
        toast({
          title: 'Task Updated',
          description: 'Task has been updated successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        const result = await createTask(updatedTask);
        setSelectedTask(result);
        toast({
          title: 'Task Created',
          description: 'Task has been created successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      // Don't close the detail panel or clear selected task - keep it open to show updated data
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update task:', error);
      // Handle limit errors specifically
      if (error.isLimitError) {
        toast({
          title: 'Task Limit Reached',
          description: error.message || 'You have reached your task limit. Upgrade to Pro for unlimited tasks.',
          status: 'warning',
          duration: 8000,
          isClosable: true,
          position: 'top',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update task. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);

  const handleSearch = (searchValue) => {
    setSearchQuery(searchValue);
  };

  const getFilteredTasksBySearch = (tasks) => {
    if (!searchQuery.trim()) return tasks;

    const query = searchQuery.toLowerCase();
    return tasks.filter(task => {
      const searchText = `${task.title} ${task.description} ${task.tags?.join(' ') || ''} ${task.project || ''}`.toLowerCase();
      return searchText.includes(query);
    });
  };

  const sortTasks = (tasks) => {
    return tasks.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate) - new Date(b.dueDate);
      } else if (a.dueDate) {
        return -1;
      } else if (b.dueDate) {
        return 1;
      }

      return a.title.localeCompare(b.title);
    });
  };

  const getCurrentDay = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const getDueDateCategory = (dueDate) => {
    if (!dueDate) return 'no-due-date';

    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'overdue';
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'tomorrow';
    if (diffDays <= 7) return 'this-week';
    return 'future';
  };

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [taskToDelete, setTaskToDelete] = React.useState(null);

  const onDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      await deleteTask(taskToDelete._id);

      // Refresh limits display
      setRefreshLimitsTrigger(prev => prev + 1);

      toast({
        title: 'Task Deleted',
        description: 'Task has been deleted successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setIsDeleteDialogOpen(false);
      setTaskToDelete(null);
      if (isDetailOpen) {
        toggleDetail();
      }
      setSelectedTask(null);
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete task. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const onLeaveTask = async (taskId) => {
    try {
      await apiService.leaveSharedTask(taskId);

      // Refresh tasks
      loadTasks();

      toast({
        title: 'Success',
        description: 'Successfully left the shared task.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to leave task:', error);
      toast({
        title: 'Error',
        description: 'Failed to leave task. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const onLeaveProject = async (projectId) => {
    try {
      await apiService.leaveSharedProject(projectId);

      // Optimistically update local state
      setLocalSharedProjects(prev => prev.filter(project => project._id !== projectId));

      // Optionally, sync with backend
      loadSharedProjects();

      toast({
        title: 'Success',
        description: 'Successfully left the shared project.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to leave project:', error);
      toast({
        title: 'Error',
        description: 'Failed to leave project. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const toggleTaskCompleted = async (taskName, source = 'today') => {
    const task = taskData[taskName];
    if (!task || !task._id) return;

    try {
      await toggleTaskCompletion(task._id, !task.completed);

      toast({
        title: task.completed ? 'Task Reopened' : 'Task Completed',
        description: task.completed ? 'Task has been reopened.' : 'Task has been completed!',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
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
      if (!isTaskCreateOpen) {
        openTaskCreate();
      }
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
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        title: 'Logout Error',
        description: 'Failed to logout. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };





  const [isDeleteProjectDialogOpen, setIsDeleteProjectDialogOpen] = React.useState(false);
  const [projectToDelete, setProjectToDelete] = React.useState(null);

  const onDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      await deleteProject(projectToDelete._id);

      // Refresh limits display
      setRefreshLimitsTrigger(prev => prev + 1);

      toast({
        title: 'Project Deleted',
        description: 'Project has been deleted successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setIsDeleteProjectDialogOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete project. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleAddProject = () => {
    openProjectCreate();
  };

  const [uploadingFiles, setUploadingFiles] = React.useState(false);

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploadingFiles(true);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      if (selectedTask && selectedTask._id) {
        formData.append('taskId', selectedTask._id);
      }

      const response = await apiService.uploadFiles(formData);

      toast({
        title: 'Files Uploaded',
        description: `${files.length} file(s) uploaded successfully.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      if (selectedTask && selectedTask._id) {
        loadTasks();
      }
    } catch (error) {
      console.error('File upload failed:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload files. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleFileDelete = async (filename) => {
    if (!selectedTask || !selectedTask._id) return;

    try {
      await apiService.deleteFile(selectedTask._id, filename);

      toast({
        title: 'File Deleted',
        description: 'File has been deleted successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      loadTasks();
    } catch (error) {
      console.error('File deletion failed:', error);
      toast({
        title: 'Deletion Failed',
        description: 'Failed to delete file. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const confirmFileDelete = async () => {
    if (!selectedTask || !selectedTask._id) return;

    try {
      await apiService.deleteFile(selectedTask._id, selectedTask.fileToDelete);

      toast({
        title: 'File Deleted',
        description: 'File has been deleted successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      loadTasks();
    } catch (error) {
      console.error('File deletion failed:', error);
      toast({
        title: 'Deletion Failed',
        description: 'Failed to delete file. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getFileIcon = (mimetype) => {
    if (mimetype.startsWith('image/')) return '🖼️';
    if (mimetype.startsWith('video/')) return '🎥';
    if (mimetype.startsWith('audio/')) return '🎵';
    if (mimetype.includes('pdf')) return '📄';
    if (mimetype.includes('word') || mimetype.includes('document')) return '📄';
    if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) return '📊';
    if (mimetype.includes('powerpoint') || mimetype.includes('presentation')) return '📊';
    if (mimetype.includes('zip') || mimetype.includes('archive')) return '📦';
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
    try {
      const files = await apiService.getTaskFiles(taskId);
      return files;
    } catch (error) {
      console.error('Failed to load task files:', error);
      return [];
    }
  };

  const renderFileAttachmentIndicator = (fileAttachments) => {
    if (!fileAttachments || fileAttachments.length === 0) return null;

    return (
      <HStack spacing={1}>
        <AttachmentIcon size="sm" color="gray.400" />
        <Text fontSize="xs" color="gray.400">
          {fileAttachments.length} file{fileAttachments.length !== 1 ? 's' : ''}
        </Text>
      </HStack>
    );
  };

  const prepareTagsForDisplay = (tags, fileAttachments, taskTitle = null) => {
    const displayTags = ensureThreeTags(tags || []);

    return displayTags.map((tag, index) => ({
      text: tag,
      color: tag ? 'blue' : 'gray',
      hasFiles: fileAttachments && fileAttachments.length > 0 && index === 0
    }));
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
    setSelectedTask({
      title: task.title,
      description: task.description,
      expanded: false,
      dueDate: task.dueDate,
      project: task.project,
      tags: task.tags,
      completed: task.completed,
      _id: task._id,
      fileAttachments: task.fileAttachments || [],
      isSharedWithMe: true
    });
    setIsEditing(false);
    if (isMobile) {
      openMobileTaskDetail();
    } else {
      if (!isDetailOpen) {
        toggleDetail();
      }
    }
  };

  const handleSharedProjectClick = (project) => {
    setSelectedProject(project);
    setIsProjectDetailModalOpen(true);
  };

  const toggleSharedContentExpanded = () => {
    const newExpandedState = !isSharedContentExpanded;
    setIsSharedContentExpanded(newExpandedState);
    localStorage.setItem('sharedContentExpanded', JSON.stringify(newExpandedState));
  };

    const refreshSharedContent = async () => {
    try {
      const [tasksResult, projectsResult] = await Promise.all([
        refreshSharedTasks(true),
        refreshSharedProjects(true)
      ]);

      // Show notifications for changes
      if (tasksResult && tasksResult.previousCount !== tasksResult.newCount) {
        const change = tasksResult.newCount > tasksResult.previousCount ? 'added' : 'removed';
        const count = Math.abs(tasksResult.newCount - tasksResult.previousCount);
        toast({
          title: 'Shared Tasks Updated',
          description: `${count} shared task${count !== 1 ? 's' : ''} ${change}.`,
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      }

      if (projectsResult && projectsResult.previousCount !== projectsResult.newCount) {
        const change = projectsResult.newCount > projectsResult.previousCount ? 'added' : 'removed';
        const count = Math.abs(projectsResult.newCount - projectsResult.previousCount);
        toast({
          title: 'Shared Projects Updated',
          description: `${count} shared project${count !== 1 ? 's' : ''} ${change}.`,
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      }

      // If no changes detected, show general success message
      if (!tasksResult && !projectsResult) {
        toast({
          title: 'Shared Content Refreshed',
          description: 'Shared content has been updated.',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Failed to refresh shared content:', error);
      toast({
        title: 'Refresh Failed',
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
    toast({
      title: 'Share Link Created',
      description: 'Share link has been created successfully.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });

    // Refresh the task data to include the new sharing information
    if (shareDialogType === 'task' && shareDialogItem?._id) {
      try {
        // Reload the specific task to get updated sharing data
        const updatedTask = await apiService.getTask(shareDialogItem._id);

        // Update the task in the backend tasks array
        setAllBackendTasks(prevTasks =>
          prevTasks.map(task =>
            task._id === shareDialogItem._id ? updatedTask.data : task
          )
        );

        // If this task is currently selected, update the selected task
        if (selectedTask && selectedTask._id === shareDialogItem._id) {
          setSelectedTask(updatedTask.data);
        }
      } catch (error) {
        console.error('Failed to refresh task data after sharing:', error);
        // Fallback: reload all tasks
        loadTasks();
      }
    }

    handleShareDialogClose();
  };

  const testSharing = async () => {
    try {
      const testTask = {
        title: 'Test Task',
        description: 'This is a test task for sharing functionality.',
        dueDate: new Date().toISOString(),
        project: 'Test Project',
        tags: ['test', 'sharing'],
        completed: false
      };

      const shareResult = await apiService.createShare('task', testTask);

      toast({
        title: 'Test Share Created',
        description: 'Test share link has been created.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Test sharing failed:', error);
      toast({
        title: 'Test Failed',
        description: 'Failed to create test share.',
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
      <SidebarCalendar
        isSidebarOpen={isSidebarOpen}
        isCenterOpen={isCenterOpen}
        colorMode={colorMode}
        dayTasks={dayTasks()}
        expandedDays={expandedDays}
        getCurrentDay={getCurrentDay}
        toggleSidebar={toggleSidebar}
        handleDayClick={handleDayClick}
        handleWeeklyTaskClick={handleWeeklyTaskClick}
        toggleTaskCompleted={toggleTaskCompleted}
        renderFileAttachmentIndicator={renderFileAttachmentIndicator}
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
          onLogout={handleLogout}
        />

        {/* Projects Panel */}
        <ProjectsPanel
          isCenterOpen={isCenterOpen}
          colorMode={colorMode}
          projectsLoading={projectsLoading}
          projectsError={projectsError}
          projects={projects}
          handleProjectFilter={handleProjectFilter}
          handleAddProject={handleAddProject}
          handleProjectClick={handleProjectClick}
          handleShareProject={handleShareProject}
          handleProjectDetailOpen={(project) => {
            setSelectedProject(project);
            setIsProjectDetailModalOpen(true);
          }}
          handleProjectDelete={onDeleteProject}
          toggleCenter={toggleCenter}
          refreshLimitsTrigger={refreshLimitsTrigger}
          onDismissError={dismissProjectsError}
        />

                <Box flex="1" overflowY="auto" p={4} mb={{ base: "80px", md: "60px" }}>
          {/* Shared Content Panel */}
          <SharedContentPanel
            sharedTasks={sharedTasks}
            sharedProjects={localSharedProjects}
            sharedTasksLoading={sharedTasksLoading}
            sharedProjectsLoading={sharedProjectsLoading}
            sharedTasksError={sharedTasksError}
            sharedProjectsError={sharedProjectsError}
            isExpanded={isSharedContentExpanded}
            onToggleExpanded={toggleSharedContentExpanded}
            onTaskClick={handleSharedTaskClick}
            onProjectClick={handleSharedProjectClick}
            onRefresh={refreshSharedContent}
            onDismissSharedError={dismissSharedTasksError}
          />

          <TaskList
            tasks={isFilteredByDay ? filteredTasks : (selectedProject ? filteredTasks : (selectedTag ? filteredTasks : backendTasks))}
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
          toggleDetail={toggleDetail}
          toggleFooter={openFeedbackModal}
          handleMobileTaskEdit={handleMobileTaskEdit}
          isMobileTaskEditOpen={isMobileTaskEditOpen}
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
