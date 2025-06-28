import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  // Load projects from backend or offline storage
  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getProjects();
      setProjects(response.data || []);
      setIsOffline(false);
    } catch (err) {
      if (err.message === 'OFFLINE_MODE') {
        // Load from offline storage
        const offlineProjects = apiService.getOfflineProjects();
        setProjects(offlineProjects);
        setIsOffline(true);
        setError('Working offline - changes will sync when connection is restored');
      } else {
        // Provide user-friendly error message
        const errorMessage = err.message.includes('Unable to connect') || err.message.includes('Server is currently unavailable')
          ? 'Unable to connect to server. Working in offline mode.'
          : 'Failed to load projects. Working in offline mode.';
        setError(errorMessage);
        // Load offline projects as fallback
        const offlineProjects = apiService.getOfflineProjects();
        setProjects(offlineProjects);
        setIsOffline(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new project
  const createProject = useCallback(async (projectData) => {
    try {
      setError(null);
      const response = await apiService.createProject(projectData);

      if (response.data.isOffline) {
        // Project was created offline
        setProjects(prev => [...prev, response.data]);
        setIsOffline(true);
        setError('Project created offline - will sync when connection is restored');
      } else {
        // Project was created online
        setProjects(prev => [...prev, response.data]);
        setIsOffline(false);
      }

      return response.data;
    } catch (err) {
      if (err.message === 'OFFLINE_MODE') {
        // Create offline project
        const offlineProject = apiService.getOfflineProjects().find(p =>
          p.name === projectData.name && p.isOffline
        );
        if (offlineProject) {
          setProjects(prev => [...prev, offlineProject]);
          setIsOffline(true);
          setError('Project created offline - will sync when connection is restored');
          return offlineProject;
        }
      }
      setError('Failed to create project. Please try again.');
      throw err;
    }
  }, []);

  // Update project
  const updateProject = useCallback(async (id, projectData) => {
    try {
      setError(null);
      const response = await apiService.updateProject(id, projectData);

      if (response.data.isOffline) {
        // Project was updated offline
        setProjects(prev => prev.map(project =>
          project._id === id ? response.data : project
        ));
        setIsOffline(true);
        setError('Project updated offline - will sync when connection is restored');
      } else {
        // Project was updated online
        setProjects(prev => prev.map(project =>
          project._id === id ? response.data : project
        ));
        setIsOffline(false);
      }

      return response.data;
    } catch (err) {
      if (err.message === 'OFFLINE_MODE') {
        // Update offline project - get the latest from storage
        const offlineProjects = apiService.getOfflineProjects();
        const updatedProject = offlineProjects.find(p => p._id === id);
        if (updatedProject) {
          setProjects(prev => prev.map(project =>
            project._id === id ? updatedProject : project
          ));
          setIsOffline(true);
          setError('Project updated offline - will sync when connection is restored');
          return updatedProject;
        } else {
          // Project not found in offline storage, this shouldn't happen with our improved API
          setError('Project not found in offline storage');
          throw new Error('Project not found');
        }
      }
      setError('Failed to update project. Please try again.');
      throw err;
    }
  }, []);

  // Delete project
  const deleteProject = useCallback(async (id) => {
    try {
      setError(null);
      const response = await apiService.deleteProject(id);

      if (response.isOffline) {
        // Project was deleted offline
        setProjects(prev => prev.filter(project => project._id !== id));
        setIsOffline(true);
        setError('Project deleted offline - will sync when connection is restored');
      } else {
        // Project was deleted online
        setProjects(prev => prev.filter(project => project._id !== id));
        setIsOffline(false);
      }
    } catch (err) {
      if (err.message === 'OFFLINE_MODE') {
        // Delete offline project
        setProjects(prev => prev.filter(project => project._id !== id));
        setIsOffline(true);
        setError('Project deleted offline - will sync when connection is restored');
      } else {
        setError('Failed to delete project. Please try again.');
        throw err;
      }
    }
  }, []);

  // Get project by ID
  const getProject = useCallback((id) => {
    return projects.find(project => project._id === id);
  }, [projects]);

  // Sync offline data
  const syncOfflineData = useCallback(async () => {
    try {
      await apiService.syncOfflineData();
      // Reload projects after sync
      await loadProjects();
      setIsOffline(false);
      setError(null);
    } catch (err) {
      setError('Failed to sync offline data. Please try again later.');
    }
  }, [loadProjects]);

  // Load projects on mount
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
    getProject,
    syncOfflineData,
  };
};
