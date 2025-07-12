import { useEffect, useRef, useCallback } from 'react';
import statePersistence from '../utils/statePersistence';

/**
 * Custom hook to handle tab persistence and prevent unnecessary reloads
 * when switching between tabs
 */
export const useTabPersistence = () => {
  const isPageVisible = useRef(true);
  const lastFocusTime = useRef(Date.now());
  const focusTimeoutRef = useRef(null);

  // Handle page visibility changes
  const handleVisibilityChange = useCallback(() => {
    const wasVisible = isPageVisible.current;
    const isVisible = !document.hidden;

    isPageVisible.current = isVisible;

    // Only handle focus events, not blur events to prevent unnecessary actions
    if (isVisible && !wasVisible) {
      const now = Date.now();
      const timeSinceLastFocus = now - lastFocusTime.current;

      // Only trigger actions if it's been more than 30 seconds since last focus
      if (timeSinceLastFocus > 30000) {
        lastFocusTime.current = now;

        // Clear any existing timeout
        if (focusTimeoutRef.current) {
          clearTimeout(focusTimeoutRef.current);
        }

        // Debounce the focus event
        focusTimeoutRef.current = setTimeout(() => {
          // Save current app state
          const currentState = {
            url: window.location.href,
            timestamp: Date.now(),
            scrollPosition: {
              x: window.scrollX,
              y: window.scrollY
            }
          };

          statePersistence.set('lastFocusState', currentState);
        }, 1000);
      }
    }
  }, []);

  // Handle window focus events
  const handleWindowFocus = useCallback(() => {
    if (isPageVisible.current) {
      const now = Date.now();
      const timeSinceLastFocus = now - lastFocusTime.current;

      // Only handle focus if it's been more than 60 seconds
      if (timeSinceLastFocus > 60000) {
        lastFocusTime.current = now;

        // Restore scroll position if available
        const lastState = statePersistence.get('lastFocusState');
        if (lastState && lastState.scrollPosition) {
          // Only restore if we're on the same page
          if (lastState.url === window.location.href) {
            setTimeout(() => {
              window.scrollTo(lastState.scrollPosition.x, lastState.scrollPosition.y);
            }, 100);
          }
        }
      }
    }
  }, []);

  // Handle beforeunload to save state
  const handleBeforeUnload = useCallback(() => {
    const currentState = {
      url: window.location.href,
      timestamp: Date.now(),
      scrollPosition: {
        x: window.scrollX,
        y: window.scrollY
      }
    };

    statePersistence.set('lastFocusState', currentState);
  }, []);

  useEffect(() => {
    // Set initial state
    isPageVisible.current = !document.hidden;
    lastFocusTime.current = Date.now();

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('beforeunload', handleBeforeUnload);

      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
    };
  }, [handleVisibilityChange, handleWindowFocus, handleBeforeUnload]);

  // Return functions for manual state management
  return {
    saveCurrentState: () => {
      const currentState = {
        url: window.location.href,
        timestamp: Date.now(),
        scrollPosition: {
          x: window.scrollX,
          y: window.scrollY
        }
      };
      statePersistence.set('lastFocusState', currentState);
    },

    restoreState: () => {
      const lastState = statePersistence.get('lastFocusState');
      if (lastState && lastState.scrollPosition) {
        if (lastState.url === window.location.href) {
          window.scrollTo(lastState.scrollPosition.x, lastState.scrollPosition.y);
          return true;
        }
      }
      return false;
    },

    clearState: () => {
      statePersistence.remove('lastFocusState');
    }
  };
};
