import React, { useEffect, useState } from 'react';
import { Box, Button, Input, List, ListItem, Spinner, Heading, VStack, HStack, Text, useToast } from '@chakra-ui/react';
import api from '../services/api';

export const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [adding, setAdding] = useState(false);
  const toast = useToast();

  useEffect(() => {
    api.get('/projects')
      .then(res => setProjects(res.data))
      .catch(() => toast({ title: 'Failed to load projects', status: 'error' }))
      .finally(() => setLoading(false));
  }, [toast]);

  const handleAdd = async () => {
    if (!newProject.name.trim()) {
      toast({ title: 'Name is required', status: 'warning' });
      return;
    }
    setAdding(true);
    try {
      const res = await api.post('/projects', newProject);
      setProjects([...projects, res.data]);
      setNewProject({ name: '', description: '' });
      toast({ title: 'Project added', status: 'success' });
    } catch {
      toast({ title: 'Failed to add project', status: 'error' });
    } finally {
      setAdding(false);
    }
  };

  return (
    <Box maxW="lg" mx="auto" mt={8} p={4} borderWidth={1} borderRadius="md" boxShadow="md" bg="gray.800">
      <Heading size="md" mb={4} color="white">Projects</Heading>
      <VStack spacing={2} align="stretch" mb={4}>
        <Input
          placeholder="Name"
          value={newProject.name}
          onChange={e => setNewProject({ ...newProject, name: e.target.value })}
          bg="gray.700" color="white"
        />
        <Input
          placeholder="Description"
          value={newProject.description}
          onChange={e => setNewProject({ ...newProject, description: e.target.value })}
          bg="gray.700" color="white"
        />
        <Button onClick={handleAdd} colorScheme="blue" isLoading={adding} alignSelf="flex-end">
          Add Project
        </Button>
      </VStack>
      {loading ? <Spinner color="white" /> : (
        <List spacing={3}>
          {projects.length === 0 ? (
            <Text color="gray.400">No projects yet.</Text>
          ) : (
            projects.map(project => (
              <ListItem key={project._id} p={2} borderBottom="1px solid" borderColor="gray.700">
                <HStack justify="space-between">
                  <Box>
                    <Text fontWeight="bold" color="white">{project.name}</Text>
                    <Text fontSize="sm" color="gray.300">{project.description}</Text>
                  </Box>
                </HStack>
              </ListItem>
            ))
          )}
        </List>
      )}
    </Box>
  );
};
