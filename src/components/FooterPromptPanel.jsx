import React from 'react';
import { Box, Collapse, Flex, Heading, IconButton, Textarea, Button } from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';

export default function FooterPromptPanel({
  isFooterOpen,
  toggleFooter,
  tasksPrompt,
  setTasksPrompt
}) {
  return (
    <Box position="fixed" bottom={0} left={0} right={0} zIndex={100}>
      <Collapse in={isFooterOpen} animateOpacity>
        <Box
          data-footer-panel
          w="full"
          bg="gray.800"
          p={{ base: 4, md: 6 }}
          pt={{ base: 5, md: 6 }}
          borderTop="1px solid"
          borderColor="gray.700"
          height={{ base: "380px", md: "300px" }}
          maxH={{ base: "90vh", md: "none" }}
          position="relative"
          overflowY="auto"
        >
          <Flex justify="space-between" align="center" mb={4} display={{ base: 'flex', md: 'none' }}>
            <Heading size="md" color="white">Tasks Prompt</Heading>
            <IconButton
              icon={<CloseIcon />}
              aria-label="Close tasks prompt"
              size="sm"
              variant="ghost"
              onClick={toggleFooter}
              color="gray.400"
              _hover={{ bg: 'gray.700' }}
            />
          </Flex>
          <Flex justify="space-between" align="start" maxW="1200px" mx="auto" gap={8}>
            <Box flex={1}>
              <Heading size="md" mb={4} color="white" display={{ base: 'none', md: 'block' }}>Tasks Prompt</Heading>
              <Textarea
                placeholder="Enter your tasks prompt here"
                mb={4}
                minH={{ base: "120px", md: "100px" }}
                maxH={{ base: "200px", md: "none" }}
                color="white"
                _placeholder={{ color: 'gray.400' }}
                value={tasksPrompt}
                onChange={(e) => setTasksPrompt(e.target.value)}
              />
              <Button colorScheme="green" w="full">Submit</Button>
            </Box>
          </Flex>
        </Box>
      </Collapse>
    </Box>
  );
}
