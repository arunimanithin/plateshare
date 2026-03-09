import { useState, useEffect } from 'react';
import { User, Donation } from '../types';
import {
  apiGetAllUsers,
  apiToggleUserActive,
  apiApproveUser,
  apiGetDonations,
  getAdminStats,
  apiGetFoods,
} from '../api';
import {
  LayoutDashboard,
  Users,
  Clock,
  Heart,
  UserCheck,
  Building2,
  ShieldCheck,
  Package,
  HandHeart,
  UtensilsCrossed,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  Mail,
  Phone,
  Calendar,
  ChevronRight,
} from 'lucide-react';

type AdminTab = 'overview' | 'users' | 'pending' | 'donations';

interface AdminDashboardProps {
  currentUser: User;
}

export default function AdminDashboard({ currentUser }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [stats, setStats] = useState({ totalDonors: 0, ngoPartners: 0, pendingApprovals: 0, activeListings: 0, currentlyClaimed: 0, mealsRescued: 0 });
  const [totalFoods, setTotalFoods] = useState(0);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const loadData = async () => {
    const [users, dons, st, foods] = await Promise.all([apiGetAllUsers(), apiGetDonations(), getAdminStats(), apiGetFoods()]);
    setAllUsers(users);
    setDonations(dons);
    setStats(st);
    setTotalFoods(foods.length);
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleToggleActive = async (userId: number) => {
    setActionLoading(userId);
    await new Promise(r => setTimeout(r, 300));
    await apiToggleUserActive(userId);
    await loadData();
    setActionLoading(null);
  };

  const handleApprove = async (userId: number) => {
    setActionLoading(userId);
    await new Promise(r => setTimeout(r, 300));
    await apiApproveUser(userId);
    await loadData();
    setActionLoading(null);
  };

  const pendingUsers = allUsers.filter(u => !u.is_approved);
  const approvedUsers = allUsers.filter(u => u.is_approved);

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'users', label: 'Users', icon: <Users size={18} />, badge: approvedUsers.length },
    { id: 'pending', label: 'Pending', icon: <Clock size={18} />, badge: pendingUsers.length },
    { id: 'donations', label: 'Donations', icon: <Heart size={18} />, badge: donations.length },
  ];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return { label: 'Admin', color: 'bg-purple-100 text-purple-700 border-purple-200', emoji: '👑' };
      case 'donor':
        return { label: 'Donor', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', emoji: '🍽️' };
      case 'recipient':
        return { label: 'Recipient', color: 'bg-blue-100 text-blue-700 border-blue-200', emoji: '🏢' };
      default:
        return { label: role, color: 'bg-gray-100 text-gray-700 border-gray-200', emoji: '👤' };
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getInitials = (name: string) =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  // ---- OVERVIEW TAB ----
  const renderOverview = () => {
    const metricCards = [
      {
        emoji: '🍽️',
        label: 'Total Donors',
        value: stats.totalDonors,
        color: 'border-l-blue-500',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
      },
      {
        emoji: '🏢',
        label: 'NGO Partners',
        value: stats.ngoPartners,
        color: 'border-l-yellow-500',
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-700',
      },
      {
        emoji: '⏳',
        label: 'Pending Approvals',
        value: stats.pendingApprovals,
        color: 'border-l-red-500',
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
      },
      {
        emoji: '📦',
        label: 'Active Listings',
        value: stats.activeListings,
        color: 'border-l-emerald-500',
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-700',
      },
      {
        emoji: '🤝',
        label: 'Currently Claimed',
        value: stats.currentlyClaimed,
        color: 'border-l-purple-500',
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-700',
      },
      {
        emoji: '🎉',
        label: 'Meals Rescued',
        value: stats.mealsRescued,
        color: 'border-l-green-500',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
      },
    ];

    return (
      <div className="space-y-8 animate-fadeInUp">
        {/* Metric Cards */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">📊 Platform Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {metricCards.map((card) => (
              <div
                key={card.label}
                className={`bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 border-l-4 ${card.color}`}
              >
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">{card.label}</p>
                      <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                    </div>
                    <div className={`w-12 h-12 ${card.bgColor} rounded-xl flex items-center justify-center text-2xl`}>
                      {card.emoji}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Summary */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Users size={18} className="text-primary-500" />
                Recent Users
              </h3>
              <button
                onClick={() => setActiveTab('users')}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
              >
                View All <ChevronRight size={14} />
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {allUsers.slice(0, 4).map(user => {
                const badge = getRoleBadge(user.role);
                return (
                  <div key={user.user_id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                        {getInitials(user.full_name)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{user.full_name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${badge.color}`}>
                      {badge.emoji} {badge.label}
                    </span>
                  </div>
                );
              })}
              {allUsers.length === 0 && (
                <div className="px-5 py-8 text-center text-gray-400 text-sm">No users found</div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Package size={18} className="text-emerald-500" />
                Food Listings Summary
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                  Available
                </span>
                <span className="text-sm font-bold text-gray-900">{stats.activeListings}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-emerald-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${totalFoods ? (stats.activeListings / totalFoods) * 100 : 0}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-400"></span>
                  Claimed
                </span>
                <span className="text-sm font-bold text-gray-900">{stats.currentlyClaimed}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${totalFoods ? (stats.currentlyClaimed / totalFoods) * 100 : 0}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                  Completed
                </span>
                <span className="text-sm font-bold text-gray-900">{stats.mealsRescued}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-gray-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${totalFoods ? (stats.mealsRescued / totalFoods) * 100 : 0}%` }}
                ></div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Total Listings</span>
                <span className="text-lg font-bold text-gray-900">{totalFoods}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live database info */}
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-100 rounded-xl p-4 flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></div>
          <p className="text-sm text-primary-700">
            <span className="font-semibold">Live overview</span> — All metrics are synced with the application database in real-time.
          </p>
        </div>
      </div>
    );
  };

  // ---- USERS TAB ----
  const renderUsers = () => {
    return (
      <div className="animate-fadeInUp">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800">
            👥 All Registered Users
            <span className="ml-2 text-sm font-normal text-gray-400">({allUsers.length} total)</span>
          </h2>
        </div>

        <div className="space-y-3">
          {allUsers.map(user => {
            const badge = getRoleBadge(user.role);
            const isLoading = actionLoading === user.user_id;

            return (
              <div
                key={user.user_id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200"
              >
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* User Info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {getInitials(user.full_name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-base font-bold text-gray-900">{user.full_name}</h3>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.color}`}>
                            {badge.emoji} {badge.label}
                          </span>
                          {user.is_approved && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-200">
                              <CheckCircle size={10} />
                              approved
                            </span>
                          )}
                        </div>
                        {user.org_name && user.org_name !== user.full_name && (
                          <p className="text-sm text-gray-500 mb-1 flex items-center gap-1.5">
                            <Building2 size={13} className="text-gray-400" />
                            {user.org_name}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Mail size={12} />
                            {user.email}
                          </span>
                          {user.phone && (
                            <span className="flex items-center gap-1">
                              <Phone size={12} />
                              {user.phone}
                            </span>
                          )}
                          {user.city && (
                            <span className="flex items-center gap-1">
                              <MapPin size={12} />
                              {user.city}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            Joined {formatDate(user.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleActive(user.user_id)}
                          disabled={isLoading}
                          className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 disabled:opacity-50 ${
                            user.is_active
                              ? 'text-red-700 bg-red-50 hover:bg-red-100 border border-red-200'
                              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                        >
                          {isLoading ? (
                            <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                          ) : user.is_active ? (
                            <>
                              <XCircle size={15} />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <CheckCircle size={15} />
                              Activate
                            </>
                          )}
                        </button>
                      )}
                      {user.role === 'admin' && (
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-xl border border-purple-200">
                          <ShieldCheck size={15} />
                          System Admin
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Bar */}
                <div className={`px-5 py-2 text-xs font-medium flex items-center gap-2 ${
                  user.is_active
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-red-50 text-red-600'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                  {user.is_active ? 'Active Account' : 'Deactivated Account'}
                </div>
              </div>
            );
          })}

          {allUsers.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <Users size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No users found</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ---- PENDING TAB ----
  const renderPending = () => {
    return (
      <div className="animate-fadeInUp">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800">
            ⏳ Pending NGO Approvals
            <span className="ml-2 text-sm font-normal text-gray-400">({pendingUsers.length} pending)</span>
          </h2>
        </div>

        {pendingUsers.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={40} className="text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">All caught up! 🎉</h3>
              <p className="text-gray-400 max-w-sm mx-auto">
                There are no pending approval requests at the moment. All registered organizations have been reviewed.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingUsers.map(user => {
              const badge = getRoleBadge(user.role);
              const isLoading = actionLoading === user.user_id;

              return (
                <div
                  key={user.user_id}
                  className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden hover:shadow-md transition-all"
                >
                  <div className="border-l-4 border-l-amber-400">
                    <div className="p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {getInitials(user.full_name)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="text-base font-bold text-gray-900">{user.full_name}</h3>
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.color}`}>
                                {badge.emoji} {badge.label}
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-600 border border-amber-200">
                                <AlertCircle size={10} />
                                pending
                              </span>
                            </div>
                            {user.org_name && (
                              <p className="text-sm text-gray-500 mb-1 flex items-center gap-1.5">
                                <Building2 size={13} className="text-gray-400" />
                                {user.org_name}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                              <span className="flex items-center gap-1"><Mail size={12} /> {user.email}</span>
                              {user.phone && <span className="flex items-center gap-1"><Phone size={12} /> {user.phone}</span>}
                              {user.city && <span className="flex items-center gap-1"><MapPin size={12} /> {user.city}</span>}
                              <span className="flex items-center gap-1"><Calendar size={12} /> Applied {formatDate(user.created_at)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleApprove(user.user_id)}
                            disabled={isLoading}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-all shadow-sm disabled:opacity-50"
                          >
                            {isLoading ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <>
                                <UserCheck size={16} />
                                Approve
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleToggleActive(user.user_id)}
                            disabled={isLoading}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-all disabled:opacity-50"
                          >
                            <XCircle size={16} />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ---- DONATIONS TAB ----
  const renderDonations = () => {
    return (
      <div className="animate-fadeInUp">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              💝 All Donations
              <span className="ml-2 text-sm font-normal text-gray-400">({donations.length} total)</span>
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">Live overview from database</p>
          </div>
        </div>

        {donations.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <HandHeart size={40} className="text-primary-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No donations yet</h3>
              <p className="text-gray-400 max-w-sm mx-auto">
                When NGOs request food from donors, the transactions will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Food Item</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Donor</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {donations.map(d => (
                    <tr key={d.donation_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 text-sm text-gray-400 font-mono">{d.donation_id}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <UtensilsCrossed size={14} className="text-primary-400" />
                          <span className="text-sm font-semibold text-gray-800">{d.food_title}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{d.donor_name}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{d.quantity}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          d.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}>
                          {d.status === 'completed' ? <CheckCircle size={11} /> : <Clock size={11} />}
                          {d.status === 'completed' ? 'Completed' : 'Requested'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-400">{formatDate(d.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Live sync indicator */}
        <div className="mt-4 bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-100 rounded-xl p-3 flex items-center gap-3">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          <p className="text-xs text-primary-600">
            Live overview from database — data refreshes with each interaction.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/15 backdrop-blur-sm p-2.5 rounded-xl">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-primary-200 text-sm mt-0.5">
                Manage users, approvals, and monitor platform activity
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-1 -mb-px">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  loadData();
                }}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-700 bg-primary-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'pending' && renderPending()}
        {activeTab === 'donations' && renderDonations()}
      </div>
    </div>
  );
}
