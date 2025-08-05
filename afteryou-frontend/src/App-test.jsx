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
import SystemMonitoring from './pages/SystemMonitoring';
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
        <Route path="system" element={<SystemMonitoring />} />
      </Route>

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
        <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
          <Router>
            <AppRoutes />
          </Router>
        </Box>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
