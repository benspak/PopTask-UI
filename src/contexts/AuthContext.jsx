import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import apiService from '../services/api';

const AuthContext = createContext();

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
      if (now - lastAuthCheck.current < 30000) { // 30 second throttle
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
          }, 3000);
        }
      }
    };

    // Improved visibility change handler with debouncing
    const handleVisibilityChange = () => {
      if (!document.hidden && !hasExplicitlyLoggedOut) {
        // Only check auth if we haven't checked recently
        const now = Date.now();
        if (now - lastAuthCheck.current > 300000) { // 5 minute minimum interval
          // Debounce visibility changes
          if (visibilityChangeTimeout.current) {
            clearTimeout(visibilityChangeTimeout.current);
          }
          visibilityChangeTimeout.current = setTimeout(() => {
            checkAuthStatus();
          }, 5000); // 5 second delay
        }
      }
    };

    // Listen for page focus events (alternative to visibility change)
    const handlePageFocus = () => {
      if (!hasExplicitlyLoggedOut) {
        const now = Date.now();
        if (now - lastAuthCheck.current > 600000) { // 10 minute minimum interval
          if (visibilityChangeTimeout.current) {
            clearTimeout(visibilityChangeTimeout.current);
          }
          visibilityChangeTimeout.current = setTimeout(() => {
            checkAuthStatus();
          }, 2000);
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
