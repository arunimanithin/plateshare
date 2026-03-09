import { useState, useEffect } from 'react';
import { FoodListing, User, Claim } from '../types';
import {
  apiGetFoods,
  apiClaimFood,
  apiGetUserClaims,
  apiMarkClaimCollected,
  getCities,
  getFoodTypes,
  getDonorNameSync,
} from '../api';
import {
  Search,
  MapPin,
  Clock,
  Package,
  Filter,
  ChevronDown,
  UtensilsCrossed,
  Leaf,
  Drumstick,
  Cake,
  HandHeart,
  CheckCircle,
  PackageOpen,
  CalendarClock,
  ArrowRight,
} from 'lucide-react';

interface NgoDashboardProps {
  currentUser: User;
  initialTab?: 'browse' | 'claims';
}

export default function NgoDashboard({ currentUser, initialTab = 'browse' }: NgoDashboardProps) {
  const [activeTab, setActiveTab] = useState<'browse' | 'claims'>(initialTab);

  // Browse state
  const [foods, setFoods] = useState<FoodListing[]>([]);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [cities, setCities] = useState<string[]>([]);
  const [foodTypes, setFoodTypes] = useState<string[]>([]);
  const [requestedIds, setRequestedIds] = useState<Set<number>>(new Set());

  // Claims state
  const [claims, setClaims] = useState<(Claim & { food?: FoodListing; donor_name?: string })[]>([]);

  const loadFoods = async () => {
    const result = await apiGetFoods({
      search: search || undefined,
      city: cityFilter,
      food_type: typeFilter,
    });
    setFoods(result);
  };

  const loadClaims = async () => {
    const result = await apiGetUserClaims(currentUser.user_id);
    setClaims(result);
    const claimedFoodIds = new Set<number>(result.map((c: { food_id: number }) => c.food_id));
    setRequestedIds(claimedFoodIds);
  };

  useEffect(() => {
    loadFoods();
    loadClaims();
    getCities().then(setCities);
    getFoodTypes().then(setFoodTypes);
  }, []);

  useEffect(() => {
    loadFoods();
  }, [search, cityFilter, typeFilter]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleRequest = async (food: FoodListing) => {
    const claim = await apiClaimFood(food.food_id, currentUser.user_id);
    if (claim) {
      setRequestedIds(prev => new Set(prev).add(food.food_id));
      loadFoods();
      loadClaims();
    }
  };

  const handleMarkCollected = async (claimId: number) => {
    const updated = await apiMarkClaimCollected(claimId);
    if (updated) {
      loadClaims();
      loadFoods();
    }
  };

  const getTimeRemaining = (expiry: string) => {
    const diff = new Date(expiry).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const getExpiryColor = (expiry: string) => {
    const diff = new Date(expiry).getTime() - Date.now();
    if (diff <= 0) return 'text-red-600 bg-red-50';
    if (diff < 3 * 3600000) return 'text-amber-600 bg-amber-50';
    return 'text-emerald-600 bg-emerald-50';
  };

  const getFoodTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'veg': return <Leaf size={14} className="text-emerald-500" />;
      case 'non-veg': return <Drumstick size={14} className="text-red-500" />;
      case 'bakery': return <Cake size={14} className="text-amber-500" />;
      default: return <UtensilsCrossed size={14} className="text-gray-500" />;
    }
  };

  const getFoodTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'veg': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'non-veg': return 'bg-red-50 text-red-700 border-red-200';
      case 'bakery': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getClaimStatusColor = (status: string) => {
    switch (status) {
      case 'reserved': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'collected': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getClaimStatusIcon = (status: string) => {
    switch (status) {
      case 'reserved': return <CalendarClock size={14} />;
      case 'collected': return <CheckCircle size={14} />;
      default: return <Package size={14} />;
    }
  };

  const availableFoods = foods.filter(f => f.status === 'available');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-blue-800 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl">
              <span className="text-2xl">🏢</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{currentUser.org_name || currentUser.full_name}</h1>
              <p className="text-primary-200 text-sm">NGO Dashboard • Recipient Organization</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-0">
            <button
              onClick={() => setActiveTab('browse')}
              className={`relative px-6 py-4 text-sm font-semibold transition-colors ${
                activeTab === 'browse'
                  ? 'text-primary-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Search size={16} />
                Browse
              </div>
              {activeTab === 'browse' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => { setActiveTab('claims'); loadClaims(); }}
              className={`relative px-6 py-4 text-sm font-semibold transition-colors ${
                activeTab === 'claims'
                  ? 'text-primary-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <PackageOpen size={16} />
                My Claims
                {claims.length > 0 && (
                  <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {claims.length}
                  </span>
                )}
              </div>
              {activeTab === 'claims' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-t-full" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ====== BROWSE TAB ====== */}
        {activeTab === 'browse' && (
          <div>
            {/* Sub-header */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Available Food Near You</h2>
              <p className="text-gray-500 text-sm mt-1">Discover surplus food from verified donors and claim what your organization needs</p>
            </div>

            {/* Search & Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search food or restaurant..."
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                  />
                </div>
                <div className="relative min-w-[160px]">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <select
                    value={cityFilter}
                    onChange={e => setCityFilter(e.target.value)}
                    className="w-full pl-9 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm appearance-none bg-white cursor-pointer"
                  >
                    <option value="all">All Cities</option>
                    {cities.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative min-w-[160px]">
                  <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <select
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value)}
                    className="w-full pl-9 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm appearance-none bg-white cursor-pointer"
                  >
                    <option value="all">All Types</option>
                    {foodTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Listings count */}
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${availableFoods.length > 0 ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                <p className="text-sm text-gray-600">
                  <span className="font-bold text-gray-900">{availableFoods.length}</span> listing{availableFoods.length !== 1 ? 's' : ''} available right now
                </p>
              </div>
            </div>

            {/* Food Cards */}
            {availableFoods.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🍽️</span>
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">No listings available right now</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  Check back later or try adjusting your filters. New food donations are posted throughout the day.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableFoods.map((food, i) => (
                  <div
                    key={food.food_id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300 animate-fadeInUp group"
                    style={{ animationDelay: `${i * 0.05}s`, animationFillMode: 'both' }}
                  >
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-4 border-b border-gray-100">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
                            {food.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-0.5">{food.donor_name || food.donor_org || getDonorNameSync(food.donor_id)}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${getFoodTypeColor(food.food_type)}`}>
                          {getFoodTypeIcon(food.food_type)}
                          {food.food_type}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-3">
                      <p className="text-sm text-gray-600 line-clamp-2">{food.description}</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Package size={15} className="text-primary-500 shrink-0" />
                          <span>Quantity: <span className="font-semibold text-gray-800">{food.quantity}</span></span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin size={15} className="text-primary-500 shrink-0" />
                          <span className="truncate">{food.pickup_address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock size={15} className="text-primary-500 shrink-0" />
                          <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${getExpiryColor(food.expiry_time)}`}>
                            {getTimeRemaining(food.expiry_time)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-4 pb-4">
                      {requestedIds.has(food.food_id) ? (
                        <button
                          disabled
                          className="w-full py-2.5 bg-emerald-50 text-emerald-700 font-semibold rounded-xl flex items-center justify-center gap-2 text-sm border border-emerald-200"
                        >
                          <CheckCircle size={16} />
                          Claimed
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRequest(food)}
                          className="w-full py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-sm flex items-center justify-center gap-2 text-sm"
                        >
                          <HandHeart size={16} />
                          Request Food
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ====== MY CLAIMS TAB ====== */}
        {activeTab === 'claims' && (
          <div>
            {/* Sub-header */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">My Claims</h2>
              <p className="text-gray-500 text-sm mt-1">Track your reserved and collected donations</p>
            </div>

            {claims.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">📦</span>
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">No claims yet</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
                  Browse available food and claim what your organization needs. Your reserved and collected items will appear here.
                </p>
                <button
                  onClick={() => setActiveTab('browse')}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-sm text-sm"
                >
                  Browse Available Food
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Claims summary */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 p-2.5 rounded-xl">
                        <span className="text-xl">📋</span>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{claims.length}</p>
                        <p className="text-xs text-gray-500 font-medium">Total Claims</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-amber-50 p-2.5 rounded-xl">
                        <span className="text-xl">⏳</span>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {claims.filter(c => c.status === 'reserved').length}
                        </p>
                        <p className="text-xs text-gray-500 font-medium">Reserved</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 col-span-2 sm:col-span-1">
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-50 p-2.5 rounded-xl">
                        <span className="text-xl">✅</span>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {claims.filter(c => c.status === 'collected').length}
                        </p>
                        <p className="text-xs text-gray-500 font-medium">Collected</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Claims list */}
                {claims.map((claim, i) => (
                  <div
                    key={claim.claim_id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fadeInUp hover:shadow-md transition-all"
                    style={{ animationDelay: `${i * 0.05}s`, animationFillMode: 'both' }}
                  >
                    <div className="p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="bg-gradient-to-br from-primary-50 to-blue-50 p-3 rounded-xl shrink-0">
                            <span className="text-2xl">🍱</span>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              {claim.food?.title || 'Food Item'}
                            </h3>
                            <p className="text-sm text-gray-500 mt-0.5">
                              From <span className="font-medium text-gray-700">{claim.donor_name}</span>
                            </p>
                            {claim.food && (
                              <div className="flex flex-wrap items-center gap-3 mt-3">
                                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                  <Package size={13} className="text-primary-500" />
                                  {claim.food.quantity}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                  <MapPin size={13} className="text-primary-500" />
                                  {claim.food.pickup_address}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                  <Clock size={13} className="text-primary-500" />
                                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getExpiryColor(claim.food.expiry_time)}`}>
                                    {getTimeRemaining(claim.food.expiry_time)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${getClaimStatusColor(claim.status)}`}>
                            {getClaimStatusIcon(claim.status)}
                            {claim.status === 'reserved' ? 'Reserved' : 'Collected'}
                          </span>
                          <p className="text-xs text-gray-400">
                            {new Date(claim.claimed_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                          {claim.status === 'reserved' && (
                            <button
                              onClick={() => handleMarkCollected(claim.claim_id)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-sm mt-1"
                            >
                              <CheckCircle size={14} />
                              Mark as Collected
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">PlateShare — 2026</p>
        </div>
      </footer>
    </div>
  );
}
