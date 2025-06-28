import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { registerSW } from 'virtual:pwa-register';
import App from './App.jsx';

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
    <ChakraProvider>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
