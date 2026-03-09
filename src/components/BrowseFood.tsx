import { useState, useEffect } from 'react';
import { FoodListing, User } from '../types';
import { apiGetFoods, apiClaimFood, getCities, getFoodTypes, getDonorNameSync } from '../api';
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
} from 'lucide-react';

interface BrowseFoodProps {
  currentUser: User | null;
  onLoginRequired: () => void;
}

export default function BrowseFood({ currentUser, onLoginRequired }: BrowseFoodProps) {
  const [foods, setFoods] = useState<FoodListing[]>([]);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [cities, setCities] = useState<string[]>([]);
  const [foodTypes, setFoodTypes] = useState<string[]>([]);
  const [requestedIds, setRequestedIds] = useState<Set<number>>(new Set());

  const loadFoods = async () => {
    const result = await apiGetFoods({
      search: search || undefined,
      city: cityFilter,
      food_type: typeFilter,
    });
    setFoods(result);
  };

  useEffect(() => {
    loadFoods();
    getCities().then(setCities);
    getFoodTypes().then(setFoodTypes);
  }, []);

  useEffect(() => {
    loadFoods();
  }, [search, cityFilter, typeFilter]);

  const handleRequest = async (food: FoodListing) => {
    if (!currentUser) {
      onLoginRequired();
      return;
    }
    const claim = await apiClaimFood(food.food_id, currentUser.user_id);
    if (claim) {
      setRequestedIds(prev => new Set(prev).add(food.food_id));
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

  const availableFoods = foods.filter(f => f.status === 'available');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Available Food Near You</h1>
          <p className="text-primary-100 text-lg">Browse surplus food from verified donors in your area</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
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

            {/* City Filter */}
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

            {/* Type Filter */}
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

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-700">{availableFoods.length}</span> available listing{availableFoods.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Food Cards */}
        {availableFoods.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossed size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No listings found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
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

                {/* Card Footer - Only show Request button for NGO/recipient users */}
                {currentUser?.role === 'recipient' && (
                  <div className="px-4 pb-4">
                    {requestedIds.has(food.food_id) ? (
                      <button
                        disabled
                        className="w-full py-2.5 bg-emerald-50 text-emerald-700 font-semibold rounded-xl flex items-center justify-center gap-2 text-sm"
                      >
                        <CheckCircle size={16} />
                        Requested
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRequest(food)}
                        className="w-full py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-sm flex items-center justify-center gap-2 text-sm group/btn"
                      >
                        <HandHeart size={16} />
                        Request Food
                      </button>
                    )}
                  </div>
                )}
                {!currentUser && (
                  <div className="px-4 pb-4">
                    <button
                      onClick={() => onLoginRequired()}
                      className="w-full py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-sm flex items-center justify-center gap-2 text-sm"
                    >
                      <HandHeart size={16} />
                      Sign in to Request
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
