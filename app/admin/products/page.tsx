import React from 'react';
import { ProductTable } from '@/components/admin/ProductTable';
import { getAdminProducts, getAllCategories } from '@/lib/products/queries';
import { requireAdminSession } from '@/lib/auth/admin';

export default async function AdminProductsPage() {
  await requireAdminSession();
  const [products, categories] = await Promise.all([
    getAdminProducts(),
    getAllCategories(),
  ]);

  return (
    <ProductTable initialProducts={products} categories={categories} />
  );
}
