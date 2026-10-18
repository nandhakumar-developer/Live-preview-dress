import { z } from 'zod';

const uuidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  sku: z.string().optional().nullable(),
  category_id: z
    .string()
    .regex(uuidPattern, 'Please select a valid category')
    .optional()
    .nullable()
    .or(z.literal(''))
    .transform((val) => (val && val.trim() ? val.trim() : null)),
  description: z.string().optional().nullable(),
  price: z.coerce.number().min(0, 'Price must be a positive number').optional().nullable(),
  currency: z.string().default('INR'),
  garment_type: z.string().min(2, 'Garment type is required (e.g., dress, saree, shirt)'),
  color: z.string().optional().nullable(),
  image_path: z.string().min(1, 'Product image is required'),
  thumbnail_path: z.string().optional().nullable(),
  try_on_prompt: z.string().optional().nullable(),
  is_published: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  sort_order: z.coerce.number().int().default(0),
});

export type ProductInput = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  audience: z.enum(['women', 'men', 'kids', 'unisex']).default('unisex'),
  sort_order: z.coerce.number().int().default(0),
  is_active: z.boolean().default(true),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export const mirrorFitSettingsSchema = z.object({
  preview_seconds: z.coerce.number().int().min(10).max(120).default(30),
  recording_enabled: z.boolean().default(true),
});

export type MirrorFitSettingsInput = z.infer<typeof mirrorFitSettingsSchema>;
