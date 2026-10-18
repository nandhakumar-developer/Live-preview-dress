export interface AdminUser {
  user_id: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  audience: 'women' | 'men' | 'kids' | 'unisex' | string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  sku?: string | null;
  category_id?: string | null;
  description?: string | null;
  price?: number | null;
  currency: string;
  garment_type: string;
  color?: string | null;
  image_path: string;
  thumbnail_path?: string | null;
  try_on_prompt?: string | null;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  category?: Category | null;
}

export interface MirrorFitSettings {
  id: string;
  shop_name: string;
  logo_path?: string | null;
  preview_seconds: number;
  recording_enabled: boolean;
  idle_timeout_seconds: number;
  updated_at: string;
}

export type TryOnState =
  | 'idle'
  | 'requesting-camera'
  | 'camera-ready'
  | 'connecting-ai'
  | 'ai-ready'
  | 'recording'
  | 'stopping'
  | 'ended'
  | 'error';

export interface CameraFraming {
  mirrored: boolean;
  fitMode: 'cover' | 'contain';
  zoom: number;
  locked: boolean;
}
