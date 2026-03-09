export interface User {
  user_id: number;
  full_name: string;
  email: string;
  password: string;
  phone: string | null;
  role: 'admin' | 'donor' | 'recipient';
  org_name: string;
  address: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  is_approved: boolean;
  is_active: boolean;
  profile_pic: string | null;
  created_at: string;
  updated_at: string;
}

export interface FoodListing {
  food_id: number;
  title: string;
  description: string;
  quantity: string;
  food_type: string;
  pickup_address: string;
  city: string;
  expiry_time: string;
  donor_id: number;
  donor_name?: string;
  donor_org?: string;
  status: 'available' | 'requested' | 'completed';
  created_at: string;
}

export interface Donation {
  donation_id: number;
  food_id: number;
  food_title: string;
  donor_name: string;
  recipient_name: string;
  quantity: string;
  status: 'requested' | 'completed';
  created_at: string;
}

export interface Claim {
  claim_id: number;
  food_id: number;
  recipient_id: number;
  status: 'reserved' | 'collected';
  claimed_at: string;
}

export type Page = 'home' | 'browse' | 'my-listings' | 'post-food' | 'admin' | 'my-claims';
