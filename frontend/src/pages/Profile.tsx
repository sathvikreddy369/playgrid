import React, { useState } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { signOut } from '../lib/firebase';
import api from '../lib/api';

export const Profile = () => {
  const { user, profile, firebaseUser, syncUser } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  const handleUpgrade = async () => {
    try {
      setIsUpgrading(true);
      await api.post('/auth/upgrade-organizer');
      await syncUser(); // Refresh user data to get new role
      alert('Successfully upgraded to Organizer!');
    } catch (error: any) {
      alert('Failed to upgrade: ' + error.message);
    } finally {
      setIsUpgrading(false);
    }
  };

  if (!user || !profile) {
    return <div className="p-8 text-center">Loading profile data...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
        >
          Sign Out
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img 
              src={firebaseUser?.photoURL || 'https://via.placeholder.com/100'} 
              alt="Avatar" 
              className="w-24 h-24 rounded-full bg-gray-200"
            />
            <div>
              <h2 className="text-2xl font-semibold">{user.name}</h2>
              <p className="text-gray-500">{user.email}</p>
              <div className="mt-2 flex gap-2">
                <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">{user.role}</span>
                <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">Rep: {user.reputation}</span>
              </div>
            </div>
          </div>

          {user.role === 'PLAYER' && (
            <button
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isUpgrading ? 'Upgrading...' : 'Become an Organizer'}
            </button>
          )}
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-4">
          <h3 className="font-semibold text-lg mb-2">About Me</h3>
          <p className="text-gray-700 dark:text-gray-300">{profile.bio || 'No bio provided yet.'}</p>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-4">
          <h3 className="font-semibold text-lg mb-2">Location</h3>
          <p className="text-gray-700 dark:text-gray-300">{profile.location || 'Not specified.'}</p>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-4">
          <h3 className="font-semibold text-lg mb-2">Sports</h3>
          <div className="flex flex-wrap gap-2">
            {profile.sports.length > 0 ? (
              profile.sports.map(sport => (
                <span key={sport} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
                  {sport}
                </span>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No sports selected.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
