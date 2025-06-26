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
  Select
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';

export default function TaskDashboard() {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { isOpen: isSidebarOpen, onToggle: toggleSidebar } = useDisclosure({ defaultIsOpen: true });
  const { isOpen: isDetailOpen, onToggle: toggleDetail } = useDisclosure({ defaultIsOpen: true });
  const { isOpen: isFooterOpen, onToggle: toggleFooter } = useDisclosure({ defaultIsOpen: false });

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
      dueDate: '2024-01-15',
      project: 'marketing',
      tags: ['analytics', 'reporting']
    },
    'Prepare presentation slides': {
      description: 'Create compelling presentation materials for the quarterly business review. Include data visualizations, key achievements, and strategic recommendations for stakeholders.',
      expanded: false,
      dueDate: '2024-01-18',
      project: 'marketing',
      tags: ['presentation', 'Q4']
    },
    'Update campaign strategy': {
      description: 'Revise digital marketing campaign approach based on recent performance data. Optimize targeting parameters, adjust budget allocation, and refine messaging for better engagement.',
      expanded: false,
      dueDate: '2024-01-20',
      project: 'marketing',
      tags: ['campaign', 'strategy']
    },
    'Conduct user interviews': {
      description: 'Schedule and conduct user research interviews to gather feedback on product features. Document insights, pain points, and improvement suggestions for the development team.',
      expanded: false,
      dueDate: '2024-01-22',
      project: 'techdev',
      tags: ['research', 'user-feedback']
    },
    'Organize team meeting': {
      description: 'Coordinate weekly team sync meeting, prepare agenda items, and ensure all team members have necessary materials. Focus on project updates and collaborative problem-solving.',
      expanded: false,
      dueDate: '2024-01-16',
      project: 'techdev',
      tags: ['meeting', 'coordination']
    }
  });

  // Tasks for each day
  const dayTasks = {
    Monday: [
      {
        title: 'Review weekly analytics',
        description: 'Analyze weekly performance metrics and identify key trends for the marketing team. Focus on conversion rates and user engagement.',
        dueDate: '2024-01-15',
        project: 'marketing',
        tags: ['analytics', 'weekly']
      },
      {
        title: 'Team standup meeting',
        description: 'Daily team synchronization meeting to discuss progress, blockers, and upcoming priorities for the week.',
        dueDate: '2024-01-15',
        project: 'techdev',
        tags: ['meeting', 'standup']
      },
      {
        title: 'Update project timeline',
        description: 'Review and update project milestones, adjust deadlines based on current progress and team capacity.',
        dueDate: '2024-01-15',
        project: 'techdev',
        tags: ['timeline', 'planning']
      }
    ],
    Tuesday: [
      {
        title: 'Client presentation prep',
        description: 'Prepare materials and rehearse presentation for upcoming client meeting. Include case studies and ROI data.',
        dueDate: '2024-01-16',
        project: 'sales',
        tags: ['presentation', 'client']
      },
      {
        title: 'Code review session',
        description: 'Conduct thorough code review for recent feature implementations. Focus on best practices and performance optimization.',
        dueDate: '2024-01-16',
        project: 'techdev',
        tags: ['code-review', 'development']
      },
      {
        title: 'Budget planning',
        description: 'Review quarterly budget allocations and plan resource distribution for upcoming projects and initiatives.',
        dueDate: '2024-01-16',
        project: 'marketing',
        tags: ['budget', 'planning']
      }
    ],
    Wednesday: [
      {
        title: 'Marketing campaign launch',
        description: 'Execute new digital marketing campaign across multiple channels. Monitor initial performance and adjust targeting.',
        dueDate: '2024-01-17',
        project: 'marketing',
        tags: ['campaign', 'launch']
      },
      {
        title: 'User feedback analysis',
        description: 'Analyze recent user feedback and survey responses. Identify common pain points and improvement opportunities.',
        dueDate: '2024-01-17',
        project: 'techdev',
        tags: ['feedback', 'analysis']
      },
      {
        title: 'Database maintenance',
        description: 'Perform routine database maintenance tasks including optimization, backup verification, and security updates.',
        dueDate: '2024-01-17',
        project: 'techdev',
        tags: ['database', 'maintenance']
      }
    ],
    Thursday: [
      {
        title: 'Product demo preparation',
        description: 'Prepare comprehensive product demonstration for potential investors. Highlight key features and market advantages.',
        dueDate: '2024-01-18',
        project: 'sales',
        tags: ['demo', 'product']
      },
      {
        title: 'Content creation',
        description: 'Create engaging content for social media and blog posts. Focus on thought leadership and brand awareness.',
        dueDate: '2024-01-18',
        project: 'marketing',
        tags: ['content', 'social-media']
      },
      {
        title: 'Performance review',
        description: 'Conduct quarterly performance reviews with team members. Provide feedback and set goals for next quarter.',
        dueDate: '2024-01-18',
        project: 'techdev',
        tags: ['review', 'performance']
      }
    ],
    Friday: [
      {
        title: 'Week wrap-up meeting',
        description: 'Weekly team meeting to review accomplishments, discuss challenges, and plan priorities for the following week.',
        dueDate: '2024-01-19',
        project: 'techdev',
        tags: ['meeting', 'wrap-up']
      },
      {
        title: 'Documentation update',
        description: 'Update technical documentation and user guides based on recent feature releases and user feedback.',
        dueDate: '2024-01-19',
        project: 'techdev',
        tags: ['documentation', 'update']
      },
      {
        title: 'Next week planning',
        description: 'Plan and prioritize tasks for the upcoming week. Allocate resources and set realistic deadlines.',
        dueDate: '2024-01-19',
        project: 'marketing',
        tags: ['planning', 'priorities']
      }
    ],
    Saturday: [
      {
        title: 'Personal project work',
        description: 'Dedicated time for personal development projects and skill building. Focus on learning new technologies.',
        dueDate: '2024-01-20',
        project: 'techdev',
        tags: ['personal', 'development']
      },
      {
        title: 'Skill development',
        description: 'Online course completion and skill enhancement activities. Focus on areas identified for improvement.',
        dueDate: '2024-01-20',
        project: 'techdev',
        tags: ['learning', 'skills']
      },
      {
        title: 'Creative brainstorming',
        description: 'Free-form creative session to generate new ideas for projects and explore innovative solutions.',
        dueDate: '2024-01-20',
        project: 'design',
        tags: ['creative', 'brainstorming']
      }
    ],
    Sunday: [
      {
        title: 'Week preparation',
        description: 'Prepare for the upcoming week by organizing tasks, setting priorities, and reviewing calendar commitments.',
        dueDate: '2024-01-21',
        project: 'personal',
        tags: ['preparation', 'planning']
      },
      {
        title: 'Rest and recharge',
        description: 'Dedicated time for rest and personal activities. Important for maintaining work-life balance and productivity.',
        dueDate: '2024-01-21',
        project: 'personal',
        tags: ['rest', 'balance']
      },
      {
        title: 'Goal setting',
        description: 'Review personal and professional goals, assess progress, and set new objectives for the upcoming period.',
        dueDate: '2024-01-21',
        project: 'personal',
        tags: ['goals', 'planning']
      }
    ]
  };

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
  };

  return (
    <Box position="relative" minH="100vh">
      <Flex direction={{ base: 'column', md: 'row' }} minH="100vh" bg="gray.900" color="white">
        {/* Sidebar */}
        {isSidebarOpen && (
          <Box w={{ base: '100%', md: '250px' }} bg="gray.800" p={4} position="relative">
            <IconButton
              icon={<ChevronLeftIcon />}
              aria-label="Collapse Sidebar"
              onClick={toggleSidebar}
              position="absolute"
              top="10px"
              right="-12px"
              size="sm"
              zIndex={1}
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
                        onClick={() => toggleDay(day)}
                        _hover={{ bg: 'gray.600' }}
                      >
                        <Text>{day}</Text>
                        {expandedDays[day] ? <ChevronUpIcon /> : <ChevronDownIcon />}
                      </Flex>
                      <Collapse in={expandedDays[day]} animateOpacity>
                        <VStack align="start" spacing={1} mt={1} ml={4} w="full">
                          {dayTasks[day].map((task, index) => (
                            <Text
                              key={index}
                              fontSize="sm"
                              color="gray.300"
                              cursor="pointer"
                              p={1}
                              w="full"
                              _hover={{ color: 'white' }}
                              onClick={() => handleWeeklyTaskClick(task)}
                            >
                              • {task.title}
                            </Text>
                          ))}
                        </VStack>
                      </Collapse>
                    </Box>
                  ))}
                </VStack>
              </Box>

              <Box>
                <Text fontSize="sm" mb={1} color="gray.400">Projects</Text>
                <VStack align="start" spacing={1}>
                  <Text cursor="pointer">Marketing</Text>
                  <Text cursor="pointer">TechDev</Text>
                </VStack>
              </Box>

            </VStack>
          </Box>
        )}
        {!isSidebarOpen && (
          <IconButton
            icon={<ChevronRightIcon />}
            aria-label="Expand Sidebar"
            onClick={toggleSidebar}
            position="absolute"
            top="10px"
            left="10px"
            size="sm"
            zIndex={10}
          />
        )}

        {/* Main Content */}
        <Box flex={1} p={6} bg="gray.850">
          {/* Navbar */}
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

          <Heading size="lg" mb={4}>Tasks for Today</Heading>
          <VStack align="stretch" spacing={3}>
            {Object.keys(taskData).map((task, idx) => (
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
                    <Text color={selectedTask === task ? 'green.300' : 'white'} fontWeight={selectedTask === task ? 'bold' : 'normal'}>
                      {task}
                    </Text>
                    {taskData[task].expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                  </Flex>

                  {/* Task metadata */}
                  <VStack align="start" spacing={1}>
                    <HStack spacing={4} fontSize="xs" color="gray.400">
                      <Text>Due: {taskData[task].dueDate}</Text>
                      <Text>Project: {taskData[task].project}</Text>
                    </HStack>
                    <HStack spacing={1}>
                      {taskData[task].tags.map((tag, tagIndex) => (
                        <Tag key={tagIndex} size="sm" colorScheme="blue" variant="subtle">
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
            ))}
          </VStack>
        </Box>

        {/* Detail Panel */}
        {isDetailOpen && (
          <Box w={{ base: '100%', md: '350px' }} bg="gray.800" p={6} position="relative">
            <IconButton
              icon={<ChevronRightIcon />}
              aria-label="Collapse Detail Panel"
              onClick={toggleDetail}
              position="absolute"
              top="10px"
              left="-12px"
              size="sm"
              zIndex={1}
            />
            <Heading size="md" mb={4}>Edit Current Task</Heading>
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
              <Button colorScheme="green" w="full">Save</Button>
            </Box>
          </Box>
        )}
        {!isDetailOpen && (
          <IconButton
            icon={<ChevronLeftIcon />}
            aria-label="Expand Detail Panel"
            onClick={toggleDetail}
            position="absolute"
            top="10px"
            right="10px"
            size="sm"
            zIndex={10}
          />
        )}
      </Flex>

      {/* Collapsible Footer Panel */}
      <Box position="fixed" bottom={0} left={0} right={0} zIndex={20}>
        {/* Toggle Button */}
        <Flex justify="center" mb={0}>
          <IconButton
            icon={isFooterOpen ? <ChevronDownIcon /> : <ChevronUpIcon />}
            aria-label="Toggle Footer Panel"
            onClick={toggleFooter}
            size="md"
            colorScheme="gray"
            variant="solid"
            borderRadius="full"
            mb={-4}
            zIndex={21}
          />
        </Flex>

        {/* Footer Content */}
        <Collapse in={isFooterOpen} animateOpacity>
          <Box w="full" bg="gray.800" p={6} borderTop="1px solid" borderColor="gray.700" minH="300px">
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
