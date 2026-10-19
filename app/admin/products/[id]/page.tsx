import React from 'react';
import { notFound } from 'next/navigation';
import { ProductForm } from '@/components/admin/ProductForm';
import { getProductById, getAllCategories } from '@/lib/products/queries';
import { requireAdminSession } from '@/lib/auth/admin';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  await requireAdminSession();
  const { id } = await params;

  const [product, categories] = await Promise.all([
    getProductById(id),
    getAllCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <ProductForm categories={categories} initialProduct={product} />
  );
}
