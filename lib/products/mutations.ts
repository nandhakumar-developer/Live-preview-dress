'use server';

import { createClient } from '@/lib/supabase/server';
import { productSchema, categorySchema, mirrorFitSettingsSchema, CategoryInput, MirrorFitSettingsInput } from './schemas';
import { revalidatePath } from 'next/cache';
import { requireAdminSession } from '@/lib/auth/admin';

/**
 * Server action to create a product (Admin only)
 */
export async function createProductAction(formData: FormData) {
  await requireAdminSession();
  const supabase = await createClient();

  const rawCategoryId = formData.get('category_id');
  const categoryId = rawCategoryId && String(rawCategoryId).trim() !== '' ? String(rawCategoryId).trim() : null;

  const rawData: Record<string, unknown> = {
    name: formData.get('name'),
    sku: formData.get('sku') || null,
    category_id: categoryId,
    description: formData.get('description') || null,
    price: formData.get('price') ? Number(formData.get('price')) : null,
    currency: formData.get('currency') || 'INR',
    garment_type: formData.get('garment_type'),
    color: formData.get('color') || null,
    image_path: formData.get('image_path'),
    thumbnail_path: formData.get('thumbnail_path') || null,
    try_on_prompt: formData.get('try_on_prompt') || null,
    is_published: formData.get('is_published') === 'true' || formData.get('is_published') === 'on',
    is_featured: formData.get('is_featured') === 'true' || formData.get('is_featured') === 'on',
    sort_order: formData.get('sort_order') ? Number(formData.get('sort_order')) : 0,
  };

  const parsed = productSchema.safeParse(rawData);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join('. ');
    throw new Error(errorMsg);
  }
  const validated = parsed.data;

  const { data, error } = await supabase
    .from('products')
    .insert([validated])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create product: ${error.message}`);
  }

  revalidatePath('/admin/products');
  revalidatePath('/home');
  return { success: true, product: data };
}

/**
 * Server action to update a product (Admin only)
 */
export async function updateProductAction(id: string, formData: FormData) {
  await requireAdminSession();
  const supabase = await createClient();

  const rawCategoryId = formData.get('category_id');
  const categoryId = rawCategoryId && String(rawCategoryId).trim() !== '' ? String(rawCategoryId).trim() : null;

  const rawData: Record<string, unknown> = {
    name: formData.get('name'),
    sku: formData.get('sku') || null,
    category_id: categoryId,
    description: formData.get('description') || null,
    price: formData.get('price') ? Number(formData.get('price')) : null,
    currency: formData.get('currency') || 'INR',
    garment_type: formData.get('garment_type'),
    color: formData.get('color') || null,
    image_path: formData.get('image_path'),
    thumbnail_path: formData.get('thumbnail_path') || null,
    try_on_prompt: formData.get('try_on_prompt') || null,
    is_published: formData.get('is_published') === 'true' || formData.get('is_published') === 'on',
    is_featured: formData.get('is_featured') === 'true' || formData.get('is_featured') === 'on',
    sort_order: formData.get('sort_order') ? Number(formData.get('sort_order')) : 0,
  };

  const parsed = productSchema.safeParse(rawData);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join('. ');
    throw new Error(errorMsg);
  }
  const validated = parsed.data;

  const { data, error } = await supabase
    .from('products')
    .update(validated)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update product: ${error.message}`);
  }

  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${id}`);
  revalidatePath('/home');
  return { success: true, product: data };
}

/**
 * Server action to delete a product and clean up storage (Admin only)
 */
export async function deleteProductAction(id: string) {
  await requireAdminSession();
  const supabase = await createClient();

  // First get current product to find storage path
  const { data: product } = await supabase
    .from('products')
    .select('image_path')
    .eq('id', id)
    .maybeSingle();

  const { error } = await supabase.from('products').delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete product: ${error.message}`);
  }

  // If image was in Supabase storage, remove it safely
  if (product?.image_path && product.image_path.startsWith('products/')) {
    try {
      await supabase.storage.from('garment-images').remove([product.image_path]);
    } catch (cleanupErr) {
      console.warn('Storage cleanup warning after product delete:', cleanupErr);
    }
  }

  revalidatePath('/admin/products');
  revalidatePath('/home');
  return { success: true };
}

/**
 * Quick toggle publish state
 */
export async function toggleProductPublishAction(id: string, is_published: boolean) {
  await requireAdminSession();
  const supabase = await createClient();

  const { error } = await supabase
    .from('products')
    .update({ is_published })
    .eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath('/admin/products');
  revalidatePath('/home');
  return { success: true };
}

/**
 * Quick toggle featured state
 */
export async function toggleProductFeaturedAction(id: string, is_featured: boolean) {
  await requireAdminSession();
  const supabase = await createClient();

  const { error } = await supabase
    .from('products')
    .update({ is_featured })
    .eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath('/admin/products');
  revalidatePath('/home');
  return { success: true };
}

/**
 * Upload an image file to Supabase Storage bucket `garment-images` (Admin only)
 */
export async function uploadGarmentImageAction(formData: FormData) {
  await requireAdminSession();
  const supabase = await createClient();

  const file = formData.get('file') as File;
  if (!file) throw new Error('No file provided');

  // Validate size (8MB max)
  const maxBytes = 8 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error('Image size must be less than 8MB');
  }

  // Validate MIME type
  const allowedMime = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedMime.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`;
  const path = `products/uploads/${uniqueName}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await supabase.storage
    .from('garment-images')
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from('garment-images')
    .getPublicUrl(path);

  return {
    success: true,
    storagePath: path,
    publicUrl: publicUrlData.publicUrl,
  };
}

/**
 * Category Mutations (Admin only)
 */
export async function createCategoryAction(input: CategoryInput) {
  await requireAdminSession();
  const supabase = await createClient();
  const validated = categorySchema.parse(input);

  const { data, error } = await supabase
    .from('categories')
    .insert([validated])
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/admin/categories');
  revalidatePath('/home');
  return { success: true, category: data };
}

export async function updateCategoryAction(id: string, input: CategoryInput) {
  await requireAdminSession();
  const supabase = await createClient();
  const validated = categorySchema.parse(input);

  const { data, error } = await supabase
    .from('categories')
    .update(validated)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/admin/categories');
  revalidatePath('/home');
  return { success: true, category: data };
}

export async function deleteCategoryAction(id: string) {
  await requireAdminSession();
  const supabase = await createClient();

  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/categories');
  revalidatePath('/home');
  return { success: true };
}

/**
 * MirrorFit settings mutation (Admin only)
 */
export async function updateMirrorFitSettingsAction(input: MirrorFitSettingsInput) {
  await requireAdminSession();
  const supabase = await createClient();
  const validated = mirrorFitSettingsSchema.parse(input);

  // Update single row
  const { data: existing, error: lookupError } = await supabase
    .from('mirrorfit_settings')
    .select('id')
    .limit(1)
    .maybeSingle();

  if (lookupError) throw new Error(`Failed to load MirrorFit settings: ${lookupError.message}`);

  let error;
  if (existing?.id) {
    const res = await supabase.from('mirrorfit_settings').update(validated).eq('id', existing.id);
    error = res.error;
  } else {
    const res = await supabase.from('mirrorfit_settings').insert([validated]);
    error = res.error;
  }

  if (error) throw new Error(error.message);

  revalidatePath('/admin/settings');
  revalidatePath('/home');
  return { success: true };
}
