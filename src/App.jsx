import React, { Suspense } from 'react';
import { Routes, Route, Navigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useTabPersistence } from './hooks/useTabPersistence';
import AuthGuard from './components/AuthGuard';
import ProGuard from './components/ProGuard';
import Login from './views/Login';
import Register from './views/Register';
import ForgotPassword from './views/ForgotPassword';
import ResetPassword from './views/ResetPassword';
import EmailVerification from './components/EmailVerification';
import OAuthCallback from './components/OAuthCallback';
import Homepage from './components/Homepage';
import { Spinner, Center, VStack, Text, HStack, Link, Box, Button } from '@chakra-ui/react';
import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy';

// Import Dashboard directly to avoid lazy loading issues
import Dashboard from './components/Dashboard';
// Import TaskDashboard directly to avoid context issues
import TaskDashboard from './components/TaskDashboard';
const SharedView = React.lazy(() => import('./components/SharedView'));
const ClientList = React.lazy(() => import('./components/ClientList'));
const ProjectList = React.lazy(() => import('./components/ProjectList'));
const InvoiceList = React.lazy(() => import('./components/InvoiceList'));
const InvoiceCreatePanel = React.lazy(() => import('./components/InvoiceCreatePanel'));
const InvoiceDetail = React.lazy(() => import('./components/InvoiceDetail'));
const InvoiceEditPanel = React.lazy(() => import('./components/InvoiceEditPanel'));
const Settings = React.lazy(() => import('./components/Settings'));
const PublicProfile = React.lazy(() => import('./components/PublicProfile'));
const CompanyVerification = React.lazy(() => import('./components/CompanyVerification'));
const CompanyList = React.lazy(() => import('./components/CompanyList'));
const PublicCompanyDetail = React.lazy(() => import('./components/PublicCompanyDetail'));
const TeamList = React.lazy(() => import('./components/TeamList'));
const ProposalTemplateList = React.lazy(() => import('./components/ProposalTemplateList'));
const JobList = React.lazy(() => import('./components/JobList'));
const PublicJobBoard = React.lazy(() => import('./components/PublicJobBoard'));
const PublicJobDetail = React.lazy(() => import('./components/PublicJobDetail'));

// Error boundary for lazy-loaded components
class LazyComponentErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Lazy component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Center h="100vh">
          <VStack spacing={4}>
            <Text color="red.500">Something went wrong loading this component</Text>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
            >
              Reload Page
            </Button>
          </VStack>
        </Center>
      );
    }

    return this.props.children;
  }
}

// Wrapper component for lazy-loaded components with error boundary
const SafeLazyComponent = ({ component: Component, ...props }) => (
  <LazyComponentErrorBoundary>
    <Component {...props} />
  </LazyComponentErrorBoundary>
);

// Loading component for lazy-loaded routes
const LoadingSpinner = () => (
  <Center h="100vh">
    <VStack spacing={4}>
      <Spinner size="xl" />
      <Text>Loading...</Text>
    </VStack>
  </Center>
);

export default function App() {
  // Wrap useAuth in a try-catch to handle any context errors
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    // Return a loading state if auth context is not available
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading authentication...</Text>
        </VStack>
      </Center>
    );
  }

  const { isAuthenticated, isLoading, user } = authContext;

  // Initialize tab persistence
  useTabPersistence();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading...</Text>
          {/* Debug information */}
          <Text fontSize="sm" color="gray.500">
            Auth Debug: isAuthenticated={typeof isAuthenticated === 'boolean' ? isAuthenticated.toString() : 'unknown'}, user={user ? 'exists' : 'null'}
          </Text>
          {/* Temporary debug button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
          >
            Clear Auth & Reload (Debug)
          </Button>
        </VStack>
      </Center>
    );
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
        } />
        <Route path="/forgot-password" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPassword />
        } />
        <Route path="/reset-password" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <ResetPassword />
        } />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/verify-company/:token" element={<CompanyVerification />} />
        <Route path="/oauth-callback" element={<OAuthCallback />} />

        {/* Shared content routes (public) */}
        <Route path="/shared/:type/:token" element={<SafeLazyComponent component={SharedView} />} />
        <Route path="/profile/:username" element={<SafeLazyComponent component={PublicProfile} />} />
        <Route path="/users/:username" element={<SafeLazyComponent component={PublicProfile} />} />
        <Route path="/company/:slug/:token" element={<SafeLazyComponent component={PublicCompanyDetail} />} />
        <Route path="/jobs" element={<SafeLazyComponent component={PublicJobBoard} />} />
        <Route path="/jobs/:slug" element={<SafeLazyComponent component={PublicJobDetail} />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={
          <AuthGuard>
            <Dashboard />
          </AuthGuard>
        } />
        <Route path="/tasks" element={
          <AuthGuard>
            <TaskDashboard />
          </AuthGuard>
        } />
        <Route path="/clients" element={
          <AuthGuard>
            <SafeLazyComponent component={ClientList} />
          </AuthGuard>
        } />
        <Route path="/projects" element={
          <AuthGuard>
            <SafeLazyComponent component={ProjectList} />
          </AuthGuard>
        } />
        <Route path="/invoices" element={
          <AuthGuard>
            <SafeLazyComponent component={InvoiceList} />
          </AuthGuard>
        } />
        <Route path="/invoices/create" element={
          <AuthGuard>
            <SafeLazyComponent component={InvoiceCreatePanel} />
          </AuthGuard>
        } />
        <Route path="/invoices/:invoiceId" element={
          <AuthGuard>
            <SafeLazyComponent component={InvoiceDetail} />
          </AuthGuard>
        } />
        <Route path="/invoices/:invoiceId/edit" element={
          <AuthGuard>
            <SafeLazyComponent component={InvoiceEditPanel} />
          </AuthGuard>
        } />
        <Route path="/settings" element={
          <AuthGuard>
            <SafeLazyComponent component={Settings} />
          </AuthGuard>
        } />
        <Route path="/companies" element={
          <AuthGuard>
            <SafeLazyComponent component={CompanyList} />
          </AuthGuard>
        } />
        <Route path="/teams" element={
          <AuthGuard>
            <ProGuard>
              <SafeLazyComponent component={TeamList} />
            </ProGuard>
          </AuthGuard>
        } />
        <Route path="/proposal-templates" element={
          <AuthGuard>
            <ProGuard>
              <SafeLazyComponent component={ProposalTemplateList} />
            </ProGuard>
          </AuthGuard>
        } />
        <Route path="/jobs/manage" element={
          <AuthGuard>
            <ProGuard>
              <SafeLazyComponent component={JobList} />
            </ProGuard>
          </AuthGuard>
        } />

        {/* Catch all route - redirect to appropriate page */}
        <Route path="*" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />
        } />
      </Routes>
    </Suspense>
  );
}
