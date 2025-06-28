import React from 'react';
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
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon, AddIcon, EditIcon, ChatIcon, DownloadIcon, DeleteIcon, WarningIcon, CalendarIcon, StarIcon, CheckCircleIcon, SunIcon, MoonIcon, InfoIcon, SettingsIcon, AttachmentIcon } from '@chakra-ui/icons';
import { useTasks } from './hooks/useTasks';
import { useProjects } from './hooks/useProjects';
import apiService, { OfflineNotifications } from './services/api';

export default function TaskDashboard() {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { isOpen: isSidebarOpen, onToggle: toggleSidebar } = useDisclosure({ defaultIsOpen: !isMobile });
  const { isOpen: isDetailOpen, onToggle: toggleDetail } = useDisclosure({ defaultIsOpen: false });
  const { isOpen: isFooterOpen, onToggle: toggleFooter } = useDisclosure({ defaultIsOpen: false });
  const { isOpen: isCenterOpen, onToggle: toggleCenter } = useDisclosure({ defaultIsOpen: !isMobile });
  const { colorMode, toggleColorMode } = useColorMode();

  // Backend integration hooks
  const {
    tasks: backendTasks,
    loading: tasksLoading,
    error: tasksError,
    isOffline: tasksOffline,
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    syncOfflineData
  } = useTasks();

  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
    isOffline: projectsOffline,
    loadProjects,
    createProject,
    updateProject,
    deleteProject,
    syncOfflineData: syncProjectsOfflineData,
  } = useProjects();

  // State for all tasks (unfiltered) - needed for updates
  const [allBackendTasks, setAllBackendTasks] = React.useState([]);

  // Load backend data on component mount
  React.useEffect(() => {
    loadTasks();
    loadProjects();
  }, [loadTasks, loadProjects]);

  // Keep all tasks in sync with backend
  React.useEffect(() => {
    setAllBackendTasks(backendTasks);
  }, [backendTasks]);

  // Transform backend tasks to match local state format
  const transformBackendTasksToLocalFormat = React.useCallback(() => {
    if (!backendTasks || backendTasks.length === 0) return {};

    const transformed = {};
    backendTasks.forEach(task => {
      transformed[task.title] = {
        description: task.description,
        expanded: false,
        dueDate: task.dueDate,
        project: task.project,
        tags: task.tags,
        completed: task.completed,
        _id: task._id, // Keep the backend ID for operations
        fileAttachments: task.fileAttachments || [] // Include file attachments
      };
    });
    return transformed;
  }, [backendTasks]);

  // State for task data with descriptions
  const [localTaskData, setLocalTaskData] = React.useState({});

  // Update local task data when backend data changes
  React.useEffect(() => {
    setLocalTaskData(transformBackendTasksToLocalFormat());
  }, [transformBackendTasksToLocalFormat]);

  // Use local task data for UI (preserves expanded state and other UI-specific data)
  const taskData = localTaskData;

  // Combined sync function for both tasks and projects
  const syncAllOfflineData = async () => {
    try {
      await syncOfflineData(); // Sync tasks
      await syncProjectsOfflineData(); // Sync projects
    } catch (error) {
      console.error('Failed to sync offline data:', error);
    }
  };

  // PWA State
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = React.useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = React.useState(false);
  const toast = useToast();

  // PWA Installation Handler
  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    const handleAppInstalled = () => {
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      toast({
        title: 'App Installed!',
        description: 'Task Dashboard has been installed successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    };

    const handleOnlineStatusChange = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        toast({
          title: 'Back Online',
          description: 'You are now connected to the internet.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Offline Mode',
          description: 'You are currently offline. Tasks will be saved locally.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    // Offline notification handler
    const handleOfflineNotification = (type, data) => {
      switch (type) {
        case 'offline_task_created':
          toast({
            title: '📝 Task Saved Offline',
            description: `"${data.title}" has been saved locally and will sync when you're back online.`,
            status: 'info',
            duration: 4000,
            isClosable: true,
            position: 'top-right',
          });
          break;
        case 'offline_task_updated':
          toast({
            title: '✏️ Task Updated Offline',
            description: `"${data.title}" has been updated locally and will sync when you're back online.`,
            status: 'info',
            duration: 4000,
            isClosable: true,
            position: 'top-right',
          });
          break;
        case 'offline_task_deleted':
          toast({
            title: '🗑️ Task Deleted Offline',
            description: `"${data.title}" has been deleted locally and will sync when you're back online.`,
            status: 'info',
            duration: 4000,
            isClosable: true,
            position: 'top-right',
          });
          break;
        case 'offline_project_created':
          toast({
            title: '📁 Project Saved Offline',
            description: `"${data.name}" has been saved locally and will sync when you're back online.`,
            status: 'info',
            duration: 4000,
            isClosable: true,
            position: 'top-right',
          });
          break;
        case 'offline_project_updated':
          toast({
            title: '✏️ Project Updated Offline',
            description: `"${data.name}" has been updated locally and will sync when you're back online.`,
            status: 'info',
            duration: 4000,
            isClosable: true,
            position: 'top-right',
          });
          break;
        case 'offline_project_deleted':
          toast({
            title: '🗑️ Project Deleted Offline',
            description: `"${data.name}" has been deleted locally and will sync when you're back online.`,
            status: 'info',
            duration: 4000,
            isClosable: true,
            position: 'top-right',
          });
          break;
        case 'sync_completed':
          if (data.tasksCount > 0 || data.projectsCount > 0) {
            toast({
              title: '🔄 Sync Completed',
              description: `Successfully synced ${data.tasksCount} tasks and ${data.projectsCount} projects.`,
              status: 'success',
              duration: 5000,
              isClosable: true,
              position: 'top-right',
            });
          }
          break;
        case 'sync_error':
          toast({
            title: '⚠️ Sync Error',
            description: data.error,
            status: 'warning',
            duration: 6000,
            isClosable: true,
            position: 'top-right',
          });
          break;
        case 'manual_sync_start':
          toast({
            title: '🔄 Syncing...',
            description: 'Syncing offline changes with the server.',
            status: 'info',
            duration: 3000,
            isClosable: true,
            position: 'top-right',
          });
          break;
        case 'going_offline':
          toast({
            title: '📱 Going Offline',
            description: 'You are now offline. Tasks and projects will be saved locally.',
            status: 'warning',
            duration: 4000,
            isClosable: true,
            position: 'top-right',
          });
          break;
        default:
          break;
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    // Add offline notification listener
    OfflineNotifications.addListener(handleOfflineNotification);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);

      // Remove offline notification listener
      OfflineNotifications.removeListener(handleOfflineNotification);
    };
  }, [toast]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
      }
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  // State for search
  const [searchTerm, setSearchTerm] = React.useState('');

  // State for project filter
  const [selectedProjectFilter, setSelectedProjectFilter] = React.useState('');

  // State for expanded days
  const [expandedDays, setExpandedDays] = React.useState({});

  // State for expanded filtered tasks
  const [expandedFilteredTasks, setExpandedFilteredTasks] = React.useState({});

  // State for task title
  const [taskTitle, setTaskTitle] = React.useState('Update campaign strategy');

  // State for task description
  const [taskDescription, setTaskDescription] = React.useState('');

  // State for tasks prompt
  const [tasksPrompt, setTasksPrompt] = React.useState('');

  // State for tags
  const [tags, setTags] = React.useState(['category', 'Q3']);

  // State for editing panel
  const [editingDueDate, setEditingDueDate] = React.useState('');
  const [editingProject, setEditingProject] = React.useState('');
  const [editingTags, setEditingTags] = React.useState(['', '', '']);
  const [editingCompleted, setEditingCompleted] = React.useState(false);

  // Helper function to ensure tags always have 3 elements
  const ensureThreeTags = (tags) => {
    const tagArray = Array.isArray(tags) ? tags : [];
    const result = [...tagArray];
    while (result.length < 3) {
      result.push('');
    }
    return result.slice(0, 3); // Ensure exactly 3 elements
  };

  // State for selected task
  const [selectedTask, setSelectedTask] = React.useState(null);
  const [selectedTaskId, setSelectedTaskId] = React.useState(null);

  // Add state to track add mode
  const [isAddMode, setIsAddMode] = React.useState(false);

  // Add state to track project add mode
  const [isAddProjectMode, setIsAddProjectMode] = React.useState(false);
  const [projectTitle, setProjectTitle] = React.useState('');
  const [projectDescription, setProjectDescription] = React.useState('');

  // Add state for project editing
  const [isEditProjectMode, setIsEditProjectMode] = React.useState(false);
  const [selectedProject, setSelectedProject] = React.useState(null);
  const [selectedProjectId, setSelectedProjectId] = React.useState(null);
  const [editingProjectTitle, setEditingProjectTitle] = React.useState('');
  const [editingProjectDescription, setEditingProjectDescription] = React.useState('');

  // Add state for project deletion
  const [isDeleteProjectDialogOpen, setIsDeleteProjectDialogOpen] = React.useState(false);
  const [isDeletingProject, setIsDeletingProject] = React.useState(false);

  // Add state for file uploads
  const [uploadedFiles, setUploadedFiles] = React.useState([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef();

  // Automatically reload task files when selectedTaskId changes
  React.useEffect(() => {
    if (selectedTaskId) {
      loadTaskFiles(selectedTaskId);
    }
    // Only clear files when explicitly going to add mode or when no task is selected
    // Don't clear files when selectedTaskId becomes null due to other state changes
  }, [selectedTaskId]);

  // Utility function to convert date to Mountain Standard Time
  const toMST = (date) => {
    const mstDate = new Date(date.toLocaleString("en-US", {timeZone: "America/Denver"}));
    return mstDate;
  };

  // State for weekly tasks - dynamically generated from backend data
  const [dayTasks, setDayTasks] = React.useState({});

  // Function to organize backend tasks by day of the week
  const organizeTasksByDay = React.useCallback(() => {
    if (!backendTasks || backendTasks.length === 0) {
      setDayTasks({});
      return;
    }

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const organizedTasks = {};

    // Initialize empty arrays for each day
    daysOfWeek.forEach(day => {
      organizedTasks[day] = [];
    });

    // Organize tasks by their due date
    backendTasks.forEach(task => {
      if (task.dueDate) {
        try {
          const dueDate = new Date(task.dueDate);
          const dayName = daysOfWeek[dueDate.getDay()];

          if (organizedTasks[dayName]) {
            organizedTasks[dayName].push({
              title: task.title,
              description: task.description,
              dueDate: task.dueDate,
              project: task.project,
              tags: task.tags,
              completed: task.completed,
              _id: task._id // Keep the backend ID for operations
            });
          }
        } catch (error) {
        }
      }
    });

    // Sort tasks within each day by due date
    daysOfWeek.forEach(day => {
      organizedTasks[day].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    });

    setDayTasks(organizedTasks);
  }, [backendTasks]);

  // Update dayTasks when backend tasks change
  React.useEffect(() => {
    organizeTasksByDay();
  }, [organizeTasksByDay]);

  // State for contextual task view
  const [currentView, setCurrentView] = React.useState('all'); // 'all', 'day', 'project', 'tag'
  const [currentFilter, setCurrentFilter] = React.useState('');

  // Get all tasks from backend for global search
  const getAllTasksForSearch = () => {
    const allTasks = [];
    const seenIds = new Set(); // Track unique task _id values

    // Add tasks from taskData (backend tasks) first
    Object.keys(taskData).forEach(taskName => {
      const task = taskData[taskName];
      if (task && task._id && !seenIds.has(task._id)) {
        seenIds.add(task._id);
        allTasks.push({
          title: taskName,
          description: task.description,
          dueDate: task.dueDate,
          project: task.project,
          tags: task.tags,
          completed: task.completed,
          expanded: task.expanded,
          _id: task._id,
          fileAttachments: task.fileAttachments || [], // Include file attachments
          source: 'today'
        });
      }
    });

    // Add tasks from dayTasks (weekly view of backend tasks) only if not already seen
    Object.keys(dayTasks).forEach(day => {
      dayTasks[day].forEach(task => {
        if (task._id && !seenIds.has(task._id)) {
          seenIds.add(task._id);
          allTasks.push({
            ...task,
            fileAttachments: task.fileAttachments || [], // Include file attachments
            source: 'week'
          });
        }
      });
    });

    return allTasks;
  };

  // Memoize filtered tasks to prevent race conditions - now only uses backend data
  const filteredTasks = React.useMemo(() => {
    try {
      if (currentView === 'all') {
        const result = getAllTasksForSearch();
        return result;
      } else if (currentView === 'day' && currentFilter && dayTasks[currentFilter]) {
        const dayTasksArray = dayTasks[currentFilter];
        if (!Array.isArray(dayTasksArray)) {
          return [];
        }
        // For day view, all tasks come from dayTasks, so source should be 'week'
        return dayTasksArray.map(task => ({
          ...task,
          source: 'week'
        })).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      } else if (currentView === 'project' && currentFilter) {
        const allTasks = [];
        const seenIds = new Set(); // Track unique task _id values

        // Add tasks from taskData (backend tasks)
        Object.keys(taskData).forEach(taskName => {
          const task = taskData[taskName];
          if (task && task.project === currentFilter && task._id && !seenIds.has(task._id)) {
            seenIds.add(task._id);
            allTasks.push({
              title: taskName,
              description: task.description,
              dueDate: task.dueDate,
              project: task.project,
              tags: task.tags,
              completed: task.completed,
              expanded: task.expanded,
              _id: task._id,
              fileAttachments: task.fileAttachments || [], // Include file attachments
              source: 'today'
            });
          }
        });

        // Add tasks from dayTasks (weekly view of backend tasks) only if not already seen
        Object.keys(dayTasks).forEach(day => {
          dayTasks[day].forEach(task => {
            if (task.project === currentFilter && task._id && !seenIds.has(task._id)) {
              seenIds.add(task._id);
              allTasks.push({
                ...task,
                fileAttachments: task.fileAttachments || [], // Include file attachments
                source: 'week'
              });
            }
          });
        });

        return allTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      } else if (currentView === 'tag' && currentFilter) {
        const allTasks = [];
        const seenIds = new Set(); // Track unique task _id values

        // Add tasks from taskData (backend tasks)
        Object.keys(taskData).forEach(taskName => {
          const task = taskData[taskName];
          if (task && task.tags.includes(currentFilter) && task._id && !seenIds.has(task._id)) {
            seenIds.add(task._id);
            allTasks.push({
              title: taskName,
              description: task.description,
              dueDate: task.dueDate,
              project: task.project,
              tags: task.tags,
              completed: task.completed,
              expanded: task.expanded,
              _id: task._id,
              fileAttachments: task.fileAttachments || [], // Include file attachments
              source: 'today'
            });
          }
        });

        // Add tasks from dayTasks (weekly view of backend tasks) only if not already seen
        Object.keys(dayTasks).forEach(day => {
          dayTasks[day].forEach(task => {
            if (task.tags.includes(currentFilter) && task._id && !seenIds.has(task._id)) {
              seenIds.add(task._id);
              allTasks.push({
                ...task,
                fileAttachments: task.fileAttachments || [], // Include file attachments
                source: 'week'
              });
            }
          });
        });

        return allTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      }
      return [];
    } catch (error) {
      return [];
    }
  }, [currentView, currentFilter, taskData, dayTasks]);

  const toggleDay = (day) => {
    setExpandedDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  const handleTaskClick = (taskName) => {
      setSelectedTask(taskName);
    setSelectedTaskId(null); // Reset task ID
    setIsAddMode(false);
    setIsEditProjectMode(false);
    setIsAddProjectMode(false);

    // First, try to find the task in backend tasks
    let foundTaskData = backendTasks.find(task => task.title === taskName);

    // If not found in backend tasks, search in other sources
    if (!foundTaskData) {
      if (currentView === 'all' && taskData && taskData[taskName]) {
        foundTaskData = taskData[taskName];
      } else if (dayTasks) {
        // Search in dayTasks
        Object.values(dayTasks).forEach(dayTaskList => {
          if (Array.isArray(dayTaskList)) {
            const foundTask = dayTaskList.find(task => task.title === taskName);
            if (foundTask) {
              foundTaskData = foundTask;
            }
          }
        });
      }
    }

    if (foundTaskData) {
      setTaskTitle(foundTaskData.title);
      setTaskDescription(foundTaskData.description || '');
      setEditingDueDate(foundTaskData.dueDate || '');
      setEditingProject(foundTaskData.project || 'general');
      setEditingTags(ensureThreeTags(foundTaskData.tags || []));
      setEditingCompleted(foundTaskData.completed || false);

      // Check if this task has a backend ID
      if (foundTaskData._id) {
        setSelectedTaskId(foundTaskData._id);
        loadTaskFiles(foundTaskData._id);
      } else {
        setSelectedTaskId(null);
        setUploadedFiles([]);
      }
    } else {
      // If task not found, set default values
      setTaskTitle(taskName);
      setTaskDescription('');
      setEditingDueDate('');
      setEditingProject('general');
      setEditingTags(ensureThreeTags([]));
      setEditingCompleted(false);
      setSelectedTaskId(null);
      setUploadedFiles([]);
    }

    if (!isDetailOpen) toggleDetail();
  };

  const handleWeeklyTaskClick = (task) => {
      setSelectedTask(task.title);
      setSelectedTaskId(task._id);
    setIsAddMode(false);
    setIsEditProjectMode(false);
    setIsAddProjectMode(false);

      setTaskTitle(task.title);
    setTaskDescription(task.description || '');
    setEditingDueDate(task.dueDate || '');
    setEditingProject(task.project || 'general');
    setEditingTags(ensureThreeTags(task.tags || []));
    setEditingCompleted(task.completed || false);

    // Load task files
    if (task._id) {
      loadTaskFiles(task._id);
    } else {
      setUploadedFiles([]);
    }

    if (!isDetailOpen) toggleDetail();
  };

  const handleFilteredTaskClick = (task) => {
      setSelectedTask(task.title);
    setSelectedTaskId(task._id);
    setIsAddMode(false);
    setIsEditProjectMode(false);
    setIsAddProjectMode(false);

      setTaskTitle(task.title);
    setTaskDescription(task.description || '');
    setEditingDueDate(task.dueDate || '');
    setEditingProject(task.project || 'general');
    setEditingTags(ensureThreeTags(task.tags || []));
    setEditingCompleted(task.completed || false);

    // Load task files
    if (task._id) {
      loadTaskFiles(task._id);
      } else {
      setUploadedFiles([]);
      }

    if (!isDetailOpen) toggleDetail();
  };

  const handleDayClick = (day) => {
    setCurrentView('day');
    setCurrentFilter(day);
  };

  const handleProjectClick = (project) => {
    // Set to project edit mode
    setIsAddMode(false);
    setIsAddProjectMode(false);
    setIsEditProjectMode(true);

    // Update selected project
    setSelectedProject(project);
    setSelectedProjectId(project._id);
    setEditingProjectTitle(project.name);
    setEditingProjectDescription(project.description || '');

    // Clear task-related state
    setSelectedTask(null);
    setSelectedTaskId(null);
    setUploadedFiles([]); // Clear uploaded files when switching to project mode

    // Filter tasks by this project
    setCurrentView('project');
    setCurrentFilter(project.name);

    // Open detail panel if it's not already open
    if (!isDetailOpen) {
      toggleDetail();
    }
  };

  const handleProjectFilter = (projectName) => {
    setCurrentView('project');
    setCurrentFilter(projectName);
  };

  const handleTagClick = (tag) => {
    setCurrentView('tag');
    setCurrentFilter(tag);
  };

  const resetToAllTasks = () => {
    setCurrentView('all');
    setCurrentFilter('');
    setSearchTerm('');
    setSelectedProjectFilter('');
  };

  // Handle project filter change
  const handleProjectFilterChange = (projectName) => {
    setSelectedProjectFilter(projectName);
    if (projectName) {
      setCurrentView('project');
      setCurrentFilter(projectName);
    } else {
      setCurrentView('all');
      setCurrentFilter('');
    }
  };

  // Update task with edited content
  const onUpdateTask = async () => {
    if (!selectedTask) {
      toast({
        title: 'Error',
        description: 'No task selected for update',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!selectedTaskId) {
      toast({
        title: 'Cannot Update',
        description: 'This task is not from the backend and cannot be updated. Only backend tasks can be modified.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const updatedTaskData = {
        title: taskTitle,
        description: taskDescription,
        dueDate: editingDueDate,
        project: editingProject,
        tags: [...editingTags],
        completed: editingCompleted
      };

      // Store the current task ID before updating
      const currentTaskId = selectedTaskId;

        // Use backend API to update task
      const updatedTask = await updateTask(currentTaskId, updatedTaskData);

        // Update selectedTask if the title was changed
        if (taskTitle !== selectedTask) {
          setSelectedTask(taskTitle);
        }

      // Handle offline mode - the hook should handle updating the task list
      // No need to reload tasks manually as the hook updates the state

      // Reload task files using the updated task data
      if (updatedTask && updatedTask.fileAttachments) {
        setUploadedFiles(updatedTask.fileAttachments);
      } else {
        // Fallback: reload files using the task ID
        await loadTaskFiles(currentTaskId);
      }

        toast({
          title: 'Success',
        description: updatedTask.isOffline ? 'Task updated offline - will sync when connection is restored' : 'Task updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

      toggleDetail();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update task',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Search handler
  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
  };

  // Filter tasks based on search term
  const getFilteredTasksBySearch = (tasks) => {
    if (!searchTerm.trim()) {
      return tasks;
    }

    const searchLower = searchTerm.toLowerCase();

    const filtered = tasks.filter(task => {
      // Search in title
      const titleMatch = task.title && task.title.toLowerCase().includes(searchLower);

      // Search in description
      const descriptionMatch = task.description && task.description.toLowerCase().includes(searchLower);

      // Search in due date
      const dueDateMatch = task.dueDate && task.dueDate.toLowerCase().includes(searchLower);

      // Search in task tags
      const taskTags = Array.isArray(task.tags) ? task.tags : [];
      const tagMatch = taskTags.some(tag => tag.toLowerCase().includes(searchLower));

      // Search in due date category tags (Today, Week, Month)
      const dueDateCategory = getDueDateCategory(task.dueDate);
      const categoryMatch = dueDateCategory.toLowerCase().includes(searchLower);

      // Return true if any field matches
      return titleMatch || descriptionMatch || dueDateMatch || tagMatch || categoryMatch;
    });

    return filtered;
  };

  // Custom sorting function for tasks by priority (Today, Week, Month)
  const sortTasksByPriority = (tasks) => {
    const sorted = tasks.sort((a, b) => {
      const aCategory = getDueDateCategory(a.dueDate);
      const bCategory = getDueDateCategory(b.dueDate);

      // Priority order: Today > Week > Month > Other months
      const priorityOrder = {
        'Today': 0,
        'Week': 1,
        'Month': 2
      };

      // If both are in the same priority category, sort by due date
      if (priorityOrder[aCategory] !== undefined && priorityOrder[bCategory] !== undefined) {
        if (priorityOrder[aCategory] === priorityOrder[bCategory]) {
          return new Date(a.dueDate) - new Date(b.dueDate);
        }
        return priorityOrder[aCategory] - priorityOrder[bCategory];
      }

      // If one is Today/Week/Month and the other is a different month
      if (priorityOrder[aCategory] !== undefined && priorityOrder[bCategory] === undefined) {
        return -1; // Today/Week/Month comes first
      }
      if (priorityOrder[aCategory] === undefined && priorityOrder[bCategory] !== undefined) {
        return 1; // Today/Week/Month comes first
      }

      // If both are different months, sort by month name alphabetically
      if (priorityOrder[aCategory] === undefined && priorityOrder[bCategory] === undefined) {
        return aCategory.localeCompare(bCategory);
      }

      return 0;
    });

    return sorted;
  };

  // Get current day of the week in MST
  const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const mstNow = toMST(new Date());
    return days[mstNow.getDay()];
  };

  // Get due date category for a task in MST
  const getDueDateCategory = (dueDate) => {
    try {
      const today = toMST(new Date());
      const due = toMST(new Date(dueDate));

      // Reset time to compare dates only
      today.setHours(0, 0, 0, 0);
      due.setHours(0, 0, 0, 0);

      // Get start of current week (Sunday) in MST
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());

      // Get end of current week (Saturday) in MST
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      // Get start and end of current month in MST
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      if (due.getTime() === today.getTime()) {
        return 'Today';
      } else if (due >= startOfWeek && due <= endOfWeek) {
        return 'Week';
      } else if (due >= startOfMonth && due <= endOfMonth) {
        return 'Month';
      } else {
        // Return month name for dates outside current month
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[due.getMonth()];
      }
    } catch (error) {
      return 'Unknown';
    }
  };

  // Add state for task deletion
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isCreatingTask, setIsCreatingTask] = React.useState(false);
  const cancelRef = React.useRef();

  // Add state for file deletion confirmation
  const [isDeleteFileDialogOpen, setIsDeleteFileDialogOpen] = React.useState(false);
  const [fileToDelete, setFileToDelete] = React.useState(null);
  const [isDeletingFile, setIsDeletingFile] = React.useState(false);
  const fileDeleteCancelRef = React.useRef();
  const projectCancelRef = React.useRef();

  const onDeleteTask = async () => {
    if (!selectedTaskId) {
      toast({
        title: 'Error',
        description: 'No task ID found for deletion',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsDeleting(true);
    try {
      const response = await deleteTask(selectedTaskId);
      toast({
        title: 'Task deleted',
        description: response.isOffline ? 'Task deleted offline - will sync when connection is restored' : 'The task was deleted successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Close confirmation dialog
      setIsDeleteDialogOpen(false);
      setIsDeleting(false);

      // Close detail panel
      toggleDetail();

      // Clear all form fields and state
      setSelectedTask(null);
      setSelectedTaskId(null);
      setTaskTitle('');
      setTaskDescription('');
      setEditingDueDate('');
      setEditingProject('general');
      setEditingTags(ensureThreeTags([]));
      setEditingCompleted(false);
      setUploadedFiles([]); // Clear uploaded files when task is deleted

      // Reset modes
      setIsAddMode(false);
      setIsEditProjectMode(false);
      setIsAddProjectMode(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to delete task: ${error.message}`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setIsDeleting(false);
    }
  };

  // Toggle task completion - only works with backend tasks
  const toggleTaskCompleted = async (taskName, source = 'today') => {
    try {
      // Find the task in backend tasks
      let task = null;

      // First try to find by ID if we have it stored
      if (selectedTaskId && taskName === selectedTask) {
        task = allBackendTasks.find(t => t._id === selectedTaskId);
      }

      // If not found by ID, try finding by title in all tasks
      if (!task) {
        task = allBackendTasks.find(t => t.title === taskName);
      }

      if (task) {
        // Use backend API to toggle completion
        await toggleTaskCompletion(task._id);

        // Update local state for UI consistency
        if (source === 'today') {
          setLocalTaskData(prev => {
            if (!prev[taskName]) {
              return prev;
            }
            const newCompleted = !prev[taskName].completed;
            if (selectedTask === taskName) {
              setEditingCompleted(newCompleted);
            }
            return {
              ...prev,
              [taskName]: {
                ...prev[taskName],
                completed: newCompleted
              }
            };
          });
        } else if (source === 'week') {
          // Update dayTasks for weekly view
          setDayTasks(prev => {
            const newDayTasks = { ...prev };
            let taskFound = false;

            Object.keys(newDayTasks).forEach(day => {
              newDayTasks[day] = newDayTasks[day].map(task => {
                if (task.title === taskName) {
                  taskFound = true;
                  const newCompleted = !task.completed;
                  if (selectedTask === taskName) {
                    setEditingCompleted(newCompleted);
                  }
                  return { ...task, completed: newCompleted };
                }
                return task;
              });
            });

            if (!taskFound) {
            }

            return newDayTasks;
          });
        }
      } else {
        toast({
          title: 'Cannot Update',
          description: 'This task is not from the backend and cannot be updated.',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update task completion status',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Add Task handler
  const handleAddTask = () => {
    setSelectedTask(null);
    setSelectedTaskId(null);
    setIsAddMode(true);
    setIsEditProjectMode(false);
    setTaskTitle('');
    setTaskDescription('');
    setEditingDueDate('');
    setEditingProject('general');
    setEditingTags(ensureThreeTags([]));
    setEditingCompleted(false);
    setUploadedFiles([]); // Clear uploaded files for new task

    if (!isDetailOpen) toggleDetail();
  };

  // Add Task submit handler
  const onCreateTask = async () => {
    // Prevent multiple rapid clicks
    if (isCreatingTask) return;

    try {
      setIsCreatingTask(true);
      const newTask = {
        title: taskTitle,
        description: taskDescription,
        dueDate: editingDueDate,
        project: editingProject,
        tags: editingTags.filter(Boolean),
        completed: editingCompleted
      };
      const createdTask = await createTask(newTask);
      toast({
        title: 'Task created',
        description: createdTask.isOffline ? 'Task created offline - will sync when connection is restored' : 'The new task was created successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setIsAddMode(false);
      toggleDetail();
      // Reset fields
      setSelectedTask(null);
      setSelectedTaskId(null);
      setTaskTitle('');
      setTaskDescription('');
      setEditingDueDate('');
      setEditingProject('general');
      setEditingTags(ensureThreeTags([]));
      setEditingCompleted(false);
      setUploadedFiles([]); // Clear uploaded files
    } catch (error) {
      // Handle duplicate task errors specifically
      if (error.message.includes('already exists')) {
        toast({
          title: 'Duplicate Task',
          description: error.message,
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      } else {
      toast({
        title: 'Error',
        description: 'Failed to create task',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
    } finally {
      setIsCreatingTask(false);
    }
  };

  // Add Project submit handler
  const onCreateProject = async () => {
    try {
      if (!projectTitle || projectTitle.trim() === '') {
        toast({
          title: 'Error',
          description: 'Project title is required',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const newProject = {
        name: projectTitle.trim(),
        description: projectDescription.trim()
      };
      await createProject(newProject);
      toast({
        title: 'Project created',
        description: 'The new project was created successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setIsAddProjectMode(false);
      toggleDetail();
      // Reset fields
      setProjectTitle('');
      setProjectDescription('');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create project',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Update Project submit handler
  const onUpdateProject = async () => {
    if (!selectedProject) {
      toast({
        title: 'Error',
        description: 'No project selected for update',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!editingProjectTitle || editingProjectTitle.trim() === '') {
      toast({
        title: 'Error',
        description: 'Project title is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const updatedProjectData = {
        name: editingProjectTitle.trim(),
        description: editingProjectDescription.trim()
      };

      await updateProject(selectedProjectId, updatedProjectData);
      toast({
        title: 'Success',
        description: 'Project updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setIsEditProjectMode(false);
      toggleDetail();
      // Reset fields
      setSelectedProject(null);
      setSelectedProjectId(null);
      setEditingProjectTitle('');
      setEditingProjectDescription('');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update project',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Delete Project handler
  const onDeleteProject = async () => {
    if (!selectedProject) {
      toast({
        title: 'Error',
        description: 'No project selected for deletion',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsDeletingProject(true);
      await deleteProject(selectedProjectId);

      toast({
        title: 'Success',
        description: 'Project deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Close confirmation dialog
      setIsDeleteProjectDialogOpen(false);
      setIsDeletingProject(false);

      // Close detail panel
      toggleDetail();

      // Clear all form fields and state
      setSelectedProject(null);
      setSelectedProjectId(null);
      setEditingProjectTitle('');
      setEditingProjectDescription('');

      // Reset modes
      setIsAddMode(false);
      setIsEditProjectMode(false);
      setIsAddProjectMode(false);

      // Clear task-related state
      setSelectedTask(null);
      setSelectedTaskId(null);
      setTaskTitle('');
      setTaskDescription('');
      setEditingDueDate('');
      setEditingProject('general');
      setEditingTags(ensureThreeTags([]));
      setEditingCompleted(false);
      setUploadedFiles([]);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete project',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeletingProject(false);
    }
  };

  const handleAddProject = () => {
    setIsAddProjectMode(true);
    setIsAddMode(false);
    setIsEditProjectMode(false);
    setSelectedTask(null);
    setSelectedTaskId(null);
    setUploadedFiles([]); // Clear uploaded files when switching to project add mode
    setProjectTitle('');
    setProjectDescription('');
    if (!isDetailOpen) toggleDetail();
  };

  // File upload handlers
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    if (!selectedTaskId) {
      toast({
        title: 'Error',
        description: 'Please save the task first before uploading files',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsUploading(true);
    const uploadPromises = files.map(async (file) => {
      try {
        const result = await apiService.uploadFile(selectedTaskId, file);
        return { success: true, data: result.data };
      } catch (error) {
        // Handle duplicate file errors
        if (error.message.includes('already exists')) {
          return {
            success: false,
            error: error.message,
            fileName: file.name,
            duplicateFile: error.duplicateFile
          };
        }

        return {
          success: false,
          error: `Failed to upload ${file.name}: ${error.message}`,
          fileName: file.name
        };
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(result => result.success).map(result => result.data);
      const failedUploads = results.filter(result => !result.success);

      if (successfulUploads.length > 0) {
        // Reload task files to get the updated list from the server
        await loadTaskFiles(selectedTaskId);

        toast({
          title: 'Success',
          description: `Successfully uploaded ${successfulUploads.length} file(s)`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      // Show warnings for duplicate files
      failedUploads.forEach(failed => {
        if (failed.error.includes('already exists')) {
          toast({
            title: 'Duplicate File',
            description: `${failed.fileName}: ${failed.error}`,
            status: 'warning',
            duration: 5000,
            isClosable: true,
          });
        } else {
          toast({
            title: 'Upload Failed',
            description: failed.error,
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
      });
    } catch (error) {
      // File upload error handled by toast notifications
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileDelete = async (filename) => {
    // Set the file to delete and open confirmation dialog
    setFileToDelete(filename);
    setIsDeleteFileDialogOpen(true);
  };

  const confirmFileDelete = async () => {
    if (!selectedTaskId || !fileToDelete) return;

    setIsDeletingFile(true);
    try {
      await apiService.deleteFile(selectedTaskId, fileToDelete);
      setUploadedFiles(prev => prev.filter(file => file.filename !== fileToDelete));
      toast({
        title: 'Success',
        description: 'File deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete file',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeletingFile(false);
      setFileToDelete(null);
      setIsDeleteFileDialogOpen(false);
    }
  };

  const getFileIcon = (mimetype) => {
    if (mimetype.startsWith('image/')) return '🖼️';
    if (mimetype === 'application/pdf') return '📄';
    if (mimetype.includes('word')) return '📝';
    if (mimetype === 'text/csv') return '📊';
    if (mimetype === 'text/plain') return '📄';
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
    if (!taskId) {
      setUploadedFiles([]);
      return;
    }

    try {
      const response = await apiService.getTask(taskId);

      // Handle the API response structure: {success: true, data: {...}}
      const task = response.data || response;
      setUploadedFiles(task.fileAttachments || []);
    } catch (error) {
      setUploadedFiles([]);
    }
  };

  // Helper function to render file attachment indicator
  const renderFileAttachmentIndicator = (fileAttachments) => {
    if (!fileAttachments || fileAttachments.length === 0) return null;

    // Check if there are any image files
    const imageFiles = fileAttachments.filter(file => file.mimetype && file.mimetype.startsWith('image/'));

    if (imageFiles.length > 0) {
      // Show thumbnail of the first image
      const firstImage = imageFiles[0];
      return (
        <Image
          src={apiService.getFileUrl(firstImage.filename)}
          alt={firstImage.originalName}
          boxSize="20px"
          objectFit="cover"
          borderRadius="sm"
          ml={2}
          fallback={
            <AttachmentIcon color="blue.400" ml={2} boxSize={3} />
          }
        />
      );
    } else {
      // Show attachment icon for non-image files
      return <AttachmentIcon color="blue.400" ml={2} boxSize={3} />;
    }
  };

  // Helper function to prepare tags for display with attachment indicator
  const prepareTagsForDisplay = (tags, fileAttachments, taskTitle = null) => {
    // Filter out empty tags
    const validTags = tags.filter(tag => tag && tag.trim() !== '');

    // Take up to 3 user tags
    const userTags = validTags.slice(0, 3);

    // Return just the user tags (no attachment emoji since there's already a visual indicator)
    return userTags;
  };

  return (
    <Box position="relative" minH="100vh" overflowX="hidden" maxW="100vw">
      {/* Search Bar - Always Visible at Top */}
      <Box position="sticky" top={0} zIndex={50} bg={colorMode === 'light' ? 'white' : 'gray.900'} borderBottom="1px solid" borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}>
        <Flex justify="space-between" align="center" p={4}>
          <Flex align="center" gap={3}>
            <IconButton
              icon={<CheckCircleIcon />}
              aria-label="Go to My Tasks"
              onClick={resetToAllTasks}
              size="sm"
              colorScheme={currentView === 'all' && !searchTerm ? "blue" : "gray"}
              variant="solid"
              borderRadius="md"
              title="My Tasks"
            />
            <Input
              placeholder="Filter tasks"
              bg={colorMode === 'light' ? 'gray.100' : 'gray.700'}
              border={0}
              w={{ base: "200px", md: "300px" }}
              _placeholder={{ color: colorMode === 'light' ? 'gray.500' : 'gray.400' }}
              color={colorMode === 'light' ? 'gray.800' : 'white'}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <Select
              placeholder="All Projects"
              bg={colorMode === 'light' ? 'gray.100' : 'gray.700'}
              border={0}
              w={{ base: "150px", md: "200px" }}
              color={colorMode === 'light' ? 'gray.800' : 'white'}
              value={selectedProjectFilter}
              onChange={(e) => handleProjectFilterChange(e.target.value)}
              isDisabled={projectsLoading}
            >
              {projects.map((project) => (
                <option key={project._id} value={project.name}>
                  {project.name}
                </option>
              ))}
            </Select>
          </Flex>
          <Flex align="center" position="relative">
            <Menu>
              <MenuButton
                as={Avatar}
                size="sm"
                bg="blue.500"
                cursor="pointer"
                _hover={{ opacity: 0.8 }}
              />
              <MenuList bg={colorMode === 'light' ? 'white' : 'gray.800'} borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}>
                <MenuItem
                  icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                  onClick={toggleColorMode}
                  bg={colorMode === 'light' ? 'white' : 'gray.800'}
                  _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
                  color={colorMode === 'light' ? 'gray.800' : 'white'}
                >
                  {colorMode === 'light' ? 'Dark Mode' : 'Light Mode'}
                </MenuItem>
                <MenuItem
                  icon={<InfoIcon />}
                  bg={colorMode === 'light' ? 'white' : 'gray.800'}
                  _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
                  color={colorMode === 'light' ? 'gray.800' : 'white'}
                >
                  User Profile
                </MenuItem>
                <MenuItem
                  icon={<SettingsIcon />}
                  bg={colorMode === 'light' ? 'white' : 'gray.800'}
                  _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
                  color={colorMode === 'light' ? 'gray.800' : 'white'}
                >
                  Settings
                </MenuItem>
              </MenuList>
            </Menu>
            {/* Online/Offline Status Dot */}
            <Box
              position="absolute"
              bottom="0"
              right="0"
              w="12px"
              h="12px"
              borderRadius="full"
              bg={isOnline ? "green.400" : "red.400"}
              border="2px solid"
              borderColor={colorMode === 'light' ? 'white' : 'gray.800'}
              boxShadow="0 0 0 2px rgba(0,0,0,0.1)"
            />
          </Flex>
        </Flex>
      </Box>

      {/* Offline Status and Sync */}
      {tasksOffline && (
        <Box bg="orange.500" color="white" p={3} textAlign="center">
          <Flex justify="center" align="center" gap={3}>
            <WarningIcon />
            <Text fontSize="sm" fontWeight="medium">
              Working offline - changes will sync when connection is restored
            </Text>
            <Button
              size="xs"
              colorScheme="whiteAlpha"
              onClick={syncAllOfflineData}
              isLoading={tasksLoading}
            >
              Sync Now
            </Button>
          </Flex>
        </Box>
      )}

      <Flex direction={{ base: 'column', md: 'row' }} minH="100vh" bg={colorMode === 'light' ? 'gray.50' : 'gray.900'} color={colorMode === 'light' ? 'gray.800' : 'white'} pb="80px">
      {/* Sidebar */}
      {isSidebarOpen && (
          <Box w={{ base: '100%', md: isCenterOpen ? '250px' : '400px' }} bg={colorMode === 'light' ? 'white' : 'gray.800'} p={4} position="relative">
            <Heading size="md" mb={4}>Workload</Heading>
            <VStack align="start" spacing={4}>
                <Box w="full">
                  <Text fontSize="sm" mb={1} color="gray.400">This Week</Text>
                  <VStack align="stretch" spacing={1} w="full">
                    {Object.keys(dayTasks).map((day) => (
                      <Box key={day} w="full">
                        <Flex
                          cursor="pointer"
                          p={2}
                          bg={colorMode === 'light' ? 'gray.600' : 'gray.700'}
                          borderRadius="md"
                          w="full"
                          justify="space-between"
                          align="center"
                          onClick={() => handleDayClick(day)}
                          _hover={{ bg: colorMode === 'light' ? 'gray.500' : 'gray.600' }}
                        >
                          <HStack spacing={2}>
                            <Text color={colorMode === 'light' ? 'white' : 'inherit'}>{day}</Text>
                            {day === getCurrentDay() && (
                              <Text fontSize="xs" color="green.300" fontWeight="medium">(today)</Text>
                            )}
                          </HStack>
                        </Flex>
                        <Collapse in={expandedDays[day]} animateOpacity>
                          <VStack align="start" spacing={1} mt={1} ml={4} w="full">
                            {dayTasks[day].map((task, index) => (
                              <Box key={index} w="full">
                                <Flex align="center" w="full">
                                  <Checkbox
                                    isChecked={task.completed}
                                    onChange={() => toggleTaskCompleted(task.title, 'week')}
                                    colorScheme="green"
                                    size="sm"
                                    mr={2}
                                  />
                                  <Text
                                    fontSize="sm"
                                    color={task.completed ? "gray.500" : "gray.300"}
                                    cursor="pointer"
                                    p={1}
                                    flex={1}
                                    _hover={{ color: 'white' }}
                                    onClick={() => handleWeeklyTaskClick(task)}
                                    textDecoration={task.completed ? "line-through" : "none"}
                                  >
                                    {task.title}
                                  </Text>
                                  {task.fileAttachments && task.fileAttachments.length > 0 && (
                                    renderFileAttachmentIndicator(task.fileAttachments)
                                  )}
                                </Flex>
                                <Text
                                  fontSize="xs"
                                  color="gray.500"
                                  ml={6}
                                  mb={1}
                                >
                                  Due: {task.dueDate}
                                </Text>
                              </Box>
                            ))}
                          </VStack>
                        </Collapse>
                      </Box>
                    ))}
                </VStack>
              </Box>

              <Box>
                  <Text fontSize="sm" mb={2} color="gray.400">Sponsors</Text>
                  <VStack align="start" spacing={2}>
                    {/* First 2 sponsors - visible on all screen sizes */}
                    <Box>
                      <Text
                        fontSize="sm"
                        color="blue.300"
                        cursor="pointer"
                        _hover={{ color: 'blue.200', textDecoration: 'underline' }}
                        onClick={() => window.open('https://www.notion.so', '_blank')}
                      >
                        Notion
                      </Text>
                      <Text fontSize="xs" color="gray.500">All-in-one workspace for notes & docs</Text>
                    </Box>
                    <Box>
                      <Text
                        fontSize="sm"
                        color="blue.300"
                        cursor="pointer"
                        _hover={{ color: 'blue.200', textDecoration: 'underline' }}
                        onClick={() => window.open('https://www.atlassian.com', '_blank')}
                      >
                        Atlassian
                      </Text>
                      <Text fontSize="xs" color="gray.500">Project management & team collaboration</Text>
                </Box>

                  {/* Remaining 3 sponsors - hidden on mobile, visible on desktop */}
                  <Box display={{ base: 'none', md: 'block' }}>
                    <Text
                      fontSize="sm"
                      color="blue.300"
                      cursor="pointer"
                      _hover={{ color: 'blue.200', textDecoration: 'underline' }}
                      onClick={() => window.open('https://www.asana.com', '_blank')}
                    >
                      Asana
                    </Text>
                    <Text fontSize="xs" color="gray.500">Work management for teams</Text>
                  </Box>
                  <Box display={{ base: 'none', md: 'block' }}>
                    <Text
                      fontSize="sm"
                      color="blue.300"
                      cursor="pointer"
                      _hover={{ color: 'blue.200', textDecoration: 'underline' }}
                      onClick={() => window.open('https://www.trello.com', '_blank')}
                    >
                      Trello
                    </Text>
                    <Text fontSize="xs" color="gray.500">Visual project management boards</Text>
                  </Box>
                  <Box display={{ base: 'none', md: 'block' }}>
                    <Text
                      fontSize="sm"
                      color="blue.300"
                      cursor="pointer"
                      _hover={{ color: 'blue.200', textDecoration: 'underline' }}
                      onClick={() => window.open('https://www.monday.com', '_blank')}
                    >
                      Monday.com
                    </Text>
                    <Text fontSize="xs" color="gray.500">Work operating system for teams</Text>
                  </Box>
                </VStack>
            </Box>
          </VStack>
        </Box>
      )}
      {!isSidebarOpen && (
        <></>
      )}

      {/* Main Content */}
        <Box flex={1} pt={2} px={6} bg={colorMode === 'light' ? 'gray.50' : 'gray.850'} position="relative">
          {/* PWA Status Indicators */}
          <Flex position="fixed" top="10px" right="10px" zIndex={40} gap={2}>
            {/* Install Prompt */}
            {showInstallPrompt && (
              <Button
                leftIcon={<DownloadIcon />}
                colorScheme="blue"
                size="sm"
                onClick={handleInstallClick}
                borderRadius="md"
              >
                Install App
              </Button>
            )}
          </Flex>

          {/* Projects Section - Now above tasks on mobile */}
          <Collapse in={isCenterOpen} animateOpacity>
            <Box mb={2} display={{ base: 'block', md: 'none' }}>
              <Text fontSize="sm" mb={3} color="gray.400" fontWeight="medium">Projects</Text>
              {projectsLoading ? (
                <Flex justify="center" align="center" p={4}>
                  <Spinner size="sm" color="blue.500" />
                </Flex>
              ) : projectsError ? (
                <Alert status="error" mb={4}>
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Projects Error!</AlertTitle>
                    <AlertDescription>
                      {projectsError}. Please check if the backend server is running.
                    </AlertDescription>
                  </Box>
                </Alert>
              ) : (
              <SimpleGrid columns={2} spacing={3}>
                  {projects.map((project) => (
                    <Box
                      key={project._id}
                      p={4}
                      bg={colorMode === 'light' ? 'gray.200' : 'gray.800'}
                      borderRadius="lg"
                      cursor="pointer"
                      _hover={{ bg: colorMode === 'light' ? 'gray.300' : 'gray.700' }}
                      onClick={() => handleProjectClick(project)}
                      position="relative"
                    >
                      <Text fontWeight="medium" mb={1} color={colorMode === 'light' ? 'gray.800' : 'white'}>{project.name}</Text>
                      <Text fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>{project.description || 'No description'}</Text>
                      {project.isOffline && (
                        <Badge
                          position="absolute"
                          top={2}
                          left={2}
                          colorScheme="orange"
                          size="sm"
                          fontSize="xs"
                        >
                          Offline
                        </Badge>
                      )}
                      <IconButton
                        icon={<StarIcon />}
                        aria-label="Filter by project"
                        size="xs"
                        position="absolute"
                        top={2}
                        right={2}
                        colorScheme="blue"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProjectFilter(project.name);
                        }}
                      />
                </Box>
                  ))}
                  <Box
                    p={4}
                    bg={colorMode === 'light' ? 'blue.100' : 'blue.900'}
                    borderRadius="lg"
                    cursor="pointer"
                    border="2px dashed"
                    borderColor={colorMode === 'light' ? 'blue.300' : 'blue.600'}
                    _hover={{ bg: colorMode === 'light' ? 'blue.200' : 'blue.800' }}
                    onClick={handleAddProject}
                  >
                    <Text fontWeight="medium" mb={1} color={colorMode === 'light' ? 'blue.800' : 'blue.200'} textAlign="center">+ Add Project</Text>
                    <Text fontSize="sm" color={colorMode === 'light' ? 'blue.600' : 'blue.300'} textAlign="center">Create a new project</Text>
                </Box>
              </SimpleGrid>
              )}
            </Box>
          </Collapse>

          {/* Projects Section - Desktop view (above tasks) */}
          <Collapse in={isCenterOpen} animateOpacity>
            <Box mb={2} display={{ base: 'none', md: 'block' }}>
              <Text fontSize="sm" mb={3} color="gray.400" fontWeight="medium">Projects</Text>
              {projectsLoading ? (
                <Flex justify="center" align="center" p={4}>
                  <Spinner size="sm" color="blue.500" />
                </Flex>
              ) : projectsError ? (
                <Alert status="error" mb={4}>
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Projects Error!</AlertTitle>
                    <AlertDescription>
                      {projectsError}. Please check if the backend server is running.
                    </AlertDescription>
                  </Box>
                </Alert>
              ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3}>
                  {projects.map((project) => (
                    <Box
                      key={project._id}
                      p={4}
                      bg={colorMode === 'light' ? 'gray.200' : 'gray.800'}
                      borderRadius="lg"
                      cursor="pointer"
                      _hover={{ bg: colorMode === 'light' ? 'gray.300' : 'gray.700' }}
                      onClick={() => handleProjectClick(project)}
                      position="relative"
                    >
                      <Text fontWeight="medium" mb={1} color={colorMode === 'light' ? 'gray.800' : 'white'}>{project.name}</Text>
                      <Text fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>{project.description || 'No description'}</Text>
                      {project.isOffline && (
                        <Badge
                          position="absolute"
                          top={2}
                          left={2}
                          colorScheme="orange"
                          size="sm"
                          fontSize="xs"
                        >
                          Offline
                        </Badge>
                      )}
                </Box>
                  ))}
                  <Box
                    p={4}
                    bg={colorMode === 'light' ? 'blue.100' : 'blue.900'}
                    borderRadius="lg"
                    cursor="pointer"
                    border="2px dashed"
                    borderColor={colorMode === 'light' ? 'blue.300' : 'blue.600'}
                    _hover={{ bg: colorMode === 'light' ? 'blue.200' : 'blue.800' }}
                    onClick={handleAddProject}
                  >
                    <Text fontWeight="medium" mb={1} color={colorMode === 'light' ? 'blue.800' : 'blue.200'} textAlign="center">+ Add Project</Text>
                    <Text fontSize="sm" color={colorMode === 'light' ? 'blue.600' : 'blue.300'} textAlign="center">Create a new project</Text>
                </Box>
              </SimpleGrid>
              )}
            </Box>
          </Collapse>

          {/* Large Title - Now below projects */}
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="lg">
              {currentView === 'all' && 'My Tasks'}
              {currentView === 'day' && `${currentFilter} Tasks`}
              {currentView === 'project' && `${currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1)} Tasks`}
              {currentView === 'tag' && `#${currentFilter} Tasks`}
            </Heading>
            <Text fontSize="sm" color="gray.400">
              {(() => {
                if (currentView === 'all') {
                  return getFilteredTasksBySearch(filteredTasks).length;
                } else {
                  return getFilteredTasksBySearch(filteredTasks).length;
                }
              })()} tasks
            </Text>
          </Flex>

          {/* Tasks Label */}
          <Text fontSize="sm" mb={3} color="gray.400" fontWeight="medium">Tasks</Text>

          {/* Backend Error Handling */}
          {tasksError && (
            <Alert status="error" mb={4}>
              <AlertIcon />
              <Box>
                <AlertTitle>Connection Error</AlertTitle>
                <AlertDescription>
                  Unable to connect to the server. Please check your internet connection and try again.
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {/* Loading State */}
          {tasksLoading && (
            <Flex justify="center" align="center" p={8}>
              <VStack spacing={4}>
                <Spinner size="lg" color="blue.500" />
                <Text color="gray.400">Loading tasks from backend...</Text>
              </VStack>
            </Flex>
          )}

          <VStack align="stretch" spacing={3}>
            {(() => {
              try {
                // Add a simple check to see if we have tasks
                if (filteredTasks.length === 0) {
                  return (
                    <Box p={4} bg="gray.800" borderRadius="md">
                      <Text color="gray.400">No tasks found. {searchTerm ? `No results for "${searchTerm}"` : 'Add some tasks to get started.'}</Text>
                    </Box>
                  );
                }

                return (
                  <>
                    {currentView === 'all' ? (
                      // Show all tasks from all sources
                      sortTasksByPriority(
                        getFilteredTasksBySearch(filteredTasks)
                      ).map((task, idx) => {
                        try {
                          const taskInfo = task;
                          if (!taskInfo) {
                            return null;
                          }

                          return (
                            <Box key={idx}>
                              <Box
                                p={3}
                                bg={selectedTask === task.title ? 'gray.700' : 'gray.800'}
                                borderRadius="md"
                                cursor="pointer"
                                onClick={() => task.source === 'today' ? handleTaskClick(task.title) : handleFilteredTaskClick(task)}
                                _hover={{ bg: 'gray.700' }}
                                border={selectedTask === task.title ? '2px solid' : '1px solid'}
                                borderColor={selectedTask === task.title ? 'blue.400' : 'transparent'}
                              >
                                <Flex justify="space-between" align="center" mb={2}>
                                  <Flex align="center" flex={1}>
                                    <Checkbox
                                      isChecked={taskInfo.completed}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        toggleTaskCompleted(task.title, task.source);
                                      }}
                                      colorScheme="green"
                                      size="md"
                                      mr={3}
                                    />
                                    <Text
                                      color={selectedTask === task.title ? 'green.300' : taskInfo.completed ? 'gray.500' : 'white'}
                                      fontWeight={selectedTask === task.title ? 'bold' : 'normal'}
                                      textDecoration={taskInfo.completed ? "line-through" : "none"}
                                    >
                                      {task.title}
                                    </Text>
                                    {taskInfo.fileAttachments && taskInfo.fileAttachments.length > 0 && (
                                      renderFileAttachmentIndicator(taskInfo.fileAttachments)
                                    )}
                                    {taskInfo.isOffline && (
                                      <Badge
                                        size="sm"
                                        colorScheme="orange"
                                        variant="subtle"
                                        ml={2}
                                        title="This task is stored offline"
                                      >
                                        📱
                                      </Badge>
                                    )}
                                  </Flex>
                                  <HStack spacing={2}>
                                    <Tag size="sm" colorScheme={getDueDateCategory(taskInfo.dueDate) === 'Today' ? 'red' : getDueDateCategory(taskInfo.dueDate) === 'Week' ? 'orange' : getDueDateCategory(taskInfo.dueDate) === 'Month' ? 'yellow' : 'gray'} variant="subtle">
                                      {getDueDateCategory(taskInfo.dueDate)}
                                    </Tag>
                                  </HStack>
                                </Flex>

                                {/* Task metadata */}
                                <VStack align="start" spacing={1}>
                                  <HStack spacing={4} fontSize="xs" color="gray.400">
                                    <Text>Due: {taskInfo.dueDate}</Text>
                                    <Text>Project: {taskInfo.project}</Text>
                                  </HStack>
                                  <HStack spacing={1}>
                                    {prepareTagsForDisplay(taskInfo.tags, taskInfo.fileAttachments, taskInfo.title).map((tag, tagIndex) => (
                                      <Tag
                                        key={tagIndex}
                                        size="sm"
                                        colorScheme="blue"
                                        variant="subtle"
                                        cursor="pointer"
                                        onClick={() => handleTagClick(tag)}
                                        _hover={{ bg: 'blue.600' }}
                                      >
                                        {tag}
                                      </Tag>
                                    ))}
                                  </HStack>
                                </VStack>
                              </Box>
                              <Collapse in={task.source === 'today' && Boolean(taskData[task.title]) ? taskInfo.expanded : expandedFilteredTasks[task.title]} animateOpacity>
                                <Box p={3} bg={colorMode === 'light' ? 'gray.100' : 'gray.750'} borderRadius="md" mt={1} borderLeft="3px solid" borderColor="blue.400">
                                  <Text fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.300'} lineHeight="1.6">
                                    {taskInfo.description.length > 150
                                      ? taskInfo.description.slice(0, 150) + '...'
                                      : taskInfo.description}
                                  </Text>
                                </Box>
                              </Collapse>
                            </Box>
                          );
                        } catch (error) {
                          return null;
                        }
                      }).filter(Boolean)
                    ) : (
                      // Show filtered tasks
                      (() => {
                        return sortTasksByPriority(getFilteredTasksBySearch(filteredTasks)).map((task, idx) => {
                          try {
                            return (
                              <Box key={idx}>
                                <Box
                                  p={3}
                                  bg={selectedTask === task.title ? 'gray.700' : 'gray.800'}
                                  borderRadius="md"
                                  cursor="pointer"
                                  onClick={() => task.source === 'today' ? handleTaskClick(task.title) : handleFilteredTaskClick(task)}
                                  _hover={{ bg: 'gray.700' }}
                                  border={selectedTask === task.title ? '2px solid' : '1px solid'}
                                  borderColor={selectedTask === task.title ? 'blue.400' : 'transparent'}
                                >
                                  <Flex justify="space-between" align="center" mb={2}>
                                    <Flex align="center" flex={1}>
                                      <Checkbox
                                        isChecked={task.completed}
                                        onChange={(e) => {
                                          e.stopPropagation();
                                          toggleTaskCompleted(task.title, task.source);
                                        }}
                                        colorScheme="green"
                                        size="md"
                                        mr={3}
                                      />
                                      <Text
                                        color={selectedTask === task.title ? 'green.300' : task.completed ? 'gray.500' : 'white'}
                                        fontWeight={selectedTask === task.title ? 'bold' : 'normal'}
                                        textDecoration={task.completed ? "line-through" : "none"}
                                      >
                                        {task.title}
                                      </Text>
                                      {task.fileAttachments && task.fileAttachments.length > 0 && (
                                        renderFileAttachmentIndicator(task.fileAttachments)
                                      )}
                                      {task.isOffline && (
                                        <Badge
                                          size="sm"
                                          colorScheme="orange"
                                          variant="subtle"
                                          ml={2}
                                          title="This task is stored offline"
                                        >
                                          📱
                                        </Badge>
                                      )}
                                    </Flex>
                                    <HStack spacing={2}>
                                      <Tag size="sm" colorScheme={getDueDateCategory(task.dueDate) === 'Today' ? 'red' : getDueDateCategory(task.dueDate) === 'Week' ? 'orange' : getDueDateCategory(task.dueDate) === 'Month' ? 'yellow' : 'gray'} variant="subtle">
                                        {getDueDateCategory(task.dueDate)}
                                      </Tag>
                                    </HStack>
                                  </Flex>

                                  {/* Task metadata */}
                                  <VStack align="start" spacing={1}>
                                    <HStack spacing={4} fontSize="xs" color="gray.400">
                                      <Text>Due: {task.dueDate}</Text>
                                      <Text>Project: {task.project}</Text>
                                    </HStack>
                                    <HStack spacing={1}>
                                      {prepareTagsForDisplay(task.tags, task.fileAttachments, task.title).map((tag, tagIndex) => (
                                        <Tag
                                          key={tagIndex}
                                          size="sm"
                                          colorScheme="blue"
                                          variant="subtle"
                                          cursor="pointer"
                                          onClick={() => handleTagClick(tag)}
                                          _hover={{ bg: 'blue.600' }}
                                        >
                                          {tag}
                                        </Tag>
                                      ))}
                                    </HStack>
                                  </VStack>
                                </Box>
                                <Collapse in={task.source === 'today' && Boolean(taskData[task.title]) ? taskData[task.title].expanded : expandedFilteredTasks[task.title]} animateOpacity>
                                  <Box p={3} bg={colorMode === 'light' ? 'gray.100' : 'gray.750'} borderRadius="md" mt={1} borderLeft="3px solid" borderColor="blue.400">
                                    <Text fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.300'} lineHeight="1.6">
                                      {task.description.length > 150
                                        ? task.description.slice(0, 150) + '...'
                                        : task.description}
                                    </Text>
                                  </Box>
                                </Collapse>
                              </Box>
                            );
                          } catch (error) {
                            return null;
                          }
                        }).filter(Boolean);
                      })()
                    )}
                  </>
                );
              } catch (error) {
                return (
                  <Box p={4} bg="red.900" borderRadius="md">
                    <Text color="red.200">Error loading content. Please refresh the page.</Text>
                  </Box>
                );
              }
            })()}
          </VStack>
        </Box>

      {/* Detail Panel */}
      {isDetailOpen && (
          <Box w={{ base: '100%', md: isCenterOpen ? '350px' : '500px' }} bg={colorMode === 'light' ? 'white' : 'gray.800'} p={6} position="relative">
            <Heading size="md" mb={4} color={colorMode === 'light' ? 'gray.800' : 'white'}>
              {isAddProjectMode ? 'Add New Project' : isEditProjectMode ? 'Update Project' : isAddMode ? 'Add New Task' : 'Update Selected Task'}
            </Heading>

            {isAddProjectMode ? (
              // Project creation form
              <>
            <Input
                  placeholder="Project name"
                  value={projectTitle}
              fontSize="lg"
              fontWeight="bold"
                  bg={colorMode === 'light' ? 'gray.100' : 'gray.700'}
              border={0}
                  p={2}
              mb={2}
                  borderRadius="md"
              color={colorMode === 'light' ? 'gray.800' : 'white'}
                  _focus={{ bg: colorMode === 'light' ? 'gray.200' : 'gray.600', border: '1px solid', borderColor: 'blue.400' }}
                  _hover={{ bg: colorMode === 'light' ? 'gray.200' : 'gray.600' }}
                  onChange={(e) => setProjectTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Project description"
                  mb={4}
                  value={projectDescription}
                  bg={colorMode === 'light' ? 'gray.100' : 'gray.700'}
                  color={colorMode === 'light' ? 'gray.800' : 'white'}
                  border={0}
                  _placeholder={{ color: colorMode === 'light' ? 'gray.500' : 'gray.400' }}
                  onChange={(e) => setProjectDescription(e.target.value)}
                />
                <Button colorScheme="green" w="full" onClick={onCreateProject} mb={2}>Create Project</Button>
              </>
            ) : isEditProjectMode ? (
              // Project editing form
              <>
                <Input
                  value={editingProjectTitle}
                  fontSize="lg"
                  fontWeight="bold"
                  bg={colorMode === 'light' ? 'gray.100' : 'gray.700'}
                  border={0}
                  p={2}
                  mb={2}
                  borderRadius="md"
                  color={colorMode === 'light' ? 'gray.800' : 'white'}
                  _focus={{ bg: colorMode === 'light' ? 'gray.200' : 'gray.600', border: '1px solid', borderColor: 'blue.400' }}
                  _hover={{ bg: colorMode === 'light' ? 'gray.200' : 'gray.600' }}
                  onChange={(e) => setEditingProjectTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Project description"
                  mb={4}
                  value={editingProjectDescription}
                  bg={colorMode === 'light' ? 'gray.100' : 'gray.700'}
                  color={colorMode === 'light' ? 'gray.800' : 'white'}
                  border={0}
                  _placeholder={{ color: colorMode === 'light' ? 'gray.500' : 'gray.400' }}
                  onChange={(e) => setEditingProjectDescription(e.target.value)}
                />
                <Button colorScheme="green" w="full" onClick={onUpdateProject} mb={2}>Update Project</Button>
                <Button colorScheme="red" w="full" onClick={() => setIsDeleteProjectDialogOpen(true)} isDisabled={isDeletingProject}>Delete Project</Button>
              </>
            ) : (
              // Task creation/editing form
              <>
                <Input
                  value={taskTitle || selectedTask || ''}
                  fontSize="lg"
                  fontWeight="bold"
                  bg={colorMode === 'light' ? 'gray.100' : 'gray.700'}
                  border={0}
                  p={2}
                  mb={2}
                  borderRadius="md"
                  color={colorMode === 'light' ? 'gray.800' : 'white'}
                  _focus={{ bg: colorMode === 'light' ? 'gray.200' : 'gray.600', border: '1px solid', borderColor: 'blue.400' }}
                  _hover={{ bg: colorMode === 'light' ? 'gray.200' : 'gray.600' }}
              onChange={(e) => setTaskTitle(e.target.value)}
            />
            <Textarea
              placeholder="Task description"
              mb={4}
              value={taskDescription}
              bg={colorMode === 'light' ? 'gray.100' : 'gray.700'}
              color={colorMode === 'light' ? 'gray.800' : 'white'}
              border={0}
              _placeholder={{ color: colorMode === 'light' ? 'gray.500' : 'gray.400' }}
              onChange={(e) => setTaskDescription(e.target.value)}
            />

            <Box mb={4}>
              <Text fontSize="sm" mb={1} color={colorMode === 'light' ? 'gray.600' : 'white'}>Due Date</Text>
              <Input
                type="date"
                bg={colorMode === 'light' ? 'gray.100' : 'gray.700'}
                border={0}
                color={colorMode === 'light' ? 'gray.800' : 'white'}
                value={editingDueDate}
                onChange={(e) => setEditingDueDate(e.target.value)}
              />
            </Box>

          <Box mb={4}>
              <Text fontSize="sm" mb={1} color={colorMode === 'light' ? 'gray.600' : 'white'}>Project</Text>
              <Select
                bg={colorMode === 'light' ? 'gray.100' : 'gray.700'}
                border={0}
                color={colorMode === 'light' ? 'gray.800' : 'white'}
                placeholder="Select project"
                value={editingProject}
                onChange={(e) => setEditingProject(e.target.value)}
                      isDisabled={projectsLoading}
                    >
                      {projects.map((project) => (
                        <option key={project._id} value={project.name}>
                          {project.name.charAt(0).toUpperCase() + project.name.slice(1)}
                        </option>
                      ))}
              </Select>
          </Box>

          <Box mb={4}>
            <Text fontSize="sm" mb={1} color={colorMode === 'light' ? 'gray.600' : 'white'}>Tags</Text>
                  <VStack spacing={2} align="stretch">
                    {[0, 1, 2].map((index) => (
                      <HStack key={index} spacing={2}>
                        <Tag
                          colorScheme="green"
                          p={0}
                          bg={colorMode === 'light' ? 'gray.200' : 'gray.600'}
                          flex={1}
                        >
                    <Input
                            value={editingTags[index] || ''}
                      onChange={(e) => {
                        const newTags = [...editingTags];
                        newTags[index] = e.target.value;
                        setEditingTags(newTags);
                      }}
                      bg="transparent"
                      border={0}
                      color={colorMode === 'light' ? 'gray.800' : 'white'}
                      fontSize="sm"
                      p={2}
                      minW="80px"
                            placeholder={`Tag ${index + 1}`}
                      _focus={{ bg: 'transparent', border: '1px solid', borderColor: colorMode === 'light' ? 'gray.600' : 'white' }}
                    />
                  </Tag>
            </HStack>
                    ))}
                  </VStack>
          </Box>

          <Box mb={4}>
            <Text fontSize="sm" mb={1} color={colorMode === 'light' ? 'gray.600' : 'white'}>Completed</Text>
            <Select
              bg={colorMode === 'light' ? 'gray.100' : 'gray.700'}
              border={0}
              color={colorMode === 'light' ? 'gray.800' : 'white'}
              placeholder="Select completion status"
              value={editingCompleted.toString()}
              onChange={(e) => {
                const newCompleted = e.target.value === 'true';
                setEditingCompleted(newCompleted);

                // Update the actual task completion status
                if (selectedTask) {
                  if (currentView === 'all' && taskData[selectedTask]) {
                    // Update taskData for "My Tasks" view
                    setLocalTaskData(prev => ({
                      ...prev,
                      [selectedTask]: {
                        ...prev[selectedTask],
                        completed: newCompleted
                      }
                    }));
                  } else {
                    // Update dayTasks for filtered views
                    setDayTasks(prev => {
                      const newDayTasks = { ...prev };
                      Object.keys(newDayTasks).forEach(day => {
                        newDayTasks[day] = newDayTasks[day].map(task => {
                          if (task.title === selectedTask) {
                            return { ...task, completed: newCompleted };
                          }
                          return task;
                        });
                      });
                      return newDayTasks;
                    });
                  }
                }
              }}
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </Select>
          </Box>

          <Box>
            <Text fontSize="sm" mb={2} color={colorMode === 'light' ? 'gray.600' : 'white'}>Task Assets</Text>

                  {/* Uploaded Files Display */}
                  {uploadedFiles.length > 0 && (
                    <Box mb={3}>
                      <Text fontSize="xs" color={colorMode === 'light' ? 'gray.500' : 'gray.400'} mb={2}>
                        Uploaded Files ({uploadedFiles.length})
                      </Text>
                      <VStack spacing={2} align="stretch">
                        {uploadedFiles.map((file, index) => (
                          <Box
                            key={index}
                            p={2}
                            bg={colorMode === 'light' ? 'gray.100' : 'gray.700'}
                            borderRadius="md"
                            border="1px solid"
                            borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
                          >
                            {file.mimetype.startsWith('image/') ? (
                              // Image thumbnail display
                              <VStack spacing={2} align="stretch">
                                <Box position="relative">
                                  <Image
                                    src={apiService.getFileUrl(file.filename)}
                                    alt={file.originalName}
                                    borderRadius="md"
                                    maxH="120px"
                                    w="full"
                                    objectFit="cover"
                                    fallback={
                                      <Box
                                        bg={colorMode === 'light' ? 'gray.200' : 'gray.600'}
                                        h="120px"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        borderRadius="md"
                                      >
                                        <Text fontSize="lg">🖼️</Text>
                                      </Box>
                                    }
                                  />
                                  <HStack
                                    position="absolute"
                                    top={1}
                                    right={1}
                                    spacing={1}
                                  >
                                    <Button
                                      size="xs"
                                      variant="solid"
                                      bg="blackAlpha.600"
                                      color="white"
                                      _hover={{ bg: 'blackAlpha.700' }}
                                      onClick={() => window.open(apiService.getFileUrl(file.filename), '_blank')}
                                    >
                                      📥
                                    </Button>
                                    <Button
                                      size="xs"
                                      variant="solid"
                                      bg="red.600"
                                      color="white"
                                      _hover={{ bg: 'red.700' }}
                                      onClick={() => handleFileDelete(file.filename)}
                                    >
                                      🗑️
                                    </Button>
                                  </HStack>
                                </Box>
                                <VStack align="start" spacing={0}>
                                  <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                                    {file.originalName}
                                  </Text>
                                  <Text fontSize="xs" color={colorMode === 'light' ? 'gray.500' : 'gray.400'}>
                                    {formatFileSize(file.size)}
                                  </Text>
                                </VStack>
                              </VStack>
                            ) : (
                              // Non-image file display (existing layout)
                              <HStack justify="space-between" align="center">
                                <HStack spacing={2} flex={1}>
                                  <Text fontSize="lg">{getFileIcon(file.mimetype)}</Text>
                                  <VStack align="start" spacing={0} flex={1}>
                                    <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                                      {file.originalName}
                                    </Text>
                                    <Text fontSize="xs" color={colorMode === 'light' ? 'gray.500' : 'gray.400'}>
                                      {formatFileSize(file.size)}
                                    </Text>
                                  </VStack>
                                </HStack>
                                <HStack spacing={1}>
                                  <Button
                                    size="xs"
                                    variant="ghost"
                                    onClick={() => window.open(apiService.getFileUrl(file.filename), '_blank')}
                                  >
                                    📥
                                  </Button>
                                  <Button
                                    size="xs"
                                    variant="ghost"
                                    colorScheme="red"
                                    onClick={() => handleFileDelete(file.filename)}
                                  >
                                    🗑️
                                  </Button>
                                </HStack>
                              </HStack>
                            )}
                          </Box>
                        ))}
                      </VStack>
                    </Box>
                  )}

                  {/* File Upload Section */}
                  {selectedTaskId && (
                    <Box mb={3}>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        multiple
                        accept=".txt,.doc,.docx,.csv,.pdf,.png,.jpg,.jpeg"
                        style={{ display: 'none' }}
                      />
                      <Button
                        size="sm"
                        colorScheme="blue"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        isLoading={isUploading}
                        mb={2}
                        w="full"
                      >
                        📎 Upload Files
                      </Button>
                      <Text fontSize="xs" color={colorMode === 'light' ? 'gray.500' : 'gray.400'} mb={2}>
                        Supported: .txt, .doc, .docx, .csv, .pdf, .png, .jpg, .jpeg (max 10MB each)
                      </Text>
                    </Box>
                  )}

                  {/* Warning for local tasks */}
            {!isAddMode && !selectedTaskId && (
              <Alert status="warning" mb={3} borderRadius="md">
                <Box>
                  <AlertTitle>Local Task</AlertTitle>
                  <AlertDescription>
                          This task is not from the backend and cannot be updated, deleted, or have files uploaded.
                  </AlertDescription>
                </Box>
              </Alert>
            )}

                  {/* Action Buttons */}
            {isAddMode ? (
              <Button colorScheme="green" w="full" onClick={onCreateTask} mb={2} isLoading={isCreatingTask} loadingText="Creating...">Create</Button>
            ) : (
              <Button colorScheme="green" w="full" onClick={onUpdateTask} mb={2} isDisabled={!selectedTaskId}>Update</Button>
            )}
            {!isAddMode && (
              <Button colorScheme="red" w="full" onClick={() => setIsDeleteDialogOpen(true)} isDisabled={!selectedTaskId || isDeleting}>Delete</Button>
            )}
          </Box>
              </>
            )}

          {/* Delete Confirmation Dialog */}
          <AlertDialog
            isOpen={isDeleteDialogOpen}
            leastDestructiveRef={cancelRef}
            onClose={() => setIsDeleteDialogOpen(false)}
          >
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                  Delete Task
                </AlertDialogHeader>
                <AlertDialogBody>
                  Are you sure you want to delete this task? This action cannot be undone.
                </AlertDialogBody>
                <AlertDialogFooter>
                  <Button ref={cancelRef} onClick={() => setIsDeleteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button colorScheme="red" onClick={onDeleteTask} ml={3} isLoading={isDeleting}>
                    Delete
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>

            {/* Project Delete Confirmation Dialog */}
            <AlertDialog
              isOpen={isDeleteProjectDialogOpen}
              leastDestructiveRef={projectCancelRef}
              onClose={() => setIsDeleteProjectDialogOpen(false)}
            >
              <AlertDialogOverlay>
                <AlertDialogContent>
                  <AlertDialogHeader fontSize="lg" fontWeight="bold">
                    Delete Project
                  </AlertDialogHeader>
                  <AlertDialogBody>
                    Are you sure you want to delete this project? This action cannot be undone.
                  </AlertDialogBody>
                  <AlertDialogFooter>
                    <Button ref={projectCancelRef} onClick={() => setIsDeleteProjectDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button colorScheme="red" onClick={onDeleteProject} ml={3} isLoading={isDeletingProject}>
                      Delete
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialogOverlay>
            </AlertDialog>

            {/* File Delete Confirmation Dialog */}
            <AlertDialog
              isOpen={isDeleteFileDialogOpen}
              leastDestructiveRef={fileDeleteCancelRef}
              onClose={() => setIsDeleteFileDialogOpen(false)}
            >
              <AlertDialogOverlay>
                <AlertDialogContent>
                  <AlertDialogHeader fontSize="lg" fontWeight="bold">
                    Delete File
                  </AlertDialogHeader>
                  <AlertDialogBody>
                    Are you sure you want to delete this file? This action cannot be undone.
                  </AlertDialogBody>
                  <AlertDialogFooter>
                    <Button ref={fileDeleteCancelRef} onClick={() => setIsDeleteFileDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button colorScheme="red" onClick={confirmFileDelete} ml={3} isLoading={isDeletingFile}>
                    Delete
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>
        </Box>
      )}
    </Flex>

      {/* Bottom Navigation - Visible on both mobile and desktop */}
      <Box
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        zIndex={25}
        bg="gray.800"
        borderTop="1px solid"
        borderColor="gray.700"
        p={{ base: 3, md: 2 }}
      >
        <Flex justify="center" align="center">
          <Flex
            justify="space-between"
            align="center"
            maxW="600px"
            w="full"
            px={4}
            gap={{ base: 4, md: 2 }}
          >
            <IconButton
              icon={<CalendarIcon />}
              aria-label="Toggle Sidebar"
              onClick={toggleSidebar}
              size={{ base: "md", md: "sm" }}
              colorScheme={isSidebarOpen ? "blue" : "gray"}
              variant="solid"
              borderRadius="full"
              _hover={{ bg: 'gray.700' }}
            />
            <IconButton
              icon={<StarIcon />}
              aria-label="Toggle Projects Panel"
              onClick={toggleCenter}
              size={{ base: "md", md: "sm" }}
              colorScheme={isCenterOpen ? "blue" : "gray"}
              variant="solid"
              borderRadius="full"
              _hover={{ bg: 'gray.700' }}
            />
            <IconButton
              icon={<AddIcon />}
              aria-label="Add New Task"
              onClick={handleAddTask}
              size={{ base: "md", md: "sm" }}
              colorScheme="green"
              variant="solid"
              borderRadius="full"
              _hover={{ bg: 'green.600' }}
            />
            {selectedTask && (
              <IconButton
                icon={<EditIcon />}
                aria-label="Toggle Detail Panel"
                onClick={toggleDetail}
                size={{ base: "md", md: "sm" }}
                colorScheme={isDetailOpen ? "blue" : "gray"}
                variant="solid"
                borderRadius="full"
                _hover={{ bg: 'gray.700' }}
              />
            )}
            <IconButton
              icon={<ChatIcon />}
              aria-label="Toggle Footer Panel"
              onClick={toggleFooter}
              size={{ base: "md", md: "sm" }}
              colorScheme={isFooterOpen ? "blue" : "gray"}
              variant="solid"
              borderRadius="full"
              _hover={{ bg: 'gray.700' }}
            />
          </Flex>
        </Flex>
      </Box>

      {/* Collapsible Footer Panel */}
      <Box position="fixed" bottom={0} left={0} right={0} zIndex={20}>
        {/* Footer Content */}
        <Collapse in={isFooterOpen} animateOpacity>
          <Box
            w="full"
            bg="gray.800"
            p={6}
            borderTop="1px solid"
            borderColor="gray.700"
            minH="300px"
            bottom="80px"
          >
            <Flex justify="space-between" align="start" maxW="1200px" mx="auto" gap={8}>
              <Box flex={1}>
                <Heading size="md" mb={4} color="white">Tasks Prompt</Heading>
                <Textarea
                  placeholder="Enter your tasks prompt here"
                  mb={4}
                  minH="100px"
                  color="white"
                  _placeholder={{ color: 'gray.400' }}
                  value={tasksPrompt}
                  onChange={(e) => setTasksPrompt(e.target.value)}
                />
                <Button colorScheme="green" w="full">Submit</Button>
              </Box>
            </Flex>
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
}
