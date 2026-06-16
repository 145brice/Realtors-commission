export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo_url: string;
  brokerage: string;
  commission_rate: number; // percentage (e.g., 1.5 for 1.5%)
  years_experience: number;
  total_sales: number;
  avg_days_on_market: number;
  rating: number; // 0-5
  review_count: number;
  bio: string;
  specialties: string[]; // e.g., ['Residential', 'Luxury', 'Investment']
  languages: string[];
  license_number: string;
  office_address: string;
  latitude: number;
  longitude: number;
  area_served: string; // e.g., 'Los Angeles, CA'
  city: string;
  state: string;
  zip_codes: string[];
  neighborhoods: string[];
  service_radius_miles: number;
  verified: boolean;
  accepts_referrals: boolean;
  created_at: string;
  updated_at: string;
}

export type AccountRole = 'public' | 'agent' | 'admin';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: AccountRole;
}

export interface AgentClaim {
  id: string;
  user_id: string;
  user_email: string;
  agent_id?: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  name: string;
  email: string;
  phone: string;
  photo_url: string;
  brokerage: string;
  commission_rate: number;
  bio: string;
  specialties: string[];
  languages: string[];
  license_number: string;
  office_address: string;
  area_served: string;
  city: string;
  state: string;
  zip_codes: string[];
  neighborhoods: string[];
  admin_note?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  agent_id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  property_type: string;
  transaction_type: 'buy' | 'sell';
  created_at: string;
}

export interface RecentSale {
  id: string;
  agent_id: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  price: number;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  sold_date: string;
  days_on_market: number;
  image_url: string;
}

export interface SearchFilters {
  commission_min: number;
  commission_max: number;
  min_rating: number;
  min_experience: number;
  specialties: string[];
  languages: string[];
  verified_only: boolean;
  accepts_referrals_only: boolean;
  sort_by: 'commission' | 'rating' | 'experience' | 'sales' | 'days_on_market';
  sort_order: 'asc' | 'desc';
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface SearchLocation {
  query: string;
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  zip?: string;
}

export interface IdxProviderConfig {
  provider: 'mls-grid' | 'trestle' | 'reso-web-api' | 'custom';
  mlsName: string;
  participantBrokerage: string;
  participantBrokerageLicense?: string;
  dataSourceName: string;
  lastSyncedAt?: string;
  refreshIntervalHours: number;
  complianceContactEmail?: string;
}

export interface IdxAttribution {
  mlsName: string;
  listingBrokerName: string;
  listingAgentName?: string;
  listingAgentPhone?: string;
  sourceSystemName?: string;
  listingKey: string;
  listingId: string;
  lastUpdatedAt: string;
  copyrightNotice?: string;
  disclaimer?: string;
}

export interface IdxListing {
  id: string;
  listing_key: string;
  listing_id: string;
  standard_status: 'Active' | 'Active Under Contract' | 'Pending' | 'Closed' | 'Coming Soon';
  property_type: string;
  property_sub_type?: string;
  list_price: number;
  bedrooms_total?: number;
  bathrooms_total_integer?: number;
  living_area?: number;
  lot_size_square_feet?: number;
  unparsed_address: string;
  city: string;
  state_or_province: string;
  postal_code: string;
  latitude?: number;
  longitude?: number;
  public_remarks?: string;
  media_urls: string[];
  attribution: IdxAttribution;
}
