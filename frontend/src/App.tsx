import React, { Suspense } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './providers/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Loader2 } from 'lucide-react';

const Home = React.lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Login = React.lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Profile = React.lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const UserPublicProfile = React.lazy(() => import('./pages/UserPublicProfile').then(m => ({ default: m.UserPublicProfile })));
const Feed = React.lazy(() => import('./pages/Feed').then(m => ({ default: m.Feed })));
const PostDetail = React.lazy(() => import('./pages/PostDetail').then(m => ({ default: m.PostDetail })));
const Communities = React.lazy(() => import('./pages/Communities').then(m => ({ default: m.Communities })));
const CreateCommunity = React.lazy(() => import('./pages/CreateCommunity').then(m => ({ default: m.CreateCommunity })));
const CommunityDetail = React.lazy(() => import('./pages/CommunityDetail').then(m => ({ default: m.CommunityDetail })));
const Grounds = React.lazy(() => import('./pages/Grounds').then(m => ({ default: m.Grounds })));
const CreateGround = React.lazy(() => import('./pages/CreateGround').then(m => ({ default: m.CreateGround })));
const GroundDetail = React.lazy(() => import('./pages/GroundDetail').then(m => ({ default: m.GroundDetail })));
const Matches = React.lazy(() => import('./pages/Matches').then(m => ({ default: m.Matches })));
const CreateMatch = React.lazy(() => import('./pages/CreateMatch').then(m => ({ default: m.CreateMatch })));
const MatchDetail = React.lazy(() => import('./pages/MatchDetail').then(m => ({ default: m.MatchDetail })));
const Messages = React.lazy(() => import('./pages/Messages').then(m => ({ default: m.Messages })));
const Search = React.lazy(() => import('./pages/Search').then(m => ({ default: m.Search })));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));

const SuspenseFallback = () => (
  <div className="flex-1 flex items-center justify-center min-h-[50vh]">
    <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <Suspense fallback={<SuspenseFallback />}>
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
              <Route path="/admin" element={<ProtectedRoute requireRole={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/profile/:id" element={<ProtectedRoute><UserPublicProfile /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;
