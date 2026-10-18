import React from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { CategoryManager } from '@/components/admin/CategoryManager';
import { getAllCategories } from '@/lib/products/queries';
import { requireAdminSession } from '@/lib/auth/admin';

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  await requireAdminSession();
  const categories = await getAllCategories();

  return (
    <AdminShell>
      <CategoryManager initialCategories={categories} />
    </AdminShell>
  );
}
