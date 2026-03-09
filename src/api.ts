import { User, FoodListing, Donation, Claim } from './types';

// ============================================
// PlateShare API Layer
// Dual mode: Tries Express backend first,
// falls back to localStorage if unavailable
// ============================================

const API_BASE = 'http://localhost:5000/api';

let backendAvailable: boolean | null = null;

async function checkBackend(): Promise<boolean> {
  if (backendAvailable !== null) return backendAvailable;
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
    backendAvailable = res.ok;
  } catch {
    backendAvailable = false;
  }
  // Re-check every 30 seconds
  setTimeout(() => { backendAvailable = null; }, 30000);
  return backendAvailable;
}

async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  return res;
}

// ============================================
// LOCAL STORAGE FALLBACK (unchanged from before)
// ============================================

const USERS_KEY = 'plateshare_users';
const FOODS_KEY = 'plateshare_foods';
const CLAIMS_KEY = 'plateshare_claims';
const NEXT_USER_ID = 'plateshare_next_uid';
const NEXT_FOOD_ID = 'plateshare_next_fid';
const NEXT_CLAIM_ID = 'plateshare_next_cid';
const INIT_KEY = 'plateshare_initialized_v5';

const seedUsers: User[] = [
  {
    user_id: 2, full_name: 'Admin User', email: 'admin@demo.com', password: 'password123',
    phone: null, role: 'admin', org_name: 'PlateShare Admin', address: null, city: null,
    latitude: null, longitude: null, is_approved: true, is_active: true, profile_pic: null,
    created_at: '2026-03-08T22:02:25', updated_at: '2026-03-08T22:18:19',
  },
  {
    user_id: 3, full_name: 'Spice Restaurant', email: 'donor@demo.com', password: 'password123',
    phone: '9068570234', role: 'donor', org_name: 'Spice Restaurant', address: null, city: 'Kochi',
    latitude: null, longitude: null, is_approved: true, is_active: true, profile_pic: null,
    created_at: '2026-03-08T22:02:25', updated_at: '2026-03-08T22:18:50',
  },
  {
    user_id: 4, full_name: 'Green Hearts', email: 'ngo@demo.com', password: 'password123',
    phone: '7012657634', role: 'recipient', org_name: 'Green Hearts', address: null, city: 'Kochi',
    latitude: null, longitude: null, is_approved: true, is_active: true, profile_pic: null,
    created_at: '2026-03-08T22:02:25', updated_at: '2026-03-08T22:19:06',
  },
];

function makeSeedFoods(): FoodListing[] {
  const now = Date.now();
  return [
    { food_id: 1, title: 'Vegetable Biryani', description: 'Freshly prepared vegetable biryani with aromatic spices and herbs.', quantity: '20 plates', food_type: 'Cooked Meals', pickup_address: 'Spice Restaurant, MG Road', city: 'Kochi', expiry_time: new Date(now + 6 * 3600000).toISOString(), donor_id: 3, status: 'available', created_at: new Date(now - 3600000).toISOString() },
    { food_id: 2, title: 'Bread Packs', description: 'Assorted fresh bread packs including whole wheat, multigrain, and white bread.', quantity: '30 packs', food_type: 'Bakery Items', pickup_address: 'Spice Restaurant, MG Road', city: 'Kochi', expiry_time: new Date(now + 12 * 3600000).toISOString(), donor_id: 3, status: 'available', created_at: new Date(now - 7200000).toISOString() },
    { food_id: 3, title: 'Rice Meals', description: 'Complete rice meals with dal, sambar, rasam, and mixed vegetable curry.', quantity: '15 meals', food_type: 'Cooked Meals', pickup_address: 'Spice Restaurant, Marine Drive', city: 'Kochi', expiry_time: new Date(now + 4 * 3600000).toISOString(), donor_id: 3, status: 'available', created_at: new Date(now - 1800000).toISOString() },
    { food_id: 4, title: 'Sandwich Boxes', description: 'Assorted sandwich boxes with fresh vegetables and cheese.', quantity: '25 boxes', food_type: 'Snacks', pickup_address: 'Spice Restaurant, Broadway', city: 'Kochi', expiry_time: new Date(now + 8 * 3600000).toISOString(), donor_id: 3, status: 'available', created_at: new Date(now - 5400000).toISOString() },
    { food_id: 5, title: 'Fruit Salad Bowls', description: 'Fresh seasonal fruit salad bowls with a mix of tropical fruits.', quantity: '12 bowls', food_type: 'Fruits & Vegetables', pickup_address: 'Spice Restaurant, Fort Kochi', city: 'Kochi', expiry_time: new Date(now + 3 * 3600000).toISOString(), donor_id: 3, status: 'available', created_at: new Date(now - 900000).toISOString() },
    { food_id: 6, title: 'Chicken Curry Meals', description: 'Spicy chicken curry with steamed rice and papad.', quantity: '18 meals', food_type: 'Cooked Meals', pickup_address: 'Spice Restaurant, Edappally', city: 'Kochi', expiry_time: new Date(now + 5 * 3600000).toISOString(), donor_id: 3, status: 'available', created_at: new Date(now - 2700000).toISOString() },
  ];
}

