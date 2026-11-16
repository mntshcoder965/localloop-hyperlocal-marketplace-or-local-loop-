export type ProductCondition = 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'NEEDS_REPAIR';
export type ListingStatus = 'DRAFT' | 'ACTIVE' | 'RESERVED' | 'SOLD' | 'REMOVED';

export interface ListingImageEntity {
  id: string;
  listing_id: string;
  image_url: string;
  public_id?: string;
  is_primary: boolean;
  display_order: number;
}

export interface ListingEntity {
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
  created_at: Date;
  updated_at: Date;
  // Joined fields
  category_name?: string;
  category_slug?: string;
  seller_name?: string;
  seller_avatar?: string;
  seller_rating_avg?: number;
  seller_rating_count?: number;
  images?: ListingImageEntity[];
  distance_km?: number;
  is_wishlisted?: boolean;
}

export interface CreateListingDTO {
  title: string;
  description: string;
  category_id: string;
  price: number;
  original_price?: number;
  condition: ProductCondition;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  images: Array<{ url: string; public_id?: string; is_primary?: boolean }>;
  status?: ListingStatus;
}

export interface UpdateListingDTO {
  title?: string;
  description?: string;
  category_id?: string;
  price?: number;
  original_price?: number;
  condition?: ProductCondition;
  status?: ListingStatus;
  locality?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  images?: Array<{ url: string; public_id?: string; is_primary?: boolean }>;
}

export interface ListingFilterQuery {
  q?: string;
  category?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  lat?: number;
  lon?: number;
  radiusKm?: number;
  pincode?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'nearest';
  page?: number;
  limit?: number;
}

