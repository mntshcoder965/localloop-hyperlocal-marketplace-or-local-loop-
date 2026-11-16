import { z } from 'zod';

export const createListingSchema = z.object({
  body: z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(200),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    category_id: z.string().uuid('Valid category ID required'),
    price: z.number().positive('Price must be greater than zero'),
    original_price: z.number().positive().optional(),
    condition: z.enum(['LIKE_NEW', 'GOOD', 'FAIR', 'NEEDS_REPAIR']),
    locality: z.string().min(2, 'Locality is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit Indian pincode'),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    images: z.array(z.object({
      url: z.string().url(),
      public_id: z.string().optional(),
      is_primary: z.boolean().optional(),
    })).min(1, 'At least 1 product photo is required').max(6, 'Maximum 6 photos allowed'),
    status: z.enum(['DRAFT', 'ACTIVE']).default('ACTIVE'),
  }),
});

export const updateListingSchema = z.object({
  body: z.object({
    title: z.string().min(5).max(200).optional(),
    description: z.string().min(10).optional(),
    category_id: z.string().uuid().optional(),
    price: z.number().positive().optional(),
    original_price: z.number().positive().optional(),
    condition: z.enum(['LIKE_NEW', 'GOOD', 'FAIR', 'NEEDS_REPAIR']).optional(),
    status: z.enum(['DRAFT', 'ACTIVE', 'RESERVED', 'SOLD', 'REMOVED']).optional(),
    locality: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().regex(/^\d{6}$/).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    images: z.array(z.object({
      url: z.string().url(),
      public_id: z.string().optional(),
      is_primary: z.boolean().optional(),
    })).max(6).optional(),
  }),
});

