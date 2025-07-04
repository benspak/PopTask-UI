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
        console.error('Error in notification listener:', error);
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
    }, 30000); // 30 seconds
  }

  // Stop periodic online status check
  stopPeriodicOnlineCheck() {
    if (this.onlineCheckInterval) {
      clearInterval(this.onlineCheckInterval);
      this.onlineCheckInterval = null;
    }
  }

  // Check if we can reach the server
  async checkServerConnection() {
    try {
      if (!navigator.onLine) {
        return false;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

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
        return false;
      }

      const data = await response.json();
      return data && typeof data.status === 'string' && data.status.toLowerCase() === 'ok';
    } catch (error) {
      return false;
    }
  }

  // Simple request method
  async request(endpoint, options = {}) {
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

    let response = await fetch(url, config);

    // If we get a 401 and we have a refresh token, try to refresh
    if (response.status === 401 && token && localStorage.getItem(this.refreshTokenKey)) {
      try {
        const refreshResult = await this.refreshToken();

        // Update the token in the request
        if (refreshResult.token) {
          config.headers.Authorization = `Bearer ${refreshResult.token}`;
          // Retry the original request with the new token
          response = await fetch(url, config);
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
        throw new Error(data.message || data.error || `Server error: ${response.status}`);
      } else {
        throw new Error(`Server error: ${response.status}`);
      }
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const result = await response.json();
      return result;
    } else {
      return { success: true };
    }
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
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout request failed:', error);
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

  // Authentication state management
  isAuthenticated() {
    return !!localStorage.getItem(this.tokenKey);
  }

  clearSession() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem('userData');
  }

  // Token storage keys
  get tokenKey() {
    return 'popTask_accessToken';
  }

  get refreshTokenKey() {
    return 'popTask_refreshToken';
  }

  // Task API methods
  async getTasks(filters = {}) {
    const queryString = this.buildQueryString(filters);
    return await this.request(`/tasks${queryString}`);
  }

  async createTask(taskData) {
    return await this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(id, taskData) {
    return await this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(id) {
    return await this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleTaskCompletion(id) {
    return await this.request(`/tasks/${id}/toggle`, {
      method: 'PATCH',
    });
  }

  async getTask(id) {
    return await this.request(`/tasks/${id}`);
  }

  // Project API methods
  async getProjects() {
    return await this.request('/projects');
  }

  async createProject(projectData) {
    return await this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(id, projectData) {
    return await this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(id) {
    return await this.request(`/projects/${id}`, {
      method: 'DELETE',
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
  async createTaskShareLink(taskId, allowedEmails = []) {
    return await this.request(`/tasks/${taskId}/share`, {
      method: 'POST',
      body: JSON.stringify({ allowedEmails }),
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

  async createProjectShareLink(projectId, allowedEmails = []) {
    return await this.request(`/projects/${projectId}/share`, {
      method: 'POST',
      body: JSON.stringify({ allowedEmails }),
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
}

// Create and export a singleton instance
const apiService = new ApiService();

export { OfflineNotifications };
export default apiService;
