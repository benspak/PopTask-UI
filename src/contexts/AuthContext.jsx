import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import apiService from '../services/api';

// Create context with a default value to prevent the error
const AuthContext = createContext({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [hasAttemptedAutoLogin, setHasAttemptedAutoLogin] = useState(false);
  const [hasExplicitlyLoggedOut, setHasExplicitlyLoggedOut] = useState(false);

  // Add refs to track state and prevent unnecessary re-authentication
  const lastAuthCheck = useRef(0);
  const isCheckingAuth = useRef(false);
  const visibilityChangeTimeout = useRef(null);

  // Check authentication status on mount and when tokens change
  useEffect(() => {
    const checkAuthStatus = async () => {
      // Prevent multiple simultaneous auth checks
      if (isCheckingAuth.current) {
        return;
      }

      // Throttle auth checks to prevent excessive API calls
      const now = Date.now();
      const throttleTime = import.meta.env.DEV ? 60000 : 30000; // 1 min in dev, 30s in prod
      if (now - lastAuthCheck.current < throttleTime) {
        return;
      }

      try {
        isCheckingAuth.current = true;
        setIsLoading(true);

        // If user has explicitly logged out, don't attempt auto-login
        if (hasExplicitlyLoggedOut) {
          setIsAuthenticated(false);
          setUser(null);
          return;
        }

        // Check if we have any tokens stored
        const hasToken = apiService.isAuthenticated();
        const hasRefreshToken = !!localStorage.getItem(apiService.refreshTokenKey);

        if (!hasToken && !hasRefreshToken) {
          setIsAuthenticated(false);
          setUser(null);
          return;
        }

        // Try to validate the current token first
        if (hasToken) {
          try {
            const validationResult = await apiService.validateToken();
            setIsAuthenticated(true);
            setUser(validationResult.user);
            lastAuthCheck.current = now;
            return;
          } catch (validationError) {
            // Token is invalid, try to refresh
          }
        }

        // Try to refresh token if we have one
        if (hasRefreshToken) {
          try {
            const refreshResult = await apiService.refreshToken();

            // Store the new tokens
            if (refreshResult.token) {
              localStorage.setItem(apiService.tokenKey, refreshResult.token);
            }
            if (refreshResult.refreshToken) {
              localStorage.setItem(apiService.refreshTokenKey, refreshResult.refreshToken);
            }

            // Get user info from the refresh response or validate the new token
            if (refreshResult.user) {
              setUser(refreshResult.user);
            } else {
              // If no user info in refresh response, validate the new token
              const validationResult = await apiService.validateToken();
              setUser(validationResult.user);
            }

            setIsAuthenticated(true);
            lastAuthCheck.current = now;
            return;
          } catch (refreshError) {
            // Both validation and refresh failed, clear everything
            apiService.clearSession();
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          // No refresh token available
          apiService.clearSession();
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        apiService.clearSession();
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
        isCheckingAuth.current = false;
      }
    };

    checkAuthStatus();

    // Listen for storage changes (when tokens are updated in other tabs)
    const handleStorageChange = (e) => {
      if (e.key === apiService.tokenKey || e.key === apiService.refreshTokenKey) {
        // Only check auth status if user hasn't explicitly logged out
        if (!hasExplicitlyLoggedOut) {
          // Debounce storage change events
          if (visibilityChangeTimeout.current) {
            clearTimeout(visibilityChangeTimeout.current);
          }
          visibilityChangeTimeout.current = setTimeout(() => {
            checkAuthStatus();
          }, import.meta.env.DEV ? 5000 : 3000); // 5s in dev, 3s in prod
        }
      }
    };

    // Improved visibility change handler with debouncing
    const handleVisibilityChange = () => {
      if (!document.hidden && !hasExplicitlyLoggedOut) {
        // Only check auth if we haven't checked recently
        const now = Date.now();
        const minInterval = import.meta.env.DEV ? 600000 : 300000; // 10 min in dev, 5 min in prod
        if (now - lastAuthCheck.current > minInterval) {
          // Debounce visibility changes
          if (visibilityChangeTimeout.current) {
            clearTimeout(visibilityChangeTimeout.current);
          }
          visibilityChangeTimeout.current = setTimeout(() => {
            checkAuthStatus();
          }, import.meta.env.DEV ? 10000 : 5000); // 10s delay in dev, 5s in prod
        }
      }
    };

    // Listen for page focus events (alternative to visibility change)
    const handlePageFocus = () => {
      if (!hasExplicitlyLoggedOut) {
        const now = Date.now();
        const minInterval = import.meta.env.DEV ? 900000 : 600000; // 15 min in dev, 10 min in prod
        if (now - lastAuthCheck.current > minInterval) {
          if (visibilityChangeTimeout.current) {
            clearTimeout(visibilityChangeTimeout.current);
          }
          visibilityChangeTimeout.current = setTimeout(() => {
            checkAuthStatus();
          }, import.meta.env.DEV ? 5000 : 2000); // 5s in dev, 2s in prod
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handlePageFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handlePageFocus);
      if (visibilityChangeTimeout.current) {
        clearTimeout(visibilityChangeTimeout.current);
      }
    };
  }, [hasExplicitlyLoggedOut]);

  const login = async (credentials) => {
    try {
      const result = await apiService.login(credentials);

      // Store tokens if they exist in the response
      if (result.token) {
        localStorage.setItem(apiService.tokenKey, result.token);
      }

      if (result.refreshToken) {
        localStorage.setItem(apiService.refreshTokenKey, result.refreshToken);
      }

      setIsAuthenticated(true);
      setUser(result.user);
      setHasAttemptedAutoLogin(false);
      setHasExplicitlyLoggedOut(false);
      lastAuthCheck.current = Date.now();
      return result;
    } catch (error) {
      // Handle email verification required error
      if (error.response?.status === 403 && error.response?.data?.requiresEmailVerification) {
        // Store tokens even for unverified users so they can access the verification prompt
        if (error.response.data.token) {
          localStorage.setItem(apiService.tokenKey, error.response.data.token);
        }
        if (error.response.data.refreshToken) {
          localStorage.setItem(apiService.refreshTokenKey, error.response.data.refreshToken);
        }

        setIsAuthenticated(true);
        setUser(error.response.data.user);
        setHasAttemptedAutoLogin(false);
        setHasExplicitlyLoggedOut(false);
        lastAuthCheck.current = Date.now();
        return error.response.data;
      }
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const result = await apiService.register(userData);

      // Store tokens if they exist in the response
      if (result.token) {
        localStorage.setItem(apiService.tokenKey, result.token);
      }
      if (result.refreshToken) {
        localStorage.setItem(apiService.refreshTokenKey, result.refreshToken);
      }

      setIsAuthenticated(true);
      setUser(result.user);
      setHasAttemptedAutoLogin(false);
      setHasExplicitlyLoggedOut(false);
      lastAuthCheck.current = Date.now();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await apiService.logout();
    setIsAuthenticated(false);
    setUser(null);
    setHasAttemptedAutoLogin(false);
    setHasExplicitlyLoggedOut(true);
    lastAuthCheck.current = 0;
  };

  const refreshUser = async () => {
    try {
      const result = await apiService.getCurrentUser();
      if (result.user) {
        setUser(result.user);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      // Error refreshing user - don't throw to avoid breaking the UI
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
