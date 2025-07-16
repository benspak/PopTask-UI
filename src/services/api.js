// Environment-based API configuration
const getApiBaseUrl = () => {
  // Use VITE_API_BASE_URL if set, otherwise default to localhost:3001/api
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();

// Simple notification system for online/offline events
const OfflineNotifications = {
  listeners: new Set(),

  // Add a listener for offline notifications
  addListener(callback) {
    this.listeners.add(callback);
  },

  // Remove a listener
  removeListener(callback) {
    this.listeners.delete(callback);
  },

  // Trigger a notification
  notify(type, data) {
    this.listeners.forEach(callback => {
      try {
        callback(type, data);
      } catch (error) {
        // Error in notification listener handled silently
      }
    });
  },

  // Notify about going offline
  notifyGoingOffline() {
    this.notify('going_offline', {
      timestamp: new Date().toISOString()
    });
  },

  // Notify about coming back online
  notifyBackOnline() {
    this.notify('back_online', {
      timestamp: new Date().toISOString()
    });
  }
};

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.isOnline = navigator.onLine;
    this.onlineCheckInterval = null;
    this.pendingRequests = new Map(); // Add request deduplication
    this.healthCheckCache = null;
    this.healthCheckCacheTime = 0;

    // Set up network status listeners
    window.addEventListener('online', () => {
      this.isOnline = true;
      OfflineNotifications.notifyBackOnline();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      OfflineNotifications.notifyGoingOffline();
    });

    // Start periodic online status check
    this.startPeriodicOnlineCheck();
  }

  // Start periodic online status check
  startPeriodicOnlineCheck() {
    const interval = import.meta.env.DEV ? 30000 : 30000; // 30s in both dev and prod

    this.onlineCheckInterval = setInterval(async () => {
      const wasOnline = this.isOnline;
      const isNowOnline = await this.checkServerConnection();

      if (wasOnline !== isNowOnline) {
        this.isOnline = isNowOnline;
        if (isNowOnline) {
          OfflineNotifications.notifyBackOnline();
        } else {
          OfflineNotifications.notifyGoingOffline();
        }
      }
    }, interval);
  }

  // Stop periodic online status check
  stopPeriodicOnlineCheck() {
    if (this.onlineCheckInterval) {
      clearInterval(this.onlineCheckInterval);
      this.onlineCheckInterval = null;
    }
  }

  // Check if we can reach the server with caching
  async checkServerConnection() {
    try {
      if (!navigator.onLine) {
        return false;
      }

      // Use cached health check result if recent
      const now = Date.now();
      const cacheTime = import.meta.env.DEV ? 10000 : 5000; // 10s in dev, 5s in prod
      if (this.healthCheckCache && (now - this.healthCheckCacheTime) < cacheTime) {
        return this.healthCheckCache;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), import.meta.env.DEV ? 2000 : 3000); // 2s in dev, 3s in prod

      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        this.healthCheckCache = false;
        this.healthCheckCacheTime = now;
        return false;
      }

      const data = await response.json();
      const isHealthy = data && typeof data.status === 'string' && data.status.toLowerCase() === 'ok';

      this.healthCheckCache = isHealthy;
      this.healthCheckCacheTime = now;
      return isHealthy;
    } catch (error) {
      this.healthCheckCache = false;
      this.healthCheckCacheTime = Date.now();
      return false;
    }
  }

  // Add batch request method for better performance
  async batchRequests(requests) {
    const promises = requests.map(req => req());
    return Promise.allSettled(promises);
  }

  // Add method to get initial dashboard data in one call
  async getDashboardData() {
    return this.request('/dashboard/initial-data');
  }

  // Add health check method with caching
  async healthCheck() {
    try {
      // Use cached result if recent
      const now = Date.now();
      const cacheTime = import.meta.env.DEV ? 5000 : 3000; // 5s in dev, 3s in prod
      if (this.healthCheckCache && (now - this.healthCheckCacheTime) < cacheTime) {
        return { status: this.healthCheckCache ? 'ok' : 'error' };
      }

      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.healthCheckCache = true;
        this.healthCheckCacheTime = now;
        return { status: 'ok', data };
      } else {
        this.healthCheckCache = false;
        this.healthCheckCacheTime = now;
        return { status: 'error', statusCode: response.status };
      }
    } catch (error) {
      this.healthCheckCache = false;
      this.healthCheckCacheTime = Date.now();
      return { status: 'error', message: error.message };
    }
  }

  // Simple request method with deduplication
  async request(endpoint, options = {}) {
    const requestKey = `${endpoint}-${JSON.stringify(options)}`;

    // Check if this request is already pending
    if (this.pendingRequests.has(requestKey)) {
      return this.pendingRequests.get(requestKey);
    }

    const promise = this._makeRequest(endpoint, options);
    this.pendingRequests.set(requestKey, promise);

    try {
      const result = await promise;
      return result;
    } finally {
      this.pendingRequests.delete(requestKey);
    }
  }

  // Internal request method
  async _makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if token exists
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Remove Content-Type for FormData requests
    if (options.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // Reduced from 10s to 8s

    try {
      let response = await fetch(url, {
        ...config,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // If we get a 401 and we have a refresh token, try to refresh
      if (response.status === 401 && token && localStorage.getItem(this.refreshTokenKey)) {
        try {
          const refreshResult = await this.refreshToken();

          // Update the token in the request
          if (refreshResult.token) {
            config.headers.Authorization = `Bearer ${refreshResult.token}`;
            // Retry the original request with the new token
            response = await fetch(url, {
              ...config,
              signal: controller.signal
            });
          }
        } catch (refreshError) {
          // If refresh fails, clear session and throw original error
          this.clearSession();
          throw new Error('Authentication failed. Please login again.');
        }
      }

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();

          // Create a custom error object that preserves the backend error details
          const error = new Error(data.message || data.error || `Server error: ${response.status}`);
          error.status = response.status;
          error.errorType = data.error;
          error.message = data.message || data.error || `Server error: ${response.status}`;
          error.isLimitError = data.error === 'Task limit reached' || data.error === 'Project limit reached';
          error.response = { data, status: response.status };

          throw error;
        } else {
          const error = new Error(`Server error: ${response.status}`);
          error.status = response.status;
          throw error;
        }
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const result = await response.json();

        // Validate and sanitize the response data
        if (result && typeof result === 'object') {
          // Handle backend response format: { success: true, data: [...] }
          if (result.success && result.data !== undefined) {
            return result.data;
          }
          // Handle direct data response
          return result;
        } else {
          // Fallback for unexpected response formats
          return result || null;
        }
      } else {
        return { success: true };
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - server may be unavailable');
      }
      throw error;
    }
  }

  // Add this generic GET method
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  // Authentication methods
  async login(credentials) {
    return await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData) {
    return await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async validateToken() {
    const result = await this.request('/auth/validate');
    return result;
  }

  async getCurrentUser() {
    return await this.request('/auth/me');
  }

  async getPublicProfile(username) {
    return await this.request(`/auth/profile/${username}`);
  }

  async getPublicUserProfile(username) {
    return await this.request(`/auth/users/${username}`);
  }

  async updateProfile(profileData) {
    return await this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async updateProfilePicture(profilePicture) {
    return await this.request('/auth/profile-picture', {
      method: 'PUT',
      body: JSON.stringify({ profilePicture }),
    });
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem(this.refreshTokenKey);
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const result = await this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    return result;
  }

  async logout() {
    try {
      const refreshToken = localStorage.getItem(this.refreshTokenKey);
      const logoutData = {};

      if (refreshToken) {
        logoutData.refreshToken = refreshToken;
      }

      await this.request('/auth/logout', {
        method: 'POST',
        body: JSON.stringify(logoutData),
      });
    } catch (error) {
      // Logout request failed silently
    } finally {
      this.clearSession();
    }
  }

  async forgotPassword(email) {
    return await this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token, newPassword) {
    return await this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  async verifyEmail(token) {
    return await this.request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async resendVerification(emailData) {
    return await this.request('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
  }

  // Authentication state management
  isAuthenticated() {
    return !!localStorage.getItem(this.tokenKey);
  }

  clearSession() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem('userData');
    localStorage.removeItem('popvia_app_state');
  }

  // Token storage keys
  get tokenKey() {
    return 'popVia_accessToken';
  }

  get refreshTokenKey() {
    return 'popVia_refreshToken';
  }

  // Task API methods
  async getTasks(filters = {}) {
    const queryString = this.buildQueryString(filters);
    return this.request(`/tasks${queryString}`);
  }

  async getSharedTasks() {
    return this.request('/tasks/shared');
  }

  async createTask(taskData) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
  }

  async updateTask(id, taskData) {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData)
    });
  }

  async deleteTask(id) {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE'
    });
  }

  async toggleTaskCompletion(id) {
    return this.request(`/tasks/${id}/toggle`, {
      method: 'PUT'
    });
  }

  async getTask(id) {
    return this.request(`/tasks/${id}`);
  }

  // Project API methods
  async getProjects() {
    return this.request('/projects');
  }

  async getProject(id) {
    return this.request(`/projects/${id}`);
  }

  async getSharedProjects() {
    return this.request('/projects/shared');
  }

  async createProject(projectData) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData)
    });
  }

  async updateProject(id, projectData) {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData)
    });
  }

  async deleteProject(id) {
    return this.request(`/projects/${id}`, {
      method: 'DELETE'
    });
  }

  async leaveSharedTask(id) {
    return this.request(`/tasks/${id}/leave`, {
      method: 'POST'
    });
  }

  async leaveSharedProject(id) {
    return this.request(`/projects/${id}/leave`, {
      method: 'POST'
    });
  }

  // File upload methods
  async uploadFile(taskId, file) {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem(this.tokenKey);
    const headers = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}/uploads/task/${taskId}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || data.error || `Upload failed: ${response.status}`);
    }

    return await response.json();
  }

  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);

    const token = localStorage.getItem(this.tokenKey);
    const headers = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}/uploads/avatar`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || data.error || `Avatar upload failed: ${response.status}`);
    }

    return await response.json();
  }

  async uploadLogo(file) {
    const formData = new FormData();
    formData.append('logo', file);

    const token = localStorage.getItem(this.tokenKey);
    const headers = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}/uploads/logo`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || data.error || `Logo upload failed: ${response.status}`);
    }

    return await response.json();
  }

  async deleteFile(taskId, filename) {
    return await this.request(`/uploads/task/${taskId}/file/${encodeURIComponent(filename)}`, {
      method: 'DELETE',
    });
  }

  getFileUrl(filename) {
    return `${this.baseURL}/uploads/files/${filename}`;
  }

  // Utility methods
  buildQueryString(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    return params.toString() ? `?${params.toString()}` : '';
  }

  // Online status
  isOnline() {
    return this.isOnline;
  }

  // Share methods
  async createTaskShareLink(taskId, sharedUsernames = []) {
    return await this.request(`/tasks/${taskId}/share`, {
      method: 'POST',
      body: JSON.stringify({ sharedUsernames }),
    });
  }

  async getSharedTask(token) {
    return await this.request(`/tasks/shared/${token}`);
  }

  async updateSharedTask(token, taskData) {
    return await this.request(`/tasks/shared/${token}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async disableTaskSharing(taskId) {
    return await this.request(`/tasks/${taskId}/share`, {
      method: 'DELETE',
    });
  }

  async createProjectShareLink(projectId, sharedUsernames = []) {
    return await this.request(`/projects/${projectId}/share`, {
      method: 'POST',
      body: JSON.stringify({ sharedUsernames }),
    });
  }

  async getSharedProject(token) {
    return await this.request(`/projects/shared/${token}`);
  }

  async updateSharedProject(token, projectData) {
    return await this.request(`/projects/shared/${token}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  async disableProjectSharing(projectId) {
    return await this.request(`/projects/${projectId}/share`, {
      method: 'DELETE',
    });
  }

  // Time tracking methods
  async startTaskTimer(taskId) {
    return await this.request(`/tasks/${taskId}/start-timer`, {
      method: 'POST',
    });
  }

  async stopTaskTimer(taskId) {
    return await this.request(`/tasks/${taskId}/stop-timer`, {
      method: 'POST',
    });
  }

  async getTaskTimeSummary(taskId) {
    return await this.request(`/tasks/${taskId}/time-summary`);
  }

  async updateTaskEstimatedTime(taskId, estimatedTime) {
    return await this.request(`/tasks/${taskId}/estimated-time`, {
      method: 'PUT',
      body: JSON.stringify({ estimatedTime }),
    });
  }

  // Get task limits for current user
  async getTaskLimits() {
    return await this.request('/tasks/limits', {
      method: 'GET',
    });
  }

  // Get project limits for current user
  async getProjectLimits() {
    return await this.request('/projects/limits', {
      method: 'GET',
    });
  }

  // Get task sharing limits for current user
  async getTaskSharingLimits() {
    return await this.request('/tasks/sharing-limits', {
      method: 'GET',
    });
  }

  // Get project sharing limits for current user
  async getProjectSharingLimits() {
    return await this.request('/projects/sharing-limits', {
      method: 'GET',
    });
  }

  // Utility method to copy share URL to clipboard
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    }
  }

  // Feedback methods
  async sendFeedback(feedbackData) {
    return await this.request('/feedback', {
      method: 'POST',
      body: JSON.stringify(feedbackData),
    });
  }

  // Payment API methods
  async createProPaymentLink(type = 'subscription', email = undefined) {
    const payload = { type };
    if (email) {
      payload.email = email;
    }

    // For payment links, we don't need authentication
    const url = `${this.baseURL}/payments/create-link`;
    const config = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        const error = new Error(data.message || data.error || `Server error: ${response.status}`);
        error.status = response.status;
        error.errorType = data.error;
        error.message = data.message || data.error || `Server error: ${response.status}`;
        throw error;
      } else {
        throw new Error(`Server error: ${response.status}`);
      }
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return { success: true };
    }
  }

  async verifyPaymentSession(sessionId) {
    return await this.request(`/payments/verify-session/${sessionId}`);
  }

  async getClients() {
    return this.request('/clients');
  }

  // Get client limits for current user
  async getClientLimits() {
    return await this.request('/clients/limits', {
      method: 'GET',
    });
  }

  async createClient(clientData) {
    return this.request('/clients', {
      method: 'POST',
      body: JSON.stringify(clientData)
    });
  }

  async updateClient(clientId, clientData) {
    return this.request(`/clients/${clientId}`, {
      method: 'PUT',
      body: JSON.stringify(clientData)
    });
  }

  async deleteClient(clientId) {
    return this.request(`/clients/${clientId}`, {
      method: 'DELETE'
    });
  }

  async assignProjectsToClient(clientId, projectIds) {
    return this.request(`/clients/${clientId}/assign-projects`, {
      method: 'POST',
      body: JSON.stringify({ projectIds })
    });
  }

  // Invoice methods
  async getInvoices() {
    return this.request('/invoices');
  }

  async createInvoice(invoiceData) {
    return this.request('/invoices', {
      method: 'POST',
      body: JSON.stringify(invoiceData)
    });
  }

  async updateInvoice(id, invoiceData) {
    return this.request(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(invoiceData)
    });
  }

  async getInvoice(id) {
    return this.request(`/invoices/${id}`);
  }

  async createPaymentLink(invoiceId) {
    return this.request(`/invoices/${invoiceId}/payment-link`, {
      method: 'POST'
    });
  }

  async sendInvoiceEmail(invoiceId) {
    return this.request(`/invoices/${invoiceId}/send-email`, {
      method: 'POST'
    });
  }

  async deleteInvoice(invoiceId) {
    return this.request(`/invoices/${invoiceId}`, {
      method: 'DELETE'
    });
  }

  // Company methods
  async getCompanies(filters = {}) {
    const queryString = this.buildQueryString(filters);
    return this.request(`/companies${queryString}`);
  }

  async getCompany(id) {
    return this.request(`/companies/${id}`);
  }

  async createCompany(companyData) {
    return this.request('/companies', {
      method: 'POST',
      body: JSON.stringify(companyData)
    });
  }

  async updateCompany(id, companyData) {
    return this.request(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(companyData)
    });
  }

  async deleteCompany(id) {
    return this.request(`/companies/${id}`, {
      method: 'DELETE'
    });
  }

  async requestCompanyVerification(id) {
    return this.request(`/companies/${id}/request-verification`, {
      method: 'POST'
    });
  }

  async generateCompanyPublicLink(id) {
    return this.request(`/companies/${id}/generate-public-link`, {
      method: 'POST'
    });
  }

  async verifyCompany(token) {
    return this.request(`/companies/verify/${token}`);
  }

  async getCompanyStats() {
    return this.request('/companies/stats');
  }

  async getVerifiedCompanies(filters = {}) {
    const queryString = this.buildQueryString(filters);
    return this.request(`/companies/verified${queryString}`);
  }

  async getPublicCompany(slug, token) {
    return this.request(`/companies/public/${slug}/${token}`);
  }

  // Team methods
  async getTeams() {
    return this.request('/teams');
  }

  async getTeam(id) {
    return this.request(`/teams/${id}`);
  }

  async createTeam(teamData) {
    return this.request('/teams', {
      method: 'POST',
      body: JSON.stringify(teamData)
    });
  }

  async updateTeam(id, teamData) {
    return this.request(`/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(teamData)
    });
  }

  async deleteTeam(id) {
    return this.request(`/teams/${id}`, {
      method: 'DELETE'
    });
  }

  async addTeamMember(teamId, memberData) {
    return this.request(`/teams/${teamId}/members`, {
      method: 'POST',
      body: JSON.stringify(memberData)
    });
  }

  async removeTeamMember(teamId, userId) {
    return this.request(`/teams/${teamId}/members/${userId}`, {
      method: 'DELETE'
    });
  }

  async updateTeamMemberRole(teamId, userId, role) {
    return this.request(`/teams/${teamId}/members/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    });
  }

  async addTeamProject(teamId, projectId) {
    return this.request(`/teams/${teamId}/projects`, {
      method: 'POST',
      body: JSON.stringify({ projectId })
    });
  }

  async removeTeamProject(teamId, projectId) {
    return this.request(`/teams/${teamId}/projects/${projectId}`, {
      method: 'DELETE'
    });
  }

  async getTeamLimits() {
    return this.request('/teams/limits');
  }

  // Jobs methods
  async getJobs(filters = {}) {
    const queryString = this.buildQueryString(filters);
    return this.request(`/jobs${queryString}`);
  }

  async getPublicJobs(filters = {}) {
    const queryString = this.buildQueryString(filters);
    return this.request(`/jobs/public${queryString}`);
  }

  async getJob(jobId) {
    return this.request(`/jobs/${jobId}`);
  }

  async getPublicJob(slug) {
    return this.request(`/jobs/public/${slug}`);
  }

  async createJob(jobData) {
    return this.request('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData)
    });
  }

  async updateJob(jobId, jobData) {
    return this.request(`/jobs/${jobId}`, {
      method: 'PUT',
      body: JSON.stringify(jobData)
    });
  }

  async updateJobStatus(jobId, status) {
    return this.request(`/jobs/${jobId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  async deleteJob(jobId) {
    return this.request(`/jobs/${jobId}`, {
      method: 'DELETE'
    });
  }

  async applyForJob(jobId, applicationData) {
    return this.request(`/jobs/${jobId}/apply`, {
      method: 'POST',
      body: JSON.stringify(applicationData)
    });
  }

  async getJobApplications(jobId) {
    return this.request(`/jobs/${jobId}/applications`);
  }

  async updateJobApplication(jobId, applicationId, status) {
    return this.request(`/jobs/${jobId}/applications/${applicationId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  // Proposal Templates methods
  async getProposalTemplates(filters = {}) {
    const queryString = this.buildQueryString(filters);
    return this.request(`/proposal-templates${queryString}`);
  }

  async getPublicProposalTemplates(filters = {}) {
    const queryString = this.buildQueryString(filters);
    return this.request(`/proposal-templates/public${queryString}`);
  }

  async getProposalTemplate(id) {
    return this.request(`/proposal-templates/${id}`);
  }

  async createProposalTemplate(templateData) {
    return this.request('/proposal-templates', {
      method: 'POST',
      body: JSON.stringify(templateData)
    });
  }

  async updateProposalTemplate(id, templateData) {
    return this.request(`/proposal-templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(templateData)
    });
  }

  async deleteProposalTemplate(id) {
    return this.request(`/proposal-templates/${id}`, {
      method: 'DELETE'
    });
  }

  async duplicateProposalTemplate(id) {
    return this.request(`/proposal-templates/${id}/duplicate`, {
      method: 'POST'
    });
  }

  async generateProposalFromTemplate(id, data) {
    return this.request(`/proposal-templates/${id}/generate`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getProposalTemplateCategories() {
    return this.request('/proposal-templates/categories');
  }
}

// Create and export a singleton instance
const apiService = new ApiService();

export { OfflineNotifications };
export default apiService;