export function initializeDB(): void {
  if (!localStorage.getItem(INIT_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(seedUsers));
    localStorage.setItem(FOODS_KEY, JSON.stringify(makeSeedFoods()));
    localStorage.setItem(CLAIMS_KEY, JSON.stringify([]));
    localStorage.setItem(NEXT_USER_ID, '5');
    localStorage.setItem(NEXT_FOOD_ID, '7');
    localStorage.setItem(NEXT_CLAIM_ID, '1');
    localStorage.setItem(INIT_KEY, 'true');
  }
}

function lsGetUsers(): User[] { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
function lsSetUsers(u: User[]) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }
function lsGetFoods(): FoodListing[] { return JSON.parse(localStorage.getItem(FOODS_KEY) || '[]'); }
function lsSetFoods(f: FoodListing[]) { localStorage.setItem(FOODS_KEY, JSON.stringify(f)); }
function lsGetClaims(): Claim[] { return JSON.parse(localStorage.getItem(CLAIMS_KEY) || '[]'); }
function lsSetClaims(c: Claim[]) { localStorage.setItem(CLAIMS_KEY, JSON.stringify(c)); }
function lsNextUserId(): number { const id = parseInt(localStorage.getItem(NEXT_USER_ID) || '5'); localStorage.setItem(NEXT_USER_ID, String(id + 1)); return id; }
function lsNextFoodId(): number { const id = parseInt(localStorage.getItem(NEXT_FOOD_ID) || '7'); localStorage.setItem(NEXT_FOOD_ID, String(id + 1)); return id; }
function lsNextClaimId(): number { const id = parseInt(localStorage.getItem(NEXT_CLAIM_ID) || '1'); localStorage.setItem(NEXT_CLAIM_ID, String(id + 1)); return id; }

// ============================================
// API FUNCTIONS — Try backend, fallback to LS
// ============================================

// POST /api/login
export async function apiLogin(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  if (await checkBackend()) {
    try {
      const res = await apiFetch('/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Login failed' };
      return { success: true, user: data.user };
    } catch { /* fallback */ }
  }
  // localStorage fallback
  const users = lsGetUsers();
  const user = users.find(u => u.email === email);
  if (!user) return { success: false, error: 'User not found' };
  if (user.password !== password) return { success: false, error: 'Invalid password' };
  if (!user.is_active) return { success: false, error: 'Account is inactive' };
  return { success: true, user };
}

