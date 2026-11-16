export type UserRole = 'BUYER' | 'SELLER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  bio?: string;
  is_verified: boolean;
  rating_avg: number;
  rating_count: number;
  created_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  title: string;
  street_address?: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  is_default: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  is_active: boolean;
  display_order: number;
}

export type ProductCondition = 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'NEEDS_REPAIR';
export type ListingStatus = 'DRAFT' | 'ACTIVE' | 'RESERVED' | 'SOLD' | 'REMOVED';

export interface ListingImage {
  id: string;
  image_url: string;
  public_id?: string;
  is_primary: boolean;
  display_order: number;
}

export interface Listing {
  id: string;
  seller_id: string;
  category_id: string;
  title: string;
  description: string;
  price: number;
  original_price?: number;
  condition: ProductCondition;
  status: ListingStatus;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  views_count: number;
  created_at: string;
  updated_at?: string;
  category_name?: string;
  category_slug?: string;
  seller_name?: string;
  seller_avatar?: string;
  seller_rating_avg?: number;
  seller_rating_count?: number;
  images: ListingImage[];
  distance_km?: number;
  is_wishlisted?: boolean;
}

export interface LocationState {
  locality: string;
  city: string;
  state: string;
  pincode?: string;
  latitude: number;
  longitude: number;
  isCustom: boolean;
  radiusKm: number;
}

export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED' | 'EXPIRED' | 'WITHDRAWN';

export interface Offer {
  id: string;
  conversation_id?: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  status: OfferStatus;
  counter_amount?: number;
  message?: string;
  created_at: string;
  updated_at: string;
  listing_title?: string;
  listing_price?: number;
  listing_image?: string;
  buyer_name?: string;
  seller_name?: string;
}

export type TransactionType = 'ONLINE' | 'OFFLINE';
export type OrderStatus =
  | 'PENDING'
  | 'PAYMENT_CONFIRMED'
  | 'MEETUP_SCHEDULED'
  | 'MEETUP_CONFIRMED_BUYER'
  | 'MEETUP_CONFIRMED_SELLER'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Order {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  offer_id?: string;
  amount: number;
  transaction_type: TransactionType;
  status: OrderStatus;
  meetup_location?: string;
  meetup_time?: string;
  meetup_notes?: string;
  buyer_confirmed: boolean;
  seller_confirmed: boolean;
  created_at: string;
  updated_at: string;
  listing_title?: string;
  listing_image?: string;
  buyer_name?: string;
  seller_name?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  sender_name?: string;
  sender_avatar?: string;
}

export interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  last_message_at: string;
  created_at: string;
  listing_title: string;
  listing_price: number;
  listing_status: ListingStatus;
  listing_image?: string;
  other_user_id: string;
  other_user_name: string;
  other_user_avatar?: string;
  last_message?: string;
  unread_count: number;
}

