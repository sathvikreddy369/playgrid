import { Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './providers/AuthProvider';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import { Feed } from './pages/Feed';
import { PostDetail } from './pages/PostDetail';
import { Communities } from './pages/Communities';
import { CreateCommunity } from './pages/CreateCommunity';
import { CommunityDetail } from './pages/CommunityDetail';
import { Grounds } from './pages/Grounds';
import { CreateGround } from './pages/CreateGround';
import { GroundDetail } from './pages/GroundDetail';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

const Home = () => {
  const { user } = useAuth();
  return (
    <div className="p-8 text-center space-y-4">
      <h1 className="text-4xl font-bold">Welcome to Playgrid</h1>
      <p>Your ultimate sports community platform.</p>
      {user ? (
        <div className="flex justify-center gap-4">
          <Link to="/feed" className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors">Go to Feed</Link>
          <Link to="/communities" className="bg-white text-blue-600 border border-blue-600 px-6 py-2 rounded-full font-medium hover:bg-blue-50 transition-colors">Communities</Link>
          <Link to="/grounds" className="bg-white text-green-600 border border-green-600 px-6 py-2 rounded-full font-medium hover:bg-green-50 transition-colors">Venues</Link>
          <Link to="/profile" className="text-blue-600 underline pt-2">My Profile</Link>
        </div>
      ) : (
        <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors">Sign In</Link>
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/communities" element={<Communities />} />
          <Route path="/communities/:id" element={<CommunityDetail />} />
          <Route path="/communities/create" element={<ProtectedRoute><CreateCommunity /></ProtectedRoute>} />
          <Route path="/grounds" element={<Grounds />} />
          <Route path="/grounds/:id" element={<GroundDetail />} />
          <Route path="/grounds/create" element={<ProtectedRoute><CreateGround /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
