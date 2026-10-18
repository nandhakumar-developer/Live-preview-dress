'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Category } from '@/types/database';
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from '@/lib/products/mutations';
import { Plus, Trash2, Check, X, Loader2, AlertCircle } from 'lucide-react';

interface CategoryManagerProps {
  initialCategories: Category[];
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  // New category state
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newAudience, setNewAudience] = useState<'women' | 'men' | 'kids' | 'unisex'>('women');
  const [newSortOrder, setNewSortOrder] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setNewName(val);
    // Auto-generate slug
    setNewSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setActionError(null);
    setIsSubmitting(true);

    try {
      const res = await createCategoryAction({
        name: newName,
        slug: newSlug,
        audience: newAudience,
        sort_order: parseInt(newSortOrder || '0', 10),
        is_active: true,
      });

      if (res.category) {
        setCategories((prev) => [...prev, res.category as Category]);
      }
      setIsAdding(false);
      setNewName('');
      setNewSlug('');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (cat: Category) => {
    setActionError(null);
    const newActive = !cat.is_active;
    // Optimistic update
    setCategories((prev) =>
      prev.map((c) => (c.id === cat.id ? { ...c, is_active: newActive } : c))
    );

    try {
      await updateCategoryAction(cat.id, {
        name: cat.name,
        slug: cat.slug,
        audience: cat.audience as 'women' | 'men' | 'kids' | 'unisex',
        sort_order: cat.sort_order,
        is_active: newActive,
      });
      router.refresh();
    } catch (err) {
      // Revert on failure
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, is_active: !newActive } : c))
      );
      setActionError(err instanceof Error ? err.message : 'Failed to update category status.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;

    setActionError(null);
    setDeletingId(id);

    try {
      await deleteCategoryAction(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      router.refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete category.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="section-heading text-[#1A1816]">
            Category
          </h1>
          <p className="body-copy text-[#736C65] mt-1">
            Organize dresses by style and audience. Active categories appear as filter tabs in MirrorFit.
          </p>
        </div>

        {!isAdding && (
          <button
            type="button"
            onClick={() => {
              setIsAdding(true);
              setActionError(null);
            }}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#7A1F2B] text-white hover:bg-[#5E1721] text-xs font-semibold shadow-md transition-all self-start md:self-auto touch-target"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        )}
      </div>

      {actionError && (
        <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Add Category Card */}
      {isAdding && (
        <form
          onSubmit={handleCreate}
          className="bg-white p-6 rounded-2xl border border-[#7A1F2B] shadow-md space-y-4 animate-fadeIn"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D8]">
            <h3 className="font-editorial text-base font-bold text-[#1A1816]">
              Create New Category
            </h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-[#736C65] hover:text-[#1A1816]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl">{error}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#1A1816]">
                Name
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Royal Sarees"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E8E2D8] bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#7A1F2B]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#1A1816]">
                Slug (URL Identifier)
              </label>
              <input
                type="text"
                required
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                placeholder="sarees"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E8E2D8] bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#7A1F2B]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#1A1816]">
                Audience
              </label>
              <select
                value={newAudience}
                onChange={(e) => setNewAudience(e.target.value as 'women' | 'men' | 'kids' | 'unisex')}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E8E2D8] bg-[#FAF8F5] text-[#1A1816] focus:outline-none focus:ring-2 focus:ring-[#7A1F2B]"
              >
                <option value="women">Women</option>
                <option value="men">Men</option>
                <option value="kids">Kids</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#1A1816]">
                Sort Order
              </label>
              <input
                type="number"
                value={newSortOrder}
                onChange={(e) => setNewSortOrder(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E8E2D8] bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#7A1F2B]"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-full border border-[#E8E2D8] text-xs font-semibold hover:bg-[#F4EFEB]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-full bg-[#7A1F2B] text-white text-xs font-semibold hover:bg-[#5E1721] flex items-center space-x-1.5 shadow-sm"
            >
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>Save Collection</span>
            </button>
          </div>
        </form>
      )}

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-[#E8E2D8] shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF8F5] border-b border-[#E8E2D8] text-[#736C65] uppercase font-semibold text-[10px] tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Collection</th>
              <th className="py-3.5 px-4">Slug</th>
              <th className="py-3.5 px-4">Audience</th>
              <th className="py-3.5 px-4">Priority</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F4EFEB]">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-[#1A1816]">
                  {cat.name}
                </td>
                <td className="py-3.5 px-4 font-mono text-[#736C65]">{cat.slug}</td>
                <td className="py-3.5 px-4 capitalize text-[#736C65]">{cat.audience}</td>
                <td className="py-3.5 px-4 font-mono text-[#736C65]">{cat.sort_order}</td>
                <td className="py-3.5 px-4">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(cat)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors ${
                      cat.is_active
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    {cat.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    type="button"
                    disabled={deletingId === cat.id}
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                    title="Delete Category"
                  >
                    {deletingId === cat.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
