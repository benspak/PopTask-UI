import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getProjects();
      setProjects(response.data || []);

      // Check online status
      const isCurrentlyOnline = await apiService.checkServerConnection();
      setIsOffline(!isCurrentlyOnline);

      if (!isCurrentlyOnline) {
        setError('Working offline - please check your connection');
      } else {
        setError(null);
      }
    } catch (err) {
      console.error('Error loading projects:', err);
      setError('Failed to load projects. Please check your connection.');
      setProjects([]);
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = useCallback(async (projectData) => {
    try {
      setError(null);
      const response = await apiService.createProject(projectData);
      setProjects(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError('Failed to create project. Please try again.');
      throw err;
    }
  }, []);

  const updateProject = useCallback(async (id, projectData) => {
    try {
      setError(null);
      const response = await apiService.updateProject(id, projectData);
      setProjects(prev => prev.map(project =>
        project._id === id ? response.data : project
      ));
      return response.data;
    } catch (err) {
      setError('Failed to update project. Please try again.');
      throw err;
    }
  }, []);

  const deleteProject = useCallback(async (id) => {
    try {
      setError(null);
      await apiService.deleteProject(id);
      setProjects(prev => prev.filter(project => project._id !== id));
      return { success: true };
    } catch (err) {
      setError('Failed to delete project. Please try again.');
      throw err;
    }
  }, []);

  // Initial data load
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return {
    projects,
    loading,
    error,
    isOffline,
    loadProjects,
    createProject,
    updateProject,
    deleteProject,
  };
};
