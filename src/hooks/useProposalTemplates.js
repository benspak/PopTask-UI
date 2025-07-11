import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

export const useProposalTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  const loadTemplates = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: params.page || pagination.page,
        limit: params.limit || pagination.limit
      });

      if (params.search) queryParams.append('search', params.search);
      if (params.category) queryParams.append('category', params.category);
      if (params.tags) queryParams.append('tags', params.tags);

      const response = await apiService.get(`/api/proposal-templates?${queryParams}`);

      if (response.success) {
        setTemplates(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
      setError('Failed to load templates');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  const loadPublicTemplates = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: params.page || pagination.page,
        limit: params.limit || pagination.limit
      });

      if (params.search) queryParams.append('search', params.search);
      if (params.category) queryParams.append('category', params.category);
      if (params.tags) queryParams.append('tags', params.tags);

      const response = await apiService.get(`/api/proposal-templates/public?${queryParams}`);

      if (response.success) {
        setTemplates(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Failed to load public templates:', error);
      setError('Failed to load public templates');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  const createTemplate = useCallback(async (templateData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.post('/api/proposal-templates', templateData);

      if (response.success) {
        // Refresh the templates list
        await loadTemplates();
        return response.data;
      }
    } catch (error) {
      console.error('Failed to create template:', error);
      setError('Failed to create template');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadTemplates]);

  const updateTemplate = useCallback(async (templateId, templateData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.put(`/api/proposal-templates/${templateId}`, templateData);

      if (response.success) {
        // Update the template in the list
        setTemplates(prev =>
          prev.map(template =>
            template._id === templateId ? response.data : template
          )
        );
        return response.data;
      }
    } catch (error) {
      console.error('Failed to update template:', error);
      setError('Failed to update template');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTemplate = useCallback(async (templateId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.delete(`/api/proposal-templates/${templateId}`);

      if (response.success) {
        // Remove the template from the list
        setTemplates(prev => prev.filter(template => template._id !== templateId));
        return response;
      }
    } catch (error) {
      console.error('Failed to delete template:', error);
      setError('Failed to delete template');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const duplicateTemplate = useCallback(async (templateId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.post(`/api/proposal-templates/${templateId}/duplicate`);

      if (response.success) {
        // Refresh the templates list
        await loadTemplates();
        return response.data;
      }
    } catch (error) {
      console.error('Failed to duplicate template:', error);
      setError('Failed to duplicate template');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadTemplates]);

  const generateProposal = useCallback(async (templateId, variables) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.post(`/api/proposal-templates/${templateId}/generate`, {
        variables
      });

      if (response.success) {
        return response.data;
      }
    } catch (error) {
      console.error('Failed to generate proposal:', error);
      setError('Failed to generate proposal');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTemplate = useCallback(async (templateId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.get(`/api/proposal-templates/${templateId}`);

      if (response.success) {
        return response.data;
      }
    } catch (error) {
      console.error('Failed to get template:', error);
      setError('Failed to get template');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCategories = useCallback(async () => {
    try {
      const response = await apiService.get('/api/proposal-templates/categories');

      if (response.success) {
        return response.data;
      }
    } catch (error) {
      console.error('Failed to get categories:', error);
      throw error;
    }
  }, []);

  return {
    templates,
    loading,
    error,
    pagination,
    loadTemplates,
    loadPublicTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    generateProposal,
    getTemplate,
    getCategories
  };
};
