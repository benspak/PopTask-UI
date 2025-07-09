import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [sharedProjects, setSharedProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sharedLoading, setSharedLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sharedError, setSharedError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  const dismissError = useCallback(() => {
    setError(null);
  }, []);

  const dismissSharedError = useCallback(() => {
    setSharedError(null);
  }, []);

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

  const loadSharedProjects = useCallback(async () => {
    try {
      setSharedLoading(true);
      setSharedError(null);

      const response = await apiService.getSharedProjects();
      setSharedProjects(response.data || []);

      // Check online status
      const isCurrentlyOnline = await apiService.checkServerConnection();
      setIsOffline(!isCurrentlyOnline);

      if (!isCurrentlyOnline) {
        setSharedError('Working offline - please check your connection');
      } else {
        setSharedError(null);
      }
    } catch (err) {
      console.error('❌ Error loading shared projects:', err);
      setSharedError('Failed to load shared projects. Please check your connection.');
      setSharedProjects([]);
      setIsOffline(true);
    } finally {
      setSharedLoading(false);
    }
  }, []);

  const refreshSharedProjects = useCallback(async (showNotification = false) => {
    try {
      const response = await apiService.getSharedProjects();
      const previousCount = sharedProjects.length;
      const newCount = response.data?.length || 0;

      setSharedProjects(response.data || []);

      // Show notification if requested and there are changes
      if (showNotification && previousCount !== newCount) {
        // This will be handled by the Dashboard component
        return { previousCount, newCount };
      }
    } catch (err) {
      console.error('Error refreshing shared projects:', err);
      // Don't set error state for refresh operations to avoid disrupting UI
      return null;
    }
  }, [sharedProjects.length]);

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

      // Refresh shared projects to reflect any changes
      await refreshSharedProjects();

      return response.data;
    } catch (err) {
      setError('Failed to update project. Please try again.');
      throw err;
    }
  }, [refreshSharedProjects]);

  const deleteProject = useCallback(async (id) => {
    try {
      setError(null);
      await apiService.deleteProject(id);
      setProjects(prev => prev.filter(project => project._id !== id));

      // Refresh shared projects to reflect any changes
      await refreshSharedProjects();

      return { success: true };
    } catch (err) {
      setError('Failed to delete project. Please try again.');
      throw err;
    }
  }, [refreshSharedProjects]);

  // Initial data load
  useEffect(() => {
    loadProjects();
    loadSharedProjects();
  }, [loadProjects, loadSharedProjects]);

  return {
    projects,
    sharedProjects,
    loading,
    sharedLoading,
    error,
    sharedError,
    isOffline,
    dismissError,
    dismissSharedError,
    loadProjects,
    loadSharedProjects,
    refreshSharedProjects,
    createProject,
    updateProject,
    deleteProject,
  };
};
