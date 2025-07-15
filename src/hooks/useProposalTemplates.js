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

      const response = await apiService.getProposalTemplates({
        page: params.page || pagination.page,
        limit: params.limit || pagination.limit,
        search: params.search,
        category: params.category,
        tags: params.tags
      });

      if (response.success) {
        setTemplates(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
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

      const response = await apiService.getPublicProposalTemplates({
        page: params.page || pagination.page,
        limit: params.limit || pagination.limit,
        search: params.search,
        category: params.category,
        tags: params.tags
      });

      if (response.success) {
        setTemplates(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
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

      const response = await apiService.createProposalTemplate(templateData);

      if (response.success) {
        // Refresh the templates list
        await loadTemplates();
        return response.data;
      }
    } catch (error) {
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

      const response = await apiService.updateProposalTemplate(templateId, templateData);

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

      const response = await apiService.deleteProposalTemplate(templateId);

      if (response.success) {
        // Remove the template from the list
        setTemplates(prev => prev.filter(template => template._id !== templateId));
        return response;
      }
    } catch (error) {
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

      const response = await apiService.duplicateProposalTemplate(templateId);

      if (response.success) {
        // Refresh the templates list
        await loadTemplates();
        return response.data;
      }
    } catch (error) {
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

      const response = await apiService.generateProposalFromTemplate(templateId, {
        variables
      });

      if (response.success) {
        return response.data;
      }
    } catch (error) {
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

      const response = await apiService.getProposalTemplate(templateId);

      if (response.success) {
        return response.data;
      }
    } catch (error) {
      setError('Failed to get template');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCategories = useCallback(async () => {
    try {
      const response = await apiService.getProposalTemplateCategories();

      if (response.success) {
        return response.data;
      }
    } catch (error) {
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
