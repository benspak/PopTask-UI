import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  IconButton,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  SimpleGrid,
  Badge,
  HStack,
  Tooltip,
  Collapse,
  Button,
} from '@chakra-ui/react';
import {
  CloseIcon,
  HamburgerIcon,
  StarIcon,
  LinkIcon,
  SettingsIcon,
} from '@chakra-ui/icons';
import apiService from '../services/api';

const ProjectsPanel = ({
  isCenterOpen,
  colorMode,
  projectsLoading,
  projectsError,
  projects,
  handleProjectFilter,
  handleAddProject,
  handleProjectClick,
  handleShareProject,
  handleProjectDetailOpen,
  handleProjectDelete,
  toggleCenter,
  refreshLimitsTrigger = 0,
}) => {
  const [projectLimits, setProjectLimits] = useState(null);
  const [isProjectLimitAlertDismissed, setIsProjectLimitAlertDismissed] = useState(false);

  // Fetch project limits to show specific alert
  useEffect(() => {
    const fetchProjectLimits = async () => {
      try {
        const response = await apiService.getProjectLimits();
        if (response.success) {
          setProjectLimits(response.data);
        }
      } catch (err) {
        // Silently handle errors - don't show anything if we can't fetch limits
        console.log('Could not fetch project limits for alert');
      }
    };

    fetchProjectLimits();
  }, [refreshLimitsTrigger]);

  // Reset dismissed state when limits change (e.g., when user creates/deletes projects)
  useEffect(() => {
    if (projectLimits && projectLimits.remaining !== 1) {
      setIsProjectLimitAlertDismissed(false);
    }
  }, [projectLimits]);

  return (
  <>
    {/* Projects Section - Mobile pop-over */}
    {isCenterOpen && (
      <Box
        position={{ base: 'fixed', md: 'relative' }}
        top={{ base: '60px', md: 'auto' }}
        left={{ base: 0, md: 'auto' }}
        right={{ base: 0, md: 'auto' }}
        bottom={{ base: 0, md: 'auto' }}
        zIndex={{ base: 70, md: 'auto' }}
        bg={colorMode === 'light' ? 'white' : 'gray.800'}
        p={4}
        overflowY={{ base: 'auto', md: 'visible' }}
        boxShadow={{ base: 'lg', md: 'none' }}
        display={{ base: 'block', md: 'none' }}
      >
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md" color={colorMode === 'light' ? 'gray.800' : 'white'}>Projects</Heading>
          <IconButton
            icon={<CloseIcon />}
            aria-label="Close projects"
            size="sm"
            variant="ghost"
            onClick={toggleCenter}
            color={colorMode === 'light' ? 'gray.600' : 'gray.400'}
            _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
          />
        </Flex>

        {/* Project Limit Alert - Show when user has only 1 project remaining */}
        {projectLimits && !projectLimits.unlimited && projectLimits.remaining === 1 && !isProjectLimitAlertDismissed && (
          <Box mb={4}>
            <Alert status="info" size="sm" borderRadius="md" mb={3}>
              <AlertIcon />
              <AlertDescription fontSize="xs" flex="1">
                Only 1 project remaining. Upgrade to Pro for unlimited projects.
                <Button
                  size="xs"
                  colorScheme="blue"
                  ml={2}
                  onClick={() => window.open('/#pricing', '_blank')}
                >
                  Upgrade
                </Button>
              </AlertDescription>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => setIsProjectLimitAlertDismissed(true)}
                color="gray.500"
                _hover={{ color: "gray.700" }}
              >
                ✕
              </Button>
            </Alert>
          </Box>
        )}

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
                onClick={() => handleProjectFilter(project.name)}
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
                <HStack position="absolute" top={2} right={2} spacing={1}>
                  <Tooltip label="Project Details">
                    <IconButton
                      icon={<SettingsIcon />}
                      aria-label="Project Details"
                      size="xs"
                      colorScheme="blue"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (handleProjectDetailOpen) {
                          handleProjectDetailOpen(project);
                        }
                      }}
                    />
                  </Tooltip>
                </HStack>

                <IconButton
                  icon={<StarIcon />}
                  aria-label="Filter by project"
                  size="xs"
                  position="absolute"
                  top={2}
                  right={8}
                  colorScheme="blue"
                  variant="ghost"
                  display={{ base: 'none', md: 'inline-flex' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProjectClick(project);
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
    )}

    {/* Projects Section - Desktop view (above tasks) */}
    <Collapse in={isCenterOpen} animateOpacity>
      <Box mb={2} display={{ base: 'none', md: 'block' }} p={8}>
        <Text fontSize="sm" mb={3} color="gray.400" fontWeight="medium">Projects</Text>

        {/* Project Limit Alert - Show when user has only 1 project remaining */}
        {projectLimits && !projectLimits.unlimited && projectLimits.remaining === 1 && !isProjectLimitAlertDismissed && (
          <Box mb={3}>
            <Alert status="info" size="sm" borderRadius="md" mb={3}>
              <AlertIcon />
              <AlertDescription fontSize="xs" flex="1">
                Only 1 project remaining. Upgrade to Pro for unlimited projects.
                <Button
                  size="xs"
                  colorScheme="blue"
                  ml={2}
                  onClick={() => window.open('/#pricing', '_blank')}
                >
                  Upgrade
                </Button>
              </AlertDescription>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => setIsProjectLimitAlertDismissed(true)}
                color="gray.500"
                _hover={{ color: "gray.700" }}
              >
                ✕
              </Button>
            </Alert>
          </Box>
        )}

        {/* Error Alert - Display above project list */}
        {projectsError && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            <Box>
              <AlertTitle>Projects Error!</AlertTitle>
              <AlertDescription>
                {projectsError}
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {projectsLoading ? (
          <Flex justify="center" align="center" p={4}>
            <Spinner size="sm" color="blue.500" />
          </Flex>
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
                <HStack position="absolute" top={2} right={2} spacing={1}>
                  <Tooltip label="Project Details">
                    <IconButton
                      icon={<SettingsIcon />}
                      aria-label="Project Details"
                      size="xs"
                      colorScheme="blue"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (handleProjectDetailOpen) {
                          handleProjectDetailOpen(project);
                        }
                      }}
                    />
                  </Tooltip>
                </HStack>
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
  </>
  );
};

export default ProjectsPanel;
