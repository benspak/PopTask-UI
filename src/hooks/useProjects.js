import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load projects from backend
  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getProjects();
      setProjects(response.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new project
  const createProject = useCallback(async (projectData) => {
    try {
      setError(null);
      const response = await apiService.createProject(projectData);
      setProjects(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err.message);
      console.error('Failed to create project:', err);
      throw err;
    }
  }, []);

  // Update project
  const updateProject = useCallback(async (id, projectData) => {
    try {
      setError(null);
      const response = await apiService.updateProject(id, projectData);
      setProjects(prev => prev.map(project =>
        project.id === id ? response.data : project
      ));
      return response.data;
    } catch (err) {
      setError(err.message);
      console.error('Failed to update project:', err);
      throw err;
    }
  }, []);

  // Delete project
  const deleteProject = useCallback(async (id) => {
    try {
      setError(null);
      await apiService.deleteProject(id);
      setProjects(prev => prev.filter(project => project.id !== id));
    } catch (err) {
      setError(err.message);
      console.error('Failed to delete project:', err);
      throw err;
    }
  }, []);

  // Get project by ID
  const getProject = useCallback((id) => {
    return projects.find(project => project.id === id);
  }, [projects]);

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return {
    projects,
    loading,
    error,
    loadProjects,
    createProject,
    updateProject,
    deleteProject,
    getProject,
  };
};
