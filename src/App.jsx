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
  AlertDescription
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon, CalendarIcon, ViewIcon, InfoIcon, ChatIcon, EditIcon, DownloadIcon, CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';

export default function TaskDashboard() {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { isOpen: isSidebarOpen, onToggle: toggleSidebar } = useDisclosure({ defaultIsOpen: true });
  const { isOpen: isDetailOpen, onToggle: toggleDetail } = useDisclosure({ defaultIsOpen: false });
  const { isOpen: isFooterOpen, onToggle: toggleFooter } = useDisclosure({ defaultIsOpen: false });
  const { isOpen: isCenterOpen, onToggle: toggleCenter } = useDisclosure({ defaultIsOpen: true });

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
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  // State for expanded days
  const [expandedDays, setExpandedDays] = React.useState({});

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

  // State for selected task
  const [selectedTask, setSelectedTask] = React.useState(null);

  // State for task data with descriptions
  const [taskData, setTaskData] = React.useState({
    'Review analytics report': {
      description: 'Analyze weekly performance metrics, identify key trends, and prepare insights for the marketing team. Focus on conversion rates, user engagement, and ROI across all campaigns.',
      expanded: false,
      dueDate: new Date().toISOString().split('T')[0], // Today
      project: 'marketing',
      tags: ['analytics', 'reporting'],
      completed: false
    },
    'Prepare presentation slides': {
      description: 'Create compelling presentation materials for the quarterly business review. Include data visualizations, key achievements, and strategic recommendations for stakeholders.',
      expanded: false,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
      project: 'marketing',
      tags: ['presentation', 'Q4'],
      completed: true
    },
    'Update campaign strategy': {
      description: 'Revise digital marketing campaign approach based on recent performance data. Optimize targeting parameters, adjust budget allocation, and refine messaging for better engagement.',
      expanded: false,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days from now
      project: 'marketing',
      tags: ['campaign', 'strategy'],
      completed: false
    },
    'Conduct user interviews': {
      description: 'Schedule and conduct user research interviews to gather feedback on product features. Document insights, pain points, and improvement suggestions for the development team.',
      expanded: false,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days from now
      project: 'techdev',
      tags: ['research', 'user-feedback'],
      completed: false
    },
    'Organize team meeting': {
      description: 'Coordinate weekly team sync meeting, prepare agenda items, and ensure all team members have necessary materials. Focus on project updates and collaborative problem-solving.',
      expanded: false,
      dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 45 days from now
      project: 'techdev',
      tags: ['meeting', 'coordination'],
      completed: true
    }
  });

  // State for weekly tasks
  const [dayTasks, setDayTasks] = React.useState({
    Monday: [
      {
        title: 'Team standup meeting',
        description: 'Daily team synchronization meeting to discuss progress, blockers, and priorities for the day.',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 day from now
        project: 'techdev',
        tags: ['meeting', 'standup'],
        completed: false
      },
      {
        title: 'Code review',
        description: 'Review pull requests and provide feedback on code quality, best practices, and potential improvements.',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
        project: 'techdev',
        tags: ['code', 'review'],
        completed: true
      },
      {
        title: 'Bug fixes',
        description: 'Address critical bugs and issues reported by users or identified during testing.',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        project: 'techdev',
        tags: ['bugs', 'fixes'],
        completed: false
      }
    ],
    Tuesday: [
      {
        title: 'Content creation',
        description: 'Create blog posts, social media content, and marketing materials for upcoming campaigns.',
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 4 days from now
        project: 'marketing',
        tags: ['content', 'creation'],
        completed: false
      },
      {
        title: 'SEO optimization',
        description: 'Optimize website content and structure for better search engine rankings and visibility.',
        dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 8 days from now
        project: 'marketing',
        tags: ['seo', 'optimization'],
        completed: false
      },
      {
        title: 'Email campaign',
        description: 'Design and send email marketing campaigns to engage subscribers and drive conversions.',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
        project: 'marketing',
        tags: ['email', 'campaign'],
        completed: true
      }
    ],
    Wednesday: [
      {
        title: 'UI/UX design',
        description: 'Create wireframes, mockups, and design prototypes for new features and improvements.',
        dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 days from now
        project: 'design',
        tags: ['design', 'ui-ux'],
        completed: false
      },
      {
        title: 'Brand guidelines',
        description: 'Update and maintain brand guidelines to ensure consistency across all design materials.',
        dueDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 11 days from now
        project: 'design',
        tags: ['brand', 'guidelines'],
        completed: false
      },
      {
        title: 'Design system',
        description: 'Develop and maintain a comprehensive design system for consistent component usage.',
        dueDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 18 days from now
        project: 'design',
        tags: ['design-system', 'components'],
        completed: true
      }
    ],
    Thursday: [
      {
        title: 'Client meeting',
        description: 'Meet with clients to discuss project requirements, progress updates, and feedback.',
        dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 9 days from now
        project: 'sales',
        tags: ['client', 'meeting'],
        completed: false
      },
      {
        title: 'Proposal writing',
        description: 'Write and prepare project proposals for potential clients and business opportunities.',
        dueDate: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 13 days from now
        project: 'sales',
        tags: ['proposal', 'writing'],
        completed: false
      },
      {
        title: 'Sales follow-up',
        description: 'Follow up with leads and prospects to nurture relationships and close deals.',
        dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 20 days from now
        project: 'sales',
        tags: ['sales', 'follow-up'],
        completed: false
      }
    ],
    Friday: [
      {
        title: 'Performance review',
        description: 'Conduct performance reviews and provide feedback to team members on their work.',
        dueDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 16 days from now
        project: 'techdev',
        tags: ['review', 'performance'],
        completed: false
      },
      {
        title: 'Documentation update',
        description: 'Update technical documentation and user guides based on recent feature releases and user feedback.',
        dueDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 35 days from now
        project: 'techdev',
        tags: ['documentation', 'update'],
        completed: true
      },
      {
        title: 'Next week planning',
        description: 'Plan and prioritize tasks for the upcoming week. Allocate resources and set realistic deadlines.',
        dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
        project: 'marketing',
        tags: ['planning', 'priorities'],
        completed: false
      }
    ],
    Saturday: [
      {
        title: 'Personal project work',
        description: 'Dedicated time for personal development projects and skill building. Focus on learning new technologies.',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days from now
        project: 'techdev',
        tags: ['personal', 'development'],
        completed: false
      },
      {
        title: 'Skill development',
        description: 'Online course completion and skill enhancement activities. Focus on areas identified for improvement.',
        dueDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 40 days from now
        project: 'techdev',
        tags: ['learning', 'skills'],
        completed: false
      },
      {
        title: 'Creative brainstorming',
        description: 'Free-form creative session to generate new ideas for projects and explore innovative solutions.',
        dueDate: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 100 days from now
        project: 'design',
        tags: ['creative', 'brainstorming'],
        completed: false
      }
    ],
    Sunday: [
      {
        title: 'Week preparation',
        description: 'Prepare for the upcoming week by organizing tasks, setting priorities, and reviewing calendar commitments.',
        dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 12 days from now
        project: 'marketing',
        tags: ['preparation', 'planning'],
        completed: false
      },
      {
        title: 'Rest and recharge',
        description: 'Dedicated time for rest and personal activities. Important for maintaining work-life balance and productivity.',
        dueDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 50 days from now
        project: 'personal',
        tags: ['rest', 'balance'],
        completed: false
      },
      {
        title: 'Goal setting',
        description: 'Review personal and professional goals, assess progress, and set new objectives for the upcoming period.',
        dueDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 120 days from now
        project: 'personal',
        tags: ['goals', 'planning'],
        completed: false
      }
    ]
  });

  // State for contextual task view
  const [currentView, setCurrentView] = React.useState('all'); // 'all', 'day', 'project', 'tag'
  const [currentFilter, setCurrentFilter] = React.useState('');

  // Memoize filtered tasks to prevent race conditions
  const filteredTasks = React.useMemo(() => {
    try {
      if (currentView === 'all') {
        return [];
      } else if (currentView === 'day' && currentFilter && dayTasks[currentFilter]) {
        const dayTasksArray = dayTasks[currentFilter];
        if (!Array.isArray(dayTasksArray)) {
          console.error('dayTasks[currentFilter] is not an array:', dayTasksArray);
          return [];
        }
        // For day view, all tasks come from dayTasks, so source should be 'week'
        return dayTasksArray.map(task => ({
          ...task,
          source: 'week'
        })).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      } else if (currentView === 'project' && currentFilter) {
        const allTasks = [];

        // Add tasks from taskData (Tasks for Today)
        Object.keys(taskData).forEach(taskName => {
          if (taskData[taskName].project === currentFilter) {
            allTasks.push({
              title: taskName,
              description: taskData[taskName].description,
              dueDate: taskData[taskName].dueDate,
              project: taskData[taskName].project,
              tags: taskData[taskName].tags,
              completed: taskData[taskName].completed,
              source: 'today'
            });
          }
        });

        // Add tasks from dayTasks (This Week)
        Object.keys(dayTasks).forEach(day => {
          dayTasks[day].forEach(task => {
            if (task.project === currentFilter) {
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

        // Add tasks from taskData (Tasks for Today)
        Object.keys(taskData).forEach(taskName => {
          if (taskData[taskName].tags.includes(currentFilter)) {
            allTasks.push({
              title: taskName,
              description: taskData[taskName].description,
              dueDate: taskData[taskName].dueDate,
              project: taskData[taskName].project,
              tags: taskData[taskName].tags,
              completed: taskData[taskName].completed,
              source: 'today'
            });
          }
        });

        // Add tasks from dayTasks (This Week)
        Object.keys(dayTasks).forEach(day => {
          dayTasks[day].forEach(task => {
            if (task.tags.includes(currentFilter)) {
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
      console.error('Error computing filtered tasks:', error);
      console.log('Current state:', { currentView, currentFilter, dayTasks: dayTasks ? Object.keys(dayTasks) : 'undefined' });
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
    // Update selected task
    setSelectedTask(taskName);
    setTaskTitle(taskName);
    setTaskDescription(taskData[taskName].description);

    // Populate editing panel fields
    setEditingDueDate(taskData[taskName].dueDate);
    setEditingProject(taskData[taskName].project);
    setEditingTags([...taskData[taskName].tags]);

    // Open detail panel if it's not already open
    if (!isDetailOpen) {
      toggleDetail();
    }

    // Toggle expanded state for the clicked task
    setTaskData(prev => ({
      ...prev,
      [taskName]: {
        ...prev[taskName],
        expanded: !prev[taskName].expanded
      }
    }));
  };

  const handleWeeklyTaskClick = (task) => {
    // Update selected task
    setSelectedTask(task.title);
    setTaskTitle(task.title);
    setTaskDescription(task.description);

    // Populate editing panel fields
    setEditingDueDate(task.dueDate);
    setEditingProject(task.project);
    setEditingTags([...task.tags]);

    // Open detail panel if it's not already open
    if (!isDetailOpen) {
      toggleDetail();
    }
  };

  const handleDayClick = (day) => {
    // Open main pane if it's closed
    if (!isCenterOpen) {
      toggleCenter();
    }

    setCurrentView('day');
    setCurrentFilter(day);
  };

  const handleProjectClick = (project) => {
    // Open main pane if it's closed
    if (!isCenterOpen) {
      toggleCenter();
    }

    setCurrentView('project');
    setCurrentFilter(project);
  };

  const handleTagClick = (tag) => {
    // Open main pane if it's closed
    if (!isCenterOpen) {
      toggleCenter();
    }

    setCurrentView('tag');
    setCurrentFilter(tag);
  };

  const resetToAllTasks = () => {
    setCurrentView('all');
    setCurrentFilter('');
  };

  const toggleTaskCompleted = (taskName, source = 'today') => {
    try {
      console.log('toggleTaskCompleted called:', { taskName, source, currentView, currentFilter });

      if (source === 'today') {
        setTaskData(prev => {
          // Validate that the task exists before accessing it
          if (!prev[taskName]) {
            console.error('Task not found in taskData:', taskName);
            return prev;
          }
          return {
            ...prev,
            [taskName]: {
              ...prev[taskName],
              completed: !prev[taskName].completed
            }
          };
        });
      } else {
        // For weekly tasks, we need to find the task in the dayTasks structure
        setDayTasks(prev => {
          console.log('Updating dayTasks:', { prev: Object.keys(prev), taskName });
          const newDayTasks = { ...prev };
          let taskFound = false;

          Object.keys(newDayTasks).forEach(day => {
            newDayTasks[day] = newDayTasks[day].map(task => {
              if (task.title === taskName) {
                taskFound = true;
                console.log('Found task to toggle:', { day, task: task.title, currentCompleted: task.completed });
                return { ...task, completed: !task.completed };
              }
              return task;
            });
          });

          if (!taskFound) {
            console.error('Task not found in dayTasks:', taskName);
          }

          console.log('New dayTasks structure:', Object.keys(newDayTasks));
          return newDayTasks;
        });
      }
    } catch (error) {
      console.error('Error in toggleTaskCompleted:', error);
      console.log('Task details:', { taskName, source, currentView, currentFilter });
    }
  };

  // Get current day of the week
  const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  // Get due date category for a task
  const getDueDateCategory = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);

    // Reset time to compare dates only
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    // Get start of current week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    // Get end of current week (Saturday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    // Get start and end of current month
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
  };

  return (
    <Box position="relative" minH="100vh">
      <Flex direction={{ base: 'column', md: 'row' }} minH="100vh" bg="gray.900" color="white" pb={{ base: '80px', md: '0' }}>
        {/* Sidebar */}
        {isSidebarOpen && (
          <Box w={{ base: '100%', md: isCenterOpen ? '250px' : '400px' }} bg="gray.800" p={4} position="relative">
            <IconButton
              icon={<CalendarIcon />}
              aria-label="Collapse Sidebar"
              onClick={toggleSidebar}
              position="absolute"
              top="10px"
              right="-12px"
              size="sm"
              zIndex={1}
              display={{ base: 'none', md: 'flex' }}
            />
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
                        bg="gray.700"
                        borderRadius="md"
                        w="full"
                        justify="space-between"
                        align="center"
                        onClick={() => handleDayClick(day)}
                        _hover={{ bg: 'gray.600' }}
                      >
                        <HStack spacing={2}>
                          <Text>{day}</Text>
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
          <IconButton
            icon={<CalendarIcon />}
            aria-label="Expand Sidebar"
            onClick={toggleSidebar}
            position="absolute"
            top="10px"
            left="10px"
            size="sm"
            zIndex={10}
            display={{ base: 'none', md: 'flex' }}
          />
        )}

        {/* Main Content */}
        <Box flex={1} p={6} bg="gray.850" position="relative">
          {/* Toggle Button for Center Panel */}
          <IconButton
            icon={isCenterOpen ? <ViewIcon /> : <ViewIcon />}
            aria-label="Toggle Center Panel"
            onClick={toggleCenter}
            position="fixed"
            top="10px"
            left="50%"
            transform="translateX(-50%)"
            size="sm"
            zIndex={30}
            display={{ base: 'none', md: 'flex' }}
          />

          {/* PWA Status Indicators */}
          <Flex position="fixed" top="10px" right="10px" zIndex={40} gap={2}>
            {/* Online/Offline Status */}
            <Alert
              status={isOnline ? 'success' : 'warning'}
              variant="solid"
              size="sm"
              maxW="200px"
              borderRadius="md"
              display={{ base: 'none', md: 'flex' }}
            >
              <AlertIcon as={isOnline ? CheckCircleIcon : WarningIcon} />
              <Text fontSize="xs">{isOnline ? 'Online' : 'Offline'}</Text>
            </Alert>

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

          {/* Search Bar - Always Visible */}
          <Flex justify="space-between" align="center" mb={6} p={4} bg="gray.800" borderRadius="lg">
            <Input
              placeholder="Search tasks..."
              bg="gray.700"
              border={0}
              w="300px"
              _placeholder={{ color: 'gray.400' }}
            />
            <Avatar size="sm" name="User" bg="blue.500" />
          </Flex>

          {/* Projects Section - Always Visible */}
          <Box mb={6}>
            <Text fontSize="sm" mb={3} color="gray.400" fontWeight="medium">Projects</Text>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3}>
              <Box p={4} bg="gray.800" borderRadius="lg" cursor="pointer" _hover={{ bg: 'gray.700' }} onClick={() => handleProjectClick('marketing')}>
                <Text fontWeight="medium" mb={1}>Marketing</Text>
                <Text fontSize="sm" color="gray.400">Campaign management & analytics</Text>
              </Box>
              <Box p={4} bg="gray.800" borderRadius="lg" cursor="pointer" _hover={{ bg: 'gray.700' }} onClick={() => handleProjectClick('techdev')}>
                <Text fontWeight="medium" mb={1}>TechDev</Text>
                <Text fontSize="sm" color="gray.400">Development & technical tasks</Text>
              </Box>
              <Box p={4} bg="gray.800" borderRadius="lg" cursor="pointer" _hover={{ bg: 'gray.700' }} onClick={() => handleProjectClick('design')}>
                <Text fontWeight="medium" mb={1}>Design</Text>
                <Text fontSize="sm" color="gray.400">UI/UX & creative work</Text>
              </Box>
              <Box p={4} bg="gray.800" borderRadius="lg" cursor="pointer" _hover={{ bg: 'gray.700' }} onClick={() => handleProjectClick('sales')}>
                <Text fontWeight="medium" mb={1}>Sales</Text>
                <Text fontSize="sm" color="gray.400">Client relations & deals</Text>
              </Box>
            </SimpleGrid>
          </Box>

          <Collapse in={isCenterOpen} animateOpacity>
            {(() => {
              try {
                return (
                  <>
                    <Flex justify="space-between" align="center" mb={4}>
                      <Heading size="lg">
                        {currentView === 'all' && 'My Tasks'}
                        {currentView === 'day' && `${currentFilter} Tasks`}
                        {currentView === 'project' && `${currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1)} Tasks`}
                        {currentView === 'tag' && `#${currentFilter} Tasks`}
                      </Heading>
                    </Flex>

                    <VStack align="stretch" spacing={3}>
                      {currentView === 'all' ? (
                        // Show all tasks from taskData
                        Object.keys(taskData).map((task, idx) => (
                          <Box key={idx}>
                            <Box
                              p={3}
                              bg={selectedTask === task ? 'gray.700' : 'gray.800'}
                              borderRadius="md"
                              cursor="pointer"
                              onClick={() => handleTaskClick(task)}
                              _hover={{ bg: 'gray.700' }}
                              border={selectedTask === task ? '2px solid' : '1px solid'}
                              borderColor={selectedTask === task ? 'blue.400' : 'transparent'}
                            >
                              <Flex justify="space-between" align="center" mb={2}>
                                <Flex align="center" flex={1}>
                                  <Checkbox
                                    isChecked={taskData[task].completed}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      toggleTaskCompleted(task, 'today');
                                    }}
                                    colorScheme="green"
                                    size="md"
                                    mr={3}
                                  />
                                  <Text
                                    color={selectedTask === task ? 'green.300' : taskData[task].completed ? 'gray.500' : 'white'}
                                    fontWeight={selectedTask === task ? 'bold' : 'normal'}
                                    textDecoration={taskData[task].completed ? "line-through" : "none"}
                                  >
                                    {task}
                                  </Text>
                                </Flex>
                                <HStack spacing={2}>
                                  <Tag size="sm" colorScheme={getDueDateCategory(taskData[task].dueDate) === 'Today' ? 'red' : getDueDateCategory(taskData[task].dueDate) === 'Week' ? 'orange' : getDueDateCategory(taskData[task].dueDate) === 'Month' ? 'yellow' : 'gray'} variant="subtle">
                                    {getDueDateCategory(taskData[task].dueDate)}
                                  </Tag>
                                  {taskData[task].expanded ? <InfoIcon /> : <InfoIcon />}
                                </HStack>
                              </Flex>

                              {/* Task metadata */}
                              <VStack align="start" spacing={1}>
                                <HStack spacing={4} fontSize="xs" color="gray.400">
                                  <Text>Due: {taskData[task].dueDate}</Text>
                                  <Text>Project: {taskData[task].project}</Text>
                                </HStack>
                                <HStack spacing={1}>
                                  {taskData[task].tags.map((tag, tagIndex) => (
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
                            <Collapse in={taskData[task].expanded} animateOpacity>
                              <Box p={3} bg="gray.750" borderRadius="md" mt={1} borderLeft="3px solid" borderColor="blue.400">
                                <Text fontSize="sm" color="gray.300" lineHeight="1.6">
                                  {taskData[task].description}
                                </Text>
                              </Box>
                            </Collapse>
                          </Box>
                        ))
                      ) : (
                        // Show filtered tasks
                        (() => {
                          try {
                            return filteredTasks.map((task, idx) => (
                              <Box key={idx}>
                                <Box
                                  p={3}
                                  bg={selectedTask === task.title ? 'gray.700' : 'gray.800'}
                                  borderRadius="md"
                                  cursor="pointer"
                                  onClick={() => task.source === 'today' ? handleTaskClick(task.title) : handleWeeklyTaskClick(task)}
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
                                    <Tag size="sm" colorScheme={getDueDateCategory(task.dueDate) === 'Today' ? 'red' : getDueDateCategory(task.dueDate) === 'Week' ? 'orange' : getDueDateCategory(task.dueDate) === 'Month' ? 'yellow' : 'gray'} variant="subtle">
                                      {getDueDateCategory(task.dueDate)}
                                    </Tag>
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
                              </Box>
                            ));
                          } catch (error) {
                            console.error('Error rendering filtered tasks:', error);
                            return (
                              <Box p={4} bg="red.900" borderRadius="md">
                                <Text color="red.200">Error loading tasks. Please refresh the page.</Text>
                              </Box>
                            );
                          }
                        })()
                      )}
                    </VStack>
                  </>
                );
              } catch (error) {
                console.error('Error in main content render:', error);
                return (
                  <Box p={4} bg="red.900" borderRadius="md">
                    <Text color="red.200">Error loading content. Please refresh the page.</Text>
                    <Text color="red.300" fontSize="sm" mt={2}>Error: {error.message}</Text>
                  </Box>
                );
              }
            })()}
          </Collapse>
        </Box>

        {/* Detail Panel */}
        {isDetailOpen && (
          <Box w={{ base: '100%', md: isCenterOpen ? '350px' : '500px' }} bg="gray.800" p={6} position="relative">
            <IconButton
              icon={<EditIcon />}
              aria-label="Collapse Detail Panel"
              onClick={toggleDetail}
              position="absolute"
              top="10px"
              left="-12px"
              size="sm"
              zIndex={1}
              display={{ base: 'none', md: 'flex' }}
            />
            <Heading size="md" mb={4}>Edit Selected Task</Heading>
            <Input
              value={taskTitle}
              fontSize="lg"
              fontWeight="bold"
              bg="transparent"
              border={0}
              p={0}
              mb={2}
              _focus={{ bg: 'gray.700', border: '1px solid', borderColor: 'blue.400' }}
              _hover={{ bg: 'gray.700' }}
              onChange={(e) => setTaskTitle(e.target.value)}
            />
            <Textarea
              placeholder="Task description"
              mb={4}
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
            />

            <Box mb={4}>
              <Text fontSize="sm" mb={1} color="gray.400">Due Date</Text>
              <Input
                type="date"
                bg="gray.700"
                border={0}
                value={editingDueDate}
                onChange={(e) => setEditingDueDate(e.target.value)}
              />
            </Box>

            <Box mb={4}>
              <Text fontSize="sm" mb={1} color="gray.400">Project</Text>
              <Select
                bg="gray.700"
                border={0}
                color="white"
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
              <Text fontSize="sm" mb={1} color="gray.400">Tags</Text>
              <HStack>
                {editingTags.map((tag, index) => (
                  <Tag key={index} colorScheme="green" p={0} bg="gray.600">
                    <Input
                      value={tag}
                      onChange={(e) => {
                        const newTags = [...editingTags];
                        newTags[index] = e.target.value;
                        setEditingTags(newTags);
                      }}
                      bg="transparent"
                      border={0}
                      color="white"
                      fontSize="sm"
                      p={2}
                      minW="80px"
                      _focus={{ bg: 'transparent', border: '1px solid', borderColor: 'white' }}
                    />
                  </Tag>
                ))}
              </HStack>
            </Box>

            <Box>
              <Text fontSize="sm" mb={2} color="gray.400">Task Assets</Text>
              <Image bg="gray.700" boxSize="60px" borderRadius="md" mb={3} />
              <Button colorScheme="green" w="full">Update</Button>
            </Box>
          </Box>
        )}
        {!isDetailOpen && selectedTask && (
          <IconButton
            icon={<EditIcon />}
            aria-label="Expand Detail Panel"
            onClick={toggleDetail}
            position="absolute"
            top="10px"
            right="10px"
            size="sm"
            zIndex={10}
            display={{ base: 'none', md: 'flex' }}
          />
        )}
      </Flex>

      {/* Mobile Sticky Footer Navigation */}
      <Box
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        zIndex={25}
        display={{ base: 'block', md: 'none' }}
        bg="gray.800"
        borderTop="1px solid"
        borderColor="gray.700"
        p={3}
      >
        <Flex justify="space-around" align="center">
          <IconButton
            icon={<CalendarIcon />}
            aria-label="Toggle Sidebar"
            onClick={toggleSidebar}
            size="md"
            colorScheme={isSidebarOpen ? "blue" : "gray"}
            variant="solid"
            borderRadius="full"
          />
          <IconButton
            icon={<ViewIcon />}
            aria-label="Toggle Center Panel"
            onClick={toggleCenter}
            size="md"
            colorScheme={isCenterOpen ? "blue" : "gray"}
            variant="solid"
            borderRadius="full"
          />
          {selectedTask && (
            <IconButton
              icon={<EditIcon />}
              aria-label="Toggle Detail Panel"
              onClick={toggleDetail}
              size="md"
              colorScheme={isDetailOpen ? "blue" : "gray"}
              variant="solid"
              borderRadius="full"
            />
          )}
          <IconButton
            icon={<ChatIcon />}
            aria-label="Toggle Footer Panel"
            onClick={toggleFooter}
            size="md"
            colorScheme={isFooterOpen ? "blue" : "gray"}
            variant="solid"
            borderRadius="full"
          />
        </Flex>
      </Box>

      {/* Collapsible Footer Panel */}
      <Box position="fixed" bottom={0} left={0} right={0} zIndex={20}>
        {/* Toggle Button */}
        <Flex justify="center" mb={0}>
          <IconButton
            icon={isFooterOpen ? <ChatIcon /> : <ChatIcon />}
            aria-label="Toggle Footer Panel"
            onClick={toggleFooter}
            size="md"
            colorScheme="gray"
            variant="solid"
            borderRadius="full"
            mb={-4}
            zIndex={21}
            display={{ base: 'none', md: 'flex' }}
          />
        </Flex>

        {/* Footer Content */}
        <Collapse in={isFooterOpen} animateOpacity>
          <Box
            w="full"
            bg="gray.800"
            p={6}
            borderTop="1px solid"
            borderColor="gray.700"
            minH="300px"
            bottom={{ base: '60px', md: '0' }}
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
