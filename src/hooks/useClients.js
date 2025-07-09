import { useState, useCallback } from 'react';
import apiService from '../services/api';

export const useClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

    const loadClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getClients();
      // Handle both direct array response and response.data
      const clientsData = Array.isArray(response) ? response : (response.data || []);
      console.log('API Response:', response);
      console.log('Clients data:', clientsData);
      setClients(clientsData);
    } catch (err) {
      setError(err.message || 'Failed to load clients');
      console.error('Error loading clients:', err);
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
      console.log('Create client response:', response);
      console.log('New client:', newClient);
      setClients(prev => [...prev, newClient]);
      return newClient;
    } catch (err) {
      setError(err.message || 'Failed to create client');
      console.error('Error creating client:', err);
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
      console.error('Error updating client:', err);
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
      console.error('Error deleting client:', err);
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
