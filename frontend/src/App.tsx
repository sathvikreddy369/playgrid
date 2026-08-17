import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import Login from './pages/Login';
import Register from './pages/Register';
import UserProfile from './pages/UserProfile';
import PublicProfile from './pages/PublicProfile';

import GroundOwnerProfile from './pages/GroundOwnerProfile';
import AdminDashboard from './pages/AdminDashboard';
import OwnerOnboarding from './pages/OwnerOnboarding';
import Dashboard from './pages/Dashboard';
import CreateMatch from './pages/CreateMatch';
import MatchDetails from './pages/MatchDetails';
import MatchManagement from './pages/MatchManagement';
import Messaging from './pages/Messaging';
import MatchReview from './pages/MatchReview';
import LandingPage from './pages/LandingPage';

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F2] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2457D6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <SpeedInsights />
      <Analytics />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/register"
            element={
              <ProtectedRoute>
                <OwnerOnboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/dashboard"
            element={
              <ProtectedRoute>
                <GroundOwnerProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:id"
            element={
              <ProtectedRoute>
                <PublicProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-match"
            element={
              <ProtectedRoute>
                <CreateMatch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/match/:id"
            element={
              <ProtectedRoute>
                <MatchDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage/:id"
            element={
              <ProtectedRoute>
                <MatchManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messaging />
              </ProtectedRoute>
            }
          />
          <Route
            path="/review/:id"
            element={
              <ProtectedRoute>
                <MatchReview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/venue"
            element={
              <ProtectedRoute>
                <GroundOwnerProfile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}


export default App;
