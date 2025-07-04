import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider, ColorModeScript, extendTheme } from '@chakra-ui/react';
import { registerSW } from 'virtual:pwa-register';
import { AuthProvider } from './contexts/AuthContext';
import App from './App.jsx';

// Create theme with dark mode as default
const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
});

// Development helper: Clear old service workers and cache
if (import.meta.env.DEV) {
  if ('serviceWorker' in navigator) {
    // Unregister all existing service workers
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (let registration of registrations) {
        registration.unregister();
      }
    });

    // Clear all caches
    if ('caches' in window) {
      caches.keys().then((cacheNames) => {
        cacheNames.forEach((cacheName) => {
          caches.delete(cacheName);
        });
      });
    }

    // Note: Removed localStorage.clear() to preserve authentication tokens
    // Only clear sessionStorage for development
    sessionStorage.clear();
  }
}

// Register PWA service worker with better error handling
const updateSW = registerSW({
  onNeedRefresh() {
    // Show update notification
    if (confirm('New content available. Reload?')) {
      updateSW();
    }
  },
  onOfflineReady() {
    // App ready to work offline
  },
  onRegisterError(error) {
    console.error('SW registration error:', error);
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <>
    <ColorModeScript initialColorMode="dark" />
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ChakraProvider>
  </>
);
