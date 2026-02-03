import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoadingScreen from "./components/Common/LoadingScreen";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import Dashboard from "./pages/Dashboard";
import MessageList from "./pages/messages/MessageList";
import CreateMessage from "./pages/messages/CreateMessage";
import MessageDetail from "./pages/messages/MessageDetail";
import EditMessage from "./pages/messages/EditMessage";
import ChainMessageView from "./pages/chains/ChainMessageView";
import UserChains from "./pages/chains/UserChains";
import SystemMonitoring from "./pages/SystemMonitoring";
import UserSettings from "./pages/settings/UserSettings";
import DigitalLocker from "./pages/locker/DigitalLocker";
import InheritanceAccess from "./pages/InheritanceAccess";
import AuthenticatedLayout from "./components/layout/AuthenticatedLayout";

// Protected Route
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

// Public Route
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <Toaster />
      <Sonner />
      <Router>
        <Routes>
          {/* Public Homepage */}
          <Route path="/" element={<HomePage />} />

          {/* Public auth */}
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

          {/* Protected routes with Navigation/Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout />
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

          {/* Public token-based routes */}
          <Route path="/inheritance/:token" element={<InheritanceAccess />} />
          <Route path="/chain/:token" element={<ChainMessageView />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
