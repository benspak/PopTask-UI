import { useState, useEffect, useCallback, useRef } from 'react';
import apiService from '../services/api';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [sharedTasks, setSharedTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sharedLoading, setSharedLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sharedError, setSharedError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  // Add refs to track if data has been loaded and when
  const hasLoadedTasks = useRef(false);
  const hasLoadedSharedTasks = useRef(false);
  const lastLoadTime = useRef(0);
  const lastSharedLoadTime = useRef(0);

  const dismissError = useCallback(() => {
    setError(null);
  }, []);

  const dismissSharedError = useCallback(() => {
    setSharedError(null);
  }, []);

  const loadTasks = useCallback(async (filters = {}, forceRefresh = false) => {
    // Don't reload if data was loaded recently (within cache time) unless forced
    const now = Date.now();
    const cacheTime = import.meta.env.DEV ? 30000 : 30000; // 30s in both dev and prod

    if (!forceRefresh && hasLoadedTasks.current && (now - lastLoadTime.current) < cacheTime) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getTasks(filters);
      // Handle both direct array response and response.data format
      const tasksData = Array.isArray(response) ? response : (response?.data || []);
      setTasks(tasksData);
      hasLoadedTasks.current = true;
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
      setError('Failed to load tasks. Please check your connection.');
      setTasks([]);
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSharedTasks = useCallback(async (forceRefresh = false) => {
    // Don't reload if data was loaded recently (within 30 seconds) unless forced
    const now = Date.now();
    if (!forceRefresh && hasLoadedSharedTasks.current && (now - lastSharedLoadTime.current) < 30000) {
      return;
    }

    try {
      setSharedLoading(true);
      setSharedError(null);

      const response = await apiService.getSharedTasks();
      // Handle both direct array response and response.data format
      const sharedTasksData = Array.isArray(response) ? response : (response?.data || []);
      setSharedTasks(sharedTasksData);
      hasLoadedSharedTasks.current = true;
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
      // Handle both direct array response and response.data format
      const sharedTasksData = Array.isArray(response) ? response : (response?.data || []);
      const previousCount = sharedTasks.length;
      const newCount = sharedTasksData.length;

      setSharedTasks(sharedTasksData);
      lastSharedLoadTime.current = Date.now();

      // Show notification if requested and there are changes
      if (showNotification && previousCount !== newCount) {
        // This will be handled by the Dashboard component
        return { previousCount, newCount };
      }
    } catch (err) {
      // Don't set error state for refresh operations to avoid disrupting UI
    }
  }, [sharedTasks.length]);

  const createTask = useCallback(async (taskData) => {
    try {
      setError(null);
      const response = await apiService.createTask(taskData);
      // Handle both direct object response and response.data format
      const newTask = response?.data || response;
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (err) {
      setError('Failed to create task. Please try again.');
      throw err;
    }
  }, []);

  const updateTask = useCallback(async (id, taskData) => {
    try {
      setError(null);
      const response = await apiService.updateTask(id, taskData);
      // Handle both direct object response and response.data format
      const updatedTask = response?.data || response;
      setTasks(prev => prev.map(task =>
        task._id === id ? updatedTask : task
      ));

      // Refresh shared tasks to reflect any changes
      await refreshSharedTasks();

      return updatedTask;
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
      // Handle both direct object response and response.data format
      const updatedTask = response?.data || response;
      setTasks(prev => prev.map(task =>
        task._id === id ? updatedTask : task
      ));

      // Refresh shared tasks to reflect any changes
      await refreshSharedTasks();

      return updatedTask;
    } catch (err) {
      setError('Failed to update task completion. Please try again.');
      throw err;
    }
  }, [refreshSharedTasks]);

  // Initial data load - only load once on mount
  useEffect(() => {
    if (!hasLoadedTasks.current) {
      loadTasks();
    }
    if (!hasLoadedSharedTasks.current) {
      loadSharedTasks();
    }
  }, []); // Empty dependency array to only run once on mount

  return {
    tasks,
    sharedTasks,
    loading,
    sharedLoading,
    error,
    sharedError,
    isOffline,
    dismissError,
    dismissSharedError,
    loadTasks,
    loadSharedTasks,
    refreshSharedTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
  };
};
