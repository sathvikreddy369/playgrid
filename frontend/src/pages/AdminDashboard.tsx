import React from 'react';
import { useCommunities, useAdminVerify } from '../hooks/useCommunities';
import { useGrounds, useAdminVerifyGround } from '../hooks/useGrounds';
import { useAuth } from '../providers/AuthProvider';
import { Navigate } from 'react-router-dom';
import { Loader2, Check, X } from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const { data: pendingCommunities, isLoading: commsLoading } = useCommunities('PENDING');
  const { data: pendingGrounds, isLoading: groundsLoading } = useGrounds('PENDING');
  
  const verifyComm = useAdminVerify();
  const verifyGround = useAdminVerifyGround();

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  const handleVerifyComm = (id: string, status: 'VERIFIED' | 'REJECTED') => {
    verifyComm.mutate({ id, status });
  };

  const handleVerifyGround = (id: string, status: 'VERIFIED' | 'REJECTED') => {
    verifyGround.mutate({ id, status });
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
      <p className="text-gray-500 mb-8">Manage verification requests and platform moderation.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Communities */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <h2 className="font-semibold text-lg">Pending Communities</h2>
          </div>

          {commsLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
          ) : pendingCommunities?.length > 0 ? (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {pendingCommunities.map((community: any) => (
                <li key={community.id} className="p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{community.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">By: {community.owner.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleVerifyComm(community.id, 'REJECTED')} disabled={verifyComm.isPending} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"><X className="w-5 h-5" /></button>
                    <button onClick={() => handleVerifyComm(community.id, 'VERIFIED')} disabled={verifyComm.isPending} className="p-2 text-white bg-green-600 rounded-lg hover:bg-green-700"><Check className="w-5 h-5" /></button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-10 text-center text-gray-500">No pending communities.</div>
          )}
        </div>

        {/* Grounds */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <h2 className="font-semibold text-lg">Pending Grounds</h2>
          </div>

          {groundsLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>
          ) : pendingGrounds?.length > 0 ? (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {pendingGrounds.map((ground: any) => (
                <li key={ground.id} className="p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{ground.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">Loc: {ground.location}</p>
                    <p className="text-sm text-gray-500 mt-1">By: {ground.owner.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleVerifyGround(ground.id, 'REJECTED')} disabled={verifyGround.isPending} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"><X className="w-5 h-5" /></button>
                    <button onClick={() => handleVerifyGround(ground.id, 'VERIFIED')} disabled={verifyGround.isPending} className="p-2 text-white bg-green-600 rounded-lg hover:bg-green-700"><Check className="w-5 h-5" /></button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-10 text-center text-gray-500">No pending grounds.</div>
          )}
        </div>

      </div>
    </div>
  );
};
