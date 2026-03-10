import { User, FoodListing, Donation, Claim } from './types';

const API_BASE = 'https://plateshare-vi1f.onrender.com';

let backendAvailable: boolean | null = null;

async function checkBackend(): Promise<boolean> {
  if (backendAvailable !== null) return backendAvailable;
  try {
    const res = await fetch(`${API_BASE}/api/health`, { signal: AbortSignal.timeout(2000) });
    backendAvailable = res.ok;
  } catch {
    backendAvailable = false;
  }
  setTimeout(() => { backendAvailable = null; }, 30000);
  return backendAvailable;
}

async function apiFetch(url: string, options?: RequestInit) {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    return res;
  } catch (err) {
    backendAvailable = false;
    throw err;
  }
}

// ==============================
// API FUNCTIONS
// ==============================

export async function apiLogin(
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> {

  const res = await apiFetch('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (!res.ok) {
    return { success: false, error: data.error || 'Login failed' };
  }

  return { success: true, user: data.user };
}

export async function apiCreateUser(data: {
  full_name: string
  email: string
  password: string
  phone?: string
  role: 'donor' | 'recipient'
  org_name: string
  city?: string
}): Promise<{ success: boolean; user?: User; error?: string }> {

  const res = await apiFetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(data)
  });

  const result = await res.json();

  if (!res.ok) {
    return { success: false, error: result.error || 'Registration failed' };
  }

  return { success: true, user: result.user };
}

export async function apiGetFoods(filters?: {
  city?: string
  food_type?: string
  search?: string
}): Promise<FoodListing[]> {

  const params = new URLSearchParams();

  if (filters?.city && filters.city !== 'all') params.set('city', filters.city);
  if (filters?.food_type && filters.food_type !== 'all') params.set('food_type', filters.food_type);
  if (filters?.search) params.set('search', filters.search);

  const res = await apiFetch(`/api/foods?${params.toString()}`);

  return res.json();
}

export async function apiCreateFood(data: {
  title: string
  description: string
  quantity: string
  food_type: string
  pickup_address: string
  city: string
  expiry_time: string
  donor_id: number
}): Promise<FoodListing> {

  const res = await apiFetch('/api/foods', {
    method: 'POST',
    body: JSON.stringify(data)
  });

  return res.json();
}

export async function apiUpdateFood(
  id: number,
  data: Partial<FoodListing>
): Promise<FoodListing | null> {

  const res = await apiFetch(`/api/foods/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });

  if (!res.ok) return null;

  return res.json();
}

export async function apiDeleteFood(id: number): Promise<boolean> {

  const res = await apiFetch(`/api/foods/${id}`, {
    method: 'DELETE'
  });

  return res.ok;
}

export async function apiGetUserListings(userId: number): Promise<FoodListing[]> {

  const res = await apiFetch(`/api/users/${userId}/listings`);

  return res.json();
}

export async function getDonorName(donorId: number): Promise<string> {

  const res = await apiFetch('/api/admin/users');

  const users = await res.json();

  const user = users.find((u: User) => u.user_id === donorId);

  return user ? user.org_name || user.full_name : 'Unknown';
}

export async function getStats(): Promise<{
  meals: number
  donors: number
  ngos: number
  wasted: string
}> {

  const res = await apiFetch('/api/stats');

  return res.json();
}

export async function getCities(): Promise<string[]> {

  const res = await apiFetch('/api/cities');

  return res.json();
}

export async function getFoodTypes(): Promise<string[]> {

  const res = await apiFetch('/api/food-types');

  return res.json();
}

// ==============================
// ADMIN
// ==============================

export async function apiGetAllUsers(): Promise<User[]> {

  const res = await apiFetch('/api/admin/users');

  return res.json();
}

export async function apiToggleUserActive(userId: number): Promise<User | null> {

  const res = await apiFetch(`/api/admin/users/${userId}/toggle-active`, {
    method: 'PUT'
  });

  if (!res.ok) return null;

  return res.json();
}

export async function apiApproveUser(userId: number): Promise<User | null> {

  const res = await apiFetch(`/api/admin/users/${userId}/approve`, {
    method: 'PUT'
  });

  if (!res.ok) return null;

  return res.json();
}

export async function getAdminStats(): Promise<{
  totalDonors: number
  ngoPartners: number
  pendingApprovals: number
  activeListings: number
  currentlyClaimed: number
  mealsRescued: number
}> {

  const res = await apiFetch('/api/admin/stats');

  return res.json();
}

export async function apiGetDonations(): Promise<Donation[]> {

  const res = await apiFetch('/api/admin/donations');

  return res.json();
}

export async function apiGetPendingUsers(): Promise<User[]> {

  const res = await apiFetch('/api/admin/pending');

  return res.json();
}

export async function apiClaimFood(
  foodId: number,
  recipientId: number
): Promise<Claim | null> {

  const res = await apiFetch('/api/claims', {
    method: 'POST',
    body: JSON.stringify({
      food_id: foodId,
      recipient_id: recipientId
    })
  });

  if (!res.ok) return null;

  return res.json();
}

export async function apiGetUserClaims(
  recipientId: number
): Promise<(Claim & { food?: FoodListing; donor_name?: string })[]> {

  const res = await apiFetch(`/api/users/${recipientId}/claims`);

  return res.json();
}

export async function apiMarkClaimCollected(claimId: number): Promise<Claim | null> {

  const res = await apiFetch(`/api/claims/${claimId}/collect`, {
    method: 'PUT'
  });

  if (!res.ok) return null;

  return res.json();
}