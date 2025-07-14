import { useState, useEffect, useCallback, useRef } from 'react';
import apiService from '../services/api';

export const useDashboardData = () => {
  const [dashboardData, setDashboardData] = useState({
    tasks: [],
    projects: [],
    sharedTasks: [],
    sharedProjects: [],
    clients: [],
    companies: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  // Add refs to track if data has been loaded and when
  const hasLoadedData = useRef(false);
  const lastLoadTime = useRef(0);

  const loadDashboardData = useCallback(async (forceRefresh = false) => {
    // Don't reload if data was loaded recently (within cache time) unless forced
    const now = Date.now();
    const cacheTime = import.meta.env.DEV ? 120000 : 60000; // 2 min in dev, 1 min in prod

    if (!forceRefresh && hasLoadedData.current && (now - lastLoadTime.current) < cacheTime) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Try to get all data in one batch request first
      try {
        const batchResponse = await apiService.getDashboardData();
        if (batchResponse.success && batchResponse.data) {
          setDashboardData(batchResponse.data);
          hasLoadedData.current = true;
          lastLoadTime.current = now;
          return;
        }
      } catch (batchError) {
        // Fall back to individual requests if batch request fails
        console.log('Batch request failed, falling back to individual requests');
      }

      // Fallback to individual requests
      const requests = [
        () => apiService.getTasks(),
        () => apiService.getProjects(),
        () => apiService.getSharedTasks(),
        () => apiService.getSharedProjects(),
        () => apiService.getClients(),
        () => apiService.getCompanies()
      ];

      const results = await apiService.batchRequests(requests);

      const newData = {
        tasks: results[0].status === 'fulfilled' ? (results[0].value?.data || []) : [],
        projects: results[1].status === 'fulfilled' ? (results[1].value?.data || []) : [],
        sharedTasks: results[2].status === 'fulfilled' ? (results[2].value?.data || []) : [],
        sharedProjects: results[3].status === 'fulfilled' ? (results[3].value?.data || []) : [],
        clients: results[4].status === 'fulfilled' ? (results[4].value?.data || results[4].value || []) : [],
        companies: results[5].status === 'fulfilled' ? (results[5].value?.data || []) : []
      };

      setDashboardData(newData);
      hasLoadedData.current = true;
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
      setError('Failed to load dashboard data. Please check your connection.');
      setDashboardData({
        tasks: [],
        projects: [],
        sharedTasks: [],
        sharedProjects: [],
        clients: [],
        companies: []
      });
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const dismissError = useCallback(() => {
    setError(null);
  }, []);

  // Initial data load - only load once on mount
  useEffect(() => {
    if (!hasLoadedData.current) {
      loadDashboardData();
    }
  }, [loadDashboardData]);

  return {
    ...dashboardData,
    loading,
    error,
    isOffline,
    dismissError,
    loadDashboardData,
    refreshData: () => loadDashboardData(true)
  };
};
