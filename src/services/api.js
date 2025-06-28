// Environment-based API configuration
const getApiBaseUrl = () => {
  // In production, use the production API URL or relative URLs
  if (import.meta.env.PROD) {
    // Use VITE_API_BASE_URL if set, otherwise use relative URLs
    return import.meta.env.VITE_API_BASE_URL || '/api';
  }
  // In development, use localhost
  return 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();

// Offline storage keys
const OFFLINE_TASKS_KEY = 'offline_tasks';
const OFFLINE_PROJECTS_KEY = 'offline_projects';
const PENDING_SYNC_KEY = 'pending_sync';

// Notification system for offline events
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

  // Notify about offline task creation
  notifyOfflineTaskCreated(task) {
    this.notify('offline_task_created', {
      title: task.title,
      project: task.project,
      timestamp: new Date().toISOString()
    });
  },

  // Notify about offline task updated
  notifyOfflineTaskUpdated(task) {
    this.notify('offline_task_updated', {
      title: task.title,
      project: task.project,
      timestamp: new Date().toISOString()
    });
  },

  // Notify about offline task deleted
  notifyOfflineTaskDeleted(task) {
    this.notify('offline_task_deleted', {
      title: task.title,
      timestamp: new Date().toISOString()
    });
  },

  // Notify about offline project creation
  notifyOfflineProjectCreated(project) {
    this.notify('offline_project_created', {
      name: project.name,
      timestamp: new Date().toISOString()
    });
  },

  // Notify about offline project update
  notifyOfflineProjectUpdated(project) {
    this.notify('offline_project_updated', {
      name: project.name,
      timestamp: new Date().toISOString()
    });
  },

  // Notify about offline project deletion
  notifyOfflineProjectDeleted(project) {
    this.notify('offline_project_deleted', {
      name: project.name,
      timestamp: new Date().toISOString()
    });
  },

  // Notify about sync completion
  notifySyncCompleted(syncedTasks, syncedProjects) {
    this.notify('sync_completed', {
      tasksCount: syncedTasks,
      projectsCount: syncedProjects,
      timestamp: new Date().toISOString()
    });
  },

  // Notify about sync errors
  notifySyncError(error) {
    this.notify('sync_error', {
      error: error.message,
      timestamp: new Date().toISOString()
    });
  },

  // Notify about manual sync start
  notifyManualSyncStart() {
    this.notify('manual_sync_start', {
      timestamp: new Date().toISOString()
    });
  },

  // Notify about going offline
  notifyGoingOffline() {
    this.notify('going_offline', {
      timestamp: new Date().toISOString()
    });
  }
};

