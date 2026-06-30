import React, { useState } from 'react';
import { useAdminStats, useAdminQueue, useAdminUsers, useAdminMatches, useAdminVerifyCommunity, useAdminVerifyGround, useAdminReports, useResolveReport, useBlockUser, useDeletePost } from '../hooks/useAdmin';
import { useAuth } from '../providers/AuthProvider';
import { Navigate, Link } from 'react-router-dom';
import { Loader2, Users, MapPin, Activity, Check, X, Shield, BarChart3, Clock, AlertTriangle, Trash2, Ban } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Community, Ground, User, Match, Report } from "../types";

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: queue, isLoading: queueLoading } = useAdminQueue();
  const { data: usersData, isLoading: usersLoading } = useAdminUsers();
  const { data: matchesData, isLoading: matchesLoading } = useAdminMatches();
  const { data: reportsData, isLoading: reportsLoading } = useAdminReports();

  const verifyComm = useAdminVerifyCommunity();
  const verifyGround = useAdminVerifyGround();
  const resolveReport = useResolveReport();
  const blockUser = useBlockUser();
  const deletePost = useDeletePost();

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  const handleVerifyComm = (id: string, status: 'VERIFIED' | 'REJECTED') => {
    verifyComm.mutate({ id, status });
  };

  const handleVerifyGround = (id: string, status: 'VERIFIED' | 'REJECTED') => {
    verifyGround.mutate({ id, status });
  };

  const fadeVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <Shield className="w-6 h-6" /> Admin Panel
        </h2>
        <nav className="space-y-2">
          <SidebarButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<BarChart3 />} label="Overview" />
          <SidebarButton active={activeTab === 'queue'} onClick={() => setActiveTab('queue')} icon={<Clock />} label="Mod Queue" count={(queue?.pendingCommunities?.length || 0) + (queue?.pendingGrounds?.length || 0)} />
          <SidebarButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon={<AlertTriangle />} label="Reports" count={reportsData?.length || 0} />
          <SidebarButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users />} label="Users" />
          <SidebarButton active={activeTab === 'matches'} onClick={() => setActiveTab('matches')} icon={<Activity />} label="Matches" />
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        {activeTab === 'overview' && (
          <motion.div initial="hidden" animate="visible" variants={fadeVariants}>
            <h1 className="text-2xl font-bold mb-6">Platform Overview</h1>
            {statsLoading ? <Loader /> : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Users" value={stats.totalUsers} icon={<Users className="text-blue-500" />} />
                <StatCard title="Active Matches" value={stats.activeMatches} subtext={`${stats.totalMatches} total`} icon={<Activity className="text-green-500" />} />
                <StatCard title="Total Communities" value={stats.totalCommunities} icon={<Users className="text-purple-500" />} />
                <StatCard title="Total Grounds" value={stats.totalGrounds} icon={<MapPin className="text-orange-500" />} />
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'queue' && (
          <motion.div initial="hidden" animate="visible" variants={fadeVariants}>
            <h1 className="text-2xl font-bold mb-6">Moderation Queue</h1>
            {queueLoading ? <Loader /> : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Communities */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <h2 className="font-semibold text-lg">Pending Communities ({queue.pendingCommunities?.length || 0})</h2>
                  </div>
                  <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                    {queue.pendingCommunities?.map((comm: Community) => (
                      <li key={comm.id} className="p-4 flex justify-between items-center">
                        <div>
                          <p className="font-bold">{comm.name}</p>
                          <p className="text-sm text-gray-500">By: {comm.owner?.name}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleVerifyComm(comm.id, 'REJECTED')} aria-label="Reject community" className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"><X className="w-5 h-5" /></button>
                          <button onClick={() => handleVerifyComm(comm.id, 'VERIFIED')} aria-label="Verify community" className="p-2 text-white bg-green-600 rounded-lg hover:bg-green-700"><Check className="w-5 h-5" /></button>
                        </div>
                      </li>
                    ))}
                    {queue.pendingCommunities?.length === 0 && <li className="p-8 text-center text-gray-500">All clear!</li>}
                  </ul>
                </div>

                {/* Grounds */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <h2 className="font-semibold text-lg">Pending Grounds ({queue.pendingGrounds?.length || 0})</h2>
                  </div>
                  <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                    {queue.pendingGrounds?.map((ground: Ground) => (
                      <li key={ground.id} className="p-4 flex justify-between items-center">
                        <div>
                          <p className="font-bold">{ground.name}</p>
                          <p className="text-sm text-gray-500">{ground.location}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleVerifyGround(ground.id, 'REJECTED')} aria-label="Reject ground" className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"><X className="w-5 h-5" /></button>
                          <button onClick={() => handleVerifyGround(ground.id, 'VERIFIED')} aria-label="Verify ground" className="p-2 text-white bg-green-600 rounded-lg hover:bg-green-700"><Check className="w-5 h-5" /></button>
                        </div>
                      </li>
                    ))}
                    {queue.pendingGrounds?.length === 0 && <li className="p-8 text-center text-gray-500">All clear!</li>}
                  </ul>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div initial="hidden" animate="visible" variants={fadeVariants}>
            <h1 className="text-2xl font-bold mb-6">User Management</h1>
            {usersLoading ? <Loader /> : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-300">Name</th>
                      <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-300">Email</th>
                      <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-300">Role</th>
                      <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-300">Reputation</th>
                      <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {usersData?.map((u: User) => (
                      <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 font-medium">
                          <Link to={`/profile/${u.id}`} className="text-indigo-600 hover:underline">{u.name}</Link>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full font-bold ${u.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-800' : u.role === 'ORGANIZER' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-green-600">{u.reputation}</td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => blockUser.mutate(u.id)}
                            className={`px-3 py-1 text-sm font-medium rounded-lg ${u.isBlocked ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} hover:opacity-80`}
                          >
                            {u.isBlocked ? 'Unblock' : 'Block'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'matches' && (
          <motion.div initial="hidden" animate="visible" variants={fadeVariants}>
            <h1 className="text-2xl font-bold mb-6">Match Overview</h1>
            {matchesLoading ? <Loader /> : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-300">Title</th>
                      <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-300">Sport</th>
                      <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-300">Status</th>
                      <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-300">Creator</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {matchesData?.map((m: Match) => (
                      <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 font-medium">{m.title}</td>
                        <td className="px-6 py-4">{m.sport}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full font-bold ${m.status === 'OPEN' ? 'bg-green-100 text-green-800' : m.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                            {m.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{m.creator.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'reports' && (
          <motion.div initial="hidden" animate="visible" variants={fadeVariants}>
            <h1 className="text-2xl font-bold mb-6">User Reports</h1>
            {reportsLoading ? <Loader /> : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-300">Target</th>
                      <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-300">Reason</th>
                      <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-300">Reported By</th>
                      <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {reportsData?.map((r: Report) => (
                      <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 font-medium">
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded font-bold mr-2">{r.targetType}</span>
                          <span className="text-sm font-mono text-gray-500">{r.targetId.substring(0, 8)}...</span>
                        </td>
                        <td className="px-6 py-4 text-red-600 font-medium">{r.reason}</td>
                        <td className="px-6 py-4 text-gray-500">{r.submitter.name}</td>
                        <td className="px-6 py-4 flex gap-2">
                          <button 
                            onClick={() => resolveReport.mutate({ id: r.id, action: 'DISMISSED' })}
                            className="p-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200" title="Dismiss" aria-label="Dismiss report"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          {r.targetType === 'POST' && (
                            <button 
                              onClick={() => {
                                deletePost.mutate(r.targetId);
                                resolveReport.mutate({ id: r.id, action: 'ACTION_TAKEN' });
                              }}
                              className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200" title="Delete Post" aria-label="Delete post"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          {r.targetType === 'USER' && (
                            <button 
                              onClick={() => {
                                blockUser.mutate(r.targetId);
                                resolveReport.mutate({ id: r.id, action: 'ACTION_TAKEN' });
                              }}
                              className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200" title="Block User" aria-label="Block user"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {reportsData?.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No pending reports</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

      </div>
    </div>
  );
};

const SidebarButton = ({ active, onClick, icon, label, count }: { active: boolean, onClick: () => void, icon: React.ReactElement, label: string, count?: number }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-colors ${active ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
  >
    <div className="flex items-center gap-3">
      {React.cloneElement(icon, { className: 'w-5 h-5' })}
      {label}
    </div>
    {count !== undefined && count > 0 && (
      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">{count}</span>
    )}
  </button>
);

const StatCard = ({ title, value, subtext, icon }: { title: string, value: number, subtext?: string, icon: React.ReactElement }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
      {React.cloneElement(icon, { className: 'w-8 h-8' })}
    </div>
    <div>
      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>
      <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{value}</h3>
      {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
  </div>
);

const Loader = () => <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>;
