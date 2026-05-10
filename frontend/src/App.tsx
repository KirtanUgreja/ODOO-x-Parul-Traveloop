import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import Dashboard from './pages/Dashboard';
import MyTrips from './pages/MyTrips';
import TripDetail from './pages/TripDetail';
import AIGenerator from './pages/AIGenerator';
import BudgetAnalytics from './pages/BudgetAnalytics';
import Profile from './pages/Profile';
import PublicTrip from './pages/PublicTrip';
import Notifications from './pages/Notifications';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(12px)',
            borderRadius: '16px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <Router>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Public Shared Trips */}
          <Route path="/share/:shareToken" element={<PublicTrip />} />

          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Route>

          {/* Protected Dashboard Routes */}
          <Route 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/trips" element={<MyTrips />} />
            <Route path="/trips/:id" element={<TripDetail />} />
            <Route path="/generator" element={<AIGenerator />} />
            <Route path="/budget" element={<BudgetAnalytics />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
