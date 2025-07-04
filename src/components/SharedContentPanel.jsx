import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  IconButton,
  Collapse,
  useColorModeValue,
  Tooltip,
  Spinner,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLinkIcon,
  ViewIcon,
  CheckIcon,
} from '@chakra-ui/icons';

const SharedContentPanel = ({
  sharedTasks = [],
  sharedProjects = [],
  sharedTasksLoading = false,
  sharedProjectsLoading = false,
  sharedTasksError = null,
  sharedProjectsError = null,
  onTaskClick,
  onProjectClick,
  isExpanded = false,
  onToggleExpanded,
}) => {
  // All hooks must be called at the top level
  const bgColor = useColorModeValue('blue.50', 'blue.900');
  const borderColor = useColorModeValue('blue.200', 'blue.700');
  const textColor = useColorModeValue('blue.800', 'blue.100');
  const hoverBgColor = useColorModeValue('blue.100', 'blue.800');
  const itemBgColor = useColorModeValue('white', 'gray.800');
  const itemBorderColor = useColorModeValue('gray.200', 'gray.600');
  const itemHoverBgColor = useColorModeValue('gray.50', 'gray.700');



  const hasSharedContent = sharedTasks.length > 0 || sharedProjects.length > 0;
  const isLoading = sharedTasksLoading || sharedProjectsLoading;
  const hasError = sharedTasksError || sharedProjectsError;

  // Always show the panel for debugging purposes
  // if (!hasSharedContent && !isLoading && !hasError) {
  //   return null;
  // }

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const dateOnly = dateString.split('T')[0];
    const [year, month, day] = dateOnly.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString();
  };

  const getOwnerName = (owner) => {
    if (owner.firstName && owner.lastName) {
      return `${owner.firstName} ${owner.lastName}`;
    } else if (owner.firstName) {
      return owner.firstName;
    } else if (owner.username) {
      return `@${owner.username}`;
    } else {
      return owner.email || 'Unknown';
    }
  };

  return (
    <Box
      border="1px"
      borderColor={borderColor}
      borderRadius="md"
      bg={bgColor}
      mb={4}
      overflow="hidden"
    >

      {/* Header */}
      <HStack
        p={3}
        justify="space-between"
        cursor="pointer"
        onClick={onToggleExpanded}
        _hover={{ bg: hoverBgColor }}
        transition="all 0.2s"
      >
        <HStack spacing={3}>
          <Text fontSize="sm" fontWeight="medium" color={textColor}>
            📤 Shared with You
          </Text>
          <Badge colorScheme="blue" size="sm">
            {sharedTasks.length + sharedProjects.length}
          </Badge>
        </HStack>
        <IconButton
          size="sm"
          variant="ghost"
          icon={isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
          aria-label="Toggle shared content"
        />
      </HStack>

      {/* Content */}
      <Collapse in={isExpanded} animateOpacity>
        <Box p={3} pt={0}>
          {isLoading && (
            <HStack justify="center" py={4}>
              <Spinner size="sm" />
              <Text fontSize="sm" color={textColor}>
                Loading shared content...
              </Text>
            </HStack>
          )}

          {hasError && (
            <Alert status="warning" size="sm" mb={3}>
              <AlertIcon />
              <AlertDescription fontSize="sm">
                {sharedTasksError || sharedProjectsError}
              </AlertDescription>
            </Alert>
          )}

          {!isLoading && !hasError && (
            <VStack spacing={3} align="stretch">
              {/* Debug: Show when no content */}
              {!hasSharedContent && (
                <Box p={3} textAlign="center">
                  <Text fontSize="sm" color="gray.500">
                    No shared content found. Tasks: {sharedTasks.length}, Projects: {sharedProjects.length}
                  </Text>
                </Box>
              )}

              {/* Shared Projects */}
              {sharedProjects.length > 0 && (
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color={textColor} mb={2}>
                    📁 Shared Projects ({sharedProjects.length})
                  </Text>
                  <VStack spacing={2} align="stretch">
                    {sharedProjects.map((project) => (
                      <Box
                        key={project._id}
                        p={2}
                        bg={itemBgColor}
                        borderRadius="sm"
                        border="1px"
                        borderColor={itemBorderColor}
                        cursor="pointer"
                        _hover={{ bg: itemHoverBgColor }}
                        onClick={() => onProjectClick(project)}
                      >
                        <HStack justify="space-between" align="center">
                          <VStack align="start" spacing={1} flex={1}>
                            <HStack spacing={2}>
                              <ViewIcon color={project.color || 'blue.500'} />
                              <Text fontSize="sm" fontWeight="medium">
                                {project.name}
                              </Text>
                            </HStack>
                            <Text fontSize="xs" color="gray.500">
                              Shared by {getOwnerName(project.owner)}
                            </Text>
                            {project.description && (
                              <Text fontSize="xs" color="gray.600" noOfLines={1}>
                                {project.description}
                              </Text>
                            )}
                          </VStack>
                          <Tooltip label="View project">
                            <IconButton
                              size="xs"
                              variant="ghost"
                              icon={<ExternalLinkIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                onProjectClick(project);
                              }}
                            />
                          </Tooltip>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              )}

              {/* Shared Tasks */}
              {sharedTasks.length > 0 && (
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color={textColor} mb={2}>
                    ✅ Shared Tasks ({sharedTasks.length})
                  </Text>
                  <VStack spacing={2} align="stretch">
                    {sharedTasks.map((task) => (
                      <Box
                        key={task._id}
                        p={2}
                        bg={itemBgColor}
                        borderRadius="sm"
                        border="1px"
                        borderColor={itemBorderColor}
                        cursor="pointer"
                        _hover={{ bg: itemHoverBgColor }}
                        onClick={() => onTaskClick(task)}
                      >
                        <HStack justify="space-between" align="center">
                          <VStack align="start" spacing={1} flex={1}>
                            <HStack spacing={2}>
                              {task.completed ? (
                                <CheckIcon color="green.500" />
                              ) : (
                                <Box w={2} h={2} borderRadius="full" bg="blue.500" />
                              )}
                              <Text
                                fontSize="sm"
                                fontWeight="medium"
                                textDecoration={task.completed ? 'line-through' : 'none'}
                                color={task.completed ? 'gray.500' : 'inherit'}
                              >
                                {task.title}
                              </Text>
                            </HStack>
                            <HStack spacing={2} fontSize="xs" color="gray.500">
                              <Text>Shared by {getOwnerName(task.owner)}</Text>
                              {task.project && task.project !== 'general' && (
                                <Badge size="xs" colorScheme="blue" variant="subtle">
                                  {task.project}
                                </Badge>
                              )}
                              {task.dueDate && (
                                <Text>Due: {formatDate(task.dueDate)}</Text>
                              )}
                            </HStack>
                            {task.description && (
                              <Text fontSize="xs" color="gray.600" noOfLines={1}>
                                {task.description}
                              </Text>
                            )}
                          </VStack>
                          <Tooltip label="View task">
                            <IconButton
                              size="xs"
                              variant="ghost"
                              icon={<ExternalLinkIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                onTaskClick(task);
                              }}
                            />
                          </Tooltip>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              )}
            </VStack>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

export default SharedContentPanel;
