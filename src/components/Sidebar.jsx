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
  Spinner,
  Divider,
  Button,
} from '@chakra-ui/react';
import {
  CloseIcon,
  WarningIcon,
  HamburgerIcon,
  StarIcon,
  LinkIcon,
  CheckCircleIcon,
  AtSignIcon,
  ViewIcon,
  DownloadIcon,
  EditIcon,
  SettingsIcon,
  ExternalLinkIcon,
} from '@chakra-ui/icons';
import { useLocation } from 'react-router-dom';
import SharedContentPanel from './SharedContentPanel';

// Sidebar receives all props needed for sidebar rendering
const Sidebar = ({
  isSidebarOpen,
  isCenterOpen,
  colorMode,
  toggleSidebar,
  // Shared content props
  sharedTasks = [],
  sharedProjects = [],
  sharedTasksLoading = false,
  sharedProjectsLoading = false,
  sharedTasksError = null,
  sharedProjectsError = null,
  isSharedContentExpanded = false,
  toggleSharedContentExpanded,
  onSharedTaskClick,
  onSharedProjectClick,
  refreshSharedContent,
  dismissSharedTasksError,
  // Navigation props
  resetToAllTasks,
  isProUser = false,
}) => {
  const location = useLocation();
  const isOnDashboard = location.pathname === '/dashboard';
  const isOnClients = location.pathname === '/clients';
  const isOnTasks = location.pathname === '/tasks';
  const isOnProjects = location.pathname === '/projects';

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
          <Heading size="md" color={colorMode === 'light' ? 'gray.800' : 'white'}>Sidebar</Heading>
          <IconButton
            icon={<CloseIcon />}
            aria-label="Close sidebar"
            size="sm"
            variant="ghost"
            onClick={toggleSidebar}
            color={colorMode === 'light' ? 'gray.600' : 'gray.400'}
            _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
          />
        </Flex>

        {/* Desktop: Show heading only */}
        <VStack align="start" spacing={4}>
          {/* Shared Content Panel - Only show when on tasks or projects */}
          {(isOnTasks || isOnProjects) && (
            <Box w="full">
              <SharedContentPanel
                sharedTasks={sharedTasks}
                sharedProjects={sharedProjects}
                sharedTasksLoading={sharedTasksLoading}
                sharedProjectsLoading={sharedProjectsLoading}
                sharedTasksError={sharedTasksError}
                sharedProjectsError={sharedProjectsError}
                isExpanded={isSharedContentExpanded}
                onToggleExpanded={toggleSharedContentExpanded}
                onTaskClick={onSharedTaskClick}
                onProjectClick={onSharedProjectClick}
                onRefresh={refreshSharedContent}
                onDismissSharedError={dismissSharedTasksError}
              />
            </Box>
          )}

          {/* Only show divider if SharedContentPanel is shown */}
          {(isOnTasks || isOnProjects) && <Divider />}

          {/* Navigation Section */}
          <Box w="full">
            <Heading size="md" mb={2} color={colorMode === 'light' ? 'gray.800' : 'white'}>Navigation</Heading>
            <VStack align="stretch" spacing={2} w="full">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/dashboard'}
                color={colorMode === 'light' ? 'gray.600' : 'gray.300'}
                _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
                leftIcon={<StarIcon />}
                justifyContent="flex-start"
                w="full"
              >
                Dashboard
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetToAllTasks}
                color={colorMode === 'light' ? 'gray.600' : 'gray.300'}
                _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
                leftIcon={<CheckCircleIcon />}
                justifyContent="flex-start"
                w="full"
              >
                Tasks
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/projects'}
                color={colorMode === 'light' ? 'gray.600' : 'gray.300'}
                _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
                leftIcon={<SettingsIcon />}
                justifyContent="flex-start"
                w="full"
              >
                Projects
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/clients'}
                color={colorMode === 'light' ? 'gray.600' : 'gray.300'}
                _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
                leftIcon={<AtSignIcon />}
                justifyContent="flex-start"
                w="full"
              >
                Clients
              </Button>
              {/* Only show Teams for pro users */}
              {isProUser && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = '/teams'}
                  color={colorMode === 'light' ? 'gray.600' : 'gray.300'}
                  _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
                  leftIcon={<ViewIcon />}
                  justifyContent="flex-start"
                  w="full"
                >
                  Teams
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/invoices'}
                color={colorMode === 'light' ? 'gray.600' : 'gray.300'}
                _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
                leftIcon={<DownloadIcon />}
                justifyContent="flex-start"
                w="full"
              >
                Invoices
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/companies'}
                color={colorMode === 'light' ? 'gray.600' : 'gray.300'}
                _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
                leftIcon={<AtSignIcon />}
                justifyContent="flex-start"
                w="full"
              >
                Companies
              </Button>
              {/* Only show Jobs for pro users */}
              {isProUser && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = '/jobs/manage'}
                  color={colorMode === 'light' ? 'gray.600' : 'gray.300'}
                  _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
                  leftIcon={<ExternalLinkIcon />}
                  justifyContent="flex-start"
                  w="full"
                >
                  Jobs
                </Button>
              )}
              {/* Only show Templates for pro users */}
              {isProUser && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = '/proposal-templates'}
                  color={colorMode === 'light' ? 'gray.600' : 'gray.300'}
                  _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
                  leftIcon={<EditIcon />}
                  justifyContent="flex-start"
                  w="full"
                >
                  Templates
                </Button>
              )}
            </VStack>
          </Box>

          <Divider />
        </VStack>
      </Box>
    )
  );
};

export default Sidebar;
