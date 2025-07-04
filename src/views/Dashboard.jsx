import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Flex,
  useColorMode,
  useToast,
  Alert,
  AlertIcon,
  AlertDescription,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  VStack,
  HStack,
  Text,
  Select,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

// Import all components
import TopBar from '../components/TopBar';
import SidebarCalendar from '../components/SidebarCalendar';
import ProjectList from '../components/ProjectList';
import TaskList from '../components/TaskList';
import TaskDetailPanel from '../components/TaskDetailPanel';
import ProjectDetailPanel from '../components/ProjectDetailPanel';
import BottomNav from '../components/BottomNav';
import SearchAndFilters from '../components/SearchAndFilters';
import ShareDialog from '../components/ShareDialog';
import FooterPromptPanel from '../components/FooterPromptPanel';
import MobileBackdropOverlay from '../components/MobileBackdropOverlay';

// Import hooks and services
import { useProjects } from '../hooks/useProjects';
import { useTasks } from '../hooks/useTasks';
import apiService from '../services/api';

const Dashboard = () => {

  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // State management
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCenterOpen, setIsCenterOpen] = useState(true);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isProjectDetailOpen, setIsProjectDetailOpen] = useState(false);
  const [isProjectDetailModalOpen, setIsProjectDetailModalOpen] = useState(false);
  const [isFooterOpen, setIsFooterOpen] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [currentView, setCurrentView] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [expandedDays, setExpandedDays] = useState({});
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareItem, setShareItem] = useState(null);
  const [shareType, setShareType] = useState('task');

  // Hooks
  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
    createProject,
    updateProject,
    deleteProject,
  } = useProjects();

  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
    createTask,
    updateTask,
    deleteTask,
  } = useTasks(selectedProject?._id);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Generate day tasks for sidebar calendar
  const dayTasks = useCallback(() => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayTasksMap = {};

    days.forEach(day => {
      dayTasksMap[day] = tasks.filter(task => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        const dayOfWeek = taskDate.getDay();
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return dayNames[dayOfWeek] === day;
      });
    });

    return dayTasksMap;
  }, [tasks]);

  // Helper functions
  const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  const handleDayClick = (day) => {
    setExpandedDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  const handleWeeklyTaskClick = (task) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  };

  const toggleTaskCompleted = async (taskTitle, context) => {
    const task = tasks.find(t => t.title === taskTitle);
    if (task) {
      await updateTask(task._id, { completed: !task.completed });
    }
  };

  const renderFileAttachmentIndicator = (attachments) => {
    if (!attachments || attachments.length === 0) return null;
    return (
      <Box
        w="8px"
        h="8px"
        bg="blue.400"
        borderRadius="full"
        title={`${attachments.length} attachment(s)`}
      />
    );
  };

  // Toggle functions
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleCenter = () => setIsCenterOpen(!isCenterOpen);
  const toggleDetail = () => setIsDetailOpen(!isDetailOpen);
  const toggleFooter = () => setIsFooterOpen(!isFooterOpen);

  const handleAddTask = () => {
    setIsAddMode(!isAddMode);
    if (!isAddMode) {
      onOpen();
    }
  };

  const resetToAllTasks = () => {
    setCurrentView('all');
    setSearchTerm('');
    setSelectedProject(null);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  // Project handlers
  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setSelectedTask(null);
    setIsDetailOpen(false);
    setIsProjectDetailModalOpen(true);
  };

  const handleProjectCreate = async (projectData) => {
    try {
      await createProject(projectData);
      toast({
        title: 'Success',
        description: 'Project created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create project',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleProjectUpdate = async (projectId, projectData) => {
    try {
      await updateProject(projectId, projectData);
      toast({
        title: 'Success',
        description: 'Project updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update project',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleProjectDelete = async (projectId) => {
    try {
      await deleteProject(projectId);
      if (selectedProject?._id === projectId) {
        setSelectedProject(null);
        setSelectedTask(null);
        setIsDetailOpen(false);
        setIsProjectDetailOpen(false);
        setIsProjectDetailModalOpen(false);
      }
      toast({
        title: 'Success',
        description: 'Project deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Task handlers
  const handleTaskSelect = useCallback((task) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
    setIsProjectDetailOpen(false);
  }, [selectedTask, isDetailOpen]);

  const handleTaskUpdate = async (taskId, taskData) => {
    try {
      await updateTask(taskId, taskData);
      toast({
        title: 'Success',
        description: 'Task updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
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

  const handleTaskDelete = async (taskId) => {
    try {
      await deleteTask(taskId);
      if (selectedTask?._id === taskId) {
        setSelectedTask(null);
        setIsDetailOpen(false);
      }
      toast({
        title: 'Success',
        description: 'Task deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete task',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      await createTask(taskData);
      onClose();
      toast({
        title: 'Success',
        description: 'Task created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
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

  // Share handlers
  const handleShare = (item, type) => {
    setShareItem(item);
    setShareType(type);
    setShareDialogOpen(true);
  };

  const handleShareCreated = (shareData) => {
    // Update the item with share data
    if (shareType === 'task' && selectedTask) {
      setSelectedTask({ ...selectedTask, ...shareData });
    } else if (shareType === 'project' && selectedProject) {
      setSelectedProject({ ...selectedProject, ...shareData });
    }
  };

  // Loading state
  if (projectsLoading || tasksLoading) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading your workspace...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box h="100vh" bg={colorMode === 'light' ? 'gray.50' : 'gray.900'}>
      {/* Offline Alert */}
      {!isOnline && (
        <Alert status="warning" borderRadius={0}>
          <AlertIcon />
          <AlertDescription>
            You're currently offline. Some features may be limited.
          </AlertDescription>
        </Alert>
      )}

      {/* Top Bar */}
      <TopBar
        colorMode={colorMode}
        toggleColorMode={toggleColorMode}
        isOnline={isOnline}
        currentView={currentView}
        searchTerm={searchTerm}
        handleSearch={handleSearch}
        resetToAllTasks={resetToAllTasks}
        isSidebarOpen={isSidebarOpen}
        isCenterOpen={isCenterOpen}
      />

      {/* Main Content */}
      <Flex h="calc(100vh - 60px - 80px)" overflow="hidden">
        {/* Sidebar Calendar */}
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

        {/* Center Content */}
        <Flex flex={1} direction="column" overflow="hidden">
          {/* Search and Filters */}
          <SearchAndFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            onCreateTask={handleCreateTask}
            selectedProject={selectedProject}
          />

          {/* Projects Panel */}
          {isCenterOpen && (
            <Box
              w={{ base: '100%', md: '300px' }}
              bg={colorMode === 'light' ? 'white' : 'gray.800'}
              borderRight="1px solid"
              borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
              overflowY="auto"
            >
              <ProjectList
                projects={projects}
                loading={projectsLoading}
                error={projectsError}
                selectedProject={selectedProject}
                onProjectSelect={handleProjectSelect}
                onProjectCreate={handleProjectCreate}
                onProjectUpdate={handleProjectUpdate}
                onProjectDelete={handleProjectDelete}
                onProjectDetailOpen={(project) => {
                  setSelectedProject(project);
                  setIsProjectDetailModalOpen(true);
                }}
              />
            </Box>
          )}

          {/* Task List */}
          <Box flex={1} overflowY="auto">
            <TaskList
              tasks={tasks}
              loading={tasksLoading}
              error={tasksError}
              selectedTask={selectedTask}
              onTaskSelect={handleTaskSelect}
              onTaskUpdate={handleTaskUpdate}
              onTaskDelete={handleTaskDelete}
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              sortBy={sortBy}
              sortOrder={sortOrder}
              selectedProject={selectedProject}
            />
          </Box>
        </Flex>

        {/* Task Detail Panel */}
        {isDetailOpen && selectedTask && (
            <Box
              w={{ base: '100%', md: '400px' }}
              bg={colorMode === 'light' ? 'white' : 'gray.800'}
              borderLeft="1px solid"
              borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
              overflowY="auto"
            >
              <TaskDetailPanel
                task={selectedTask}
                projects={projects}
                onTaskUpdate={handleTaskUpdate}
                onTaskDelete={handleTaskDelete}
                onClose={() => setIsDetailOpen(false)}
              />
            </Box>
          )}


      </Flex>

      {/* Bottom Navigation */}
      <BottomNav
        isSidebarOpen={isSidebarOpen}
        isCenterOpen={isCenterOpen}
        isAddMode={isAddMode}
        isDetailOpen={isDetailOpen}
        isFooterOpen={isFooterOpen}
        selectedTask={selectedTask}
        toggleSidebar={toggleSidebar}
        toggleCenter={toggleCenter}
        handleAddTask={handleAddTask}
        toggleDetail={toggleDetail}
        toggleFooter={toggleFooter}
      />

      {/* Footer Prompt Panel */}
      {isFooterOpen && (
        <FooterPromptPanel
          isOpen={isFooterOpen}
          onClose={() => setIsFooterOpen(false)}
          colorMode={colorMode}
        />
      )}

      {/* Mobile Backdrop Overlay */}
      <MobileBackdropOverlay
        isOpen={isSidebarOpen}
        onClose={toggleSidebar}
      />

      {/* Create Task Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Task</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input
                  placeholder="Enter task title"
                  id="taskTitle"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  placeholder="Enter task description"
                  rows={3}
                  id="taskDescription"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Due Date</FormLabel>
                <Input
                  type="date"
                  id="taskDueDate"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Project</FormLabel>
                <Select placeholder="Select a project" id="taskProject">
                  {projects.map(project => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <HStack spacing={4} w="full" justify="flex-end">
                <Button onClick={onClose}>Cancel</Button>
                <Button
                  colorScheme="blue"
                  leftIcon={<AddIcon />}
                  onClick={() => {
                    const title = document.getElementById('taskTitle').value;
                    const description = document.getElementById('taskDescription').value;
                    const dueDate = document.getElementById('taskDueDate').value;
                    const projectId = document.getElementById('taskProject').value;

                    if (title.trim()) {
                      handleCreateTask({
                        title,
                        description,
                        dueDate,
                        projectId: projectId || selectedProject?._id,
                      });
                    }
                  }}
                >
                  Create Task
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Share Dialog */}
      <ShareDialog
        isOpen={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        type={shareType}
        item={shareItem}
        onShareCreated={handleShareCreated}
      />

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetailPanel
          project={selectedProject}
          tasks={tasks}
          onProjectUpdate={handleProjectUpdate}
          onProjectDelete={handleProjectDelete}
          onClose={() => setIsProjectDetailModalOpen(false)}
          onShareProject={(project) => handleShare(project, 'project')}
          isOpen={isProjectDetailModalOpen}
        />
      )}
    </Box>
  );
};

export default Dashboard;
