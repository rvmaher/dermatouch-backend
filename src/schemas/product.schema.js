import { z } from 'zod';

export const createProductSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  image: z.string().url().optional(),
  sku: z.string().optional(),
  stock: z.number().int().min(0, 'Stock cannot be negative').default(0),
  categoryId: z.number().int().positive('Valid category ID required'),
  isActive: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  search: z.string().optional(),
  categoryId: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  sortBy: z.enum(['title', 'price', 'createdAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});