import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Flex,
  HStack,
  Checkbox,
  Collapse,
  useColorMode,
} from '@chakra-ui/react';

const RightSidebar = ({
  currentView = 'tasks',
  colorMode,
  // Task-specific props
  dayTasks = {},
  expandedDays = {},
  getCurrentDay = () => '',
  handleDayClick = () => {},
  handleWeeklyTaskClick = () => {},
  toggleTaskCompleted = () => {},
  renderFileAttachmentIndicator = () => null,
}) => {
  const renderTasksWeekDays = () => {
    // Check if there are any tasks in any day
    const hasTasks = Object.values(dayTasks).some(tasks => tasks && tasks.length > 0);

    if (!hasTasks) {
      return (
        <Box p={4}>
          <Text fontSize="sm" color="gray.500" fontStyle="italic">
            No tasks to display
          </Text>
        </Box>
      );
    }

    return (
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
                {dayTasks[day].length > 0 ? (
                  dayTasks[day].map((task, index) => (
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
                  ))
                ) : (
                  <Box p={2} w="full">
                    <Text fontSize="sm" color="gray.500" fontStyle="italic">
                      No Tasks This Day
                    </Text>
                  </Box>
                )}
              </VStack>
            </Collapse>
          </Box>
        ))}
      </VStack>
    );
  };

  const renderContextualContent = () => {
    switch (currentView) {
      case 'tasks':
        return (
          <Box w="full">
            <Heading size="md" mb={2} color={colorMode === 'light' ? 'gray.800' : 'white'}>
              Week Days
            </Heading>
            {renderTasksWeekDays()}
          </Box>
        );
      case 'projects':
        return (
          <Box w="full">
            <Heading size="md" mb={2} color={colorMode === 'light' ? 'gray.800' : 'white'}>
              Project Stats
            </Heading>
            <Text fontSize="sm" color="gray.500">
              Project-specific information will appear here
            </Text>
          </Box>
        );
      case 'clients':
        return (
          <Box w="full">
            <Heading size="md" mb={2} color={colorMode === 'light' ? 'gray.800' : 'white'}>
              Client Info
            </Heading>
            <Text fontSize="sm" color="gray.500">
              Client-specific information will appear here
            </Text>
          </Box>
        );
      case 'invoices':
        return (
          <Box w="full">
            <Heading size="md" mb={2} color={colorMode === 'light' ? 'gray.800' : 'white'}>
              Invoice Summary
            </Heading>
            <Text fontSize="sm" color="gray.500">
              Invoice statistics will appear here
            </Text>
          </Box>
        );
      default:
        return (
          <Box w="full">
            <Text fontSize="sm" color="gray.500">
              Select a tool to see contextual information
            </Text>
          </Box>
        );
    }
  };

  return (
    <Box
      w="300px"
      bg={colorMode === 'dark' ? 'gray.800' : 'white'}
      borderLeft="1px"
      borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
      overflowY="auto"
      p={4}
    >
      {renderContextualContent()}
    </Box>
  );
};

export default RightSidebar;
