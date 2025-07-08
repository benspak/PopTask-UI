import React from 'react';
import {
  Box,
  VStack,
  Text,
  Collapse,
  Flex,
  Checkbox,
  HStack,
  Tag,
  Badge,
  IconButton,
  Tooltip,
  Spinner,
} from '@chakra-ui/react';
import { LinkIcon } from '@chakra-ui/icons';

const MainTaskList = ({
  filteredTasks,
  searchTerm,
  sortTasks,
  getFilteredTasksBySearch,
  currentView,
  taskData,
  expandedFilteredTasks,
  selectedTask,
  colorMode,
  toggleTaskCompleted,
  handleTaskClick,
  handleFilteredTaskClick,
  backendTasks,
  renderFileAttachmentIndicator,
  prepareTagsForDisplay,
  getDueDateCategory,
  dayTasks,
  handleShareTask,
}) => {
  // Utility function to format dates without timezone issues
  const formatDate = (dateString) => {
    if (!dateString) return '';
    // Split the date string and take only the date part (YYYY-MM-DD)
    const dateOnly = dateString.split('T')[0];
    const [year, month, day] = dateOnly.split('-');
    // Create date in local timezone by using the date components
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString();
  };

  return (
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
                sortTasks(
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
                          bg={colorMode === 'light' ? 'gray.100' : selectedTask === task.title ? 'gray.700' : 'gray.800'}
                          borderRadius="md"
                          cursor="pointer"
                          onClick={() => task.source === 'today' ? handleTaskClick(task.title) : handleFilteredTaskClick(task)}
                          _hover={{ bg: colorMode === 'light' ? 'gray.200' : 'gray.700' }}
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
                                color={selectedTask === task.title
                                  ? (colorMode === 'light' ? 'green.600' : 'green.300')
                                  : taskInfo.completed
                                    ? 'gray.500'
                                    : (colorMode === 'light' ? 'gray.800' : 'white')}
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
                              <Tooltip label="Share task">
                                <IconButton
                                  icon={<LinkIcon />}
                                  size="xs"
                                  variant="ghost"
                                  colorScheme="blue"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const backendTask = backendTasks.find(t => t.title === task.title);
                                    if (backendTask) {
                                      handleShareTask(backendTask);
                                    }
                                  }}
                                />
                              </Tooltip>
                            </HStack>
                          </Flex>

                          {/* Task metadata */}
                          <VStack align="start" spacing={1}>
                            <HStack spacing={4} fontSize="xs" color="gray.400">
                              <Text>Due: {formatDate(taskInfo.dueDate)}</Text>
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
                                  onClick={() => {}}
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
                  return sortTasks(getFilteredTasksBySearch(filteredTasks)).map((task, idx) => {
                    try {
                      return (
                        <Box key={idx}>
                          <Box
                            p={3}
                            bg={colorMode === 'light' ? 'gray.100' : selectedTask === task.title ? 'gray.700' : 'gray.800'}
                            borderRadius="md"
                            cursor="pointer"
                            onClick={() => task.source === 'today' ? handleTaskClick(task.title) : handleFilteredTaskClick(task)}
                            _hover={{ bg: colorMode === 'light' ? 'gray.200' : 'gray.700' }}
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
                                  color={selectedTask === task.title
                                    ? (colorMode === 'light' ? 'green.600' : 'green.300')
                                    : task.completed
                                      ? 'gray.500'
                                      : (colorMode === 'light' ? 'gray.800' : 'white')}
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
                                <Tooltip label="Share task">
                                  <IconButton
                                    icon={<LinkIcon />}
                                    size="xs"
                                    variant="ghost"
                                    colorScheme="blue"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const backendTask = backendTasks.find(t => t.title === task.title);
                                      if (backendTask) {
                                        handleShareTask(backendTask);
                                      }
                                    }}
                                  />
                                </Tooltip>
                              </HStack>
                            </Flex>

                            {/* Task metadata */}
                            <VStack align="start" spacing={1}>
                              <HStack spacing={4} fontSize="xs" color="gray.400">
                                <Text>Due: {formatDate(task.dueDate)}</Text>
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
                                    onClick={() => {}}
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
  );
};

export default MainTaskList;
