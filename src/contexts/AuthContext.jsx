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
    let timeoutId = null;

    const checkAuthStatus = async () => {
      // Prevent multiple simultaneous auth checks
      if (isCheckingAuth.current) {
        return;
      }

      // Throttle auth checks to prevent excessive API calls
      const now = Date.now();
      const throttleTime = import.meta.env.DEV ? 30000 : 30000; // 30s in both dev and prod
      if (now - lastAuthCheck.current < throttleTime) {
        return;
      }

      // Add timeout to prevent infinite loading
      timeoutId = setTimeout(() => {
        console.log('Auth check timeout, forcing loading state to false');
        setIsLoading(false);
        isCheckingAuth.current = false;
      }, 5000); // Reduced from 10s to 5s

      try {
        isCheckingAuth.current = true;
        setIsLoading(true);

        // If user has explicitly logged out, don't attempt auto-login
        if (hasExplicitlyLoggedOut) {
          console.log('User has explicitly logged out, skipping auth check');
          setIsAuthenticated(false);
          setUser(null);
          setIsLoading(false);
          isCheckingAuth.current = false;
          if (timeoutId) clearTimeout(timeoutId);
          return;
        }

        // Check if backend server is accessible
        console.log('Checking backend server health...');
        const healthCheck = await apiService.healthCheck();
        console.log('Backend health check result:', healthCheck);

        if (healthCheck.status !== 'ok') {
          console.log('Backend server is not accessible, skipping auth check');
          setIsAuthenticated(false);
          setUser(null);
          setIsLoading(false);
          isCheckingAuth.current = false;
          if (timeoutId) clearTimeout(timeoutId);
          return;
        }

        // Check if we have any tokens stored
        const hasToken = apiService.isAuthenticated();
        const hasRefreshToken = !!localStorage.getItem(apiService.refreshTokenKey);

        if (!hasToken && !hasRefreshToken) {
          console.log('No tokens found, user is not authenticated');
          setIsAuthenticated(false);
          setUser(null);
          setIsLoading(false);
          isCheckingAuth.current = false;
          if (timeoutId) clearTimeout(timeoutId);
          return;
        }

        // Try to validate the current token first
        if (hasToken) {
          try {
            console.log('Validating current token...');
            const validationResult = await apiService.validateToken();
            console.log('Token validation successful');
            setIsAuthenticated(true);
            setUser(validationResult.user);
            lastAuthCheck.current = now;
            setIsLoading(false);
            isCheckingAuth.current = false;
            if (timeoutId) clearTimeout(timeoutId);
            return;
          } catch (validationError) {
            console.log('Token validation failed:', validationError.message);
            // Token is invalid, try to refresh
          }
        }

        // Try to refresh token if we have one
        if (hasRefreshToken) {
          try {
            console.log('Attempting to refresh token...');
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

            console.log('Token refresh successful');
            setIsAuthenticated(true);
            lastAuthCheck.current = now;
            setIsLoading(false);
            isCheckingAuth.current = false;
            if (timeoutId) clearTimeout(timeoutId);
            return;
          } catch (refreshError) {
            console.log('Token refresh failed:', refreshError.message);
            // Both validation and refresh failed, clear everything
            apiService.clearSession();
            setIsAuthenticated(false);
            setUser(null);
            setIsLoading(false);
            isCheckingAuth.current = false;
            if (timeoutId) clearTimeout(timeoutId);
            return;
          }
        } else {
          // No refresh token available
          console.log('No refresh token available, clearing session');
          apiService.clearSession();
          setIsAuthenticated(false);
          setUser(null);
          setIsLoading(false);
          isCheckingAuth.current = false;
          if (timeoutId) clearTimeout(timeoutId);
          return;
        }
      } catch (error) {
        console.error('Auth check error:', error);
        apiService.clearSession();
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        isCheckingAuth.current = false;
        if (timeoutId) clearTimeout(timeoutId);
      }
    };

    // Only run checkAuthStatus if user hasn't explicitly logged out
    if (!hasExplicitlyLoggedOut) {
      checkAuthStatus();
    } else {
      // If user has explicitly logged out, ensure we're in logged out state
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
    }

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
            // Double-check that user hasn't logged out before running auth check
            if (!hasExplicitlyLoggedOut) {
              checkAuthStatus();
            }
          }, import.meta.env.DEV ? 3000 : 2000); // Reduced from 5s to 3s in dev, 3s to 2s in prod
        }
      }
    };

    // Improved visibility change handler with debouncing
    const handleVisibilityChange = () => {
      if (!document.hidden && !hasExplicitlyLoggedOut) {
        // Only check auth if we haven't checked recently
        const now = Date.now();
        const minInterval = import.meta.env.DEV ? 300000 : 300000; // 5 min in both dev and prod
        if (now - lastAuthCheck.current > minInterval) {
          // Debounce visibility changes
          if (visibilityChangeTimeout.current) {
            clearTimeout(visibilityChangeTimeout.current);
          }
          visibilityChangeTimeout.current = setTimeout(() => {
            // Double-check that user hasn't logged out before running auth check
            if (!hasExplicitlyLoggedOut) {
              checkAuthStatus();
            }
          }, import.meta.env.DEV ? 5000 : 3000); // Reduced from 10s to 5s in dev, 5s to 3s in prod
        }
      }
    };

    // Listen for page focus events (alternative to visibility change)
    const handlePageFocus = () => {
      if (!hasExplicitlyLoggedOut) {
        const now = Date.now();
        const minInterval = import.meta.env.DEV ? 600000 : 600000; // 10 min in both dev and prod
        if (now - lastAuthCheck.current > minInterval) {
          if (visibilityChangeTimeout.current) {
            clearTimeout(visibilityChangeTimeout.current);
          }
          visibilityChangeTimeout.current = setTimeout(() => {
            // Double-check that user hasn't logged out before running auth check
            if (!hasExplicitlyLoggedOut) {
              checkAuthStatus();
            }
          }, import.meta.env.DEV ? 3000 : 2000); // Reduced from 5s to 3s in dev, 2s to 2s in prod
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
      if (timeoutId) {
        clearTimeout(timeoutId);
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
    try {
      console.log('Logging out user...');
      await apiService.logout();
      console.log('Backend logout successful');
    } catch (error) {
      console.error('Backend logout failed:', error);
      // Logout request failed silently
    } finally {
      // Clear session and set logout state
      console.log('Clearing session and setting logout state');
      apiService.clearSession();
      setIsAuthenticated(false);
      setUser(null);
      setHasAttemptedAutoLogin(false);
      setHasExplicitlyLoggedOut(true);
      lastAuthCheck.current = 0;
      isCheckingAuth.current = false;
      console.log('Logout completed - user should be unauthenticated');
    }
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

  const oauthLogin = async (token, refreshToken) => {
    try {
      // Store tokens
      localStorage.setItem(apiService.tokenKey, token);
      localStorage.setItem(apiService.refreshTokenKey, refreshToken);

      // Get current user data
      const userResult = await apiService.getCurrentUser();

      setIsAuthenticated(true);
      setUser(userResult.user);
      setHasAttemptedAutoLogin(false);
      setHasExplicitlyLoggedOut(false);
      lastAuthCheck.current = Date.now();

      return userResult;
    } catch (error) {
      console.error('OAuth login error:', error);
      throw error;
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
    oauthLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
