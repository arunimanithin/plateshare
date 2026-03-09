import { useState, useEffect } from 'react';
import { FoodListing, User } from '../types';
import { apiGetUserListings, apiDeleteFood, apiUpdateFood } from '../api';
import {
  PlusCircle,
  Edit3,
  Trash2,
  Clock,
  MapPin,
  Package,
  CheckCircle,
  AlertTriangle,
  UtensilsCrossed,
  X,
  Save,
  Leaf,
  Drumstick,
  Cake,
  Heart,
  Coffee,
} from 'lucide-react';

interface DonorDashboardProps {
  currentUser: User;
  onPostFood: () => void;
}

export default function DonorDashboard({ currentUser, onPostFood }: DonorDashboardProps) {
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<FoodListing>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const loadListings = async () => {
    const result = await apiGetUserListings(currentUser.user_id);
    setListings(result.sort((a: FoodListing, b: FoodListing) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
  };

  useEffect(() => {
    loadListings();
  }, [currentUser]);

  const handleDelete = async (id: number) => {
    await apiDeleteFood(id);
    setDeleteConfirmId(null);
    loadListings();
  };

  const startEdit = (food: FoodListing) => {
    setEditingId(food.food_id);
    const d = new Date(food.expiry_time);
    const localStr = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setEditForm({
      title: food.title,
      description: food.description,
      quantity: food.quantity,
      food_type: food.food_type,
      pickup_address: food.pickup_address,
      city: food.city,
      expiry_time: localStr,
    });
  };

  const saveEdit = async () => {
    if (editingId === null) return;
    const updatedData: Partial<FoodListing> = { ...editForm };
    if (editForm.expiry_time) {
      updatedData.expiry_time = new Date(editForm.expiry_time).toISOString();
    }
    await apiUpdateFood(editingId, updatedData);
    setEditingId(null);
    setEditForm({});
    loadListings();
  };

  const getTimeRemaining = (expiry: string) => {
    const diff = new Date(expiry).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h left`;
    }
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const getStatusBadge = (status: string, expiry: string) => {
    const isExpired = new Date(expiry).getTime() <= Date.now();
    if (isExpired) return { label: 'Expired', classes: 'bg-red-100 text-red-700', icon: <AlertTriangle size={13} /> };
    switch (status) {
      case 'available': return { label: 'Available', classes: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle size={13} /> };
      case 'requested': return { label: 'Claimed', classes: 'bg-amber-100 text-amber-700', icon: <Clock size={13} /> };
      case 'completed': return { label: 'Completed', classes: 'bg-blue-100 text-blue-700', icon: <CheckCircle size={13} /> };
      default: return { label: status, classes: 'bg-gray-100 text-gray-600', icon: null };
    }
  };

  const getFoodTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'cooked meals': return <UtensilsCrossed size={14} className="text-orange-500" />;
      case 'bakery items': return <Cake size={14} className="text-amber-500" />;
      case 'beverages': return <Coffee size={14} className="text-brown-500" />;
      case 'veg': return <Leaf size={14} className="text-emerald-500" />;
      case 'non-veg': return <Drumstick size={14} className="text-red-500" />;
      case 'bakery': return <Cake size={14} className="text-amber-500" />;
      default: return <UtensilsCrossed size={14} className="text-gray-500" />;
    }
  };

  const categories = ['Cooked Meals', 'Bakery Items', 'Beverages', 'Snacks', 'Fruits & Vegetables', 'Veg', 'Non-Veg', 'Bakery', 'Other'];
  const totalDonations = listings.length;
  const displayName = currentUser.org_name || currentUser.full_name;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white py-10 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-xl">🍽️</span>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">{displayName}</h1>
                  <p className="text-blue-200 text-sm">Donor Dashboard</p>
                </div>
              </div>
            </div>
            <button
              onClick={onPostFood}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition shadow-sm self-start text-sm"
            >
              <PlusCircle size={17} />
              Post Food Now
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Donation Summary Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-1">Donation Summary</h2>
              <p className="text-gray-500 text-sm">Your contribution to reducing food waste</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 mb-1 mx-auto">
                  <Heart size={24} className="text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{totalDonations}</p>
                <p className="text-xs text-gray-500">Total Donations</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 mb-1 mx-auto">
                  <CheckCircle size={24} className="text-emerald-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{listings.filter(l => l.status === 'available').length}</p>
                <p className="text-xs text-gray-500">Active</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 mb-1 mx-auto">
                  <Clock size={24} className="text-amber-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{listings.filter(l => l.status === 'requested').length}</p>
                <p className="text-xs text-gray-500">Claimed</p>
              </div>
            </div>
          </div>
        </div>

        {/* My Listings Section */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">My Listings</h2>
          <span className="text-sm text-gray-500">{listings.length} {listings.length === 1 ? 'listing' : 'listings'}</span>
        </div>

        {/* Listings Content */}
        {listings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <span className="text-4xl">🍲</span>
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No listings yet</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Start making a difference by sharing your surplus food with those who need it.
            </p>
            <button
              onClick={onPostFood}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-sm"
            >
              <PlusCircle size={18} />
              Post Food Now
            </button>
          </div>
        ) : (
          <div className="space-y-4 pb-8">
            {listings.map(food => {
              const badge = getStatusBadge(food.status, food.expiry_time);
              const isEditing = editingId === food.food_id;

              return (
                <div
                  key={food.food_id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {isEditing ? (
                    /* Edit Form */
                    <div className="p-5 sm:p-6 space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-900">✏️ Edit Listing</h3>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-gray-500 mb-1 block">Food Title</label>
                          <input
                            type="text"
                            value={editForm.title || ''}
                            onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 mb-1 block">Quantity</label>
                          <input
                            type="text"
                            value={editForm.quantity || ''}
                            onChange={e => setEditForm(p => ({ ...p, quantity: e.target.value }))}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 mb-1 block">Category</label>
                          <select
                            value={editForm.food_type || ''}
                            onChange={e => setEditForm(p => ({ ...p, food_type: e.target.value }))}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white"
                          >
                            {categories.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 mb-1 block">City</label>
                          <input
                            type="text"
                            value={editForm.city || ''}
                            onChange={e => setEditForm(p => ({ ...p, city: e.target.value }))}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-xs font-semibold text-gray-500 mb-1 block">Pickup Address</label>
                          <input
                            type="text"
                            value={editForm.pickup_address || ''}
                            onChange={e => setEditForm(p => ({ ...p, pickup_address: e.target.value }))}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-xs font-semibold text-gray-500 mb-1 block">Description</label>
                          <textarea
                            value={editForm.description || ''}
                            onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                            rows={2}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 mb-1 block">Expiry Date & Time</label>
                          <input
                            type="datetime-local"
                            value={editForm.expiry_time || ''}
                            onChange={e => setEditForm(p => ({ ...p, expiry_time: e.target.value }))}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={saveEdit}
                          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition text-sm"
                        >
                          <Save size={16} />
                          Save Changes
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Normal View */
                    <div className="p-5 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-lg font-bold text-gray-900">{food.title}</h3>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.classes}`}>
                              {badge.icon}
                              {badge.label}
                            </span>
                          </div>
                          {food.description && (
                            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{food.description}</p>
                          )}
                          <div className="flex flex-wrap gap-x-5 gap-y-2">
                            <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                              {getFoodTypeIcon(food.food_type)}
                              {food.food_type}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                              <Package size={14} className="text-blue-500" />
                              {food.quantity}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                              <MapPin size={14} className="text-blue-500" />
                              {food.pickup_address}
                            </span>
                            <span className={`inline-flex items-center gap-1.5 text-sm ${
                              new Date(food.expiry_time).getTime() <= Date.now() ? 'text-red-500' : 'text-gray-600'
                            }`}>
                              <Clock size={14} className={new Date(food.expiry_time).getTime() <= Date.now() ? 'text-red-500' : 'text-blue-500'} />
                              {getTimeRemaining(food.expiry_time)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => startEdit(food)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-xl hover:bg-blue-100 transition"
                          >
                            <Edit3 size={15} />
                            Edit
                          </button>
                          {deleteConfirmId === food.food_id ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDelete(food.food_id)}
                                className="px-3.5 py-2 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-3.5 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(food.food_id)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-xl hover:bg-red-100 transition"
                            >
                              <Trash2 size={15} />
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
