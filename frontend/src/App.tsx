import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Lobby } from './pages/Lobby';
import { GameRoom } from './pages/GameRoom';
import { Profile } from './pages/Profile';
import { Leaderboards } from './pages/Leaderboards';
import { StudyDocs } from './pages/StudyDocs';

// Protected Route Wrapper: requires authentication and wraps pages with SocketProvider
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-400 gap-2 font-montserrat">
        <div className="h-8 w-8 border-4 border-history-gold/30 border-t-history-gold rounded-full animate-spin" />
        <span>Đang xác thực tài khoản học viên...</span>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <SocketProvider>{children}</SocketProvider>;
};

// Public Route Wrapper: redirects authenticated users to lobby
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-400 gap-2 font-montserrat">
        <div className="h-8 w-8 border-4 border-history-gold/30 border-t-history-gold rounded-full animate-spin" />
        <span>Đang kết nối...</span>
      </div>
    );
  }

  if (token) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="relative min-h-screen pb-12 overflow-hidden">
          
          {/* Dong Son Drum SVG Background Watermark */}
          <div className="dong-son-bg" />

          {/* Page Routing */}
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Authenticated / Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Lobby />
                </ProtectedRoute>
              }
            />
            <Route
              path="/game/:roomCode"
              element={
                <ProtectedRoute>
                  <GameRoom />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/:userId"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <Leaderboards />
                </ProtectedRoute>
              }
            />
            <Route
              path="/study"
              element={
                <ProtectedRoute>
                  <StudyDocs />
                </ProtectedRoute>
              }
            />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