// Offline storage utilities
const OfflineStorage = {
  // Task storage
  getOfflineTasks() {
    try {
      const stored = localStorage.getItem(OFFLINE_TASKS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  },

  setOfflineTasks(tasks) {
    try {
      localStorage.setItem(OFFLINE_TASKS_KEY, JSON.stringify(tasks));
    } catch (error) {
      // Handle storage quota exceeded or other errors
    }
  },

  addOfflineTask(task) {
    const tasks = this.getOfflineTasks();

    // Check for duplicate tasks by title and project (case-insensitive)
    const isDuplicate = tasks.some(existingTask =>
      existingTask.title.toLowerCase().trim() === task.title.toLowerCase().trim() &&
      existingTask.project === task.project
    );

    if (isDuplicate) {
      throw new Error('A task with this title already exists in this project');
    }

    const newTask = {
      ...task,
      _id: task._id || `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isOffline: true,
      createdAt: task.createdAt || new Date().toISOString(),
    };
    tasks.push(newTask);
    this.setOfflineTasks(tasks);

    // Trigger offline task created notification
    OfflineNotifications.notifyOfflineTaskCreated(newTask);

    return newTask;
  },

  updateOfflineTask(id, updates) {
    const tasks = this.getOfflineTasks();
    const index = tasks.findIndex(task => task._id === id);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates, isOffline: true };
      this.setOfflineTasks(tasks);

      // Trigger offline task updated notification
      OfflineNotifications.notifyOfflineTaskUpdated(tasks[index]);

      return tasks[index];
    }
    return null;
  },

  deleteOfflineTask(id) {
    const tasks = this.getOfflineTasks();
    const taskToDelete = tasks.find(task => task._id === id);
    const filteredTasks = tasks.filter(task => task._id !== id);
    this.setOfflineTasks(filteredTasks);

    // Trigger offline task deleted notification
    if (taskToDelete) {
      OfflineNotifications.notifyOfflineTaskDeleted(taskToDelete);
    }
  },

  // Project storage
  getOfflineProjects() {
    try {
      const stored = localStorage.getItem(OFFLINE_PROJECTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  },

  setOfflineProjects(projects) {
    try {
      localStorage.setItem(OFFLINE_PROJECTS_KEY, JSON.stringify(projects));
    } catch (error) {
      // Handle storage quota exceeded or other errors
    }
  },

  addOfflineProject(project) {
    const projects = this.getOfflineProjects();
    const newProject = {
      ...project,
      _id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isOffline: true,
      createdAt: new Date().toISOString(),
    };
    projects.push(newProject);
    this.setOfflineProjects(projects);
    return newProject;
  },

  // Pending sync storage
  getPendingSync() {
    try {
      const stored = localStorage.getItem(PENDING_SYNC_KEY);
      return stored ? JSON.parse(stored) : { tasks: [], projects: [] };
    } catch (error) {
      return { tasks: [], projects: [] };
    }
  },

  addPendingSync(type, data) {
    const pending = this.getPendingSync();

    // Check for duplicate pending sync entries
    const isDuplicate = pending[type].some(item => {
      if (type === 'tasks' && item.action === data.action) {
        if (item.action === 'create') {
          return item.data.title === data.data.title && item.data.project === data.data.project;
        } else if (item.action === 'update' || item.action === 'delete') {
          return item.id === data.id;
        }
      }
      return false;
    });

    if (!isDuplicate) {
      pending[type].push({
        ...data,
        timestamp: new Date().toISOString(),
      });
      try {
        localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(pending));
      } catch (error) {
        // Handle storage quota exceeded
      }
    }
  },

  clearPendingSync(type) {
    const pending = this.getPendingSync();
    pending[type] = [];
    try {
      localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(pending));
    } catch (error) {
      // Handle storage quota exceeded
    }
  },

  // Clean up duplicate pending sync entries
  cleanupDuplicatePendingSync() {
    const pending = this.getPendingSync();

    // Remove duplicate task entries
    const uniqueTasks = [];
    const seenTasks = new Set();

    pending.tasks.forEach(task => {
      let key;
      if (task.action === 'create') {
        key = `create_${task.data.title.toLowerCase().trim()}_${task.data.project}`;
      } else {
        key = `${task.action}_${task.id}`;
      }

      if (!seenTasks.has(key)) {
        seenTasks.add(key);
        uniqueTasks.push(task);
      }
    });

    pending.tasks = uniqueTasks;

    try {
      localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(pending));
    } catch (error) {
      // Handle storage quota exceeded
    }
  },

  // Clean up duplicate offline tasks
  cleanupDuplicateOfflineTasks() {
    const tasks = this.getOfflineTasks();
    const uniqueTasks = [];
    const seenTasks = new Set();

    tasks.forEach(task => {
      const key = `${task.title.toLowerCase().trim()}_${task.project}`;
      if (!seenTasks.has(key)) {
        seenTasks.add(key);
        uniqueTasks.push(task);
      }
    });

    this.setOfflineTasks(uniqueTasks);
  },

  // Clear offline tasks after successful sync
  clearOfflineTasks() {
    try {
      localStorage.removeItem(OFFLINE_TASKS_KEY);
    } catch (error) {
      // Handle storage errors
    }
  },

  clearOfflineProjects() {
    try {
      localStorage.removeItem(OFFLINE_PROJECTS_KEY);
    } catch (error) {
      // Handle storage errors
    }
  },

  // Check if a task already exists (for both online and offline tasks)
  checkTaskExists(taskData) {
    const offlineTasks = this.getOfflineTasks();

    // Check offline tasks (case-insensitive)
    const offlineDuplicate = offlineTasks.some(task =>
      task.title.toLowerCase().trim() === taskData.title.toLowerCase().trim() &&
      task.project === taskData.project
    );

    if (offlineDuplicate) {
      return { exists: true, message: 'A task with this title already exists in this project' };
    }

    return { exists: false };
  },

  // Check if a task exists in the current task list (online + offline)
  async checkTaskExistsInCurrentList(taskData) {
    try {
      // Get current tasks (online + offline)
      const response = await this.getTasks();
      const currentTasks = response.data || [];

      // Check for duplicates in current task list (case-insensitive)
      const duplicate = currentTasks.some(task =>
        task.title.toLowerCase().trim() === taskData.title.toLowerCase().trim() &&
        task.project === taskData.project
      );

      if (duplicate) {
        return { exists: true, message: 'A task with this title already exists in this project' };
      }

      return { exists: false };
    } catch (error) {
      // If we can't get the current list, fall back to offline-only check
      return this.checkTaskExists(taskData);
    }
  },

  // Check if a task exists online only (for sync purposes)
  async checkOnlineTaskExists(taskData) {
    try {
      const response = await this.request('/tasks');
      const onlineTasks = response.data || [];

      // Check for duplicates in online tasks only (case-insensitive)
      const duplicate = onlineTasks.some(task =>
        task.title.toLowerCase().trim() === taskData.title.toLowerCase().trim() &&
        task.project === taskData.project
      );

      if (duplicate) {
        return { exists: true, message: 'A task with this title already exists in this project' };
      }

      return { exists: false };
    } catch (error) {
      // If we can't check online, assume it doesn't exist
      return { exists: false };
    }
  },

  async checkOnlineProjectExists(projectData) {
    try {
      const response = await this.request('/projects');
      const onlineProjects = response.data || [];

      // Check for duplicates in online projects only (case-insensitive)
      const duplicate = onlineProjects.some(project =>
        project.name.toLowerCase().trim() === projectData.name.toLowerCase().trim()
      );

      if (duplicate) {
        return { exists: true, message: 'A project with this name already exists' };
      }

      return { exists: false };
    } catch (error) {
      // If we can't check online, assume it doesn't exist
      return { exists: false };
    }
  },
};

// Network status detection
const NetworkStatus = {
  isOnline() {
    return navigator.onLine;
  },

  addOnlineListener(callback) {
    window.addEventListener('online', callback);
  },

  addOfflineListener(callback) {
    window.addEventListener('offline', callback);
  },

  removeOnlineListener(callback) {
    window.removeEventListener('online', callback);
  },

  removeOfflineListener(callback) {
    window.removeEventListener('offline', callback);
  },
};

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.isOnline = true;
    this.onlineCheckInterval = null;
    this.syncInProgress = false; // Add sync lock

    // Clean up any existing duplicate pending sync entries and offline tasks
    OfflineStorage.cleanupDuplicatePendingSync();
    OfflineStorage.cleanupDuplicateOfflineTasks();

    // Set up network status listeners
    NetworkStatus.addOnlineListener(() => {
      this.isOnline = true;
      this.syncOfflineData();
    });

    NetworkStatus.addOfflineListener(() => {
      this.isOnline = false;
      OfflineNotifications.notifyGoingOffline();
    });

    // Periodic online status check every 30 seconds
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
          console.log('Periodic check: Back online, checking for pending sync...');
          const pending = OfflineStorage.getPendingSync();
          if ((pending.tasks.length > 0 || pending.projects.length > 0) && !this.syncInProgress) {
            console.log('Found pending data, starting sync...');
            this.syncOfflineData();
          } else {
            console.log('No pending data to sync or sync already in progress');
          }
        } else {
          console.log('Periodic check: Went offline');
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

  // Manual online status check
  async checkOnlineStatus() {
    const wasOnline = this.isOnline;
    const isNowOnline = await this.checkServerConnection();

    if (wasOnline !== isNowOnline) {
      this.isOnline = isNowOnline;

      if (isNowOnline) {
        console.log('Manual check: Back online, checking for pending sync...');
        const pending = OfflineStorage.getPendingSync();
        if ((pending.tasks.length > 0 || pending.projects.length > 0) && !this.syncInProgress) {
          console.log('Found pending data, starting sync...');
          this.syncOfflineData();
        } else {
          console.log('No pending data to sync or sync already in progress');
        }
      } else {
        console.log('Manual check: Went offline');
        OfflineNotifications.notifyGoingOffline();
      }
    }

    return isNowOnline;
  }

  // Check if we can reach the server
  async checkServerConnection() {
    try {
      // First check if we're online at all
      if (!navigator.onLine) {
        console.log('Browser reports offline');
        return false;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

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
        console.log('Health check returned non-OK status:', response.status);
        return false;
      }

      return true;
    } catch (error) {
      console.log('Server connection check failed:', error.message);

      // Handle specific error types
      if (error.name === 'AbortError') {
        console.log('Health check timed out');
      } else if (error.message.includes('Failed to fetch')) {
        console.log('Network error - server unreachable');
      } else if (error.message.includes('ERR_NETWORK')) {
        console.log('Network error - connection failed');
      }

      return false;
    }
  }

  // Generic request method with offline fallback
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      // Check if we're online and server is reachable
      const serverReachable = await this.checkServerConnection();

      if (!serverReachable) {
        console.log('Server not reachable, throwing OFFLINE_MODE error');
        throw new Error('OFFLINE_MODE');
      }

      const response = await fetch(url, config);

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response format from server');
      }

      const data = await response.json();

      if (!response.ok) {
        // Use the server's error message if available, otherwise provide a generic one
        const errorMessage = data.message || data.error || `Server error: ${response.status}`;

        // Handle specific HTTP status codes
        if (response.status === 409) {
          throw new Error(`Conflict: ${errorMessage}`);
        } else if (response.status === 500) {
          throw new Error(`Server error: ${errorMessage}`);
        } else if (response.status === 400) {
          throw new Error(`Bad request: ${errorMessage}`);
        } else {
          throw new Error(errorMessage);
        }
      }

      return data;
    } catch (error) {
      // Handle offline mode specifically
      if (error.message === 'OFFLINE_MODE') {
        throw new Error('OFFLINE_MODE');
      }

      // Handle network errors that indicate offline mode
      if (error.message.includes('Failed to fetch') ||
          error.message.includes('NetworkError') ||
          error.message.includes('ERR_NETWORK') ||
          error.message.includes('ERR_INTERNET_DISCONNECTED') ||
          error.message.includes('ERR_NETWORK_CHANGED')) {
        console.log('Network error detected, switching to offline mode');
        throw new Error('OFFLINE_MODE');
      }

      // Handle timeout errors
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        console.log('Request timeout, switching to offline mode');
        throw new Error('OFFLINE_MODE');
      }

      // Handle server errors that might indicate offline mode
      if (error.message.includes('getaddrinfo ENOTFOUND') ||
          error.message.includes('ECONNREFUSED') ||
          error.message.includes('ENOTFOUND')) {
        console.log('Server connection error, switching to offline mode');
        throw new Error('OFFLINE_MODE');
      }

      // Re-throw other errors
      throw error;
    }
  }

  // Clean up corrupted pending sync data
  cleanupCorruptedPendingSync() {
    const pending = OfflineStorage.getPendingSync();
    let cleaned = false;

    // Clean up corrupted task data
    const validTasks = pending.tasks.filter(task => {
      if (task.action === 'create' && (!task.data || !task.data.title)) {
        console.log('Removing corrupted task data:', task);
        cleaned = true;
        return false;
      }
      return true;
    });

    // Clean up corrupted project data
    const validProjects = pending.projects.filter(project => {
      if (project.action === 'create' && (!project.data || !project.data.name)) {
        console.log('Removing corrupted project data:', project);
        cleaned = true;
        return false;
      }
      return true;
    });

    if (cleaned) {
      const cleanedPending = {
        tasks: validTasks,
        projects: validProjects
      };
      try {
        localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(cleanedPending));
        console.log('Cleaned up corrupted pending sync data');
      } catch (error) {
        console.error('Failed to save cleaned pending sync data:', error);
      }
    }
  }

  // Sync offline data when back online
  async syncOfflineData() {
    // Prevent concurrent sync operations
    if (this.syncInProgress) {
      console.log('Sync already in progress, skipping...');
      return;
    }

    this.syncInProgress = true;

    try {
      // Clean up duplicate entries and corrupted data before syncing
      OfflineStorage.cleanupDuplicatePendingSync();
      this.cleanupCorruptedPendingSync();

      const pending = OfflineStorage.getPendingSync();
      console.log('Starting sync with pending tasks:', pending.tasks.length, 'projects:', pending.projects.length);
      console.log('Pending tasks:', pending.tasks.map(t => ({ action: t.action, title: t.data?.title, id: t.id })));
      console.log('Pending projects:', pending.projects.map(p => ({ action: p.action, name: p.data?.name, id: p.id })));

      // If no pending data, skip sync
      if (pending.tasks.length === 0 && pending.projects.length === 0) {
        console.log('No pending data to sync');
        return;
      }

      let tasksSynced = 0;
      let projectsSynced = 0;
      let tasksFailed = 0;
      let projectsFailed = 0;
      const successfulTaskIds = [];
      const successfulProjectIds = [];

      // Notify about manual sync start
      OfflineNotifications.notifyManualSyncStart();

      // Sync offline tasks
      for (const task of pending.tasks) {
        try {
          console.log('Syncing task:', task.action, task.data?.title || task.id);

          // Validate task data before syncing
          if (task.action === 'create' && (!task.data || !task.data.title)) {
            console.log('Invalid task data, skipping:', task);
            successfulTaskIds.push(task); // Mark as successful to remove from queue
            continue;
          }

          // Skip if task was created then deleted before sync
          if (task.action === 'create') {
            const taskExists = OfflineStorage.getOfflineTasks().find(t =>
              t._id === task.data._id ||
              (t.title === task.data.title && t.project === task.data.project)
            );
            if (!taskExists) {
              console.log('Task was deleted before sync, skipping:', task.data.title);
              successfulTaskIds.push(task);
              continue;
            }
          }

          if (task.action === 'create') {
            // For sync, we need to check against online tasks only, not offline tasks
            const onlineDuplicateCheck = await OfflineStorage.checkOnlineTaskExists(task.data);
            if (onlineDuplicateCheck.exists) {
              // Task already exists online, skip sync and mark as successful
              console.log('Task already exists online, skipping:', task.data.title);
              tasksSynced++;
              successfulTaskIds.push(task);
              continue;
            }

            try {
              // Create task directly without duplicate checking against offline tasks
              await this.createTaskDirectly(task.data);
              console.log('Successfully synced task:', task.data.title);
              tasksSynced++;
              successfulTaskIds.push(task);
            } catch (error) {
              // If we get a duplicate error from the server, mark as successful
              if (error.message.includes('already exists') || error.message.includes('duplicate')) {
                console.log('Task already exists on server, skipping:', task.data.title);
                tasksSynced++;
                successfulTaskIds.push(task);
              } else {
                throw error; // Re-throw other errors
              }
            }
          } else if (task.action === 'update') {
            // Skip update if task doesn't exist online yet
            if (task.id && task.id.startsWith('offline_')) {
              console.log('Skipping update for offline task that hasn\'t been synced yet:', task.id);
              successfulTaskIds.push(task);
              continue;
            }

            await this.updateTask(task.id, task.data);
            console.log('Successfully updated task:', task.id);
            tasksSynced++;
            successfulTaskIds.push(task);
          } else if (task.action === 'delete') {
            // Skip delete if task doesn't exist online yet
            if (task.id && task.id.startsWith('offline_')) {
              console.log('Skipping delete for offline task that hasn\'t been synced yet:', task.id);
              successfulTaskIds.push(task);
              continue;
            }

            await this.deleteTask(task.id);
            console.log('Successfully deleted task:', task.id);
            tasksSynced++;
            successfulTaskIds.push(task);
          }
        } catch (error) {
          console.error('Failed to sync task:', error.message);
          // Keep in pending sync if sync fails
          tasksFailed++;
          continue;
        }
      }

      // Sync offline projects
      for (const project of pending.projects) {
        try {
          console.log('Syncing project:', project.action, project.data?.name || project.id);

          // Validate project data before syncing
          if (project.action === 'create' && (!project.data || !project.data.name)) {
            console.log('Invalid project data, skipping:', project);
            successfulProjectIds.push(project); // Mark as successful to remove from queue
            continue;
          }

          // Skip if project was created then deleted before sync
          if (project.action === 'create') {
            const projectExists = OfflineStorage.getOfflineProjects().find(p =>
              p._id === project.data._id ||
              p.name === project.data.name
            );
            if (!projectExists) {
              console.log('Project was deleted before sync, skipping:', project.data.name);
              successfulProjectIds.push(project);
              continue;
            }
          }

          if (project.action === 'create') {
            // For sync, we need to check against online projects only, not offline projects
            const onlineDuplicateCheck = await OfflineStorage.checkOnlineProjectExists(project.data);
            if (onlineDuplicateCheck.exists) {
              // Project already exists online, skip sync and mark as successful
              console.log('Project already exists online, skipping:', project.data.name);
              projectsSynced++;
              successfulProjectIds.push(project);
              continue;
            }

            try {
              console.log('Attempting to create project during sync:', project.data);
              await this.createProjectDirectly(project.data);
              console.log('Successfully created project during sync:', project.data.name);
              projectsSynced++;
              successfulProjectIds.push(project);
            } catch (error) {
              console.error('Failed to create project during sync:', error);
              console.error('Project data that failed:', project.data);

              // If we get a duplicate error from the server, mark as successful
              if (error.message.includes('already exists') || error.message.includes('duplicate') || error.message.includes('409')) {
                console.log('Project already exists on server, skipping:', project.data.name);
                projectsSynced++;
                successfulProjectIds.push(project);
              } else {
                throw error; // Re-throw other errors
              }
            }
          } else if (project.action === 'update') {
            // Skip update if project doesn't exist online yet
            if (project.id && project.id.startsWith('offline_')) {
              console.log('Skipping update for offline project that hasn\'t been synced yet:', project.id);
              successfulProjectIds.push(project);
              continue;
            }

            await this.updateProject(project.id, project.data);
            projectsSynced++;
            successfulProjectIds.push(project);
          } else if (project.action === 'delete') {
            // Skip delete if project doesn't exist online yet
            if (project.id && project.id.startsWith('offline_')) {
              console.log('Skipping delete for offline project that hasn\'t been synced yet:', project.id);
              successfulProjectIds.push(project);
              continue;
            }

            await this.deleteProject(project.id);
            projectsSynced++;
            successfulProjectIds.push(project);
          }
        } catch (error) {
          console.error('Failed to sync project:', error.message);
          // Keep in pending sync if sync fails
          projectsFailed++;
          continue;
        }
      }

      // Remove successfully synced items from pending sync
      if (successfulTaskIds.length > 0) {
        const updatedPendingTasks = pending.tasks.filter(task =>
          !successfulTaskIds.some(successful =>
            (task.action === 'create' && successful.action === 'create' &&
             task.data.title === successful.data.title && task.data.project === successful.data.project) ||
            (task.action !== 'create' && successful.action !== 'create' && task.id === successful.id)
          )
        );
        pending.tasks = updatedPendingTasks;
        try {
          localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(pending));
        } catch (error) {
          // Handle storage quota exceeded
        }
      }

      if (successfulProjectIds.length > 0) {
        const updatedPendingProjects = pending.projects.filter(project =>
          !successfulProjectIds.some(successful =>
            (project.action === 'create' && successful.action === 'create' &&
             project.data.name === successful.data.name) ||
            (project.action !== 'create' && successful.action !== 'create' && project.id === successful.id)
          )
        );
        pending.projects = updatedPendingProjects;
        try {
          localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(pending));
        } catch (error) {
          // Handle storage quota exceeded
        }
      }

      // Clear offline storage if all items were synced successfully
      if (pending.tasks.length === 0) {
        OfflineStorage.clearOfflineTasks();
      }
      if (pending.projects.length === 0) {
        OfflineStorage.clearOfflineProjects();
      }

      console.log('Sync completed. Tasks synced:', tasksSynced, 'Projects synced:', projectsSynced, 'Tasks failed:', tasksFailed, 'Projects failed:', projectsFailed);
      console.log('Remaining pending tasks:', pending.tasks.length, 'Remaining pending projects:', pending.projects.length);

      // Notify about sync completion
      OfflineNotifications.notifySyncCompleted(tasksSynced, projectsSynced);

      // Notify about sync errors if any
      if (tasksFailed > 0 || projectsFailed > 0) {
        const errorMessage = `${tasksFailed} tasks and ${projectsFailed} projects failed to sync`;
        OfflineNotifications.notifySyncError(new Error(errorMessage));
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  // Task API methods with offline support
  async getTasks(filters = {}) {
    try {
      const response = await this.request(`/tasks${this.buildQueryString(filters)}`);

      // If we're online, also include any offline tasks that haven't been synced yet
      const offlineTasks = OfflineStorage.getOfflineTasks();
      if (offlineTasks.length > 0) {
        // Merge online and offline tasks, with offline tasks taking precedence for duplicates
        const onlineTasks = response.data || [];
        const offlineTaskIds = new Set(offlineTasks.map(t => t._id));

        // Filter out online tasks that have offline versions
        const filteredOnlineTasks = onlineTasks.filter(task => !offlineTaskIds.has(task._id));

        // Combine online and offline tasks
        const mergedTasks = [...filteredOnlineTasks, ...offlineTasks];
        return { data: mergedTasks };
      }

      return response;
    } catch (error) {
      if (error.message === 'OFFLINE_MODE') {
        // Return offline tasks
        const offlineTasks = OfflineStorage.getOfflineTasks();
        return { data: offlineTasks };
      }
      throw error;
    }
  }

  async getTask(id) {
    // If it's an offline ID, return the offline task directly
    if (id && id.startsWith('offline_')) {
      const offlineTasks = OfflineStorage.getOfflineTasks();
      const task = offlineTasks.find(t => t._id === id);
      if (task) {
        return { data: task };
      }
      throw new Error('Task not found');
    }

    try {
      return await this.request(`/tasks/${id}`);
    } catch (error) {
      if (error.message === 'OFFLINE_MODE') {
        // Return offline task if exists
        const offlineTasks = OfflineStorage.getOfflineTasks();
        const task = offlineTasks.find(t => t._id === id);
        if (task) {
          return { data: task };
        }
        throw new Error('Task not found');
      }
      throw error;
    }
  }

  async createTask(taskData) {
    try {
      // Check for duplicates before creating task (both online and offline)
      const duplicateCheck = await OfflineStorage.checkTaskExistsInCurrentList(taskData);
      if (duplicateCheck.exists) {
        throw new Error(duplicateCheck.message);
      }

      const response = await this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
      return response;
    } catch (error) {
      if (error.message === 'OFFLINE_MODE') {
        // Check for duplicates before creating offline task
        const duplicateCheck = OfflineStorage.checkTaskExists(taskData);
        if (duplicateCheck.exists) {
          throw new Error(duplicateCheck.message);
        }

        // Store offline and add to pending sync
        const offlineTask = OfflineStorage.addOfflineTask(taskData);
        OfflineStorage.addPendingSync('tasks', {
          action: 'create',
          data: taskData,
        });
        // Ensure the offline task has the isOffline flag
        const taskWithOfflineFlag = { ...offlineTask, isOffline: true };
        return { data: taskWithOfflineFlag };
      }
      throw error;
    }
  }

  async updateTask(id, taskData) {
    // If it's an offline ID, update the offline task directly
    if (id && id.startsWith('offline_')) {
      const updatedTask = OfflineStorage.updateOfflineTask(id, taskData);
      if (updatedTask) {
        // Ensure the updated task has the isOffline flag
        const taskWithOfflineFlag = { ...updatedTask, isOffline: true };
        return { data: taskWithOfflineFlag };
      }
      throw new Error('Task not found');
    }

    try {
      const response = await this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
      return response;
    } catch (error) {
      if (error.message === 'OFFLINE_MODE') {
        // Check if task exists in offline storage
        let offlineTask = OfflineStorage.getOfflineTasks().find(t => t._id === id);

        if (!offlineTask) {
          // Task doesn't exist in offline storage, create it there first
          // This happens when we're updating an online task while offline
          const existingTask = {
            _id: id,
            title: taskData.title,
            description: taskData.description,
            dueDate: taskData.dueDate,
            project: taskData.project,
            tags: taskData.tags,
            completed: taskData.completed,
            isOffline: true,
            createdAt: new Date().toISOString(),
          };
          offlineTask = OfflineStorage.addOfflineTask(existingTask);
        }

        // Update the offline task with new data
        const updatedTask = OfflineStorage.updateOfflineTask(id, taskData);
        if (updatedTask) {
          // Ensure the updated task has the isOffline flag
          const taskWithOfflineFlag = { ...updatedTask, isOffline: true };

          OfflineStorage.addPendingSync('tasks', {
            action: 'update',
            id,
            data: taskData,
          });
          return { data: taskWithOfflineFlag };
        }
        throw new Error('Task not found');
      }
      throw error;
    }
  }

  async deleteTask(taskId) {
    console.log('Attempting to delete task:', taskId);

    // If it's an offline ID, delete the offline task directly
    if (taskId && taskId.startsWith('offline_')) {
      console.log('Deleting offline task:', taskId);
      OfflineStorage.deleteOfflineTask(taskId);
      return { success: true, isOffline: true };
    }

    try {
      const response = await this.request(`/tasks/${taskId}`, {
        method: 'DELETE',
      });
      console.log('Task deleted successfully:', response);
      return response;
    } catch (error) {
      console.error('Failed to delete task:', error);

      if (error.message === 'OFFLINE_MODE') {
        // Delete offline task and add to pending sync
        console.log('Offline mode detected, deleting offline task and adding to pending sync');
        OfflineStorage.deleteOfflineTask(taskId);
        OfflineStorage.addPendingSync('tasks', {
          action: 'delete',
          id: taskId,
        });
        return { success: true, isOffline: true };
      }

      // If it's a 404 error, the task might have already been deleted
      if (error.message && error.message.includes('Task not found')) {
        console.log('Task not found on server, it may have already been deleted');
        // Return a success response to prevent UI errors
        return { success: true, message: 'Task deleted or not found' };
      }

      throw error;
    }
  }

  async toggleTaskCompletion(id) {
    // If it's an offline ID, toggle the offline task directly
    if (id && id.startsWith('offline_')) {
      const offlineTasks = OfflineStorage.getOfflineTasks();
      const task = offlineTasks.find(t => t._id === id);
      if (task) {
        const updatedTask = OfflineStorage.updateOfflineTask(id, {
          completed: !task.completed,
        });
        // Ensure the updated task has the isOffline flag
        const taskWithOfflineFlag = { ...updatedTask, isOffline: true };
        return { data: taskWithOfflineFlag };
      }
      throw new Error('Task not found');
    }

    try {
      const response = await this.request(`/tasks/${id}/toggle`, {
      method: 'PATCH',
    });
      return response;
    } catch (error) {
      if (error.message === 'OFFLINE_MODE') {
        // Toggle offline task completion
        const offlineTasks = OfflineStorage.getOfflineTasks();
        const task = offlineTasks.find(t => t._id === id);
        if (task) {
          const updatedTask = OfflineStorage.updateOfflineTask(id, {
            completed: !task.completed,
          });
          // Ensure the updated task has the isOffline flag
          const taskWithOfflineFlag = { ...updatedTask, isOffline: true };
          return { data: taskWithOfflineFlag };
        }
        throw new Error('Task not found');
      }
      throw error;
    }
  }

  // Project API methods with offline support
  async getProjects() {
    try {
      const response = await this.request('/projects');

      // If we're online, also include any offline projects that haven't been synced yet
      const offlineProjects = OfflineStorage.getOfflineProjects();
      if (offlineProjects.length > 0) {
        // Merge online and offline projects, with offline projects taking precedence for duplicates
        const onlineProjects = response.data || [];
        const offlineProjectIds = new Set(offlineProjects.map(p => p._id));

        // Filter out online projects that have offline versions
        const filteredOnlineProjects = onlineProjects.filter(project => !offlineProjectIds.has(project._id));

        // Combine online and offline projects
        const mergedProjects = [...filteredOnlineProjects, ...offlineProjects];
        return { data: mergedProjects };
      }

      return response;
    } catch (error) {
      if (error.message === 'OFFLINE_MODE') {
        // Return offline projects
        const offlineProjects = OfflineStorage.getOfflineProjects();
        return { data: offlineProjects };
      }
      throw error;
    }
  }

  async createProject(projectData) {
    try {
      const response = await this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
      return response;
    } catch (error) {
      if (error.message === 'OFFLINE_MODE') {
        // Store offline and add to pending sync
        const offlineProject = OfflineStorage.addOfflineProject(projectData);
        OfflineStorage.addPendingSync('projects', {
          action: 'create',
          data: projectData,
        });
        // Trigger offline project created notification
        OfflineNotifications.notifyOfflineProjectCreated(offlineProject);
        return { data: offlineProject };
      }
      throw error;
    }
  }

  async updateProject(id, projectData) {
    // If it's an offline ID, update the offline project directly
    if (id && id.startsWith('offline_')) {
      const projects = OfflineStorage.getOfflineProjects();
      const index = projects.findIndex(p => p._id === id);
      if (index !== -1) {
        projects[index] = { ...projects[index], ...projectData };
        OfflineStorage.setOfflineProjects(projects);
        // Trigger offline project updated notification
        OfflineNotifications.notifyOfflineProjectUpdated(projects[index]);
        return { data: projects[index] };
      }
      throw new Error('Project not found');
    }

    try {
      const response = await this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
      return response;
    } catch (error) {
      if (error.message === 'OFFLINE_MODE') {
        // Update offline project and add to pending sync
        const projects = OfflineStorage.getOfflineProjects();
        const index = projects.findIndex(p => p._id === id);
        if (index !== -1) {
          projects[index] = { ...projects[index], ...projectData };
          OfflineStorage.setOfflineProjects(projects);
          OfflineStorage.addPendingSync('projects', {
            action: 'update',
            id,
            data: projectData,
          });
          // Trigger offline project updated notification
          OfflineNotifications.notifyOfflineProjectUpdated(projects[index]);
          return { data: projects[index] };
        }
        throw new Error('Project not found');
      }
      throw error;
    }
  }

  async deleteProject(id) {
    // If it's an offline ID, delete the offline project directly
    if (id && id.startsWith('offline_')) {
      const projects = OfflineStorage.getOfflineProjects();
      const projectToDelete = projects.find(p => p._id === id);
      const filteredProjects = projects.filter(p => p._id !== id);
      OfflineStorage.setOfflineProjects(filteredProjects);
      // Trigger offline project deleted notification
      if (projectToDelete) {
        OfflineNotifications.notifyOfflineProjectDeleted(projectToDelete);
      }
      return { success: true, isOffline: true };
    }

    try {
      await this.request(`/projects/${id}`, {
        method: 'DELETE',
      });
      return { success: true };
    } catch (error) {
      if (error.message === 'OFFLINE_MODE') {
        // Delete offline project and add to pending sync
        const projects = OfflineStorage.getOfflineProjects();
        const projectToDelete = projects.find(p => p._id === id);
        const filteredProjects = projects.filter(p => p._id !== id);
        OfflineStorage.setOfflineProjects(filteredProjects);
        OfflineStorage.addPendingSync('projects', {
          action: 'delete',
          id,
        });
        // Trigger offline project deleted notification
        if (projectToDelete) {
          OfflineNotifications.notifyOfflineProjectDeleted(projectToDelete);
        }
        return { success: true, isOffline: true };
      }
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Utility methods
  buildQueryString(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value);
      }
    });
    return params.toString() ? `?${params.toString()}` : '';
  }

  transformTaskForBackend(task) {
    return {
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      project: task.project,
      tags: task.tags,
      completed: task.completed,
    };
  }

  transformTaskFromBackend(task) {
    return {
      ...task,
      // Add any frontend-specific transformations here
    };
  }

  // File upload methods (no offline support for files)
  async uploadFile(taskId, file) {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseURL}/uploads/task/${taskId}`;
    const config = {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header for FormData
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      throw new Error('File upload requires an internet connection');
    }
  }

  async deleteFile(taskId, filename) {
    return this.request(`/uploads/task/${taskId}/file/${filename}`, {
      method: 'DELETE',
    });
  }

  getFileUrl(filename) {
    return `${this.baseURL}/uploads/files/${filename}`;
  }

  // Offline storage access methods
  getOfflineTasks() {
    return OfflineStorage.getOfflineTasks();
  }

  getOfflineProjects() {
    return OfflineStorage.getOfflineProjects();
  }

  getPendingSync() {
    return OfflineStorage.getPendingSync();
  }

  isOnline() {
    return this.isOnline;
  }

  async createTaskDirectly(taskData) {
    // Validate task data before sending to server
    if (!taskData || !taskData.title) {
      throw new Error('Invalid task data: missing title');
    }

    // Ensure required fields are present
    const validatedTaskData = {
      title: taskData.title,
      description: taskData.description || '',
      dueDate: taskData.dueDate || '',
      project: taskData.project || 'general',
      tags: Array.isArray(taskData.tags) ? taskData.tags : [],
      completed: Boolean(taskData.completed)
    };

    console.log('Creating task with validated data:', validatedTaskData);

    const response = await this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(validatedTaskData),
    });
    return response;
  }

  async createProjectDirectly(projectData) {
    // Validate project data before sending to server
    if (!projectData || !projectData.name) {
      throw new Error('Invalid project data: missing name');
    }

    // Clean and validate the project data
    const validatedProjectData = {
      name: projectData.name.trim(),
      description: projectData.description ? projectData.description.trim() : ''
    };

    // Additional validation
    if (validatedProjectData.name.length === 0) {
      throw new Error('Invalid project data: name cannot be empty');
    }

    if (validatedProjectData.name.length > 100) {
      throw new Error('Invalid project data: name too long (max 100 characters)');
    }

    console.log('Creating project with validated data:', validatedProjectData);
    console.log('Original project data:', projectData);

    // Check if project already exists online before creating
    try {
      const existingCheck = await OfflineStorage.checkOnlineProjectExists(validatedProjectData);
      if (existingCheck.exists) {
        console.log('Project already exists online, skipping creation:', validatedProjectData.name);
        return { success: true, message: 'Project already exists', data: existingCheck.project };
      }
    } catch (error) {
      console.log('Could not check for existing project, proceeding with creation:', error.message);
    }

    try {
      const response = await this.request('/projects', {
        method: 'POST',
        body: JSON.stringify(validatedProjectData),
      });
      console.log('Project created successfully:', response);
      return response;
    } catch (error) {
      console.error('Failed to create project:', error);
      console.error('Project data that failed:', validatedProjectData);

      // If it's a 409 conflict, the project already exists
      if (error.message.includes('409') || error.message.includes('already exists') || error.message.includes('duplicate')) {
        console.log('Project already exists on server, skipping:', validatedProjectData.name);
        return { success: true, message: 'Project already exists' };
      }

      throw error;
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService();

export { OfflineNotifications };
export default apiService;
