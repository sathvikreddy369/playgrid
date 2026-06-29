import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { NotificationBell } from './NotificationBell';

export const Layout = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 flex flex-col">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-blue-600">Playgrid</Link>
          
          <nav className="hidden md:flex gap-6 items-center">
            <Link to="/search" className="text-gray-600 hover:text-blue-600 font-medium">Search</Link>
            <Link to="/feed" className="text-gray-600 hover:text-blue-600 font-medium">Feed</Link>
            <Link to="/communities" className="text-gray-600 hover:text-blue-600 font-medium">Communities</Link>
            <Link to="/grounds" className="text-gray-600 hover:text-blue-600 font-medium">Venues</Link>
            <Link to="/matches" className="text-gray-600 hover:text-blue-600 font-medium">Matches</Link>
            <Link to="/messages" className="text-gray-600 hover:text-blue-600 font-medium">Messages</Link>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <NotificationBell />
                <Link to="/profile">
                  <img src={`https://ui-avatars.com/api/?name=${user.name}&background=random`} className="w-8 h-8 rounded-full" alt="Profile" />
                </Link>
              </>
            ) : (
              <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">Sign In</Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};
