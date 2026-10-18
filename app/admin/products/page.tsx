import React from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { ProductTable } from '@/components/admin/ProductTable';
import { getAdminProducts, getAllCategories } from '@/lib/products/queries';
import { requireAdminSession } from '@/lib/auth/admin';

export const revalidate = 0;

export default async function AdminProductsPage() {
  await requireAdminSession();
  const [products, categories] = await Promise.all([
    getAdminProducts(),
    getAllCategories(),
  ]);

  return (
    <AdminShell>
      <ProductTable initialProducts={products} categories={categories} />
    </AdminShell>
  );
}
