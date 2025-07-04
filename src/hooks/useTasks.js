import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [sharedTasks, setSharedTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sharedLoading, setSharedLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sharedError, setSharedError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  const loadTasks = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getTasks(filters);
      setTasks(response.data || []);

      // Check online status
      const isCurrentlyOnline = await apiService.checkServerConnection();
      setIsOffline(!isCurrentlyOnline);

      if (!isCurrentlyOnline) {
        setError('Working offline - please check your connection');
      } else {
        setError(null);
      }
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError('Failed to load tasks. Please check your connection.');
      setTasks([]);
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSharedTasks = useCallback(async () => {
    try {
      setSharedLoading(true);
      setSharedError(null);

      const response = await apiService.getSharedTasks();
      setSharedTasks(response.data || []);

      // Check online status
      const isCurrentlyOnline = await apiService.checkServerConnection();
      setIsOffline(!isCurrentlyOnline);

      if (!isCurrentlyOnline) {
        setSharedError('Working offline - please check your connection');
      } else {
        setSharedError(null);
      }
    } catch (err) {
      console.error('❌ Error loading shared tasks:', err);
      setSharedError('Failed to load shared tasks. Please check your connection.');
      setSharedTasks([]);
      setIsOffline(true);
    } finally {
      setSharedLoading(false);
    }
  }, []);

  const refreshSharedTasks = useCallback(async (showNotification = false) => {
    try {
      const response = await apiService.getSharedTasks();
      const previousCount = sharedTasks.length;
      const newCount = response.data?.length || 0;

      setSharedTasks(response.data || []);

      // Show notification if requested and there are changes
      if (showNotification && previousCount !== newCount) {
        // This will be handled by the Dashboard component
        return { previousCount, newCount };
      }
    } catch (err) {
      console.error('Error refreshing shared tasks:', err);
      // Don't set error state for refresh operations to avoid disrupting UI
    }
  }, [sharedTasks.length]);

  const createTask = useCallback(async (taskData) => {
    try {
      setError(null);
      const response = await apiService.createTask(taskData);
      setTasks(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError('Failed to create task. Please try again.');
      throw err;
    }
  }, []);

  const updateTask = useCallback(async (id, taskData) => {
    try {
      setError(null);
      const response = await apiService.updateTask(id, taskData);
      setTasks(prev => prev.map(task =>
        task._id === id ? response.data : task
      ));

      // Refresh shared tasks to reflect any changes
      await refreshSharedTasks();

      return response.data;
    } catch (err) {
      setError('Failed to update task. Please try again.');
      throw err;
    }
  }, [refreshSharedTasks]);

  const deleteTask = useCallback(async (id) => {
    try {
      setError(null);
      await apiService.deleteTask(id);
      setTasks(prev => prev.filter(task => task._id !== id));

      // Refresh shared tasks to reflect any changes
      await refreshSharedTasks();

      return { success: true };
    } catch (err) {
      setError('Failed to delete task. Please try again.');
      throw err;
    }
  }, [refreshSharedTasks]);

  const toggleTaskCompletion = useCallback(async (id) => {
    try {
      setError(null);
      const response = await apiService.toggleTaskCompletion(id);
      setTasks(prev => prev.map(task =>
        task._id === id ? response.data : task
      ));

      // Refresh shared tasks to reflect any changes
      await refreshSharedTasks();

      return response.data;
    } catch (err) {
      setError('Failed to update task completion. Please try again.');
      throw err;
    }
  }, [refreshSharedTasks]);

  // Initial data load
  useEffect(() => {
    loadTasks();
    loadSharedTasks();
  }, [loadTasks, loadSharedTasks]);

  return {
    tasks,
    sharedTasks,
    loading,
    sharedLoading,
    error,
    sharedError,
    isOffline,
    loadTasks,
    loadSharedTasks,
    refreshSharedTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
  };
};
