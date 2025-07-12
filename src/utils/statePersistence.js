// State persistence utility for maintaining app state across tab switches

const STATE_STORAGE_KEY = 'poptask_app_state';
const STATE_VERSION = '1.0';

class StatePersistence {
  constructor() {
    this.state = {};
    this.listeners = new Set();
    this.loadState();
  }

  // Load state from localStorage
  loadState() {
    try {
      const stored = localStorage.getItem(STATE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.version === STATE_VERSION) {
          this.state = parsed.data || {};
        }
      }
    } catch (error) {
      this.state = {};
    }
  }

  // Save state to localStorage
  saveState() {
    try {
      const stateToSave = {
        version: STATE_VERSION,
        timestamp: Date.now(),
        data: this.state
      };
      localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      // Failed to save state silently
    }
  }

  // Get a specific piece of state
  get(key, defaultValue = null) {
    return this.state[key] !== undefined ? this.state[key] : defaultValue;
  }

  // Set a piece of state
  set(key, value) {
    this.state[key] = value;
    this.saveState();
    this.notifyListeners(key, value);
  }

  // Remove a piece of state
  remove(key) {
    if (key in this.state) {
      delete this.state[key];
      this.saveState();
      this.notifyListeners(key, undefined);
    }
  }

  // Clear all state
  clear() {
    this.state = {};
    localStorage.removeItem(STATE_STORAGE_KEY);
    this.notifyListeners('*', undefined);
  }

  // Subscribe to state changes
  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Notify listeners of state changes
  notifyListeners(key, value) {
    this.listeners.forEach(listener => {
      try {
        listener(key, value, this.state);
      } catch (error) {
        // State listener error handled silently
      }
    });
  }

  // Get all state
  getAll() {
    return { ...this.state };
  }

  // Set multiple state values at once
  setMultiple(updates) {
    Object.assign(this.state, updates);
    this.saveState();
    Object.keys(updates).forEach(key => {
      this.notifyListeners(key, updates[key]);
    });
  }

  // Check if state has a specific key
  has(key) {
    return key in this.state;
  }

  // Get state size
  size() {
    return Object.keys(this.state).length;
  }
}

// Create a singleton instance
const statePersistence = new StatePersistence();

// Export the singleton and the class for testing
export default statePersistence;
export { StatePersistence };

import React from 'react';

// React hook for using persisted state
export const usePersistedState = (key, defaultValue = null) => {
  const [value, setValue] = React.useState(() => statePersistence.get(key, defaultValue));

  React.useEffect(() => {
    const unsubscribe = statePersistence.subscribe((changedKey, newValue) => {
      if (changedKey === key || changedKey === '*') {
        setValue(statePersistence.get(key, defaultValue));
      }
    });

    return unsubscribe;
  }, [key, defaultValue]);

  const setPersistedValue = React.useCallback((newValue) => {
    statePersistence.set(key, newValue);
  }, [key]);

  return [value, setPersistedValue];
};
