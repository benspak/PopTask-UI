import React, { useState } from 'react';
import {
  Box,
  HStack,
  VStack,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Select,
  Text,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  useDisclosure,
} from '@chakra-ui/react';
import { SearchIcon, AddIcon } from '@chakra-ui/icons';

const SearchAndFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  onCreateTask,
  selectedProject,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
  });

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;

    try {
      await onCreateTask({
        ...newTask,
        projectId: selectedProject?._id,
      });

      // Reset form
      setNewTask({
        title: '',
        description: '',
        dueDate: '',
      });
      onClose();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  return (
    <>
      <Box
        p={4}
        bg={bgColor}
        borderBottom="1px"
        borderColor={borderColor}
      >
        <VStack spacing={4} align="stretch">
          {/* Search and Create Task */}
          <HStack spacing={4}>
            <InputGroup flex={1}>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="md"
              />
            </InputGroup>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              onClick={onOpen}
              size="md"
            >
              New Task
            </Button>
          </HStack>

          {/* Filters */}
          <HStack spacing={4} wrap="wrap">
            <FormControl maxW="200px">
              <FormLabel fontSize="sm">Status</FormLabel>
              <Select
                size="sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </Select>
            </FormControl>

            <FormControl maxW="200px">
              <FormLabel fontSize="sm">Sort By</FormLabel>
              <Select
                size="sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="createdAt">Created Date</option>
                <option value="title">Title</option>
                <option value="dueDate">Due Date</option>
              </Select>
            </FormControl>

            <FormControl maxW="200px">
              <FormLabel fontSize="sm">Order</FormLabel>
              <Select
                size="sm"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </Select>
            </FormControl>
          </HStack>

          {/* Selected Project Info */}
          {selectedProject && (
            <Box p={3} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200">
              <Text fontSize="sm" fontWeight="medium" color="blue.800">
                Viewing tasks for project: <strong>{selectedProject.name}</strong>
              </Text>
            </Box>
          )}
        </VStack>
      </Box>

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
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter task title"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter task description"
                  rows={3}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Due Date</FormLabel>
                <Input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </FormControl>

              <HStack spacing={4} w="full" justify="flex-end">
                <Button onClick={onClose}>Cancel</Button>
                <Button colorScheme="blue" onClick={handleCreateTask}>
                  Create Task
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default SearchAndFilters;
