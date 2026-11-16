export type UserRole = 'BUYER' | 'SELLER' | 'ADMIN';

export interface UserEntity {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  bio?: string;
  is_verified: boolean;
  is_suspended: boolean;
  rating_avg: number;
  rating_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface SanitizedUser {
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
  created_at: Date;
}

