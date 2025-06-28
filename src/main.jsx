import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, ColorModeScript, extendTheme } from '@chakra-ui/react';
import { registerSW } from 'virtual:pwa-register';
import App from './App.jsx';

// Create theme with dark mode as default
const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
});

// Register PWA service worker
const updateSW = registerSW({
  onNeedRefresh() {
    // Show update notification
    if (confirm('New content available. Reload?')) {
      updateSW();
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ColorModeScript initialColorMode="dark" />
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
