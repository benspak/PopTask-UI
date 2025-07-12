import { useState, useCallback, useRef } from 'react';
import apiService from '../services/api';

export const useClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add refs to track if data has been loaded and when
  const hasLoadedClients = useRef(false);
  const lastLoadTime = useRef(0);

  const loadClients = useCallback(async (forceRefresh = false) => {
    // Don't reload if data was loaded recently (within 30 seconds) unless forced
    const now = Date.now();
    if (!forceRefresh && hasLoadedClients.current && (now - lastLoadTime.current) < 30000) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getClients();
      // Handle both direct array response and response.data
      const clientsData = Array.isArray(response) ? response : (response.data || []);
      setClients(clientsData);
      hasLoadedClients.current = true;
      lastLoadTime.current = now;
    } catch (err) {
      setError(err.message || 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  }, []);

  const createClient = useCallback(async (clientData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.createClient(clientData);
      // Handle both direct object response and response.data
      const newClient = response.data || response;
      setClients(prev => [...prev, newClient]);
      return newClient;
    } catch (err) {
      setError(err.message || 'Failed to create client');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateClient = useCallback(async (clientId, clientData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.updateClient(clientId, clientData);
      // Handle both direct object response and response.data
      const updatedClient = response.data || response;
      setClients(prev => prev.map(client =>
        client._id === clientId ? updatedClient : client
      ));
      return updatedClient;
    } catch (err) {
      setError(err.message || 'Failed to update client');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteClient = useCallback(async (clientId) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.deleteClient(clientId);
      setClients(prev => prev.filter(client => client._id !== clientId));
    } catch (err) {
      setError(err.message || 'Failed to delete client');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    clients,
    loading,
    error,
    loadClients,
    createClient,
    updateClient,
    deleteClient,
  };
};
