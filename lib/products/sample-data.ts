import { Category, Product, MirrorFitSettings } from '@/types/database';

export const SAMPLE_CATEGORIES: Category[] = [
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    name: 'Evening Dresses',
    slug: 'dresses',
    audience: 'women',
    sort_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    name: 'Heritage Sarees',
    slug: 'sarees',
    audience: 'women',
    sort_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    name: 'Artisan Kurtis',
    slug: 'kurtis',
    audience: 'women',
    sort_order: 3,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c4444444-4444-4444-4444-444444444444',
    name: 'Bespoke Shirts',
    slug: 'shirts',
    audience: 'men',
    sort_order: 4,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const SAMPLE_PRODUCTS: Product[] = [
];

export const DEFAULT_MIRRORFIT_SETTINGS: MirrorFitSettings = {
  id: '00000000-0000-0000-0000-000000000001',
  shop_name: 'MirrorFit',
  logo_path: null,
  preview_seconds: 30,
  recording_enabled: true,
  idle_timeout_seconds: 60,
  updated_at: new Date().toISOString(),
};
