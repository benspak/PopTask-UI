import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTimezone } from '../contexts/TimezoneContext';
import { isValidTimezone } from '../utils/timezone';

export const useAuthWithTimezone = () => {
  const { user, refreshUser } = useAuth();
  const { userTimezone, updateTimezone } = useTimezone();

  // Update timezone when user data becomes available
  useEffect(() => {
    if (user?.timezone && isValidTimezone(user.timezone)) {
      updateTimezone(user.timezone);
    }
  }, [user?.timezone, updateTimezone]);

  return { user, userTimezone, updateTimezone, refreshUser };
};
