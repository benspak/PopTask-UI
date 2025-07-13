import React, { useState } from 'react';
import {
  Box,
  Flex,
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
  Heading,
  Button,
  useBreakpointValue,
  Collapse,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  Divider,
} from '@chakra-ui/react';
import {
  CheckCircleIcon,
  MoonIcon,
  SunIcon,
  InfoIcon,
  SettingsIcon,
  StarIcon,
  ExternalLinkIcon,
  HamburgerIcon,
  AtSignIcon,
  DownloadIcon,
  ViewIcon,
  EditIcon,
} from '@chakra-ui/icons';
import { useAuthWithTimezone } from '../hooks/useAuthWithTimezone';
import { formatInUserTimezone } from '../utils/timezone';
import { Link as RouterLink } from 'react-router-dom';
import PopTaskLogo from './PopTaskLogo';

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
  onLogout,
}) => {
  const { user, userTimezone } = useAuthWithTimezone();
  const isProUser = user?.userType === 'pro';

  // Mobile responsive breakpoints
  const isMobile = useBreakpointValue({ base: true, md: false });
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false });

  // Mobile state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Mobile menu items
  const mobileMenuItems = [
    {
      label: 'My Tasks',
      icon: <CheckCircleIcon />,
      onClick: () => {
        resetToAllTasks();
        closeMobileMenu();
      },
      isActive: currentView === 'all',
    },
    {
      label: 'Clients',
      icon: <AtSignIcon />,
      onClick: () => {
        window.location.href = '/clients';
        closeMobileMenu();
      },
    },
    // Only show Teams for pro users
    ...(isProUser ? [{
      label: 'Teams',
      icon: <ViewIcon />,
      onClick: () => {
        window.location.href = '/teams';
        closeMobileMenu();
      },
    }] : []),
    {
      label: 'Companies',
      icon: <AtSignIcon />,
      onClick: () => {
        window.location.href = '/companies';
        closeMobileMenu();
      },
    },
    // Only show Templates for pro users
    ...(isProUser ? [{
      label: 'Templates',
      icon: <EditIcon />,
      onClick: () => {
        window.location.href = '/proposal-templates';
        closeMobileMenu();
      },
    }] : []),
    {
      label: 'Invoices',
      icon: <DownloadIcon />,
      onClick: () => {
        window.location.href = '/invoices';
        closeMobileMenu();
      },
    },
  ];

  return (
    <Box
      position="sticky"
      top={0}
      zIndex={50}
      bg={colorMode === 'light' ? 'white' : 'gray.900'}
      borderBottom="1px solid"
      borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
    >
      {/* Main TopBar */}
      <Flex justify="space-between" align="center" p={{ base: 2, md: 4 }}>
        {/* Left Section */}
        <Flex align="center" gap={{ base: 2, md: 3 }} flex="1">
          <Flex align="center" mr={{ base: 2, md: 4 }}>
            <PopTaskLogo
              size={{ base: 120, md: 140 }}
              colorMode={colorMode}
            />
          </Flex>
        </Flex>



        {/* Right Section */}
        <Flex align="center" position="relative" gap={{ base: 1, md: 2 }}>
          {/* Pro Badge - Hidden on very small screens */}
          {isProUser && (
            <Badge
              colorScheme="green"
              variant="subtle"
              size="sm"
              display={{ base: 'none', sm: 'flex' }}
            >
              <StarIcon boxSize={2} mr={1} />
              Pro
            </Badge>
          )}

          {/* Date - Hidden on mobile */}
          <Text
            fontSize="sm"
            fontWeight="medium"
            color={colorMode === 'light' ? 'gray.600' : 'gray.300'}
            textAlign="right"
            minW="120px"
            display={{ base: 'none', md: 'block' }}
          >
            {formatInUserTimezone(new Date(), userTimezone, 'EEE, MMM d')}
          </Text>

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              icon={<HamburgerIcon />}
              aria-label="Open mobile menu"
              onClick={() => setIsMobileMenuOpen(true)}
              size="sm"
              variant="ghost"
              color={colorMode === 'light' ? 'gray.600' : 'gray.300'}
            />
          )}

          {/* User Menu */}
          <Menu>
            <MenuButton
              as={Avatar}
              size={{ base: "xs", md: "sm" }}
              src={user?.profilePicture}
              name={user?.displayName || user?.firstName}
              bg="blue.500"
              cursor="pointer"
              _hover={{ opacity: 0.8 }}
            />
            <MenuList
              bg={colorMode === 'light' ? 'white' : 'gray.800'}
              borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
              minW={{ base: "200px", md: "auto" }}
            >
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
                icon={<ExternalLinkIcon />}
                bg={colorMode === 'light' ? 'white' : 'gray.800'}
                _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
                color={colorMode === 'light' ? 'gray.800' : 'white'}
                onClick={() => window.location.href = `/profile/${user?.username}`}
              >
                View Profile
              </MenuItem>
              <MenuItem
                icon={<SettingsIcon />}
                bg={colorMode === 'light' ? 'white' : 'gray.800'}
                _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
                color={colorMode === 'light' ? 'gray.800' : 'white'}
                onClick={() => window.location.href = '/settings'}
              >
                Profile Settings
              </MenuItem>
              <MenuItem
                onClick={onLogout}
                bg={colorMode === 'light' ? 'white' : 'gray.800'}
                _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
                color="red.500"
              >
                Logout
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

      {/* Mobile Menu Drawer */}
      <Drawer
        isOpen={isMobileMenuOpen}
        placement="right"
        onClose={closeMobileMenu}
        size="xs"
      >
        <DrawerOverlay />
        <DrawerContent bg={colorMode === 'light' ? 'white' : 'gray.800'}>
          <DrawerCloseButton color={colorMode === 'light' ? 'gray.600' : 'gray.300'} />
          <DrawerHeader
            borderBottomWidth="1px"
            borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
            color={colorMode === 'light' ? 'gray.800' : 'white'}
          >
            Menu
          </DrawerHeader>
          <DrawerBody p={0}>
            <VStack spacing={0} align="stretch">
              {mobileMenuItems.map((item, index) => (
                <Box key={index}>
                  <Button
                    w="full"
                    justifyContent="flex-start"
                    variant="ghost"
                    size="lg"
                    onClick={item.onClick}
                    colorScheme={item.isActive ? "blue" : "gray"}
                    color={colorMode === 'light' ? 'gray.800' : 'white'}
                    _hover={{
                      bg: item.isActive
                        ? (colorMode === 'light' ? 'blue.50' : 'blue.900')
                        : (colorMode === 'light' ? 'gray.100' : 'gray.700')
                    }}
                    leftIcon={item.icon}
                    borderRadius={0}
                    py={4}
                  >
                    {item.label}
                  </Button>
                  {index < mobileMenuItems.length - 1 && (
                    <Divider borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'} />
                  )}
                </Box>
              ))}

              {/* User Info Section */}
              <Divider borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'} />
              <Box p={4}>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" fontWeight="medium" color={colorMode === 'light' ? 'gray.800' : 'white'}>
                    {user?.displayName || user?.email}
                  </Text>
                  <Text fontSize="xs" color={colorMode === 'light' ? 'gray.500' : 'gray.400'}>
                    {isProUser ? 'Pro User' : 'Basic User'}
                  </Text>
                  {isProUser && (
                    <Badge colorScheme="green" variant="subtle" size="sm">
                      <StarIcon boxSize={2} mr={1} />
                      Pro
                    </Badge>
                  )}
                </VStack>
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default TopBar;
