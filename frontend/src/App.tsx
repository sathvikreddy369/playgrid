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
import { Matches } from './pages/Matches';
import { CreateMatch } from './pages/CreateMatch';
import { MatchDetail } from './pages/MatchDetail';
import { Messages } from './pages/Messages';
import { Search } from './pages/Search';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

const Home = () => {
  const { user } = useAuth();
  return (
    <div className="p-8 text-center space-y-8 mt-10">
      <h1 className="text-5xl font-bold text-gray-900 dark:text-white tracking-tight">Welcome to Playgrid</h1>
      <p className="text-xl text-gray-500 max-w-2xl mx-auto">Your ultimate sports community platform. Find players, build communities, and play more.</p>
      {user ? (
        <div className="flex justify-center gap-4 flex-wrap max-w-2xl mx-auto">
          <Link to="/search" className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-full font-medium hover:bg-blue-50 transition-colors shadow-sm">Global Search</Link>
          <Link to="/matches" className="bg-orange-600 text-white px-8 py-3 rounded-full font-medium hover:bg-orange-700 transition-colors shadow-sm">Find Matches</Link>
          <Link to="/communities" className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-full font-medium hover:bg-blue-50 transition-colors shadow-sm">Communities</Link>
          <Link to="/grounds" className="bg-white text-green-600 border-2 border-green-600 px-8 py-3 rounded-full font-medium hover:bg-green-50 transition-colors shadow-sm">Venues</Link>
        </div>
      ) : (
        <Link to="/login" className="inline-block bg-blue-600 text-white px-10 py-4 rounded-full text-lg font-bold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1 transform duration-200">Get Started</Link>
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
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
          <Route path="/matches" element={<Matches />} />
          <Route path="/matches/:id" element={<MatchDetail />} />
          <Route path="/matches/create" element={<ProtectedRoute><CreateMatch /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/search" element={<Search />} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
