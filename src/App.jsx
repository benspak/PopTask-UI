import React from 'react';
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
import Dashboard from './components/Dashboard';
import SharedView from './components/SharedView';
import Homepage from './components/Homepage';
import { Spinner, Center, VStack, Text, HStack, Link, Box } from '@chakra-ui/react';
import { ClientList } from './components/ClientList';
import { ProjectList } from './components/ProjectList';
import { InvoiceList } from './components/InvoiceList';
import { InvoiceCreatePanel } from './components/InvoiceCreatePanel';
import { InvoiceDetail } from './components/InvoiceDetail';
import { InvoiceEditPanel } from './components/InvoiceEditPanel';
import Settings from './components/Settings';
import PublicProfile from './components/PublicProfile';
import CompanyVerification from './components/CompanyVerification';
import CompanyList from './components/CompanyList';
import PublicCompanyDetail from './components/PublicCompanyDetail';
import TeamList from './components/TeamList';
import ProposalTemplateList from './components/ProposalTemplateList';

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

  const { isAuthenticated, isLoading } = authContext;

  // Initialize tab persistence
  useTabPersistence();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading...</Text>
        </VStack>
      </Center>
    );
  }

  return (
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

      {/* Shared content routes (public) */}
      <Route path="/shared/:type/:token" element={<SharedView />} />
      <Route path="/profile/:username" element={<PublicProfile />} />
      <Route path="/users/:username" element={<PublicProfile />} />
      <Route path="/company/:slug/:token" element={<PublicCompanyDetail />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={
        <AuthGuard>
          <Dashboard />
        </AuthGuard>
      } />
      <Route path="/clients" element={
        <AuthGuard>
          <ClientList />
        </AuthGuard>
      } />
      <Route path="/projects" element={
        <AuthGuard>
          <ProjectList />
        </AuthGuard>
      } />
      <Route path="/invoices" element={
        <AuthGuard>
          <InvoiceList />
        </AuthGuard>
      } />
      <Route path="/invoices/create" element={
        <AuthGuard>
          <InvoiceCreatePanel />
        </AuthGuard>
      } />
      <Route path="/invoices/:invoiceId" element={
        <AuthGuard>
          <InvoiceDetail />
        </AuthGuard>
      } />
      <Route path="/invoices/:invoiceId/edit" element={
        <AuthGuard>
          <InvoiceEditPanel />
        </AuthGuard>
      } />
      <Route path="/settings" element={
        <AuthGuard>
          <Settings />
        </AuthGuard>
      } />
      <Route path="/companies" element={
        <AuthGuard>
          <CompanyList />
        </AuthGuard>
      } />
      <Route path="/teams" element={
        <AuthGuard>
          <ProGuard>
            <TeamList />
          </ProGuard>
        </AuthGuard>
      } />
      <Route path="/proposal-templates" element={
        <AuthGuard>
          <ProGuard>
            <ProposalTemplateList />
          </ProGuard>
        </AuthGuard>
      } />

      {/* Catch all route - redirect to appropriate page */}
      <Route path="*" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />
      } />
    </Routes>
  );
}
