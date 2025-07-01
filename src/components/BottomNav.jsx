import React from 'react';
import { Flex, IconButton, Tooltip } from '@chakra-ui/react';
import { CalendarIcon, StarIcon, AddIcon, CloseIcon, EditIcon, ChatIcon } from '@chakra-ui/icons';

export default function BottomNav({
  isSidebarOpen,
  isCenterOpen,
  isAddMode,
  isDetailOpen,
  isFooterOpen,
  selectedTask,
  toggleSidebar,
  toggleCenter,
  handleAddTask,
  toggleDetail,
  toggleFooter
}) {
  return (
    <Flex
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      zIndex={25}
      bg="gray.800"
      borderTop="1px solid"
      borderColor="gray.700"
      p={{ base: 3, md: 2 }}
      justify="center"
      align="center"
    >
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
        <Tooltip
          label={isAddMode ? "Close Add Task" : "Add New Task"}
          placement="top"
          hasArrow
        >
          <IconButton
            icon={isAddMode ? <CloseIcon /> : <AddIcon />}
            aria-label={isAddMode ? "Close Add Task" : "Add New Task"}
            onClick={handleAddTask}
            size={{ base: "md", md: "sm" }}
            colorScheme={isAddMode ? "red" : "green"}
            variant="solid"
            borderRadius="full"
            _hover={{ bg: isAddMode ? 'red.600' : 'green.600' }}
          />
        </Tooltip>
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
  );
}
