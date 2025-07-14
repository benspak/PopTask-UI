import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

export const useJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Fetch jobs with filters
  const fetchJobs = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      // Add pagination
      params.append('page', filters.page || pagination.page);
      params.append('limit', filters.limit || pagination.limit);

      // Add filters
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.type) params.append('type', filters.type);
      if (filters.level) params.append('level', filters.level);
      if (filters.locationType) params.append('locationType', filters.locationType);
      if (filters.status) params.append('status', filters.status);
      if (filters.companyId) params.append('companyId', filters.companyId);

      const response = await apiService.getJobs(filters);

      if (response.success) {
        setJobs(response.data);
        setPagination(response.pagination);
      } else {
        setError(response.error || 'Failed to fetch jobs');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  // Fetch public jobs
  const fetchPublicJobs = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      // Add pagination
      params.append('page', filters.page || pagination.page);
      params.append('limit', filters.limit || pagination.limit);

      // Add filters
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.type) params.append('type', filters.type);
      if (filters.level) params.append('level', filters.level);
      if (filters.locationType) params.append('locationType', filters.locationType);
      if (filters.companyId) params.append('companyId', filters.companyId);

      const response = await apiService.getPublicJobs(filters);

      if (response.success) {
        setJobs(response.data);
        setPagination(response.pagination);
      } else {
        setError(response.error || 'Failed to fetch jobs');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  // Get a single job
  const getJob = useCallback(async (jobId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getJob(jobId);

      if (response.success) {
        return response.data;
      } else {
        setError(response.error || 'Failed to fetch job');
        return null;
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch job');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get a public job by slug
  const getPublicJob = useCallback(async (slug) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getPublicJob(slug);

      if (response.success) {
        return response.data;
      } else {
        setError(response.error || 'Failed to fetch job');
        return null;
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch job');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new job
  const createJob = useCallback(async (jobData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.createJob(jobData);

      if (response.success) {
        setJobs(prev => [response.data, ...prev]);
        return response.data;
      } else {
        setError(response.error || 'Failed to create job');
        return null;
      }
    } catch (err) {
      setError(err.message || 'Failed to create job');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a job
  const updateJob = useCallback(async (jobId, jobData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.updateJob(jobId, jobData);

      if (response.success) {
        setJobs(prev => prev.map(job =>
          job._id === jobId ? response.data : job
        ));
        return response.data;
      } else {
        setError(response.error || 'Failed to update job');
        return null;
      }
    } catch (err) {
      setError(err.message || 'Failed to update job');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update job status
  const updateJobStatus = useCallback(async (jobId, status) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.updateJobStatus(jobId, status);

      if (response.success) {
        setJobs(prev => prev.map(job =>
          job._id === jobId ? response.data : job
        ));
        return response.data;
      } else {
        setError(response.error || 'Failed to update job status');
        return null;
      }
    } catch (err) {
      setError(err.message || 'Failed to update job status');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a job
  const deleteJob = useCallback(async (jobId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.deleteJob(jobId);

      if (response.success) {
        setJobs(prev => prev.filter(job => job._id !== jobId));
        return true;
      } else {
        setError(response.error || 'Failed to delete job');
        return false;
      }
    } catch (err) {
      setError(err.message || 'Failed to delete job');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply for a job
  const applyForJob = useCallback(async (jobId, applicationData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.applyForJob(jobId, applicationData);

      if (response.success) {
        return true;
      } else {
        setError(response.error || 'Failed to submit application');
        return false;
      }
    } catch (err) {
      setError(err.message || 'Failed to submit application');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get job applications
  const getJobApplications = useCallback(async (jobId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getJobApplications(jobId);

      if (response.success) {
        return response.data;
      } else {
        setError(response.error || 'Failed to fetch applications');
        return [];
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch applications');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Update application status
  const updateApplicationStatus = useCallback(async (jobId, applicationId, status, notes) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.updateJobApplication(jobId, applicationId, status);

      if (response.success) {
        return response.data;
      } else {
        setError(response.error || 'Failed to update application status');
        return null;
      }
    } catch (err) {
      setError(err.message || 'Failed to update application status');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refresh jobs
  const refreshJobs = useCallback(() => {
    fetchJobs();
  }, [fetchJobs]);

  return {
    jobs,
    loading,
    error,
    pagination,
    fetchJobs,
    fetchPublicJobs,
    getJob,
    getPublicJob,
    createJob,
    updateJob,
    updateJobStatus,
    deleteJob,
    applyForJob,
    getJobApplications,
    updateApplicationStatus,
    clearError,
    refreshJobs
  };
};
