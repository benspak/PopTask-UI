import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getUserTimezone, isValidTimezone } from '../utils/timezone';

const TimezoneContext = createContext();

export const useTimezone = () => {
  const context = useContext(TimezoneContext);
  if (!context) {
    throw new Error('useTimezone must be used within a TimezoneProvider');
  }
  return context;
};

export const TimezoneProvider = ({ children }) => {
  const { user } = useAuth();
  const [userTimezone, setUserTimezone] = useState('UTC');

  // Initialize timezone from user data or browser
  useEffect(() => {
    if (user?.timezone && isValidTimezone(user.timezone)) {
      setUserTimezone(user.timezone);
    } else {
      // Fallback to browser timezone
      const browserTimezone = getUserTimezone();
      if (isValidTimezone(browserTimezone)) {
        setUserTimezone(browserTimezone);
      }
    }
  }, [user]);

  const updateTimezone = (newTimezone) => {
    if (isValidTimezone(newTimezone)) {
      setUserTimezone(newTimezone);
    }
  };

  const value = {
    userTimezone,
    updateTimezone,
  };

  return (
    <TimezoneContext.Provider value={value}>
      {children}
    </TimezoneContext.Provider>
  );
};
