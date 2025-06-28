import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  // Load tasks from backend or offline storage
  const loadTasks = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getTasks(filters);
      setTasks(response.data || []);
      setIsOffline(false);
    } catch (err) {
      if (err.message === 'OFFLINE_MODE') {
        // Load from offline storage
        const offlineTasks = apiService.getOfflineTasks();
        setTasks(offlineTasks);
        setIsOffline(true);
        setError('Working offline - changes will sync when connection is restored');
      } else {
        // Provide user-friendly error message
        const errorMessage = err.message.includes('Unable to connect') || err.message.includes('Server is currently unavailable')
          ? 'Unable to connect to server. Working in offline mode.'
          : 'Failed to load tasks. Working in offline mode.';
        setError(errorMessage);
        // Load offline tasks as fallback
        const offlineTasks = apiService.getOfflineTasks();
        setTasks(offlineTasks);
        setIsOffline(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new task
  const createTask = useCallback(async (taskData) => {
    try {
      setError(null);
      const response = await apiService.createTask(taskData);

      if (response.data.isOffline) {
        // Task was created offline
        setTasks(prev => [...prev, response.data]);
        setIsOffline(true);
        setError('Task created offline - will sync when connection is restored');
      } else {
        // Task was created online
      setTasks(prev => [...prev, response.data]);
        setIsOffline(false);
      }

      return response.data;
    } catch (err) {
      if (err.message === 'OFFLINE_MODE') {
        // Create offline task
        const offlineTask = apiService.getOfflineTasks().find(t =>
          t.title === taskData.title && t.isOffline
        );
        if (offlineTask) {
          setTasks(prev => [...prev, offlineTask]);
          setIsOffline(true);
          setError('Task created offline - will sync when connection is restored');
          return offlineTask;
        }
      }
      setError('Failed to create task. Please try again.');
      throw err;
    }
  }, []);

  // Update task
  const updateTask = useCallback(async (id, taskData) => {
    try {
      setError(null);
      const response = await apiService.updateTask(id, taskData);

      if (response.data.isOffline) {
        // Task was updated offline
        setTasks(prev => prev.map(task =>
          task._id === id ? response.data : task
        ));
        setIsOffline(true);
        setError('Task updated offline - will sync when connection is restored');
      } else {
        // Task was updated online
      setTasks(prev => prev.map(task =>
        task._id === id ? response.data : task
      ));
        setIsOffline(false);
      }

      return response.data;
    } catch (err) {
      if (err.message === 'OFFLINE_MODE') {
        // Update offline task - get the latest from storage
        const offlineTasks = apiService.getOfflineTasks();
        const updatedTask = offlineTasks.find(t => t._id === id);
        if (updatedTask) {
          setTasks(prev => prev.map(task =>
            task._id === id ? updatedTask : task
          ));
          setIsOffline(true);
          setError('Task updated offline - will sync when connection is restored');
          return updatedTask;
        } else {
          // Task not found in offline storage, this shouldn't happen with our improved API
          setError('Task not found in offline storage');
          throw new Error('Task not found');
        }
      }
      setError('Failed to update task. Please try again.');
      throw err;
    }
  }, []);

  // Delete task
  const deleteTask = useCallback(async (id) => {
    try {
      setError(null);
      const response = await apiService.deleteTask(id);

      // Check if the response indicates success (even for "not found" cases)
      if (response.success) {
        // Task was deleted successfully (or already didn't exist)
        setTasks(prev => prev.filter(task => task._id !== id));

        if (response.isOffline) {
          setIsOffline(true);
          setError('Task deleted offline - will sync when connection is restored');
        } else {
          setIsOffline(false);
        }

        return response;
      } else {
        // Handle unexpected response format
        setError('Failed to delete task. Please try again.');
        throw new Error('Unexpected response from server');
      }
    } catch (err) {
      if (err.message === 'OFFLINE_MODE') {
        // Delete offline task
        setTasks(prev => prev.filter(task => task._id !== id));
        setIsOffline(true);
        setError('Task deleted offline - will sync when connection is restored');
      } else {
        // Check if it's a "not found" error that we should handle gracefully
        if (err.message && err.message.includes('Task not found')) {
          console.log('Task not found, removing from local state');
          setTasks(prev => prev.filter(task => task._id !== id));
          return { success: true, message: 'Task deleted or not found' };
        }

        setError('Failed to delete task. Please try again.');
        throw err;
      }
    }
  }, []);

  // Toggle task completion
  const toggleTaskCompletion = useCallback(async (id) => {
    try {
      setError(null);
      const response = await apiService.toggleTaskCompletion(id);

      if (response.data.isOffline) {
        // Task was toggled offline
        setTasks(prev => prev.map(task =>
          task._id === id ? response.data : task
        ));
        setIsOffline(true);
        setError('Task updated offline - will sync when connection is restored');
      } else {
        // Task was toggled online
      setTasks(prev => prev.map(task =>
        task._id === id ? response.data : task
      ));
        setIsOffline(false);
      }

      return response.data;
    } catch (err) {
      if (err.message === 'OFFLINE_MODE') {
        // Toggle offline task
        const toggledTask = apiService.getOfflineTasks().find(t => t._id === id);
        if (toggledTask) {
          setTasks(prev => prev.map(task =>
            task._id === id ? toggledTask : task
          ));
          setIsOffline(true);
          setError('Task updated offline - will sync when connection is restored');
          return toggledTask;
        }
      }
      setError('Failed to update task completion. Please try again.');
      throw err;
    }
  }, []);

  // Sync offline data
  const syncOfflineData = useCallback(async () => {
    try {
      await apiService.syncOfflineData();
      // Reload tasks after sync
      await loadTasks();
      setIsOffline(false);
      setError(null);
    } catch (err) {
      setError('Failed to sync offline data. Please try again later.');
    }
  }, [loadTasks]);

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return {
    tasks,
    loading,
    error,
    isOffline,
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    syncOfflineData,
  };
};
