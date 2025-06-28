import React from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Heading,
  Input,
  Textarea,
  Checkbox,
  Button,
  useBreakpointValue,
  SimpleGrid,
  Tag,
  Image,
  IconButton,
  Collapse,
  useDisclosure,
  Avatar,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Select,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorMode,
  Spinner,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon, CalendarIcon, StarIcon, InfoIcon, ChatIcon, EditIcon, DownloadIcon, CheckCircleIcon, WarningIcon, SunIcon, MoonIcon, SettingsIcon, AddIcon } from '@chakra-ui/icons';
import { useTasks } from './hooks/useTasks';
import { useProjects } from './hooks/useProjects';
import apiService from './services/api';

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
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion
  } = useTasks();

  const {
    projects: backendProjects,
    loading: projectsLoading,
    error: projectsError,
    loadProjects
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
        _id: task._id // Keep the backend ID for operations
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

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
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
  const [editingTags, setEditingTags] = React.useState(['category', 'Q3']);
  const [editingCompleted, setEditingCompleted] = React.useState(false);

  // State for selected task
  const [selectedTask, setSelectedTask] = React.useState(null);
  const [selectedTaskId, setSelectedTaskId] = React.useState(null);

  // Add state to track add mode
  const [isAddMode, setIsAddMode] = React.useState(false);

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
    try {
      // Check if task exists in taskData
      if (!taskData[taskName]) {
        return;
      }

      // Update selected task
      setSelectedTask(taskName);
      setSelectedTaskId(taskData[taskName]._id);
      setTaskTitle(taskName);
      setTaskDescription(taskData[taskName].description);

      // Populate editing panel fields
      setEditingDueDate(taskData[taskName].dueDate);
      setEditingProject(taskData[taskName].project);
      setEditingTags([...taskData[taskName].tags]);
      setEditingCompleted(taskData[taskName].completed);

      // Open detail panel if it's not already open
      if (!isDetailOpen) {
        toggleDetail();
      }

      // Toggle expanded state for the clicked task
      setLocalTaskData(prev => ({
        ...prev,
        [taskName]: {
          ...prev[taskName],
          expanded: !prev[taskName].expanded
        }
      }));
    } catch (error) {
    }
  };

  const handleWeeklyTaskClick = (task) => {
    try {
      // Update selected task
      setSelectedTask(task.title);
      setSelectedTaskId(task._id);
      setTaskTitle(task.title);
      setTaskDescription(task.description);

      // Populate editing panel fields
      setEditingDueDate(task.dueDate);
      setEditingProject(task.project);
      setEditingTags([...task.tags]);
      setEditingCompleted(task.completed);

      // Open detail panel if it's not already open
      if (!isDetailOpen) {
        toggleDetail();
      }
    } catch (error) {
    }
  };

  const handleFilteredTaskClick = (task) => {
    try {
      // Find the corresponding backend task to get the ID
      let backendTask = null;
      if (task.source === 'today') {
        // For tasks from taskData, get the ID from localTaskData
        const localTask = taskData[task.title];
        if (localTask && localTask._id) {
          backendTask = allBackendTasks.find(t => t._id === localTask._id);
        }
      } else if (task.source === 'week') {
        // For tasks from dayTasks, use the _id directly since it's from backend data
        if (task._id) {
          backendTask = allBackendTasks.find(t => t._id === task._id);
        }
        // Fallback to title matching if _id is not available
        if (!backendTask) {
          backendTask = allBackendTasks.find(t => t.title === task.title);
        }
      }

      // Update selected task
      setSelectedTask(task.title);
      setSelectedTaskId(backendTask ? backendTask._id : null);
      setTaskTitle(task.title);
      setTaskDescription(task.description);

      // Populate editing panel fields
      setEditingDueDate(task.dueDate);
      setEditingProject(task.project);
      setEditingTags([...task.tags]);
      setEditingCompleted(task.completed);

      // Open detail panel if it's not already open
      if (!isDetailOpen) {
        toggleDetail();
      }

      // Show warning if task is not in backend
      if (!backendTask) {
        console.warn('Task not found in backend:', task.title);
      }

      // Toggle expanded state based on task source
      if (task.source === 'today' && taskData[task.title]) {
        // For tasks from taskData, update taskData expanded state
        setLocalTaskData(prev => ({
          ...prev,
          [task.title]: {
            ...prev[task.title],
            expanded: !prev[task.title].expanded
          }
        }));
      } else {
        // For tasks from dayTasks or filtered views, update expandedFilteredTasks
        setExpandedFilteredTasks(prev => ({
          ...prev,
          [task.title]: !prev[task.title]
        }));
      }
    } catch (error) {
    }
  };

  const handleDayClick = (day) => {
    setCurrentView('day');
    setCurrentFilter(day);
  };

  const handleProjectClick = (project) => {
    setCurrentView('project');
    setCurrentFilter(project);
  };

  const handleTagClick = (tag) => {
    setCurrentView('tag');
    setCurrentFilter(tag);
  };

  const resetToAllTasks = () => {
    setCurrentView('all');
    setCurrentFilter('');
    setSearchTerm('');
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

      // Find the task in ALL backend tasks by ID (most reliable)
      let task = allBackendTasks.find(t => t._id === selectedTaskId);

      // If not found by ID, fallback to title matching in all tasks
      if (!task) {
        task = allBackendTasks.find(t => t.title === selectedTask);
      }

      // If still not found, try finding by the new title
      if (!task && taskTitle !== selectedTask) {
        task = allBackendTasks.find(t => t.title === taskTitle);
      }

      if (task) {
        // Use backend API to update task
        await updateTask(task._id, updatedTaskData);

        // Update selectedTask if the title was changed
        if (taskTitle !== selectedTask) {
          setSelectedTask(taskTitle);
        }

        // Reload tasks to ensure UI is in sync with backend
        await loadTasks();

        toast({
          title: 'Success',
          description: 'Task updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        console.error('Task not found in backend:', selectedTask);
        console.error('Available task IDs:', allBackendTasks.map(t => ({ id: t._id, title: t.title })));
        toast({
          title: 'Error',
          description: 'Task not found in backend',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }

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

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const cancelRef = React.useRef();

  const onDeleteTask = async () => {
    if (!selectedTaskId) return;
    setIsDeleting(true);
    try {
      await deleteTask(selectedTaskId);
      toast({
        title: 'Task deleted',
        description: 'The task was deleted successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setIsDeleteDialogOpen(false);
      setIsDeleting(false);
      toggleDetail();
      setSelectedTask(null);
      setSelectedTaskId(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete task',
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
    setIsAddMode(true);
    setSelectedTask(null);
    setSelectedTaskId(null);
    setTaskTitle('');
    setTaskDescription('');
    setEditingDueDate('');
    setEditingProject('');
    setEditingTags(['']);
    setEditingCompleted(false);
    if (!isDetailOpen) toggleDetail();
  };

  // Add Task submit handler
  const onCreateTask = async () => {
    try {
      const newTask = {
        title: taskTitle,
        description: taskDescription,
        dueDate: editingDueDate,
        project: editingProject,
        tags: editingTags.filter(Boolean),
        completed: editingCompleted
      };
      await createTask(newTask);
      toast({
        title: 'Task created',
        description: 'The new task was created successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setIsAddMode(false);
      toggleDetail();
      // Optionally reset fields
      setTaskTitle('');
      setTaskDescription('');
      setEditingDueDate('');
      setEditingProject('');
      setEditingTags(['']);
      setEditingCompleted(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create task',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
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
          </Flex>
          <Flex align="center" position="relative">
            <Menu>
              <MenuButton
                as={Avatar}
                size="sm"
                name="User"
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
              <SimpleGrid columns={2} spacing={3}>
                <Box p={4} bg={colorMode === 'light' ? 'gray.200' : 'gray.800'} borderRadius="lg" cursor="pointer" _hover={{ bg: colorMode === 'light' ? 'gray.300' : 'gray.700' }} onClick={() => handleProjectClick('marketing')}>
                  <Text fontWeight="medium" mb={1} color={colorMode === 'light' ? 'gray.800' : 'white'}>Marketing</Text>
                  <Text fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>Campaign management & analytics</Text>
                </Box>
                <Box p={4} bg={colorMode === 'light' ? 'gray.200' : 'gray.800'} borderRadius="lg" cursor="pointer" _hover={{ bg: colorMode === 'light' ? 'gray.300' : 'gray.700' }} onClick={() => handleProjectClick('techdev')}>
                  <Text fontWeight="medium" mb={1} color={colorMode === 'light' ? 'gray.800' : 'white'}>TechDev</Text>
                  <Text fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>Development & technical tasks</Text>
                </Box>
                <Box p={4} bg={colorMode === 'light' ? 'gray.200' : 'gray.800'} borderRadius="lg" cursor="pointer" _hover={{ bg: colorMode === 'light' ? 'gray.300' : 'gray.700' }} onClick={() => handleProjectClick('design')}>
                  <Text fontWeight="medium" mb={1} color={colorMode === 'light' ? 'gray.800' : 'white'}>Design</Text>
                  <Text fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>UI/UX & creative work</Text>
                </Box>
                <Box p={4} bg={colorMode === 'light' ? 'gray.200' : 'gray.800'} borderRadius="lg" cursor="pointer" _hover={{ bg: colorMode === 'light' ? 'gray.300' : 'gray.700' }} onClick={() => handleProjectClick('sales')}>
                  <Text fontWeight="medium" mb={1} color={colorMode === 'light' ? 'gray.800' : 'white'}>Sales</Text>
                  <Text fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>Client relations & deals</Text>
                </Box>
              </SimpleGrid>
            </Box>
          </Collapse>

          {/* Projects Section - Desktop view (above tasks) */}
          <Collapse in={isCenterOpen} animateOpacity>
            <Box mb={2} display={{ base: 'none', md: 'block' }}>
              <Text fontSize="sm" mb={3} color="gray.400" fontWeight="medium">Projects</Text>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3}>
                <Box p={4} bg={colorMode === 'light' ? 'gray.200' : 'gray.800'} borderRadius="lg" cursor="pointer" _hover={{ bg: colorMode === 'light' ? 'gray.300' : 'gray.700' }} onClick={() => handleProjectClick('marketing')}>
                  <Text fontWeight="medium" mb={1} color={colorMode === 'light' ? 'gray.800' : 'white'}>Marketing</Text>
                  <Text fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>Campaign management & analytics</Text>
                </Box>
                <Box p={4} bg={colorMode === 'light' ? 'gray.200' : 'gray.800'} borderRadius="lg" cursor="pointer" _hover={{ bg: colorMode === 'light' ? 'gray.300' : 'gray.700' }} onClick={() => handleProjectClick('techdev')}>
                  <Text fontWeight="medium" mb={1} color={colorMode === 'light' ? 'gray.800' : 'white'}>TechDev</Text>
                  <Text fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>Development & technical tasks</Text>
                </Box>
                <Box p={4} bg={colorMode === 'light' ? 'gray.200' : 'gray.800'} borderRadius="lg" cursor="pointer" _hover={{ bg: colorMode === 'light' ? 'gray.300' : 'gray.700' }} onClick={() => handleProjectClick('design')}>
                  <Text fontWeight="medium" mb={1} color={colorMode === 'light' ? 'gray.800' : 'white'}>Design</Text>
                  <Text fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>UI/UX & creative work</Text>
                </Box>
                <Box p={4} bg={colorMode === 'light' ? 'gray.200' : 'gray.800'} borderRadius="lg" cursor="pointer" _hover={{ bg: colorMode === 'light' ? 'gray.300' : 'gray.700' }} onClick={() => handleProjectClick('sales')}>
                  <Text fontWeight="medium" mb={1} color={colorMode === 'light' ? 'gray.800' : 'white'}>Sales</Text>
                  <Text fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>Client relations & deals</Text>
                </Box>
              </SimpleGrid>
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
                <AlertTitle>Backend Error!</AlertTitle>
                <AlertDescription>
                  {tasksError}. Please check if the backend server is running.
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
                                    {taskInfo.tags.map((tag, tagIndex) => (
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
                              <Collapse in={task.source === 'today' && taskData[task.title] ? taskInfo.expanded : expandedFilteredTasks[task.title]} animateOpacity>
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
                                      {task.tags.map((tag, tagIndex) => (
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
                                <Collapse in={task.source === 'today' && taskData[task.title] ? taskData[task.title].expanded : expandedFilteredTasks[task.title]} animateOpacity>
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
              {isAddMode ? 'Add New Task' : 'Update Selected Task'}
            </Heading>
            <Input
              value={taskTitle}
              fontSize="lg"
              fontWeight="bold"
              bg="transparent"
              border={0}
              p={0}
              mb={2}
              color={colorMode === 'light' ? 'gray.800' : 'white'}
              _focus={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700', border: '1px solid', borderColor: 'blue.400' }}
              _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
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
              >
                <option value="marketing">Marketing</option>
                <option value="techdev">TechDev</option>
                <option value="design">Design</option>
                <option value="sales">Sales</option>
              </Select>
          </Box>

          <Box mb={4}>
            <Text fontSize="sm" mb={1} color={colorMode === 'light' ? 'gray.600' : 'white'}>Tags</Text>
            <HStack>
                {editingTags.map((tag, index) => (
                  <Tag key={index} colorScheme="green" p={0} bg={colorMode === 'light' ? 'gray.200' : 'gray.600'}>
                    <Input
                      value={tag}
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
                      _focus={{ bg: 'transparent', border: '1px solid', borderColor: colorMode === 'light' ? 'gray.600' : 'white' }}
                    />
                  </Tag>
                ))}
            </HStack>
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
            <Image bg={colorMode === 'light' ? 'gray.200' : 'gray.700'} boxSize="60px" borderRadius="md" mb={3} />
            {!isAddMode && !selectedTaskId && (
              <Alert status="warning" mb={3} borderRadius="md">
                <Box>
                  <AlertTitle>Local Task</AlertTitle>
                  <AlertDescription>
                    This task is not from the backend and cannot be updated or deleted.
                  </AlertDescription>
                </Box>
              </Alert>
            )}
            {isAddMode ? (
              <Button colorScheme="green" w="full" onClick={onCreateTask} mb={2}>Create</Button>
            ) : (
              <Button colorScheme="green" w="full" onClick={onUpdateTask} mb={2} isDisabled={!selectedTaskId}>Update</Button>
            )}
            {!isAddMode && (
              <Button colorScheme="red" w="full" onClick={() => setIsDeleteDialogOpen(true)} isDisabled={!selectedTaskId || isDeleting}>Delete</Button>
            )}
          </Box>

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
