import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

export const useCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Fetch companies
  const fetchCompanies = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        ...(params.search && { search: params.search }),
        ...(params.industry && { industry: params.industry }),
        ...(params.size && { size: params.size }),
        includeVerified: params.includeVerified !== false ? 'true' : 'false' // Default to true
      });

      const response = await apiService.getCompanies({
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search,
        industry: params.industry,
        size: params.size,
        includeVerified: params.includeVerified !== false ? 'true' : 'false' // Default to true
      });

      if (response.success) {
        setCompanies(response.data);
        setPagination(response.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create company
  const createCompany = async (companyData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.createCompany(companyData);

      if (response.success) {
        setCompanies(prev => [response.data, ...prev]);
        return { success: true, data: response.data };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to create company';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Update company
  const updateCompany = async (id, companyData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.updateCompany(id, companyData);

      if (response.success) {
        setCompanies(prev =>
          prev.map(company =>
            company._id === id ? response.data : company
          )
        );
        return { success: true, data: response.data };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to update company';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Delete company
  const deleteCompany = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.deleteCompany(id);

      if (response.success) {
        setCompanies(prev => prev.filter(company => company._id !== id));
        return { success: true };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to delete company';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Request verification
  const requestVerification = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.requestCompanyVerification(id);

      if (response.success) {
        return { success: true, message: response.message };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to request verification';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Generate public link
  const generatePublicLink = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.generateCompanyPublicLink(id);

      if (response.success) {
        return { success: true, data: response.data };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to generate public link';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Get company by ID
  const getCompany = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getCompany(id);

      if (response.success) {
        return { success: true, data: response.data };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch company';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Get company statistics
  const getCompanyStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getCompanyStats();

      if (response.success) {
        return { success: true, data: response.data };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch company statistics';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Fetch verified companies (public)
  const fetchVerifiedCompanies = async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 20,
        ...(params.search && { search: params.search }),
        ...(params.industry && { industry: params.industry }),
        ...(params.country && { country: params.country })
      });

      const response = await apiService.getVerifiedCompanies({
        page: params.page || 1,
        limit: params.limit || 20,
        search: params.search,
        industry: params.industry,
        country: params.country
      });

      if (response.success) {
        return {
          success: true,
          data: response.data,
          pagination: response.pagination
        };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch verified companies';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Verify company by token
  const verifyCompany = async (token) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.verifyCompany(token);

      if (response.success) {
        return { success: true, data: response.data };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to verify company';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Get public company by slug and token
  const getPublicCompany = async (slug, token) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getPublicCompany(slug, token);

      if (response.success) {
        return { success: true, data: response.data };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch company details';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return {
    companies,
    loading,
    error,
    pagination,
    fetchCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
    requestVerification,
    generatePublicLink,
    getCompany,
    getCompanyStats,
    fetchVerifiedCompanies,
    verifyCompany,
    getPublicCompany,
    clearError
  };
};
