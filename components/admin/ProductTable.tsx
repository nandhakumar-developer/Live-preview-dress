'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Category, Product } from '@/types/database';
import { DeleteProductDialog } from './DeleteProductDialog';
import { toggleProductPublishAction, toggleProductFeaturedAction } from '@/lib/products/mutations';
import {
  Search,
  Plus,
  Edit,
  Eye,
  EyeOff,
  Star,
  Layers,
} from 'lucide-react';

interface ProductTableProps {
  initialProducts: Product[];
  categories: Category[];
}

export function ProductTable({ initialProducts, categories }: ProductTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [publishedFilter, setPublishedFilter] = useState<'all' | 'published' | 'draft'>('all');

  const filteredProducts = initialProducts.filter((p) => {
    // Search
    const matchesSearch =
      searchTerm.trim() === '' ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));

    // Category
    const matchesCategory =
      selectedCategory === 'all' || p.category_id === selectedCategory;

    // Published
    const matchesPublished =
      publishedFilter === 'all' ||
      (publishedFilter === 'published' && p.is_published) ||
      (publishedFilter === 'draft' && !p.is_published);

    return matchesSearch && matchesCategory && matchesPublished;
  });

  const handleTogglePublish = async (id: string, current: boolean) => {
    try {
      await toggleProductPublishAction(id, !current);
      router.refresh();
    } catch (err) {
      console.warn('Failed to toggle publish:', err);
    }
  };

  const handleToggleFeatured = async (id: string, current: boolean) => {
    try {
      await toggleProductFeaturedAction(id, !current);
      router.refresh();
    } catch (err) {
      console.warn('Failed to toggle featured:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="section-heading text-[#1A1816]">
            Dresses
          </h1>
          <p className="body-copy text-[#736C65] mt-1">
            Manage dresses, publication status, and featured styles.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="button-label flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#7A1F2B] text-white hover:bg-[#5E1721] shadow-md transition-all self-start md:self-auto touch-target"
        >
          <Plus className="w-4 h-4" />
          <span>Add Dress</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8E2D8] flex flex-col md:flex-row items-center gap-3 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#736C65] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search dresses by name or type..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[#E8E2D8] bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#7A1F2B]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-[#E8E2D8] bg-[#FAF8F5] text-[#1A1816] focus:outline-none focus:ring-2 focus:ring-[#7A1F2B]"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={publishedFilter}
            onChange={(e) => setPublishedFilter(e.target.value as 'all' | 'published' | 'draft')}
            className="px-3 py-2 text-xs rounded-xl border border-[#E8E2D8] bg-[#FAF8F5] text-[#1A1816] focus:outline-none focus:ring-2 focus:ring-[#7A1F2B]"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-[#E8E2D8] shadow-sm overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center">
            <Layers className="w-10 h-10 text-[#C5A880] mx-auto mb-3" />
            <h3 className="font-editorial text-lg text-[#1A1816]">No Dresses Found</h3>
            <p className="text-xs text-[#736C65] mt-1">
              Try adjusting your search or add a dress.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#E8E2D8] text-[#736C65] uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Dress</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Featured</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4EFEB]">
                {filteredProducts.map((p) => {
                  const cat = categories.find((c) => c.id === p.category_id);
                  return (
                    <tr key={p.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-12 rounded-lg bg-[#F4EFEB] overflow-hidden flex-shrink-0 border border-[#E8E2D8]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.thumbnail_path || p.image_path}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <span className="font-semibold text-[#1A1816] block">{p.name}</span>
                            <span className="text-[10px] text-[#736C65]">{p.garment_type}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#1A1816] font-medium">{cat?.name || '—'}</td>
                      <td className="py-3 px-4 font-semibold text-[#1A1816]">
                        {p.price
                          ? new Intl.NumberFormat('en-IN', {
                              style: 'currency',
                              currency: p.currency || 'INR',
                              maximumFractionDigits: 0,
                            }).format(p.price)
                          : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(p.id, p.is_published)}
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors ${
                            p.is_published
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                          }`}
                        >
                          {p.is_published ? (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>Published</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>Draft</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(p.id, p.is_featured)}
                          className={`p-1.5 rounded-full transition-colors ${
                            p.is_featured
                              ? 'text-amber-500 hover:bg-amber-50'
                              : 'text-zinc-300 hover:text-amber-500 hover:bg-zinc-100'
                          }`}
                        >
                          <Star className={`w-4 h-4 ${p.is_featured ? 'fill-current' : ''}`} />
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <Link
                            href={`/admin/products/${p.id}`}
                            className="p-1.5 rounded-lg text-[#736C65] hover:text-[#1A1816] hover:bg-[#F4EFEB] transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <DeleteProductDialog
                            productId={p.id}
                            productName={p.name}
                            onSuccess={() => router.refresh()}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
