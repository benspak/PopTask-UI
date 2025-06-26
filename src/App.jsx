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
  Divider,
  SimpleGrid,
  Tag,
  Image
} from '@chakra-ui/react';

export default function TaskDashboard() {
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Flex direction={{ base: 'column', md: 'row' }} minH="100vh" bg="gray.900" color="white">
      {/* Sidebar */}
      <Box w={{ base: '100%', md: '250px' }} bg="gray.800" p={4}>
        <Heading size="md" mb={4}>Dashboard</Heading>
        <VStack align="start" spacing={4}>
          <Box>
            <Text fontSize="sm" mb={1} color="gray.400">Projects</Text>
            <VStack align="start" spacing={1}>
              <Text cursor="pointer">Marketing</Text>
              <Text cursor="pointer">TechDev</Text>
            </VStack>
          </Box>

          <Box>
            <Text fontSize="sm" mb={1} color="gray.400">Tags</Text>
            <VStack align="start" spacing={1}>
              <Text>#marketing</Text>
              <Text>#design</Text>
            </VStack>
          </Box>

          <Box>
            <Text fontSize="sm" mb={1} color="gray.400">Folders of Images</Text>
            <SimpleGrid columns={3} spacing={2}>
              <Image bg="gray.700" boxSize="50px" borderRadius="md" />
              <Image bg="gray.700" boxSize="50px" borderRadius="md" />
              <Image bg="gray.700" boxSize="50px" borderRadius="md" />
            </SimpleGrid>
          </Box>
        </VStack>
      </Box>

      {/* Main Content */}
      <Box flex={1} p={6} bg="gray.850">
        <Heading size="lg" mb={4}>Tasks for Today</Heading>
        <VStack align="stretch" spacing={3}>
          {['Review analytics report', 'Prepare presentation slides', 'Update campaign strategy', 'Conduct user interviews', 'Organize team meeting'].map((task, idx) => (
            <Box key={idx} p={3} bg={task === 'Update campaign strategy' ? 'gray.700' : 'gray.800'} borderRadius="md">
              <Text color={task === 'Update campaign strategy' ? 'green.300' : 'white'}>{task}</Text>
            </Box>
          ))}
        </VStack>
      </Box>

      {/* Detail Panel */}
      <Box w={{ base: '100%', md: '350px' }} bg="gray.800" p={6}>
        <Heading size="md" mb={4}>Current Task</Heading>
        <Checkbox mb={4}>Complete task</Checkbox>
        <Heading size="sm" mb={2}>Update campaign strategy</Heading>
        <Textarea placeholder="Task description" mb={4} />

        <Box mb={4}>
          <Text fontSize="sm" mb={2} color="gray.400">Checklist / Subtasks</Text>
          <VStack align="start" spacing={2}>
            <Checkbox>First task</Checkbox>
            <Checkbox>Second task</Checkbox>
            <Checkbox>Third task</Checkbox>
          </VStack>
        </Box>

        <Box mb={4}>
          <Text fontSize="sm" mb={1} color="gray.400">Tags</Text>
          <HStack>
            <Tag colorScheme="green">category</Tag>
            <Tag colorScheme="purple">Q3</Tag>
          </HStack>
        </Box>

        <Box mb={4}>
          <Text fontSize="sm" mb={1} color="gray.400">Due Date</Text>
          <Input type="date" bg="gray.700" border={0} />
        </Box>

        <Box>
          <Text fontSize="sm" mb={2} color="gray.400">Task Assets</Text>
          <Image bg="gray.700" boxSize="60px" borderRadius="md" mb={3} />
          <Button colorScheme="green" w="full">Generate with AI</Button>
        </Box>
      </Box>
    </Flex>
  );
}
