// Utility function to format hours to hh:mm format
export const formatHoursToTime = (hours) => {
  if (!hours || hours === 0) return '00:00';

  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

// Utility function to format seconds to hh:mm format
export const formatSecondsToTime = (seconds) => {
  if (!seconds || seconds === 0) return '00:00';

  const totalMinutes = Math.floor(seconds / 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

// Utility function to format minutes to hh:mm format
export const formatMinutesToTime = (minutes) => {
  if (!minutes || minutes === 0) return '00:00';

  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

// Utility function to convert hh:mm format to decimal hours
export const parseTimeToHours = (timeString) => {
  if (!timeString || timeString === '00:00') return 0;

  const [hours, minutes] = timeString.split(':').map(Number);
  return hours + (minutes / 60);
};
