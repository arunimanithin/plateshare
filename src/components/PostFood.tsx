import React, { useState } from 'react';
import { User } from '../types';
import { apiCreateFood } from '../api';
import {
  PlusCircle,
  UtensilsCrossed,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  ArrowLeft,
  Tag,
} from 'lucide-react';

interface PostFoodProps {
  currentUser: User;
  onSuccess: () => void;
  onGoBack: () => void;
}

export default function PostFood({ currentUser, onSuccess, onGoBack }: PostFoodProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('Cooked Meals');
  const [pickupAddress, setPickupAddress] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [expiryTimePart, setExpiryTimePart] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title || !quantity || !pickupAddress || !expiryDate || !expiryTimePart) {
      setError('Please fill in all required fields');
      return;
    }

    const expiryDateTime = new Date(`${expiryDate}T${expiryTimePart}`);
    if (expiryDateTime <= new Date()) {
      setError('Expiry date & time must be in the future');
      return;
    }

    // Extract city from pickup address (last part after comma, or use user's city)
    const addressParts = pickupAddress.split(',').map(s => s.trim());
    const city = addressParts.length > 1 ? addressParts[addressParts.length - 1] : (currentUser.city || 'Unknown');

    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    await apiCreateFood({
      title,
      description: description || title,
      quantity,
      food_type: category,
      pickup_address: pickupAddress,
      city,
      expiry_time: expiryDateTime.toISOString(),
      donor_id: currentUser.user_id,
    });

    setLoading(false);
    setSuccess(true);

    setTimeout(() => {
      onSuccess();
    }, 1500);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center animate-fadeInUp">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Listing Posted Successfully!</h2>
          <p className="text-gray-500">Your food donation is now visible to NGOs and shelters nearby.</p>
        </div>
      </div>
    );
  }

  const categories = [
    'Cooked Meals',
    'Bakery Items',
    'Beverages',
    'Snacks',
    'Fruits & Vegetables',
    'Dairy Products',
    'Packaged Food',
    'Other',
  ];

  const displayName = currentUser.org_name || currentUser.full_name;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={onGoBack}
            className="flex items-center gap-1.5 text-blue-200 hover:text-white mb-4 text-sm transition"
          >
            <ArrowLeft size={16} />
            Back to My Listings
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-xl">🍲</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Post Surplus Food</h1>
              <p className="text-blue-200 text-sm">
                {displayName} — Help reduce waste by sharing surplus food
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Form Header */}
          <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">📋 Donation Details</h2>
            <p className="text-sm text-gray-500 mt-0.5">Fill in the details below to list your surplus food for donation</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                <span className="text-red-400">⚠️</span>
                {error}
              </div>
            )}

            {/* Food Title */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <UtensilsCrossed size={15} className="text-blue-500" />
                Food Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                placeholder='e.g., "30 portions of veg biryani"'
              />
            </div>

            {/* Category & Quantity */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Tag size={15} className="text-blue-500" />
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm appearance-none bg-white cursor-pointer"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Package size={15} className="text-blue-500" />
                  Quantity <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                  placeholder="e.g., 20 plates, 30 packs"
                />
              </div>
            </div>

            {/* Description (Optional) */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <span className="text-blue-500 text-sm">📝</span>
                Description <span className="text-gray-400 text-xs font-normal">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm resize-none"
                placeholder="Describe the food, preparation method, allergens, etc."
              />
            </div>

            {/* Pickup Address */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <MapPin size={15} className="text-blue-500" />
                Pickup Address <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={pickupAddress}
                onChange={e => setPickupAddress(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                placeholder="Street, Area, City"
              />
              <p className="text-xs text-gray-400 mt-1.5">
                Enter the exact location where food can be picked up
              </p>
            </div>

            {/* Expiry Date & Time */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Clock size={15} className="text-blue-500" />
                Expiry Date & Time <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={e => setExpiryDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">Date</p>
                </div>
                <div>
                  <input
                    type="time"
                    value={expiryTimePart}
                    onChange={e => setExpiryTimePart(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">Time</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                ⏰ Specify when the food is no longer safe for consumption
              </p>
            </div>

            {/* Separator */}
            <div className="border-t border-gray-100 pt-4">
              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <PlusCircle size={20} />
                    Post Donation Listing
                  </>
                )}
              </button>
              <p className="text-center text-xs text-gray-400 mt-3">
                Your listing will be visible to all verified NGOs and shelters on the platform
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
