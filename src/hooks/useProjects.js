import { useState, useEffect, useCallback, useRef } from 'react';
import apiService from '../services/api';

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [sharedProjects, setSharedProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sharedLoading, setSharedLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sharedError, setSharedError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  // Add refs to track if data has been loaded and when
  const hasLoadedProjects = useRef(false);
  const hasLoadedSharedProjects = useRef(false);
  const lastLoadTime = useRef(0);
  const lastSharedLoadTime = useRef(0);

  const dismissError = useCallback(() => {
    setError(null);
  }, []);

  const dismissSharedError = useCallback(() => {
    setSharedError(null);
  }, []);

  const loadProjects = useCallback(async (forceRefresh = false) => {
    // Don't reload if data was loaded recently (within cache time) unless forced
    const now = Date.now();
    const cacheTime = import.meta.env.DEV ? 30000 : 30000; // 30s in both dev and prod

    if (!forceRefresh && hasLoadedProjects.current && (now - lastLoadTime.current) < cacheTime) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getProjects();

      // Enhanced data validation and sanitization
      let projectsData = [];

      if (Array.isArray(response)) {
        projectsData = response;
      } else if (response && typeof response === 'object' && response.data) {
        projectsData = response.data;
      } else if (response && typeof response === 'object') {
        // Handle case where response is an object but not in expected format
        projectsData = Array.isArray(response) ? response : [];
      } else {
        console.warn('Unexpected projects response format:', response);
        projectsData = [];
      }

      // Ensure we have a valid array and filter out any invalid entries
      const validProjects = Array.isArray(projectsData)
        ? projectsData.filter(project => {
            // Enhanced validation for project objects
            return project &&
                   typeof project === 'object' &&
                   project._id &&
                   typeof project._id === 'string' &&
                   project.name &&
                   typeof project.name === 'string';
          })
        : [];

      setProjects(validProjects);
      hasLoadedProjects.current = true;
      lastLoadTime.current = now;

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

  const loadSharedProjects = useCallback(async (forceRefresh = false) => {
    // Don't reload if data was loaded recently (within cache time) unless forced
    const now = Date.now();
    const cacheTime = import.meta.env.DEV ? 60000 : 30000; // 1 min in dev, 30s in prod

    if (!forceRefresh && hasLoadedSharedProjects.current && (now - lastSharedLoadTime.current) < cacheTime) {
      return;
    }

    try {
      setSharedLoading(true);
      setSharedError(null);

      const response = await apiService.getSharedProjects();

      // Enhanced data validation and sanitization
      let sharedProjectsData = [];

      if (Array.isArray(response)) {
        sharedProjectsData = response;
      } else if (response && typeof response === 'object' && response.data) {
        sharedProjectsData = response.data;
      } else if (response && typeof response === 'object') {
        // Handle case where response is an object but not in expected format
        sharedProjectsData = Array.isArray(response) ? response : [];
      } else {
        console.warn('Unexpected shared projects response format:', response);
        sharedProjectsData = [];
      }

      // Ensure we have a valid array and filter out any invalid entries
      const validSharedProjects = Array.isArray(sharedProjectsData)
        ? sharedProjectsData.filter(project => {
            // Enhanced validation for project objects
            return project &&
                   typeof project === 'object' &&
                   project._id &&
                   typeof project._id === 'string' &&
                   project.name &&
                   typeof project.name === 'string';
          })
        : [];

      setSharedProjects(validSharedProjects);
      hasLoadedSharedProjects.current = true;
      lastSharedLoadTime.current = now;

      // Check online status
      const isCurrentlyOnline = await apiService.checkServerConnection();
      setIsOffline(!isCurrentlyOnline);

      if (!isCurrentlyOnline) {
        setSharedError('Working offline - please check your connection');
      } else {
        setSharedError(null);
      }
    } catch (err) {
      console.error('Error loading shared projects:', err);
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

      // Enhanced data validation and sanitization
      let sharedProjectsData = [];

      if (Array.isArray(response)) {
        sharedProjectsData = response;
      } else if (response && typeof response === 'object' && response.data) {
        sharedProjectsData = response.data;
      } else if (response && typeof response === 'object') {
        // Handle case where response is an object but not in expected format
        sharedProjectsData = Array.isArray(response) ? response : [];
      } else {
        console.warn('Unexpected shared projects response format:', response);
        sharedProjectsData = [];
      }

      // Ensure we have a valid array and filter out any invalid entries
      const validSharedProjects = Array.isArray(sharedProjectsData)
        ? sharedProjectsData.filter(project => {
            // Enhanced validation for project objects
            return project &&
                   typeof project === 'object' &&
                   project._id &&
                   typeof project._id === 'string' &&
                   project.name &&
                   typeof project.name === 'string';
          })
        : [];

      const previousCount = sharedProjects.length;
      const newCount = validSharedProjects.length;

      setSharedProjects(validSharedProjects);
      lastSharedLoadTime.current = Date.now();

      // Show notification if requested and there are changes
      if (showNotification && previousCount !== newCount) {
        // This will be handled by the Dashboard component
        return { previousCount, newCount };
      }
    } catch (err) {
      console.error('Error refreshing shared projects:', err);
      // Don't set error state for refresh operations to avoid disrupting UI
    }
  }, [sharedProjects.length]);

  const createProject = useCallback(async (projectData) => {
    try {
      setError(null);
      const response = await apiService.createProject(projectData);
      // Handle both direct object response and response.data format
      const newProject = response?.data || response;
      setProjects(prev => [...prev, newProject]);

      // Refresh shared projects to reflect any changes
      await refreshSharedProjects();

      return newProject;
    } catch (err) {
      setError('Failed to create project. Please try again.');
      throw err;
    }
  }, [refreshSharedProjects]);

  const updateProject = useCallback(async (id, projectData) => {
    try {
      setError(null);
      const response = await apiService.updateProject(id, projectData);
      // Handle both direct object response and response.data format
      const updatedProject = response?.data || response;
      setProjects(prev => prev.map(project =>
        project._id === id ? updatedProject : project
      ));

      // Refresh shared projects to reflect any changes
      await refreshSharedProjects();

      return updatedProject;
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

  // Initial data load - only load once on mount
  useEffect(() => {
    if (!hasLoadedProjects.current) {
      loadProjects();
    }
    if (!hasLoadedSharedProjects.current) {
      loadSharedProjects();
    }
  }, []); // Empty dependency array to only run once on mount

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
