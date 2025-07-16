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
    // Don't reload if data was loaded recently (within cache time) unless forced
    const now = Date.now();
    const cacheTime = import.meta.env.DEV ? 30000 : 30000; // 30s in both dev and prod

    if (!forceRefresh && hasLoadedClients.current && (now - lastLoadTime.current) < cacheTime) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getClients();
      // The API service already extracts the data property, so response is the clients array
      const clientsData = response || [];

      // Ensure we have a valid array and filter out any invalid entries
      const validClients = Array.isArray(clientsData)
        ? clientsData.filter(client => client && typeof client === 'object' && client._id)
        : [];

      setClients(validClients || []);
      hasLoadedClients.current = true;
      lastLoadTime.current = now;
    } catch (err) {
      setError(err.message || 'Failed to load clients');
      setClients([]); // Ensure clients is always an array even if loading fails
    } finally {
      setLoading(false);
    }
  }, []);

  const createClient = useCallback(async (clientData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.createClient(clientData);
      // The API service already extracts the data property
      const newClient = response;

      // Ensure we have a valid client object
      if (newClient && typeof newClient === 'object' && newClient._id) {
        setClients(prev => [...prev, newClient]);
        return newClient;
      } else {
        throw new Error('Invalid client data received from server');
      }
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
      // The API service already extracts the data property
      const updatedClient = response;

      // Ensure we have a valid client object
      if (updatedClient && typeof updatedClient === 'object' && updatedClient._id) {
        setClients(prev => prev.map(client =>
          client._id === clientId ? updatedClient : client
        ));
        return updatedClient;
      } else {
        throw new Error('Invalid client data received from server');
      }
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
