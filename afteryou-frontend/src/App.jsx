import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import afterYouTheme from './theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import MessageList from './pages/MessageList';
import CreateMessage from './pages/CreateMessage';
import MessageDetail from './pages/MessageDetail';
import EditMessage from './pages/EditMessage';
import ChainMessageView from './pages/ChainMessageView';
import UserChains from './pages/UserChains';
import SystemMonitoring from './pages/SystemMonitoring';
import UserSettings from './pages/UserSettings';
import DigitalLocker from './pages/DigitalLocker';
import InheritanceAccess from './pages/InheritanceAccess';
import Layout from './components/Layout/Layout';
import LoadingScreen from './components/Common/LoadingScreen';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Protected routes with layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
  <Route path="messages" element={<MessageList />} />
  <Route path="messages/create" element={<CreateMessage />} />
  <Route path="messages/:id" element={<MessageDetail />} />
  <Route path="messages/:id/edit" element={<EditMessage />} />
        <Route path="chains" element={<UserChains />} />
        <Route path="system" element={<SystemMonitoring />} />
        <Route path="settings" element={<UserSettings />} />
        <Route path="digital-locker" element={<DigitalLocker />} />
      </Route>

      {/* Public inheritance access route */}
      <Route 
        path="/inheritance/:token" 
        element={<InheritanceAccess />} 
      />

      {/* Public chain message access route */}
      <Route 
        path="/chain/:token" 
        element={<ChainMessageView />} 
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={afterYouTheme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
