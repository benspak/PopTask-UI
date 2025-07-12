import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider, ColorModeScript, extendTheme } from '@chakra-ui/react';
import { registerSW } from 'virtual:pwa-register';
import { AuthProvider } from './contexts/AuthContext';
import { TimezoneProvider } from './contexts/TimezoneContext';
import App from './App.jsx';

// Create theme with dark mode as default
const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
});

// Production-ready service worker handling with improved tab switching support

// Register PWA service worker with better error handling
const updateSW = registerSW({
  onNeedRefresh() {
    // Show update notification with better UX
    if (confirm('New content available. Reload to get the latest features?')) {
      updateSW();
    }
  },
  onOfflineReady() {
    // App ready to work offline
    console.log('App is ready to work offline');
  },
  onRegisterError(error) {
    // Service worker registration error handled silently in production
    console.warn('Service worker registration failed:', error);
  },
  // Add immediate update option for better UX
  immediate: true
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <>
    <ColorModeScript initialColorMode="dark" />
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <AuthProvider>
          <TimezoneProvider>
            <App />
          </TimezoneProvider>
        </AuthProvider>
      </BrowserRouter>
    </ChakraProvider>
  </>
);