// POST /api/users
export async function apiCreateUser(data: {
  full_name: string; email: string; password: string; phone?: string;
  role: 'donor' | 'recipient'; org_name: string; city?: string;
}): Promise<{ success: boolean; user?: User; error?: string }> {
  if (await checkBackend()) {
    try {
      const res = await apiFetch('/users', { method: 'POST', body: JSON.stringify(data) });
      const result = await res.json();
      if (!res.ok) return { success: false, error: result.error || 'Registration failed' };
      return { success: true, user: result.user };
    } catch { /* fallback */ }
  }
  const users = lsGetUsers();
  if (users.find(u => u.email === data.email)) return { success: false, error: 'Email already registered' };
  const newUser: User = {
    user_id: lsNextUserId(), full_name: data.full_name, email: data.email, password: data.password,
    phone: data.phone || null, role: data.role, org_name: data.org_name, address: null,
    city: data.city || null, latitude: null, longitude: null, is_approved: true, is_active: true,
    profile_pic: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  };
  users.push(newUser);
  lsSetUsers(users);
  return { success: true, user: newUser };
}

// GET /api/foods
export async function apiGetFoods(filters?: { city?: string; food_type?: string; search?: string }): Promise<FoodListing[]> {
  if (await checkBackend()) {
    try {
      const params = new URLSearchParams();
      if (filters?.city && filters.city !== 'all') params.set('city', filters.city);
      if (filters?.food_type && filters.food_type !== 'all') params.set('food_type', filters.food_type);
      if (filters?.search) params.set('search', filters.search);
      const res = await apiFetch(`/foods?${params.toString()}`);
      return await res.json();
    } catch { /* fallback */ }
  }
  let foods = lsGetFoods();
  if (filters) {
    if (filters.city && filters.city !== 'all') foods = foods.filter(f => f.city.toLowerCase() === filters.city!.toLowerCase());
    if (filters.food_type && filters.food_type !== 'all') foods = foods.filter(f => f.food_type.toLowerCase() === filters.food_type!.toLowerCase());
    if (filters.search) { const q = filters.search.toLowerCase(); foods = foods.filter(f => f.title.toLowerCase().includes(q) || f.description.toLowerCase().includes(q) || f.pickup_address.toLowerCase().includes(q)); }
  }
  return foods;
}

// POST /api/foods
export async function apiCreateFood(data: {
  title: string; description: string; quantity: string; food_type: string;
  pickup_address: string; city: string; expiry_time: string; donor_id: number;
}): Promise<FoodListing> {
  if (await checkBackend()) {
    try {
      const res = await apiFetch('/foods', { method: 'POST', body: JSON.stringify(data) });
      return await res.json();
    } catch { /* fallback */ }
  }
  const foods = lsGetFoods();
  const newFood: FoodListing = { food_id: lsNextFoodId(), ...data, status: 'available', created_at: new Date().toISOString() };
  foods.push(newFood);
  lsSetFoods(foods);
  return newFood;
}

