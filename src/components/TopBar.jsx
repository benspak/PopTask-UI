import React from 'react';
import {
  Box,
  Flex,
  Input,
  IconButton,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
  Badge,
  Text,
  Link,
  HStack,
} from '@chakra-ui/react';
import {
  CheckCircleIcon,
  MoonIcon,
  SunIcon,
  InfoIcon,
  SettingsIcon,
  StarIcon,
} from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext';
import { Link as RouterLink } from 'react-router-dom';

const TopBar = ({
  colorMode,
  toggleColorMode,
  isOnline,
  currentView,
  searchTerm,
  handleSearch,
  resetToAllTasks,
  isSidebarOpen,
  isCenterOpen,
}) => {
  const { user } = useAuth();
  const isProUser = user?.userType === 'pro';

  return (
    <Box position="sticky" top={0} zIndex={50} bg={colorMode === 'light' ? 'white' : 'gray.900'} borderBottom="1px solid" borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}>
      <Flex justify="space-between" align="center" p={4}>
        <Flex align="center" gap={3}>
          <IconButton
            icon={<CheckCircleIcon />}
            aria-label="Go to My Tasks"
            onClick={resetToAllTasks}
            size="sm"
            colorScheme={currentView === 'all' && !searchTerm ? "blue" : "gray"}
            variant="solid"
            borderRadius="md"
            title="My Tasks"
          />
          <Input
            placeholder="Filter tasks"
            bg={colorMode === 'light' ? 'gray.100' : 'gray.700'}
            border={0}
            w={{ base: "200px", md: "300px" }}
            _placeholder={{ color: colorMode === 'light' ? 'gray.500' : 'gray.400' }}
            color={colorMode === 'light' ? 'gray.800' : 'white'}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </Flex>
        <Flex align="center" position="relative" gap={2}>
          {isProUser && (
            <Badge colorScheme="green" variant="subtle" size="sm">
              <StarIcon boxSize={2} mr={1} />
              Pro
            </Badge>
          )}
          <Menu>
            <MenuButton
              as={Avatar}
              size="sm"
              bg="blue.500"
              cursor="pointer"
              _hover={{ opacity: 0.8 }}
            />
            <MenuList bg={colorMode === 'light' ? 'white' : 'gray.800'} borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}>
              <MenuItem
                icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                onClick={toggleColorMode}
                bg={colorMode === 'light' ? 'white' : 'gray.800'}
                _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
                color={colorMode === 'light' ? 'gray.800' : 'white'}
              >
                {colorMode === 'light' ? 'Dark Mode' : 'Light Mode'}
              </MenuItem>
              <MenuItem
                icon={<InfoIcon />}
                bg={colorMode === 'light' ? 'white' : 'gray.800'}
                _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
                color={colorMode === 'light' ? 'gray.800' : 'white'}
              >
                <Flex direction="column" align="start">
                  <Text fontSize="sm" fontWeight="medium">
                    {user?.displayName || user?.email}
                  </Text>
                  <Text fontSize="xs" color={colorMode === 'light' ? 'gray.500' : 'gray.400'}>
                    {isProUser ? 'Pro User' : 'Basic User'}
                  </Text>
                </Flex>
              </MenuItem>
              <MenuItem
                icon={<SettingsIcon />}
                bg={colorMode === 'light' ? 'white' : 'gray.800'}
                _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
                color={colorMode === 'light' ? 'gray.800' : 'white'}
              >
                Settings
              </MenuItem>
            </MenuList>
          </Menu>
          {/* Online/Offline Status Dot */}
          <Box
            position="absolute"
            bottom="0"
            right="0"
            w="12px"
            h="12px"
            borderRadius="full"
            bg={isOnline ? "green.400" : "red.400"}
            border="2px solid"
            borderColor={colorMode === 'light' ? 'white' : 'gray.800'}
            boxShadow="0 0 0 2px rgba(0,0,0,0.1)"
          />
        </Flex>
      </Flex>
    </Box>
  );
};

export default TopBar;
