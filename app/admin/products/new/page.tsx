import React from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { ProductForm } from '@/components/admin/ProductForm';
import { getAllCategories } from '@/lib/products/queries';
import { requireAdminSession } from '@/lib/auth/admin';

export const revalidate = 0;

export default async function NewProductPage() {
  await requireAdminSession();
  const categories = await getAllCategories();

  return (
    <AdminShell>
      <ProductForm categories={categories} />
    </AdminShell>
  );
}
