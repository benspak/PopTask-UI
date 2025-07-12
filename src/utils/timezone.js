// Timezone utility functions
import { format } from 'date-fns';
import { formatInTimeZone, fromZonedTime, toZonedTime, getTimezoneOffset } from 'date-fns-tz';

// Common timezone options
export const TIMEZONE_OPTIONS = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Europe/Moscow', label: 'Moscow (MSK)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZST/NZDT)' },
];

// Get user's current timezone
export const getUserTimezone = () => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return timezone || 'UTC';
  } catch (error) {
    return 'UTC';
  }
};

// Format date in user's timezone
export const formatInUserTimezone = (date, timezone, formatString = 'PPpp') => {
  try {
    return formatInTimeZone(new Date(date), timezone, formatString);
  } catch (error) {
    return format(new Date(date), formatString);
  }
};

// Convert UTC date to user's timezone
export const convertUTCToUserTimezone = (utcDate, timezone) => {
  try {
    return toZonedTime(new Date(utcDate), timezone);
  } catch (error) {
    return new Date(utcDate);
  }
};

// Convert user's timezone date to UTC
export const convertUserTimezoneToUTC = (zonedDate, timezone) => {
  try {
    return fromZonedTime(new Date(zonedDate), timezone);
  } catch (error) {
    return new Date(zonedDate);
  }
};

// Get timezone offset string
export const getTimezoneOffsetString = (timezone) => {
  try {
    // getTimezoneOffset returns offset in milliseconds, but it's the opposite of what we want
    // Positive offset means timezone is ahead of UTC, negative means behind UTC
    const offset = getTimezoneOffset(new Date(), timezone);

    // Convert to minutes and invert the sign for display
    const offsetMinutes = -Math.round(offset / (1000 * 60));
    const hours = Math.floor(offsetMinutes / 60);
    const minutes = Math.abs(offsetMinutes % 60);

    if (hours === 0 && minutes === 0) return 'UTC';

    const sign = offsetMinutes >= 0 ? '+' : '-';
    const timeString = `${sign}${Math.abs(hours).toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    return `UTC${timeString}`;
  } catch (error) {
    return 'UTC';
  }
};

// Format timezone for display
export const formatTimezoneForDisplay = (timezone) => {
  try {
    if (!timezone || typeof timezone !== 'string') {
      return 'Not set';
    }

    // Format current time in the timezone
    const currentTime = formatInTimeZone(new Date(), timezone, 'h:mm a');
    const timezoneName = timezone.split('/').pop().replace('_', ' ');
    return `${timezoneName} (${currentTime})`;
  } catch (error) {
    return 'Not set';
  }
};

// Validate timezone
export const isValidTimezone = (timezone) => {
  try {
    if (!timezone || typeof timezone !== 'string') {
      return false;
    }
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch (error) {
    return false;
  }
};
