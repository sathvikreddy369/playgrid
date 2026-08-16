import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { SpeedInsights } from "@vercel/speed-insights/next"
import Login from './pages/Login';
import Register from './pages/Register';
import UserProfile from './pages/UserProfile';
import GroundOwnerProfile from './pages/GroundOwnerProfile';
import Dashboard from './pages/Dashboard';
import CreateMatch from './pages/CreateMatch';
import MatchDetails from './pages/MatchDetails';
import MatchManagement from './pages/MatchManagement';
import Messaging from './pages/Messaging';
import MatchReview from './pages/MatchReview';

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
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
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
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
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
