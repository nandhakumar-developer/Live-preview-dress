import React from 'react';
import { ProductForm } from '@/components/admin/ProductForm';
import { getAllCategories } from '@/lib/products/queries';
import { requireAdminSession } from '@/lib/auth/admin';

export default async function NewProductPage() {
  await requireAdminSession();
  const categories = await getAllCategories();

  return (
    <ProductForm categories={categories} />
  );
}
