import { idb } from './idb';

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

    const response = await fetch(url, config);

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
      return await response.json();
    } else {
      return { success: true };
    }
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

    const response = await fetch(`${this.baseURL}/uploads/task/${taskId}`, {
      method: 'POST',
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
  async createTaskShareLink(taskId, permission = 'readonly') {
    return await this.request(`/tasks/${taskId}/share`, {
      method: 'POST',
      body: JSON.stringify({ permission }),
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

  async createProjectShareLink(projectId, permission = 'readonly') {
    return await this.request(`/projects/${projectId}/share`, {
      method: 'POST',
      body: JSON.stringify({ permission }),
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
