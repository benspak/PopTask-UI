import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import AuthGuard from './components/AuthGuard';
import Login from './views/Login';
import Register from './views/Register';
import ForgotPassword from './views/ForgotPassword';
import ResetPassword from './views/ResetPassword';
import EmailVerification from './components/EmailVerification';
import Dashboard from './components/Dashboard';
import SharedView from './components/SharedView';
import Homepage from './components/Homepage';
import Changelog from './components/Changelog';
import { Spinner, Center, VStack, Text } from '@chakra-ui/react';

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();

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
      <Route path="/changelog" element={<Changelog />} />
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

      {/* Shared content routes (public) */}
      <Route path="/shared/:type/:token" element={<SharedView />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={
        <AuthGuard>
          <Dashboard />
        </AuthGuard>
      } />

      {/* Catch all route - redirect to appropriate page */}
      <Route path="*" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />
      } />
    </Routes>
  );
}
