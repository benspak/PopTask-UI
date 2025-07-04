import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  IconButton,
  VStack,
  HStack,
  Collapse,
  Checkbox,
  Image,
  Badge,
  Tooltip,
} from '@chakra-ui/react';
import { CloseIcon, WarningIcon, HamburgerIcon, StarIcon, LinkIcon } from '@chakra-ui/icons';

// SidebarCalendar receives all props needed for sidebar rendering
const SidebarCalendar = ({
  isSidebarOpen,
  isCenterOpen,
  colorMode,
  dayTasks,
  expandedDays,
  getCurrentDay,
  toggleSidebar,
  handleDayClick,
  handleWeeklyTaskClick,
  toggleTaskCompleted,
  renderFileAttachmentIndicator,
}) => {
  return (
    isSidebarOpen && (
      <Box
        w={{ base: '100%', md: isCenterOpen ? '250px' : '400px' }}
        bg={colorMode === 'light' ? 'white' : 'gray.800'}
        p={4}
        position={{ base: 'fixed', md: 'relative' }}
        top={{ base: '60px', md: 'auto' }}
        left={{ base: 0, md: 'auto' }}
        right={{ base: 0, md: 'auto' }}
        bottom={{ base: 0, md: 'auto' }}
        zIndex={{ base: 60, md: 'auto' }}
        overflowY={{ base: 'auto', md: 'visible' }}
        boxShadow={{ base: 'lg', md: 'none' }}
      >
        {/* Mobile: Show close button and heading */}
        <Flex justify="space-between" align="center" mb={4} display={{ base: 'flex', md: 'none' }}>
          <Heading size="md" color={colorMode === 'light' ? 'gray.800' : 'white'}>Calendar</Heading>
          <IconButton
            icon={<CloseIcon />}
            aria-label="Close calendar"
            size="sm"
            variant="ghost"
            onClick={toggleSidebar}
            color={colorMode === 'light' ? 'gray.600' : 'gray.400'}
            _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
          />
        </Flex>
        {/* Desktop: Show heading only */}
        <VStack align="start" spacing={4}>
          <Box w="full">
            <Text fontSize="sm" mb={1} color="gray.400">Days</Text>
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
    )
  );
};

export default SidebarCalendar;
