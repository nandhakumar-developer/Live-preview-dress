import { createClient } from '@/lib/supabase/server';
import { Category, Product, MirrorFitSettings } from '@/types/database';
import { SAMPLE_CATEGORIES, SAMPLE_PRODUCTS, DEFAULT_MIRRORFIT_SETTINGS } from './sample-data';

/**
 * Fetch active categories for the MirrorFit customer experience
 */
export async function getActiveCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return SAMPLE_CATEGORIES;
    }

    return data as Category[];
  } catch (err) {
    console.warn('Error fetching categories from Supabase, using sample categories:', err);
    return SAMPLE_CATEGORIES;
  }
}

/**
 * Fetch published products for the customer experience (strictly capped to max 5 per page)
 */
export async function getMirrorFitProducts(options?: {
  categoryId?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ products: Product[]; total: number; page: number; totalPages: number }> {
  const page = options?.page || 1;
  const pageSize = options?.pageSize ? Math.min(options.pageSize, 5) : 5; // strictly max 5 cards per requirement
  const categoryId = options?.categoryId;

  try {
    const supabase = await createClient();
    let query = supabase
      .from('products')
      .select('*, category:categories(*)', { count: 'exact' })
      .eq('is_published', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (categoryId && categoryId !== 'all') {
      query = query.eq('category_id', categoryId);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error || !data || data.length === 0) {
      // Fallback to sample dresses
      let filtered = [...SAMPLE_PRODUCTS];
      if (categoryId && categoryId !== 'all') {
        filtered = filtered.filter((p) => p.category_id === categoryId);
      }
      const total = filtered.length;
      const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
      return {
        products: paginated,
        total,
        page,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      };
    }

    const total = count ?? data.length;
    return {
      products: data as Product[],
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  } catch (err) {
    console.warn('Error fetching MirrorFit products, using sample data:', err);
    let filtered = [...SAMPLE_PRODUCTS];
    if (categoryId && categoryId !== 'all') {
      filtered = filtered.filter((p) => p.category_id === categoryId);
    }
    const total = filtered.length;
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
    return {
      products: paginated,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }
}

/**
 * Fetch all products for admin dashboard (supports search, category filter, published filter)
 */
export async function getAdminProducts(filters?: {
  search?: string;
  categoryId?: string;
  published?: boolean;
}): Promise<Product[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from('products')
      .select('*, category:categories(*)')
      .order('created_at', { ascending: false });

    if (filters?.categoryId && filters.categoryId !== 'all') {
      query = query.eq('category_id', filters.categoryId);
    }

    if (filters?.published !== undefined) {
      query = query.eq('is_published', filters.published);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error || !data) {
      return SAMPLE_PRODUCTS;
    }

    return data as Product[];
  } catch (err) {
    console.warn('Error fetching admin products:', err);
    return SAMPLE_PRODUCTS;
  }
}

/**
 * Fetch single product by ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      const found = SAMPLE_PRODUCTS.find((p) => p.id === id);
      return found || null;
    }

    return data as Product;
  } catch (err) {
    console.warn('Error fetching product by ID:', err);
    return SAMPLE_PRODUCTS.find((p) => p.id === id) || null;
  }
}

/**
 * Fetch all categories for admin (including inactive)
 */
export async function getAllCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return SAMPLE_CATEGORIES;
    }

    return data as Category[];
  } catch (err) {
    console.warn('Error fetching all categories:', err);
    return SAMPLE_CATEGORIES;
  }
}

/**
 * Fetch MirrorFit settings
 */
export async function getMirrorFitSettings(): Promise<MirrorFitSettings> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('mirrorfit_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return DEFAULT_MIRRORFIT_SETTINGS;
    }

    return data as MirrorFitSettings;
  } catch {
    return DEFAULT_MIRRORFIT_SETTINGS;
  }
}
