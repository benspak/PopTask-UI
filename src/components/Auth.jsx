import React, { useState, useEffect } from 'react';
import Login from './Login';
import Register from './Register';
import ForgotPassword from './ForgotPassword';

const Auth = () => {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'register', 'forgot-password'

  // Determine initial view based on current route
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/register') {
      setCurrentView('register');
    } else if (path === '/login') {
      setCurrentView('login');
    } else {
      setCurrentView('login');
    }
  }, []);

  const switchToRegister = () => {
    setCurrentView('register');
    window.history.pushState({}, '', '/register');
  };

  const switchToLogin = () => {
    setCurrentView('login');
    window.history.pushState({}, '', '/login');
  };

  const switchToForgotPassword = () => {
    setCurrentView('forgot-password');
    window.history.pushState({}, '', '/forgot-password');
  };

  return (
    <>
      {currentView === 'login' && (
        <Login
          onSwitchToRegister={switchToRegister}
          onSwitchToForgotPassword={switchToForgotPassword}
        />
      )}
      {currentView === 'register' && (
        <Register onSwitchToLogin={switchToLogin} />
      )}
      {currentView === 'forgot-password' && (
        <ForgotPassword onBackToLogin={switchToLogin} />
      )}
    </>
  );
};

export default Auth;