// PUT /api/foods/:id
export async function apiUpdateFood(id: number, data: Partial<FoodListing>): Promise<FoodListing | null> {
  if (await checkBackend()) {
    try {
      const res = await apiFetch(`/foods/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      if (!res.ok) return null;
      return await res.json();
    } catch { /* fallback */ }
  }
  const foods = lsGetFoods();
  const idx = foods.findIndex(f => f.food_id === id);
  if (idx === -1) return null;
  foods[idx] = { ...foods[idx], ...data };
  lsSetFoods(foods);
  return foods[idx];
}

// DELETE /api/foods/:id
export async function apiDeleteFood(id: number): Promise<boolean> {
  if (await checkBackend()) {
    try {
      const res = await apiFetch(`/foods/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch { /* fallback */ }
  }
  const foods = lsGetFoods();
  const filtered = foods.filter(f => f.food_id !== id);
  if (filtered.length === foods.length) return false;
  lsSetFoods(filtered);
  return true;
}

// GET /api/users/:id/listings
export async function apiGetUserListings(userId: number): Promise<FoodListing[]> {
  if (await checkBackend()) {
    try {
      const res = await apiFetch(`/users/${userId}/listings`);
      return await res.json();
    } catch { /* fallback */ }
  }
  return lsGetFoods().filter(f => f.donor_id === userId);
}

// Get donor name (sync - localStorage only, used inline in JSX)
export function getDonorNameSync(donorId: number): string {
  const users = lsGetUsers();
  const user = users.find(u => u.user_id === donorId);
  return user ? user.org_name || user.full_name : 'Unknown';
}

// Get donor name (async)
export async function getDonorName(donorId: number): Promise<string> {
  if (await checkBackend()) {
    try {
      const res = await apiFetch('/admin/users');
      const users = await res.json();
      const user = users.find((u: User) => u.user_id === donorId);
      return user ? user.org_name || user.full_name : 'Unknown';
    } catch { /* fallback */ }
  }
  const users = lsGetUsers();
  const user = users.find(u => u.user_id === donorId);
  return user ? user.org_name || user.full_name : 'Unknown';
}

// Get stats (hero page)
export async function getStats(): Promise<{ meals: number; donors: number; ngos: number; wasted: string }> {
  if (await checkBackend()) {
    try {
      const res = await apiFetch('/stats');
      return await res.json();
    } catch { /* fallback */ }
  }
  const users = lsGetUsers();
  const foods = lsGetFoods();
  const completed = foods.filter(f => f.status === 'completed');
  const meals = completed.reduce((sum, f) => { const p = parseInt(f.quantity); return sum + (isNaN(p) ? 1 : p); }, 0);
  return { meals, donors: users.filter(u => u.role === 'donor').length, ngos: users.filter(u => u.role === 'recipient').length, wasted: '2.1M tons' };
}

// Get unique cities
export async function getCities(): Promise<string[]> {
  if (await checkBackend()) {
    try {
      const res = await apiFetch('/cities');
      return await res.json();
    } catch { /* fallback */ }
  }
  return [...new Set(lsGetFoods().map(f => f.city))];
}

// Get unique food types
export async function getFoodTypes(): Promise<string[]> {
  if (await checkBackend()) {
    try {
      const res = await apiFetch('/food-types');
      return await res.json();
    } catch { /* fallback */ }
  }
  return [...new Set(lsGetFoods().map(f => f.food_type))];
}

// ---- ADMIN FUNCTIONS ----

export async function apiGetAllUsers(): Promise<User[]> {
  if (await checkBackend()) {
    try {
      const res = await apiFetch('/admin/users');
      return await res.json();
    } catch { /* fallback */ }
  }
  return lsGetUsers();
}

export async function apiToggleUserActive(userId: number): Promise<User | null> {
  if (await checkBackend()) {
    try {
      const res = await apiFetch(`/admin/users/${userId}/toggle-active`, { method: 'PUT' });
      if (!res.ok) return null;
      return await res.json();
    } catch { /* fallback */ }
  }
  const users = lsGetUsers();
  const idx = users.findIndex(u => u.user_id === userId);
  if (idx === -1) return null;
  users[idx].is_active = !users[idx].is_active;
  users[idx].updated_at = new Date().toISOString();
  lsSetUsers(users);
  return users[idx];
}

export async function apiApproveUser(userId: number): Promise<User | null> {
  if (await checkBackend()) {
    try {
      const res = await apiFetch(`/admin/users/${userId}/approve`, { method: 'PUT' });
      if (!res.ok) return null;
      return await res.json();
    } catch { /* fallback */ }
  }
  const users = lsGetUsers();
  const idx = users.findIndex(u => u.user_id === userId);
  if (idx === -1) return null;
  users[idx].is_approved = true;
  users[idx].updated_at = new Date().toISOString();
  lsSetUsers(users);
  return users[idx];
}

export async function getAdminStats(): Promise<{
  totalDonors: number; ngoPartners: number; pendingApprovals: number;
  activeListings: number; currentlyClaimed: number; mealsRescued: number;
}> {
  if (await checkBackend()) {
    try {
      const res = await apiFetch('/admin/stats');
      return await res.json();
    } catch { /* fallback */ }
  }
  const users = lsGetUsers();
  const foods = lsGetFoods();
  return {
    totalDonors: users.filter(u => u.role === 'donor' && u.is_approved).length,
    ngoPartners: users.filter(u => u.role === 'recipient' && u.is_approved).length,
    pendingApprovals: users.filter(u => !u.is_approved).length,
    activeListings: foods.filter(f => f.status === 'available').length,
    currentlyClaimed: foods.filter(f => f.status === 'requested').length,
    mealsRescued: foods.filter(f => f.status === 'completed').length,
  };
}

export async function apiGetDonations(): Promise<Donation[]> {
  if (await checkBackend()) {
    try {
      const res = await apiFetch('/admin/donations');
      return await res.json();
    } catch { /* fallback */ }
  }
  const foods = lsGetFoods();
  const users = lsGetUsers();
  const donations: Donation[] = [];
  let did = 1;
  foods.filter(f => f.status === 'requested' || f.status === 'completed').forEach(f => {
    const donor = users.find(u => u.user_id === f.donor_id);
    donations.push({
      donation_id: did++, food_id: f.food_id, food_title: f.title,
      donor_name: donor ? donor.org_name || donor.full_name : 'Unknown',
      recipient_name: 'Assigned NGO', quantity: f.quantity,
      status: f.status as 'requested' | 'completed', created_at: f.created_at,
    });
  });
  return donations;
}

export async function apiGetPendingUsers(): Promise<User[]> {
  if (await checkBackend()) {
    try {
      const res = await apiFetch('/admin/pending');
      return await res.json();
    } catch { /* fallback */ }
  }
  return lsGetUsers().filter(u => !u.is_approved);
}

// ---- CLAIMS FUNCTIONS ----

export async function apiClaimFood(foodId: number, recipientId: number): Promise<Claim | null> {
  if (await checkBackend()) {
    try {
      const res = await apiFetch('/claims', { method: 'POST', body: JSON.stringify({ food_id: foodId, recipient_id: recipientId }) });
      if (!res.ok) return null;
      return await res.json();
    } catch { /* fallback */ }
  }
  const foods = lsGetFoods();
  const idx = foods.findIndex(f => f.food_id === foodId);
  if (idx === -1 || foods[idx].status !== 'available') return null;
  foods[idx].status = 'requested';
  lsSetFoods(foods);
  const claims = lsGetClaims();
  const newClaim: Claim = { claim_id: lsNextClaimId(), food_id: foodId, recipient_id: recipientId, status: 'reserved', claimed_at: new Date().toISOString() };
  claims.push(newClaim);
  lsSetClaims(claims);
  return newClaim;
}

export async function apiGetUserClaims(recipientId: number): Promise<(Claim & { food?: FoodListing; donor_name?: string })[]> {
  if (await checkBackend()) {
    try {
      const res = await apiFetch(`/users/${recipientId}/claims`);
      return await res.json();
    } catch { /* fallback */ }
  }
  const claims = lsGetClaims();
  const foods = lsGetFoods();
  const users = lsGetUsers();
  return claims
    .filter(c => c.recipient_id === recipientId)
    .map(c => {
      const food = foods.find(f => f.food_id === c.food_id);
      const donor = food ? users.find(u => u.user_id === food.donor_id) : undefined;
      return { ...c, food: food || undefined, donor_name: donor ? donor.org_name || donor.full_name : 'Unknown' };
    })
    .sort((a, b) => new Date(b.claimed_at).getTime() - new Date(a.claimed_at).getTime());
}

export async function apiMarkClaimCollected(claimId: number): Promise<Claim | null> {
  if (await checkBackend()) {
    try {
      const res = await apiFetch(`/claims/${claimId}/collect`, { method: 'PUT' });
      if (!res.ok) return null;
      return await res.json();
    } catch { /* fallback */ }
  }
  const claims = lsGetClaims();
  const idx = claims.findIndex(c => c.claim_id === claimId);
  if (idx === -1) return null;
  if (claims[idx].status === 'collected') return claims[idx];
  claims[idx].status = 'collected';
  lsSetClaims(claims);
  const foods = lsGetFoods();
  const fIdx = foods.findIndex(f => f.food_id === claims[idx].food_id);
  if (fIdx !== -1) { foods[fIdx].status = 'completed'; lsSetFoods(foods); }
  return claims[idx];
}
