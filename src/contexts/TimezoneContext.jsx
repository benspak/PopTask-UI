import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserTimezone, isValidTimezone } from '../utils/timezone';

// Create context with a default value to prevent the error
const TimezoneContext = createContext({
  userTimezone: 'UTC',
  updateTimezone: () => {},
});

export const useTimezone = () => {
  const context = useContext(TimezoneContext);
  if (!context) {
    throw new Error('useTimezone must be used within a TimezoneProvider');
  }
  return context;
};

export const TimezoneProvider = ({ children }) => {
  const [userTimezone, setUserTimezone] = useState('UTC');

  // Initialize timezone from browser
  useEffect(() => {
    const browserTimezone = getUserTimezone();
    if (isValidTimezone(browserTimezone)) {
      setUserTimezone(browserTimezone);
    }
  }, []);

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
