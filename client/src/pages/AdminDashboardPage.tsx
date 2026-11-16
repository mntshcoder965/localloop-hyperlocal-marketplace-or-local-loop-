import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Users,
  Package,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  UserX,
  UserCheck,
  Trash2,
  FileText,
} from 'lucide-react';
import api from '../services/api';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'reports'>('overview');
  const [usersList, setUsersList] = useState<any[]>([]);
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsersList(res.data.data);
    } catch {}
  };

  const fetchReports = async () => {
    try {
      const res = await api.get('/admin/reports');
      setReportsList(res.data.data);
    } catch {}
  };

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchStats(), fetchUsers(), fetchReports()]).finally(() => setIsLoading(false));
  }, []);

  const handleToggleSuspend = async (userId: string, currentSuspended: boolean) => {
    try {
      await api.patch(`/admin/users/${userId}/suspend`, { isSuspended: !currentSuspended });
      fetchUsers();
      fetchStats();
    } catch (err) {
      alert('Error updating user suspension status');
    }
  };

  const handleResolveReport = async (reportId: string, status: 'RESOLVED' | 'DISMISSED') => {
    const notes = prompt('Enter admin notes for resolution (optional):') || 'Action taken by admin';
    try {
      await api.patch(`/admin/reports/${reportId}/resolve`, { status, adminNotes: notes });
      fetchReports();
      fetchStats();
    } catch {
      alert('Error resolving report');
    }
  };

  const handleModerateListing = async (listingId: string, status: 'ACTIVE' | 'REMOVED') => {
    try {
      await api.patch(`/admin/listings/${listingId}/moderate`, { status });
      fetchStats();
      alert(`Listing marked as ${status}`);
    } catch {
      alert('Error updating listing status');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-20 flex justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
            <ShieldAlert size={14} /> Platform Moderation Portal
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
            Admin Governance & Analytics
          </h1>
          <p className="text-xs text-slate-500">Monitor marketplace integrity, users, and safety reports</p>
        </div>

        {/* Tab Pills */}
        <div className="flex gap-2">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'users', label: 'User Management' },
            { key: 'reports', label: `Pending Reports (${stats?.pendingReports || 0})` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === t.key
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Users</span>
            <Users size={18} className="text-indigo-600" />
          </div>
          <span className="text-2xl font-black text-slate-900">{stats?.totalUsers || 0}</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Active Listings</span>
            <Package size={18} className="text-teal-600" />
          </div>
          <span className="text-2xl font-black text-slate-900">{stats?.activeListings || 0}</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Completed Orders</span>
            <CheckCircle2 size={18} className="text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-slate-900">{stats?.completedOrders || 0}</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Transaction Volume</span>
            <TrendingUp size={18} className="text-blue-600" />
          </div>
          <span className="text-2xl font-black text-slate-900">₹{(stats?.totalVolume || 0).toLocaleString('en-IN')}</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Pending Reports</span>
            <AlertTriangle size={18} className="text-rose-600" />
          </div>
          <span className="text-2xl font-black text-rose-600">{stats?.pendingReports || 0}</span>
        </div>
      </div>

      {/* Overview Panel */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Recent Listings */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Recent Listings</h3>
            <div className="divide-y divide-slate-100">
              {stats?.recentListings?.map((l: any) => (
                <div key={l.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900">{l.title}</h4>
                    <p className="text-slate-400">By {l.seller_name} • ₹{parseFloat(l.price).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {l.status}
                    </span>
                    {l.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleModerateListing(l.id, 'REMOVED')}
                        className="p-1 text-slate-400 hover:text-rose-600"
                        title="Takedown listing"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Recent Transactions</h3>
            <div className="divide-y divide-slate-100">
              {stats?.recentOrders?.map((o: any) => (
                <div key={o.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900">{o.listing_title}</h4>
                    <p className="text-slate-400">
                      {o.buyer_name} → {o.seller_name} • ₹{parseFloat(o.amount).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800">
                    {o.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users Panel */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Platform Registered Users</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-slate-900">{u.name}</td>
                    <td className="p-4 text-slate-500">{u.email}</td>
                    <td className="p-4 font-semibold text-slate-700">{u.role}</td>
                    <td className="p-4">{parseFloat(u.rating_avg) || 0}★ ({u.rating_count || 0})</td>
                    <td className="p-4">
                      {u.is_suspended ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                          SUSPENDED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          ACTIVE
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleSuspend(u.id, u.is_suspended)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          u.is_suspended
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        }`}
                      >
                        {u.is_suspended ? 'Unsuspend' : 'Suspend Account'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reports Panel */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs space-y-4">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Community Safety & Takedown Reports</h3>
          </div>
          {reportsList.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {reportsList.map((rep) => (
                <div key={rep.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                        {rep.target_type}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">{rep.reason}</h4>
                    </div>
                    <p className="text-xs text-slate-600">Target: {rep.target_title || rep.target_id}</p>
                    {rep.details && <p className="text-xs text-slate-500 italic">"{rep.details}"</p>}
                    <p className="text-[10px] text-slate-400">Reported by: {rep.reporter_name} ({rep.reporter_email})</p>
                  </div>

                  {rep.status === 'PENDING' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResolveReport(rep.id, 'RESOLVED')}
                        className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                      >
                        Resolve & Moderate
                      </button>
                      <button
                        onClick={() => handleResolveReport(rep.id, 'DISMISSED')}
                        className="px-3.5 py-1.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                      >
                        Dismiss
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-lg">
                      {rep.status}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-400">
              No pending reports. Marketplace is currently clean and safe!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

