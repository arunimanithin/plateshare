import { User, FoodListing, Donation, Claim } from './types';

// ============================================
// PlateShare API Layer
// All calls go to the deployed Express backend
// ============================================

const API_BASE = 'https://plateshare-vi1f.onrender.com';

async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  return res;
}

// No-op — kept for compatibility with App.tsx import
export function initializeDB(): void {}

// ============================================
// AUTH
// ============================================

// POST /api/login
export async function apiLogin(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const res = await apiFetch('/api/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Login failed' };
    return { success: true, user: data.user };
  } catch {
    return { success: false, error: 'Server unavailable. Please try again later.' };
  }
}

// POST /api/users
export async function apiCreateUser(data: {
  full_name: string; email: string; password: string; phone?: string;
  role: 'donor' | 'recipient'; org_name: string; city?: string;
}): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const res = await apiFetch('/api/users', { method: 'POST', body: JSON.stringify(data) });
    const result = await res.json();
    if (!res.ok) return { success: false, error: result.error || 'Registration failed' };
    return { success: true, user: result.user };
  } catch {
    return { success: false, error: 'Server unavailable. Please try again later.' };
  }
}

// ============================================
// FOOD LISTINGS
// ============================================

// GET /api/foods
export async function apiGetFoods(filters?: { city?: string; food_type?: string; search?: string }): Promise<FoodListing[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.city && filters.city !== 'all') params.set('city', filters.city);
    if (filters?.food_type && filters.food_type !== 'all') params.set('food_type', filters.food_type);
    if (filters?.search) params.set('search', filters.search);
    const res = await apiFetch(`/api/foods?${params.toString()}`);
    return await res.json();
  } catch {
    return [];
  }
}

// POST /api/foods
export async function apiCreateFood(data: {
  title: string; description: string; quantity: string; food_type: string;
  pickup_address: string; city: string; expiry_time: string; donor_id: number;
}): Promise<FoodListing> {
  const res = await apiFetch('/api/foods', { method: 'POST', body: JSON.stringify(data) });
  return await res.json();
}

// PUT /api/foods/:id
export async function apiUpdateFood(id: number, data: Partial<FoodListing>): Promise<FoodListing | null> {
  try {
    const res = await apiFetch(`/api/foods/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// DELETE /api/foods/:id
export async function apiDeleteFood(id: number): Promise<boolean> {
  try {
    const res = await apiFetch(`/api/foods/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return false;
  }
}

// GET /api/users/:id/listings
export async function apiGetUserListings(userId: number): Promise<FoodListing[]> {
  try {
    const res = await apiFetch(`/api/users/${userId}/listings`);
    return await res.json();
  } catch {
    return [];
  }
}

// ============================================
// DONOR NAME HELPERS
// ============================================

export function getDonorNameSync(donorId: number): string {
  return `Donor #${donorId}`;
}

export async function getDonorName(donorId: number): Promise<string> {
  try {
    const res = await apiFetch('/api/admin/users');
    const users = await res.json();
    const user = users.find((u: User) => u.user_id === donorId);
    return user ? user.org_name || user.full_name : 'Unknown';
  } catch {
    return 'Unknown';
  }
}

// ============================================
// PUBLIC STATS
// ============================================

export async function getStats(): Promise<{ meals: number; donors: number; ngos: number; wasted: string }> {
  try {
    const res = await apiFetch('/api/stats');
    return await res.json();
  } catch {
    return { meals: 0, donors: 0, ngos: 0, wasted: '2.1M tons' };
  }
}

// ============================================
// FILTERS (Cities & Food Types)
// ============================================

export async function getCities(): Promise<string[]> {
  try {
    const res = await apiFetch('/api/foods/filters');
    const data = await res.json();
    return data.cities || [];
  } catch {
    return [];
  }
}

export async function getFoodTypes(): Promise<string[]> {
  try {
    const res = await apiFetch('/api/foods/filters');
    const data = await res.json();
    return data.foodTypes || [];
  } catch {
    return [];
  }
}

// ============================================
// ADMIN FUNCTIONS
// ============================================

export async function apiGetAllUsers(): Promise<User[]> {
  try {
    const res = await apiFetch('/api/admin/users');
    return await res.json();
  } catch {
    return [];
  }
}

export async function apiToggleUserActive(userId: number): Promise<User | null> {
  try {
    const res = await apiFetch(`/api/admin/users/${userId}/toggle-active`, { method: 'PUT' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiApproveUser(userId: number): Promise<User | null> {
  try {
    const res = await apiFetch(`/api/admin/users/${userId}/approve`, { method: 'PUT' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function getAdminStats(): Promise<{
  totalDonors: number; ngoPartners: number; pendingApprovals: number;
  activeListings: number; currentlyClaimed: number; mealsRescued: number;
}> {
  try {
    const res = await apiFetch('/api/admin/stats');
    return await res.json();
  } catch {
    return { totalDonors: 0, ngoPartners: 0, pendingApprovals: 0, activeListings: 0, currentlyClaimed: 0, mealsRescued: 0 };
  }
}

export async function apiGetDonations(): Promise<Donation[]> {
  try {
    const res = await apiFetch('/api/admin/donations');
    return await res.json();
  } catch {
    return [];
  }
}

export async function apiGetPendingUsers(): Promise<User[]> {
  try {
    const res = await apiFetch('/api/admin/pending');
    return await res.json();
  } catch {
    return [];
  }
}

// ============================================
// CLAIMS (NGO)
// ============================================

export async function apiClaimFood(foodId: number, recipientId: number): Promise<Claim | null> {
  try {
    const res = await apiFetch('/api/claims', {
      method: 'POST',
      body: JSON.stringify({ food_id: foodId, recipient_id: recipientId }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiGetUserClaims(recipientId: number): Promise<(Claim & { food?: FoodListing; donor_name?: string })[]> {
  try {
    const res = await apiFetch(`/api/users/${recipientId}/claims`);
    return await res.json();
  } catch {
    return [];
  }
}

export async function apiMarkClaimCollected(claimId: number): Promise<Claim | null> {
  try {
    const res = await apiFetch(`/api/claims/${claimId}/collect`, { method: 'PUT' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
