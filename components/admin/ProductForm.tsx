'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Category, Product } from '@/types/database';
import { ImageUploader } from './ImageUploader';
import { createProductAction, updateProductAction } from '@/lib/products/mutations';
import { Sparkles, Save, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface ProductFormProps {
  categories: Category[];
  initialProduct?: Product | null;
}

export function ProductForm({ categories, initialProduct }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!initialProduct;

  const [name, setName] = useState(initialProduct?.name || '');
  const [sku] = useState(initialProduct?.sku || '');
  const [categoryId, setCategoryId] = useState(initialProduct?.category_id || categories[0]?.id || '');
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [price, setPrice] = useState(initialProduct?.price?.toString() || '');
  const [currency] = useState(initialProduct?.currency || 'INR');
  const [garmentType, setGarmentType] = useState(initialProduct?.garment_type || 'shirt');
  const [color] = useState(initialProduct?.color || '');
  const [imagePath, setImagePath] = useState(initialProduct?.image_path || '');
  const [tryOnPrompt, setTryOnPrompt] = useState(initialProduct?.try_on_prompt || '');
  const [isPublished, setIsPublished] = useState(initialProduct?.is_published ?? true);
  const [isFeatured, setIsFeatured] = useState(initialProduct?.is_featured ?? false);
  const [sortOrder, setSortOrder] = useState(initialProduct?.sort_order?.toString() || '0');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing) {
      if (/polo/i.test(val)) setGarmentType('polo');
      else if (/shirt|tee|t-shirt/i.test(val)) setGarmentType('shirt');
      else if (/blazer|suit|jacket/i.test(val)) setGarmentType('blazer');
      else if (/saree/i.test(val)) setGarmentType('saree');
      else if (/kurti|kurta/i.test(val)) setGarmentType('kurti');
      else if (/dress|gown/i.test(val)) setGarmentType('dress');
    }
  };

  const handleCategoryChange = (val: string) => {
    setCategoryId(val);
    const cat = categories.find((c) => c.id === val);
    if (cat && !isEditing) {
      if (cat.slug === 'shirts' || cat.audience === 'men') {
        setGarmentType('shirt');
      } else if (cat.slug === 'sarees') {
        setGarmentType('saree');
      } else if (cat.slug === 'kurtis') {
        setGarmentType('kurti');
      } else if (cat.slug === 'dresses') {
        setGarmentType('dress');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Product name is required.');
      return;
    }

    if (!imagePath.trim()) {
      setError('Please upload a dress image.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('sku', sku);
      formData.append('category_id', categoryId);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('currency', currency);
      formData.append('garment_type', garmentType);
      formData.append('color', color);
      formData.append('image_path', imagePath);
      formData.append('try_on_prompt', tryOnPrompt);
      formData.append('is_published', isPublished.toString());
      formData.append('is_featured', isFeatured.toString());
      formData.append('sort_order', sortOrder);

      if (isEditing && initialProduct?.id) {
        await updateProductAction(initialProduct.id, formData);
      } else {
        await createProductAction(formData);
      }

      router.push('/admin/products');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 md:p-8 rounded-3xl border border-[#E8E2D8] shadow-sm">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-6 border-b border-[#E8E2D8]">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-full border border-[#E8E2D8] text-[#736C65] hover:text-[#1A1816] hover:bg-[#F4EFEB] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h2 className="section-heading text-[#1A1816]">
            {isEditing ? 'Edit Dress' : 'Create New Dress'}
          </h2>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="button-label flex items-center space-x-2 px-6 py-2.5 rounded-full bg-[#7A1F2B] text-white hover:bg-[#5E1721] shadow-md transition-all disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isSubmitting ? 'Saving...' : isEditing ? 'Update Dress' : 'Publish Dress'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Grid Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#1A1816]">
            Dress Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            placeholder="e.g. Crimson Polo Shirt"
            className="w-full px-4 py-3 rounded-xl border border-[#E8E2D8] bg-[#FAF8F5] text-sm text-[#1A1816] focus:outline-none focus:ring-2 focus:ring-[#7A1F2B]"
          />
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#1A1816]">
            Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[#E8E2D8] bg-[#FAF8F5] text-sm text-[#1A1816] focus:outline-none focus:ring-2 focus:ring-[#7A1F2B]"
          >
            {categories.length === 0 && (
              <option value="">No categories available</option>
            )}
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.audience})
              </option>
            ))}
          </select>
        </div>

        {/* Garment Type */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#1A1816]">
              Dress Type <span className="text-red-500">*</span>
            </label>
            <span className="text-[10px] text-[#736C65]">Tap preset or type</span>
          </div>
          <input
            type="text"
            value={garmentType}
            onChange={(e) => setGarmentType(e.target.value)}
            required
            placeholder="shirt, polo, t-shirt, dress, saree, kurti, blazer..."
            className="w-full px-4 py-2.5 rounded-xl border border-[#E8E2D8] bg-[#FAF8F5] text-sm text-[#1A1816] focus:outline-none focus:ring-2 focus:ring-[#7A1F2B]"
          />
          <div className="flex flex-wrap gap-1.5 pt-1">
            {['shirt', 'polo', 't-shirt', 'blazer', 'dress', 'saree', 'kurti'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setGarmentType(t)}
                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-semibold transition-all ${
                  garmentType.toLowerCase() === t
                    ? 'bg-[#7A1F2B] text-white shadow-sm'
                    : 'bg-[#F4EFEB] text-[#736C65] hover:bg-[#E8E2D8]'
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Price */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#1A1816]">
            Price ({currency})
          </label>
          <input
            type="number"
            step="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 2500"
            className="w-full px-4 py-3 rounded-xl border border-[#E8E2D8] bg-[#FAF8F5] text-sm text-[#1A1816] focus:outline-none focus:ring-2 focus:ring-[#7A1F2B]"
          />
        </div>

        {/* Sort Order */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#1A1816]">
            Display Priority
          </label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[#E8E2D8] bg-[#FAF8F5] text-sm text-[#1A1816] focus:outline-none focus:ring-2 focus:ring-[#7A1F2B]"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#1A1816]">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description of tailoring, fabric, and styling..."
            className="w-full px-4 py-3 rounded-xl border border-[#E8E2D8] bg-[#FAF8F5] text-sm text-[#1A1816] focus:outline-none focus:ring-2 focus:ring-[#7A1F2B]"
          />
        </div>

        {/* AI Try-on Prompt */}
        <div className="space-y-1.5 md:col-span-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#1A1816] flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Decart AI Try-On Prompt (Optional)</span>
            </label>
            <span className="text-[10px] text-[#736C65]">
              Leave blank to automatically compose a prompt for this dress
            </span>
          </div>
          <input
            type="text"
            value={tryOnPrompt}
            onChange={(e) => setTryOnPrompt(e.target.value)}
            placeholder="e.g. Crisp tailored polo shirt with collar and short sleeves, realistic fit..."
            className="w-full px-4 py-3 rounded-xl border border-[#E8E2D8] bg-[#FAF8F5] text-sm text-[#1A1816] focus:outline-none focus:ring-2 focus:ring-[#7A1F2B]"
          />
        </div>

        {/* Image Upload Component */}
        <div className="md:col-span-2">
          <ImageUploader
            initialImageUrl={imagePath}
            onImageUploaded={(url) => setImagePath(url)}
          />
        </div>

        {/* Toggles */}
        <div className="flex items-center space-x-6 pt-2 md:col-span-2">
          <label className="flex items-center space-x-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 rounded text-[#7A1F2B] focus:ring-[#7A1F2B]"
            />
            <span className="text-xs font-semibold text-[#1A1816]">
              Published on MirrorFit
            </span>
          </label>

          <label className="flex items-center space-x-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 rounded text-[#7A1F2B] focus:ring-[#7A1F2B]"
            />
            <span className="text-xs font-semibold text-[#1A1816]">
              Featured Collection
            </span>
          </label>
        </div>
      </div>
    </form>
  );
}
