import React, { useState } from 'react';
import { useAdminStats, useAdminQueue, useAdminUsers, useAdminMatches, useAdminVerifyCommunity, useAdminVerifyVenue, useAdminReports, useResolveReport, useBlockUser, useDeletePost } from '../hooks/useAdmin';
import { useAuth } from '../providers/AuthProvider';
import { Navigate, Link } from 'react-router-dom';
import { Loader2, Users, MapPin, Activity, Check, X, Shield, BarChart3, Clock, AlertTriangle, Trash2, Ban } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Community, Venue, User, Match, Report } from "../types";

export const AdminDashboard = () => {
 const { user } = useAuth();
 const [activeTab, setActiveTab] = useState('overview');

 const { data: stats, isLoading: statsLoading } = useAdminStats();
 const { data: queue, isLoading: queueLoading } = useAdminQueue();
 const { data: usersData, isLoading: usersLoading } = useAdminUsers();
 const { data: matchesData, isLoading: matchesLoading } = useAdminMatches();
 const { data: reportsData, isLoading: reportsLoading } = useAdminReports();

 const verifyComm = useAdminVerifyCommunity();
 const verifyGround = useAdminVerifyVenue();
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
 visible: { opacity: 1, y: 0, transition: { duration: 0.2 } }
 };

 return (
 <div className="flex h-[calc(100vh-64px)] bg-background">
 {/* Sidebar */}
 <div className="w-64 bg-surface border-r border-border p-4 shrink-0 flex flex-col justify-between">
 <div>
 <h2 className="text-lg font-black mb-8 flex items-center gap-2 text-foreground tracking-tight px-2">
 <Shield className="w-5 h-5" /> Admin Control
 </h2>
 <nav className="space-y-1">
 <SidebarButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<BarChart3 />} label="Overview" />
 <SidebarButton active={activeTab === 'queue'} onClick={() => setActiveTab('queue')} icon={<Clock />} label="Mod Queue" count={(queue?.pendingCommunities?.length || 0) + (queue?.pendingGrounds?.length || 0)} />
 <SidebarButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon={<AlertTriangle />} label="Reports" count={reportsData?.length || 0} />
 <SidebarButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users />} label="Users" />
 <SidebarButton active={activeTab === 'matches'} onClick={() => setActiveTab('matches')} icon={<Activity />} label="Matches" />
 </nav>
 </div>
 </div>

 {/* Main Content */}
 <div className="flex-1 overflow-auto p-8 md:p-10">
 {activeTab === 'overview' && (
 <motion.div initial="hidden" animate="visible" variants={fadeVariants}>
 <h1 className="text-2xl font-black mb-6 tracking-tight">Platform Overview</h1>
 {statsLoading ? <Loader /> : (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <StatCard title="Total Users" value={stats.totalUsers} icon={<Users className="text-foreground" />} />
 <StatCard title="Active Matches" value={stats.activeMatches} subtext={`${stats.totalMatches} total matches`} icon={<Activity className="text-foreground" />} />
 <StatCard title="Total Communities" value={stats.totalCommunities} icon={<Users className="text-foreground" />} />
 <StatCard title="Total Venues" value={stats.totalGrounds} icon={<MapPin className="text-foreground" />} />
 </div>
 )}
 </motion.div>
 )}

 {activeTab === 'queue' && (
 <motion.div initial="hidden" animate="visible" variants={fadeVariants}>
 <h1 className="text-2xl font-black mb-6 tracking-tight">Moderation Queue</h1>
 {queueLoading ? <Loader /> : (
 <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
 {/* Communities */}
 <div className="bg-surface rounded-2xl border border-border overflow-hidden">
 <div className="px-6 py-4 border-b border-border bg-zinc-50 ">
 <h2 className="font-bold text-sm tracking-tight text-foreground">Pending Communities ({queue.pendingCommunities?.length || 0})</h2>
 </div>
 <ul className="divide-y divide-border">
 {queue.pendingCommunities?.map((comm: Community) => (
 <li key={comm.id} className="p-4 flex justify-between items-center text-sm font-semibold">
 <div>
 <p className="font-bold text-foreground">{comm.name}</p>
 <p className="text-xs text-muted font-semibold">By: {comm.owner?.name}</p>
 </div>
 <div className="flex gap-2">
 <button onClick={() => handleVerifyComm(comm.id, 'REJECTED')} aria-label="Reject community" className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"><X className="w-4 h-4" /></button>
 <button onClick={() => handleVerifyComm(comm.id, 'VERIFIED')} aria-label="Verify community" className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer"><Check className="w-4 h-4" /></button>
 </div>
 </li>
 ))}
 {queue.pendingCommunities?.length === 0 && <li className="p-8 text-center text-xs text-muted font-bold">No pending communities</li>}
 </ul>
 </div>

 {/* Venues */}
 <div className="bg-surface rounded-2xl border border-border overflow-hidden">
 <div className="px-6 py-4 border-b border-border bg-zinc-50 ">
 <h2 className="font-bold text-sm tracking-tight text-foreground">Pending Venues ({queue.pendingGrounds?.length || 0})</h2>
 </div>
 <ul className="divide-y divide-border">
 {queue.pendingGrounds?.map((venue: Venue) => (
 <li key={venue.id} className="p-4 flex justify-between items-center text-sm font-semibold">
 <div>
 <p className="font-bold text-foreground">{venue.name}</p>
 <p className="text-xs text-muted font-semibold">{venue.location}</p>
 </div>
 <div className="flex gap-2">
 <button onClick={() => handleVerifyGround(venue.id, 'REJECTED')} aria-label="Reject venue" className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"><X className="w-4 h-4" /></button>
 <button onClick={() => handleVerifyGround(venue.id, 'VERIFIED')} aria-label="Verify venue" className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer"><Check className="w-4 h-4" /></button>
 </div>
 </li>
 ))}
 {queue.pendingGrounds?.length === 0 && <li className="p-8 text-center text-xs text-muted font-bold">No pending venues</li>}
 </ul>
 </div>
 </div>
 )}
 </motion.div>
 )}

 {activeTab === 'users' && (
 <motion.div initial="hidden" animate="visible" variants={fadeVariants}>
 <h1 className="text-2xl font-black mb-6 tracking-tight">User Management</h1>
 {usersLoading ? <Loader /> : (
 <div className="bg-surface rounded-2xl border border-border overflow-hidden">
 <table className="w-full text-left text-sm font-semibold">
 <thead className="bg-zinc-50 border-b border-border">
 <tr>
 <th className="px-6 py-4 font-extrabold text-foreground tracking-tight text-xs uppercase">Name</th>
 <th className="px-6 py-4 font-extrabold text-foreground tracking-tight text-xs uppercase">Email</th>
 <th className="px-6 py-4 font-extrabold text-foreground tracking-tight text-xs uppercase">Role</th>
 <th className="px-6 py-4 font-extrabold text-foreground tracking-tight text-xs uppercase">Reputation</th>
 <th className="px-6 py-4 font-extrabold text-foreground tracking-tight text-xs uppercase text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {usersData?.map((u: User) => (
 <tr key={u.id} className="hover:bg-zinc-50 transition-colors">
 <td className="px-6 py-4 font-bold text-foreground">
 <Link to={`/profile/${u.id}`} className="hover:underline">{u.name}</Link>
 </td>
 <td className="px-6 py-4 text-muted text-xs font-bold">{u.email}</td>
 <td className="px-6 py-4">
 <span className="badge-premium bg-zinc-100 text-foreground border-border">
 {u.role}
 </span>
 </td>
 <td className="px-6 py-4 font-extrabold text-emerald-600 ">{u.reputation}</td>
 <td className="px-6 py-4 text-right">
 <button 
 onClick={() => blockUser.mutate(u.id)}
 className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${u.isBlocked ? 'bg-emerald-50 border border-emerald-250 text-emerald-700 ' : 'bg-red-50 border border-red-250 text-red-700 '}`}
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
 <h1 className="text-2xl font-black mb-6 tracking-tight">Match Overview</h1>
 {matchesLoading ? <Loader /> : (
 <div className="bg-surface rounded-2xl border border-border overflow-hidden">
 <table className="w-full text-left text-sm font-semibold">
 <thead className="bg-zinc-50 border-b border-border">
 <tr>
 <th className="px-6 py-4 font-extrabold text-foreground tracking-tight text-xs uppercase">Title</th>
 <th className="px-6 py-4 font-extrabold text-foreground tracking-tight text-xs uppercase">Sport</th>
 <th className="px-6 py-4 font-extrabold text-foreground tracking-tight text-xs uppercase">Status</th>
 <th className="px-6 py-4 font-extrabold text-foreground tracking-tight text-xs uppercase">Creator</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {matchesData?.map((m: Match) => (
 <tr key={m.id} className="hover:bg-zinc-50 transition-colors">
 <td className="px-6 py-4 font-bold text-foreground">{m.title}</td>
 <td className="px-6 py-4 text-muted">{m.sport}</td>
 <td className="px-6 py-4">
 <span className={`badge-premium ${m.status === 'OPEN' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 ' : m.status === 'CANCELLED' ? 'bg-red-50 border-red-200 text-red-700 ' : 'bg-zinc-100 text-muted'}`}>
 {m.status}
 </span>
 </td>
 <td className="px-6 py-4 text-muted text-xs font-bold">{m.creator?.name || 'User'}</td>
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
 <h1 className="text-2xl font-black mb-6 tracking-tight">User Reports</h1>
 {reportsLoading ? <Loader /> : (
 <div className="bg-surface rounded-2xl border border-border overflow-hidden">
 <table className="w-full text-left text-sm font-semibold">
 <thead className="bg-zinc-50 border-b border-border">
 <tr>
 <th className="px-6 py-4 font-extrabold text-foreground tracking-tight text-xs uppercase">Target</th>
 <th className="px-6 py-4 font-extrabold text-foreground tracking-tight text-xs uppercase">Reason</th>
 <th className="px-6 py-4 font-extrabold text-foreground tracking-tight text-xs uppercase">Reported By</th>
 <th className="px-6 py-4 font-extrabold text-foreground tracking-tight text-xs uppercase text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {reportsData?.map((r: Report) => (
 <tr key={r.id} className="hover:bg-zinc-50 transition-colors">
 <td className="px-6 py-4 font-bold text-foreground">
 <span className="bg-zinc-100 border border-border text-foreground text-[10px] px-2 py-0.5 rounded font-extrabold mr-2 uppercase tracking-wider">{r.targetType}</span>
 <span className="text-xs font-mono text-muted">{r.targetId.substring(0, 8)}</span>
 </td>
 <td className="px-6 py-4 text-red-500 font-bold text-xs">{r.reason}</td>
 <td className="px-6 py-4 text-muted text-xs font-bold">{r.submitter?.name || 'User'}</td>
 <td className="px-6 py-4 text-right flex justify-end gap-2">
 <button 
 onClick={() => resolveReport.mutate({ id: r.id, action: 'DISMISSED' })}
 className="p-2 hover:bg-zinc-100 text-muted rounded-xl transition-colors cursor-pointer" title="Dismiss" aria-label="Dismiss report"
 >
 <X className="w-4 h-4" />
 </button>
 {r.targetType === 'POST' && (
 <button 
 onClick={() => {
 deletePost.mutate(r.targetId);
 resolveReport.mutate({ id: r.id, action: 'ACTION_TAKEN' });
 }}
 className="p-2 hover:bg-red-50 text-red-650 rounded-xl transition-colors cursor-pointer" title="Delete Post" aria-label="Delete post"
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
 className="p-2 hover:bg-red-50 text-red-650 rounded-xl transition-colors cursor-pointer" title="Block User" aria-label="Block user"
 >
 <Ban className="w-4 h-4" />
 </button>
 )}
 </td>
 </tr>
 ))}
 {reportsData?.length === 0 && (
 <tr>
 <td colSpan={4} className="px-6 py-8 text-center text-xs text-muted font-bold">No pending reports</td>
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
 className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer select-none active:scale-[0.98] ${active ? 'bg-zinc-100 text-foreground' : 'text-muted hover:bg-zinc-50 hover:text-foreground'}`}
 >
 <div className="flex items-center gap-3">
 {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-4 h-4' })}
 {label}
 </div>
 {count !== undefined && count > 0 && (
 <span className="bg-zinc-950 text-white text-[10px] px-2 py-0.5 rounded-full font-extrabold">{count}</span>
 )}
 </button>
);

const StatCard = ({ title, value, subtext, icon }: { title: string, value: number, subtext?: string, icon: React.ReactElement }) => (
 <div className="card-premium p-6 flex items-center gap-4 bg-surface">
 <div className="p-3 bg-zinc-50 border border-border rounded-xl shrink-0">
 {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-6 h-6' })}
 </div>
 <div>
 <p className="text-muted text-xs font-bold uppercase tracking-wider">{title}</p>
 <h3 className="text-2xl font-black text-foreground mt-0.5">{value}</h3>
 {subtext && <p className="text-[10px] text-muted font-semibold mt-0.5">{subtext}</p>}
 </div>
 </div>
);

const Loader = () => <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-foreground" /></div>;
