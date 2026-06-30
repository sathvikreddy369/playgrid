import { Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './providers/AuthProvider';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import { UserPublicProfile } from './pages/UserPublicProfile';
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

import { Home } from './pages/Home';

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
          <Route path="/profile/:id" element={<ProtectedRoute><UserPublicProfile /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
