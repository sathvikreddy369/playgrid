import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Users, Building, Trophy, AlertTriangle, Star, CheckCircle, ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../components/AuthProvider';
import { getGoogleMapsDirectionsUrl } from '../utils/location';

export default function AdminDashboard() {
  const { user } = useAuth();

  const [dbUser, setDbUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [activeTab, setActiveTab] = useState<'overview' | 'pending' | 'venues' | 'reports' | 'reviews'>('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [pendingVenues, setPendingVenues] = useState<any[]>([]);
  const [allVenues, setAllVenues] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const verifyAdminRole = async () => {
      setCheckingAuth(true);
      try {
        const profileRes = await api.get('/users/profile').catch(() => null);
        const currentUser = profileRes?.data?.user;
        setDbUser(currentUser);

        const isAdmin = currentUser?.role === 'ADMIN' || 
                        currentUser?.email === 'admin@gmail.com' || 
                        user?.email === 'admin@gmail.com';

        if (!isAdmin) {
          setCheckingAuth(false);
          return;
        }

        await fetchAdminData();
      } catch (err) {
        console.error('Failed to verify admin role', err);
      } finally {
        setCheckingAuth(false);
      }
    };

    verifyAdminRole();
  }, [user, activeTab]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const res = await api.get('/admin/overview');
        setStats(res.data);
      } else if (activeTab === 'pending') {
        const res = await api.get('/admin/owners/pending');
        setPendingVenues(res.data.venues || []);
      } else if (activeTab === 'venues') {
        const res = await api.get('/admin/owners');
        setAllVenues(res.data.venues || []);
      } else if (activeTab === 'reports') {
        const res = await api.get('/admin/reports');
        setReports(res.data.reports || []);
      } else if (activeTab === 'reviews') {
        const res = await api.get('/admin/reviews');
        setReviews(res.data.reviews || []);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveVenue = async (id: string) => {
    setActionLoading(id);
    try {
      await api.post(`/admin/owners/${id}/approve`);
      setPendingVenues(pendingVenues.filter(v => v.id !== id));
      alert('Venue approved and live on platform!');
    } catch (err) {
      alert('Failed to approve venue.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectVenue = async (id: string) => {
    const reason = prompt('Enter rejection reason for venue owner:');
    if (reason === null) return;
    
    setActionLoading(id);
    try {
      await api.post(`/admin/owners/${id}/reject`, { reason });
      setPendingVenues(pendingVenues.filter(v => v.id !== id));
      alert('Venue application rejected.');
    } catch (err) {
      alert('Failed to reject venue.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspendVenue = async (id: string) => {
    if (!confirm('Suspend this venue listing from public discovery?')) return;
    setActionLoading(id);
    try {
      await api.post(`/admin/owners/${id}/suspend`);
      fetchAdminData();
    } catch (err) {
      alert('Failed to suspend venue.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReinstateVenue = async (id: string) => {
    setActionLoading(id);
    try {
      await api.post(`/admin/owners/${id}/reinstate`);
      fetchAdminData();
    } catch (err) {
      alert('Failed to reinstate venue.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReportAction = async (reportId: string, action: 'DISMISSED' | 'ACTION_TAKEN', suspendUser = false) => {
    setActionLoading(reportId);
    try {
      await api.post(`/admin/reports/${reportId}/action`, { action, suspendUser });
      setReports(reports.map(r => r.id === reportId ? { ...r, status: action } : r));
    } catch (err) {
      alert('Failed to process report action.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Remove this review from the venue listing?')) return;
    setActionLoading(reviewId);
    try {
      await api.delete(`/admin/reviews/${reviewId}`);
      setReviews(reviews.filter(r => r.id !== reviewId));
    } catch (err) {
      alert('Failed to delete review.');
    } finally {
      setActionLoading(null);
    }
  };

  const isUserAdmin = dbUser?.role === 'ADMIN' || dbUser?.email === 'admin@gmail.com' || user?.email === 'admin@gmail.com';

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#F7F7F2] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#2457D6] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-[#667085]">Verifying Admin Credentials...</p>
        </div>
      </div>
    );
  }

  if (!isUserAdmin) {
    return (
      <div className="min-h-screen bg-[#F7F7F2] flex items-center justify-center p-4">
        <div className="bg-white border border-[#E6E8EC] p-8 rounded-2xl max-w-md text-center shadow-sm space-y-4">
          <ShieldCheck className="w-12 h-12 text-[#FF7A3D] mx-auto" />
          <h2 className="text-xl font-black text-[#172033] uppercase">Admin Access Restricted</h2>
          <p className="text-xs text-[#667085] leading-relaxed">
            You must be signed in as the authorized Platform Administrator (<code className="bg-gray-100 px-1 py-0.5 rounded text-[#2457D6]">admin@gmail.com</code>) to access the Admin Control Hub.
          </p>
          <div className="pt-2">
            <Link to="/login" className="inline-block px-6 py-3 bg-[#2457D6] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-xl uppercase tracking-wider shadow-sm">
              Sign In as Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F2] text-[#172033] font-sans pb-24 sm:pb-12">
      {/* Header */}
      <header className="border-b border-[#E6E8EC] bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="p-2 hover:bg-[#F7F7F2] rounded-xl text-[#667085] transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-8 h-8 rounded-xl bg-[#2457D6] text-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-black text-[#172033] uppercase tracking-wide">Admin Control Center</h1>
              <p className="text-[11px] text-[#2457D6] font-semibold">{dbUser?.email || user?.email}</p>
            </div>
          </div>

          <button 
            onClick={fetchAdminData} 
            className="p-2 bg-[#F7F7F2] border border-[#E6E8EC] hover:bg-white text-[#667085] rounded-xl text-xs flex items-center gap-1 font-bold transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar border-b border-[#E6E8EC]">
          {[
            { id: 'overview', label: '📊 Overview', count: null },
            { id: 'pending', label: '⏳ Pending Applications', count: pendingVenues.length || stats?.pendingOwners },
            { id: 'venues', label: '🏟️ Ground Owners', count: stats?.approvedOwners },
            { id: 'reports', label: '🚩 Fraud Reports', count: stats?.pendingReports },
            { id: 'reviews', label: '💬 Review Moderation', count: stats?.totalReviews }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs whitespace-nowrap transition-all uppercase tracking-wider flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-[#2457D6] text-white shadow-sm'
                  : 'bg-white text-[#667085] hover:text-[#172033] border border-[#E6E8EC]'
              }`}
            >
              {tab.label}
              {tab.count !== null && tab.count !== undefined && tab.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-[#FF7A3D] text-white'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white border border-[#E6E8EC] p-6 rounded-2xl shadow-sm">
                <Users className="w-8 h-8 text-[#2457D6] mb-3" />
                <p className="text-3xl font-black text-[#172033]">{stats?.totalUsers || 0}</p>
                <p className="text-xs font-semibold text-[#667085]">Total Registered Users</p>
              </div>

              <div className="bg-white border border-[#E6E8EC] p-6 rounded-2xl shadow-sm">
                <Building className="w-8 h-8 text-[#16803C] mb-3" />
                <p className="text-3xl font-black text-[#172033]">{stats?.approvedOwners || 0}</p>
                <p className="text-xs font-semibold text-[#667085]">Approved Live Venues</p>
              </div>

              <div className="bg-white border border-[#E6E8EC] p-6 rounded-2xl shadow-sm">
                <Trophy className="w-8 h-8 text-[#FF7A3D] mb-3" />
                <p className="text-3xl font-black text-[#172033]">{stats?.activeMatches || 0}</p>
                <p className="text-xs font-semibold text-[#667085]">Active Open Games</p>
              </div>

              <div className="bg-white border border-[#E6E8EC] p-6 rounded-2xl shadow-sm">
                <AlertTriangle className="w-8 h-8 text-[#DC2626] mb-3" />
                <p className="text-3xl font-black text-[#172033]">{stats?.pendingReports || 0}</p>
                <p className="text-xs font-semibold text-[#667085]">Pending Moderation Flags</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Pending Owner Applications */}
        {activeTab === 'pending' && (
          <div className="space-y-6">
            <h2 className="text-lg font-black text-[#172033] uppercase tracking-wider">
              Pending Venue Applications ({pendingVenues.length})
            </h2>

            {loading ? (
              <div className="py-12 text-center text-[#667085]">Loading pending applications...</div>
            ) : pendingVenues.length === 0 ? (
              <div className="bg-white border border-[#E6E8EC] rounded-2xl p-12 text-center text-[#667085]">
                <CheckCircle className="w-12 h-12 text-[#16803C] mx-auto mb-3" />
                <p className="font-bold text-sm">No pending owner applications requiring review.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pendingVenues.map((venue) => {
                  const mapsUrl = getGoogleMapsDirectionsUrl(venue.latitude, venue.longitude);
                  return (
                    <div key={venue.id} className="bg-white border border-[#E6E8EC] rounded-2xl p-6 shadow-sm space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded bg-[#FF7A3D]/10 text-[#FF7A3D]">
                            {venue.category}
                          </span>
                          <h3 className="text-base font-extrabold text-[#172033] mt-1">{venue.name}</h3>
                          <p className="text-xs text-[#667085]">{venue.locality} • ₹{venue.pricePerHour}/hr</p>
                        </div>
                        <span className="text-xs text-[#98A2B3] font-semibold">
                          Owner: {venue.owner?.profile?.name || venue.owner?.email}
                        </span>
                      </div>

                      <p className="text-xs text-[#667085] leading-relaxed bg-[#F7F7F2] p-3 rounded-xl">
                        {venue.description || 'No description provided.'}
                      </p>

                      {venue.images && venue.images.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {venue.images.map((img: string, i: number) => (
                            <img key={i} src={img} alt="Venue" className="w-20 h-20 object-cover rounded-xl border border-[#E6E8EC]" />
                          ))}
                        </div>
                      )}

                      <div className="pt-3 border-t border-[#E6E8EC] flex items-center justify-between">
                        {mapsUrl ? (
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-[#2457D6] hover:underline flex items-center gap-1"
                          >
                            Google Maps <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : <div />}

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRejectVenue(venue.id)}
                            disabled={actionLoading === venue.id}
                            className="px-4 py-2 border border-[#DC2626] text-[#DC2626] hover:bg-[#DC2626]/10 font-bold text-xs rounded-xl uppercase tracking-wider"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleApproveVenue(venue.id)}
                            disabled={actionLoading === venue.id}
                            className="px-4 py-2 bg-[#16803C] hover:bg-[#12632E] text-white font-bold text-xs rounded-xl uppercase tracking-wider shadow-sm"
                          >
                            Approve Live
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: All Ground Owners */}
        {activeTab === 'venues' && (
          <div className="space-y-6">
            <h2 className="text-lg font-black text-[#172033] uppercase tracking-wider">
              All Registered Ground Owners & Venues
            </h2>

            <div className="bg-white border border-[#E6E8EC] rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F7F7F2] border-b border-[#E6E8EC] text-[#667085] font-extrabold uppercase">
                      <th className="p-4">Venue & Locality</th>
                      <th className="p-4">Owner Contact</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Rating</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E8EC]">
                    {allVenues.map((v) => (
                      <tr key={v.id} className="hover:bg-gray-50/50">
                        <td className="p-4 font-bold text-[#172033]">
                          {v.name}
                          <span className="block text-[11px] text-[#667085] font-normal">{v.locality}</span>
                        </td>
                        <td className="p-4 text-[#667085]">
                          {v.owner?.profile?.name || 'Owner'}
                          <span className="block text-[11px] font-semibold text-[#98A2B3]">{v.owner?.email}</span>
                        </td>
                        <td className="p-4 font-semibold text-[#2457D6]">{v.category}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase ${
                            v.status === 'APPROVED' ? 'bg-[#16803C]/10 text-[#16803C]' :
                            v.status === 'PENDING_APPROVAL' ? 'bg-[#FF7A3D]/10 text-[#FF7A3D]' : 'bg-red-100 text-red-700'
                          }`}>
                            {v.status}
                          </span>
                        </td>
                        <td className="p-4 font-bold flex items-center gap-1 text-[#172033]">
                          <Star className="w-3.5 h-3.5 fill-[#FF7A3D] text-[#FF7A3D]" />
                          {v.rating} ({v.reviewCount})
                        </td>
                        <td className="p-4 text-right">
                          {v.status === 'APPROVED' ? (
                            <button
                              onClick={() => handleSuspendVenue(v.id)}
                              className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-lg font-bold text-[11px]"
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReinstateVenue(v.id)}
                              className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 rounded-lg font-bold text-[11px]"
                            >
                              Reinstate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Fraud Reports */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <h2 className="text-lg font-black text-[#172033] uppercase tracking-wider">
              User & Venue Fraud Reports ({reports.length})
            </h2>

            {reports.length === 0 ? (
              <div className="bg-white border border-[#E6E8EC] rounded-2xl p-12 text-center text-[#667085]">
                <CheckCircle className="w-12 h-12 text-[#16803C] mx-auto mb-3" />
                <p className="font-bold text-sm">No fraud reports submitted.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="bg-white border border-[#E6E8EC] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded bg-red-100 text-red-700">
                          {report.targetType} REPORT
                        </span>
                        <span className="text-xs font-bold text-[#667085]">
                          Target ID: {report.targetId}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm text-[#172033]">Reason: {report.reason}</h4>
                      <p className="text-xs text-[#667085] mt-1">{report.description || 'No description provided.'}</p>
                      <p className="text-[11px] text-[#98A2B3] mt-2">
                        Reported by: {report.reporter?.email} on {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleReportAction(report.id, 'DISMISSED')}
                        className="px-3.5 py-2 border border-[#E6E8EC] hover:bg-gray-50 text-[#667085] font-bold text-xs rounded-xl"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleReportAction(report.id, 'ACTION_TAKEN', true)}
                        className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm"
                      >
                        Suspend Target
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Reviews Moderation */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <h2 className="text-lg font-black text-[#172033] uppercase tracking-wider">
              Recent Reviews Moderation
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="bg-white border border-[#E6E8EC] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-[#2457D6]">{rev.venue?.name}</span>
                      <span className="text-xs font-black text-[#FF7A3D] flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-[#FF7A3D]" /> {rev.rating}/5
                      </span>
                    </div>
                    <p className="text-xs text-[#172033] italic bg-[#F7F7F2] p-3 rounded-xl">
                      "{rev.comment || 'No comment text'}"
                    </p>
                    <p className="text-[11px] text-[#98A2B3] mt-2 font-semibold">
                      Author: {rev.author?.profile?.name || rev.author?.email}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#E6E8EC] text-right">
                    <button
                      onClick={() => handleDeleteReview(rev.id)}
                      className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold"
                    >
                      Delete Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
