import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  List,
  ListItem,
  Spinner,
  Heading,
  useToast,
  useDisclosure,
  useColorModeValue,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure as useAlertDisclosure,
  Divider,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tooltip,
  Flex,
  Wrap,
  WrapItem,
  Select,
  useColorMode,
} from '@chakra-ui/react';
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  ViewIcon,
  ChevronDownIcon,
  AtSignIcon,
  InfoIcon,
  StarIcon,
  ChevronLeftIcon,
} from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { useTeams } from '../hooks/useTeams';
import TeamCreatePanel from './TeamCreatePanel';
import TeamEditPanel from './TeamEditPanel';
import LimitsDisplay from './LimitsDisplay';
import TopBar from './TopBar';

const TeamList = () => {
  const { teams, loading, error, loadTeams, createTeam, updateTeam, deleteTeam } = useTeams();
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const toast = useToast();
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen: isCreateOpen, onOpen: openCreate, onClose: closeCreate } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: openEdit, onClose: closeEdit } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: openDelete, onClose: closeDelete } = useDisclosure();
  const { isOpen: isAlertOpen, onOpen: openAlert, onClose: closeAlert } = useAlertDisclosure();

  // TopBar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCenterOpen, setIsCenterOpen] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const emptyTextColor = useColorModeValue('gray.500', 'gray.400');
  const descriptionTextColor = useColorModeValue('gray.600', 'gray.400');
  const ownerTextColor = useColorModeValue('gray.500', 'gray.400');

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  const handleCreateTeam = async (teamData) => {
    try {
      await createTeam(teamData);
      toast({
        title: 'Success',
        description: 'Team created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create team',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleUpdateTeam = async (teamId, updateData) => {
    try {
      const { action, ...data } = updateData;

      switch (action) {
        case 'updateTeam':
          await updateTeam(teamId, data.teamData);
          break;
        case 'addMember':
          await updateTeam(teamId, { members: data.memberData });
          break;
        case 'removeMember':
          await updateTeam(teamId, { removeMember: data.userId });
          break;
        case 'updateMemberRole':
          await updateTeam(teamId, { updateMemberRole: { userId: data.userId, role: data.role } });
          break;
        default:
          throw new Error('Invalid action');
      }

      toast({
        title: 'Success',
        description: 'Team updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update team',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteTeam = async () => {
    if (!selectedTeam) return;

    try {
      await deleteTeam(selectedTeam._id);
      toast({
        title: 'Success',
        description: 'Team deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      closeDelete();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete team',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // TopBar handlers
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleCenter = () => setIsCenterOpen(!isCenterOpen);
  const handleSearch = (value) => setSearchQuery(value);
  const resetToAllTasks = () => navigate('/dashboard');
  const handleLogout = async () => {
    try {
      // Handle logout logic here
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast({ title: 'Logout failed', status: 'error' });
    }
  };

  const openEditModal = (team) => {
    setSelectedTeam(team);
    openEdit();
  };

  const openDeleteModal = (team) => {
    setSelectedTeam(team);
    openDelete();
  };

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         team.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = filterRole === 'all' ||
                       (filterRole === 'owner' && team.owner) ||
                       (filterRole === 'member' && team.members.length > 0);

    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'red';
      case 'member': return 'blue';
      case 'viewer': return 'gray';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <Box p={6}>
        <VStack spacing={4}>
          <Spinner size="lg" />
          <Text>Loading teams...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <>
      <Box minH="100vh" bg={colorMode === 'dark' ? 'gray.900' : 'gray.50'}>
        <Flex h="100vh" overflow="hidden">
          <Flex flex="1" direction="column">
            <TopBar
              colorMode={colorMode}
              toggleColorMode={toggleColorMode}
              isOnline={true}
              currentView="teams"
              searchTerm={searchQuery}
              handleSearch={handleSearch}
              resetToAllTasks={resetToAllTasks}
              isSidebarOpen={isSidebarOpen}
              isCenterOpen={isCenterOpen}
              onLogout={handleLogout}
            />

            <Box flex="1" overflowY="auto" p={4}>
              <Box maxW="6xl" mx="auto">
              <Flex justify="space-between" align="center" mb={6}>
                <HStack spacing={4} align="center">
                  <IconButton
                    icon={<ChevronLeftIcon />}
                    aria-label="Go back"
                    onClick={() => navigate('/dashboard')}
                    size="sm"
                    variant="ghost"
                    color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}
                    _hover={{ bg: colorMode === 'dark' ? 'gray.700' : 'gray.100' }}
                  />
                  <Heading size="lg" color={textColor}>Teams</Heading>
                </HStack>
                <Button
                  leftIcon={<AddIcon />}
                  colorScheme="blue"
                  onClick={openCreate}
                >
                  Create Team
                </Button>
              </Flex>

              {/* Stats */}
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
                <Stat>
                  <StatLabel>Total Teams</StatLabel>
                  <StatNumber>{teams.length}</StatNumber>
                  <StatHelpText>Your teams</StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Total Members</StatLabel>
                  <StatNumber>
                    {teams.reduce((total, team) => total + team.members.length, 0)}
                  </StatNumber>
                  <StatHelpText>Across all teams</StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Total Projects</StatLabel>
                  <StatNumber>
                    {teams.reduce((total, team) => total + (team.projects?.length || 0), 0)}
                  </StatNumber>
                  <StatHelpText>In teams</StatHelpText>
                </Stat>
              </SimpleGrid>

              {/* Search and Filters */}
              <HStack spacing={4} mb={6}>
                <Input
                  placeholder="Search teams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  bg={bgColor}
                  color={textColor}
                  borderColor={borderColor}
                  _focus={{ borderColor: 'blue.500' }}
                />
                <Select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  w="150px"
                  bg={bgColor}
                  color={textColor}
                  borderColor={borderColor}
                  _focus={{ borderColor: 'blue.500' }}
                >
                  <option value="all">All Teams</option>
                  <option value="owner">Owned by me</option>
                  <option value="member">Member of</option>
                </Select>
              </HStack>

              {/* Teams List */}
              {filteredTeams.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <Text color={emptyTextColor}>
                    {teams.length === 0 ? 'No teams yet. Create your first team!' : 'No teams match your search.'}
                  </Text>
                </Box>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {filteredTeams.map((team) => (
                    <Box
                      key={team._id}
                      p={4}
                      border="1px"
                      borderColor={borderColor}
                      borderRadius="lg"
                      bg={bgColor}
                      _hover={{ shadow: 'md' }}
                      transition="all 0.2s"
                    >
                      <VStack spacing={3} align="stretch">
                        {/* Team Header */}
                        <Flex justify="space-between" align="start">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold" color={textColor}>
                              {team.name}
                            </Text>
                            {team.description && (
                              <Text fontSize="sm" color={descriptionTextColor} noOfLines={2}>
                                {team.description}
                              </Text>
                            )}
                          </VStack>
                          <Menu>
                            <MenuButton
                              as={IconButton}
                              icon={<ChevronDownIcon />}
                              variant="ghost"
                              size="sm"
                              aria-label="Team options"
                            />
                            <MenuList>
                              <MenuItem icon={<ViewIcon />} onClick={() => openEditModal(team)}>
                                View Details
                              </MenuItem>
                              <MenuItem icon={<EditIcon />} onClick={() => openEditModal(team)}>
                                Edit Team
                              </MenuItem>
                              <Divider />
                              <MenuItem
                                icon={<DeleteIcon />}
                                onClick={() => openDeleteModal(team)}
                                color="red.500"
                              >
                                Delete Team
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </Flex>

                        {/* Team Stats */}
                        <HStack spacing={4} fontSize="sm" color={descriptionTextColor}>
                          <HStack spacing={1}>
                            <AtSignIcon />
                            <Text>{team.members.length} members</Text>
                          </HStack>
                          <HStack spacing={1}>
                            <InfoIcon />
                            <Text>{team.projects?.length || 0} projects</Text>
                          </HStack>
                        </HStack>

                        {/* Owner */}
                        <HStack spacing={2}>
                          <Avatar
                            size="sm"
                            name={`${team.owner.firstName} ${team.owner.lastName}`}
                            src={team.owner.profilePicture}
                          />
                          <VStack align="start" spacing={0}>
                            <Text fontSize="sm" fontWeight="medium" color={textColor}>
                              {team.owner.firstName} {team.owner.lastName}
                            </Text>
                            <Text fontSize="xs" color={ownerTextColor}>
                              Owner
                            </Text>
                          </VStack>
                        </HStack>

                        {/* Members Preview */}
                        {team.members.length > 0 && (
                          <VStack align="start" spacing={2}>
                            <Text fontSize="sm" fontWeight="medium" color={textColor}>
                              Members
                            </Text>
                            <Wrap spacing={1}>
                              {team.members.slice(0, 3).map((member) => (
                                <WrapItem key={member.user._id}>
                                  <Badge
                                    colorScheme={getRoleBadgeColor(member.role)}
                                    variant="subtle"
                                    fontSize="xs"
                                  >
                                    {member.user.firstName} {member.user.lastName}
                                  </Badge>
                                </WrapItem>
                              ))}
                              {team.members.length > 3 && (
                                <WrapItem>
                                  <Badge variant="outline" fontSize="xs">
                                    +{team.members.length - 3} more
                                  </Badge>
                                </WrapItem>
                              )}
                            </Wrap>
                          </VStack>
                        )}
                      </VStack>
                    </Box>
                  ))}
                </SimpleGrid>
              )}
            </Box>
          </Box>
        </Flex>
      </Flex>
    </Box>

    {/* Create Team Modal */}
    <TeamCreatePanel
      isOpen={isCreateOpen}
      onClose={closeCreate}
      onCreateTeam={handleCreateTeam}
      loading={loading}
    />

    {/* Edit Team Modal */}
    <TeamEditPanel
      isOpen={isEditOpen}
      onClose={closeEdit}
      team={selectedTeam}
      onUpdateTeam={handleUpdateTeam}
      loading={loading}
    />

    {/* Delete Confirmation */}
    <AlertDialog isOpen={isDeleteOpen} onClose={closeDelete}>
      <AlertDialogOverlay />
      <AlertDialogContent>
        <AlertDialogHeader>Delete Team</AlertDialogHeader>
        <AlertDialogBody>
          Are you sure you want to delete "{selectedTeam?.name}"? This action cannot be undone.
        </AlertDialogBody>
        <AlertDialogFooter>
          <Button onClick={closeDelete}>Cancel</Button>
          <Button colorScheme="red" onClick={handleDeleteTeam} ml={3}>
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  );
};

export default TeamList;
