import React from 'react';
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
} from '@chakra-ui/react';
import {
  CloseIcon,
  HamburgerIcon,
  StarIcon,
  LinkIcon,
} from '@chakra-ui/icons';

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
  toggleCenter,
}) => (
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
                  <Tooltip label="Share project">
                    <IconButton
                      icon={<LinkIcon />}
                      aria-label="Share project"
                      size="xs"
                      colorScheme="green"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShareProject(project);
                      }}
                    />
                  </Tooltip>
                </HStack>
                <IconButton
                  icon={<HamburgerIcon />}
                  aria-label="Edit project"
                  size="xs"
                  position="absolute"
                  top={2}
                  right={2}
                  colorScheme="blue"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProjectClick(project);
                  }}
                />
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
    )}

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
                  <Tooltip label="Share project">
                    <IconButton
                      icon={<LinkIcon />}
                      aria-label="Share project"
                      size="xs"
                      colorScheme="green"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShareProject(project);
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

export default ProjectsPanel;
