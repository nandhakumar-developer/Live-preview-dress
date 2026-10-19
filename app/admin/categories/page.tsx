import React from 'react';
import { CategoryManager } from '@/components/admin/CategoryManager';
import { getAllCategories } from '@/lib/products/queries';
import { requireAdminSession } from '@/lib/auth/admin';

export default async function AdminCategoriesPage() {
  await requireAdminSession();
  const categories = await getAllCategories();

  return (
    <CategoryManager initialCategories={categories} />
  );
}
