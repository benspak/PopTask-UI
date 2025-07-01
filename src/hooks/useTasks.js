import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
      return response.data;
    } catch (err) {
      setError('Failed to update task. Please try again.');
      throw err;
    }
  }, []);

  const deleteTask = useCallback(async (id) => {
    try {
      setError(null);
      await apiService.deleteTask(id);
      setTasks(prev => prev.filter(task => task._id !== id));
      return { success: true };
    } catch (err) {
      setError('Failed to delete task. Please try again.');
      throw err;
    }
  }, []);

  const toggleTaskCompletion = useCallback(async (id) => {
    try {
      setError(null);
      const response = await apiService.toggleTaskCompletion(id);
      setTasks(prev => prev.map(task =>
        task._id === id ? response.data : task
      ));
      return response.data;
    } catch (err) {
      setError('Failed to update task completion. Please try again.');
      throw err;
    }
  }, []);

  // Initial data load
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
  };
};
