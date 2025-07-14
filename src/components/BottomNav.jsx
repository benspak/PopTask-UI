import React from 'react';
import { Flex, IconButton, Tooltip } from '@chakra-ui/react';
import { HamburgerIcon, AddIcon, CloseIcon, ChatIcon } from '@chakra-ui/icons';
import { useLocation } from 'react-router-dom';

export default function BottomNav({
  isSidebarOpen,
  isAddMode,
  isFooterOpen,
  toggleSidebar,
  handleAddTask,
  handleAddProject,
  handleAddClient,
  toggleFooter
}) {
  const location = useLocation();
  const isOnProjectsPage = location.pathname === '/projects';
  const isOnClientsPage = location.pathname === '/clients';
  const isOnInvoicesPage = location.pathname === '/invoices';
  const isOnCompaniesPage = location.pathname === '/companies';
  const isOnDashboard = location.pathname === '/dashboard';
  const isOnTeamsPage = location.pathname === '/teams';
  const isOnJobsPage = location.pathname === '/jobs/manage';

  // Determine the appropriate handler and labels based on current route
  const handleAddAction = isOnProjectsPage ? handleAddProject : isOnClientsPage ? handleAddClient : isOnCompaniesPage ? handleAddClient : isOnInvoicesPage ? handleAddTask : isOnTeamsPage ? handleAddTask : isOnJobsPage ? handleAddTask : handleAddTask;
  const addButtonLabel = isOnProjectsPage ? "Add New Project" : isOnClientsPage ? "Add New Client" : isOnCompaniesPage ? "Add New Company" : isOnInvoicesPage ? "Create Invoice" : isOnTeamsPage ? "Create Team" : isOnJobsPage ? "Post New Job" : "Add New Task";
  const closeButtonLabel = isOnProjectsPage ? "Close Add Project" : isOnClientsPage ? "Close Add Client" : isOnCompaniesPage ? "Close Add Company" : isOnInvoicesPage ? "Close Create Invoice" : isOnTeamsPage ? "Close Create Team" : isOnJobsPage ? "Close Post Job" : "Close Add Task";
  const ariaLabel = isAddMode ? (isOnProjectsPage ? "Close Add Project" : isOnClientsPage ? "Close Add Client" : isOnCompaniesPage ? "Close Add Company" : isOnInvoicesPage ? "Close Create Invoice" : isOnTeamsPage ? "Close Create Team" : isOnJobsPage ? "Close Post Job" : "Close Add Task") : (isOnProjectsPage ? "Add New Project" : isOnClientsPage ? "Add New Client" : isOnCompaniesPage ? "Add New Company" : isOnInvoicesPage ? "Create Invoice" : isOnTeamsPage ? "Create Team" : isOnJobsPage ? "Post New Job" : "Add New Task");

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
          icon={<HamburgerIcon />}
          aria-label="Toggle Sidebar"
          onClick={toggleSidebar}
          size={{ base: "md", md: "sm" }}
          colorScheme={isSidebarOpen ? "blue" : "gray"}
          variant="solid"
          borderRadius="full"
          _hover={{ bg: 'gray.700' }}
        />
        {!isOnDashboard && (
          <Tooltip
            label={isAddMode ? closeButtonLabel : addButtonLabel}
            placement="top"
            hasArrow
          >
            <IconButton
              icon={isAddMode ? <CloseIcon /> : <AddIcon />}
              aria-label={ariaLabel}
              onClick={handleAddAction}
              size={{ base: "md", md: "sm" }}
              colorScheme={isAddMode ? "red" : "green"}
              variant="solid"
              borderRadius="full"
              _hover={{ bg: isAddMode ? 'red.600' : 'green.600' }}
            />
          </Tooltip>
        )}
        <Tooltip
          label="Send Feedback"
          placement="top"
          hasArrow
        >
          <IconButton
            icon={<ChatIcon />}
            aria-label="Send Feedback"
            onClick={toggleFooter}
            size={{ base: "md", md: "sm" }}
            colorScheme={isFooterOpen ? "blue" : "gray"}
            variant="solid"
            borderRadius="full"
            _hover={{ bg: 'gray.700' }}
          />
        </Tooltip>
      </Flex>
    </Flex>
  );
}
