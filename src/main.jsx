import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider, ColorModeScript, extendTheme } from '@chakra-ui/react';
import { AuthProvider } from './contexts/AuthContext';
import { TimezoneProvider } from './contexts/TimezoneContext';
import App from './App.jsx';
import apiService from './services/api';

// Add global debug function for testing backend connectivity
window.debugBackend = async () => {
  console.log('Testing backend connectivity...');
  try {
    const healthCheck = await apiService.healthCheck();
    console.log('Backend health check:', healthCheck);
    return healthCheck;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return { status: 'error', message: error.message };
  }
};

// Add performance monitoring
window.performanceMonitor = {
  startTime: performance.now(),

  measure(name, fn) {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    console.log(`${name}: ${duration.toFixed(2)}ms`);
    return result;
  },

  logTotalTime() {
    const total = performance.now() - this.startTime;
    console.log(`Total load time: ${total.toFixed(2)}ms`);

    if (total < 2000) {
      console.log('✅ Excellent performance!');
    } else if (total < 5000) {
      console.log('⚠️  Good performance, but could be better');
    } else {
      console.log('❌ Performance needs improvement');
    }
  }
};

// Create theme with dark mode as default
const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
});

// PWA registration is handled by the VitePWA plugin in production
// No manual registration needed in main.jsx

// Error boundary component to catch any provider errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Error logged silently in production
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h1>Something went wrong</h1>
          <p>Please refresh the page to try again.</p>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
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
  </ErrorBoundary>
);

// Log total performance after app loads
window.addEventListener('load', () => {
  setTimeout(() => {
    window.performanceMonitor.logTotalTime();
  }, 1000);
});
