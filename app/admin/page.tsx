import React from 'react';
import Link from 'next/link';
import { getAdminProducts, getAllCategories, getMirrorFitSettings } from '@/lib/products/queries';
import { requireAdminSession } from '@/lib/auth/admin';
import {
  Layers,
  Sparkles,
  Eye,
  FolderTree,
  Settings,
  Plus,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

export default async function AdminOverviewPage() {
  await requireAdminSession();
  const [products, categories, settings] = await Promise.all([
    getAdminProducts(),
    getAllCategories(),
    getMirrorFitSettings(),
  ]);

  const publishedCount = products.filter((p) => p.is_published).length;
  const featuredCount = products.filter((p) => p.is_featured).length;

  return (
    <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="section-heading text-[#1A1816]">
              Boutique Overview
            </h1>
            <p className="body-copy text-[#736C65] mt-1">
              MirrorFit session limit: {settings.preview_seconds} seconds
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/admin/products/new"
              className="button-label flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#7A1F2B] text-white hover:bg-[#5E1721] shadow-md transition-all touch-target"
            >
              <Plus className="w-4 h-4" />
              <span>Add Dress</span>
            </Link>

            <Link
              href="/home"
              target="_blank"
              className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-white border border-[#E8E2D8] text-[#1A1816] hover:bg-[#F4EFEB] text-xs font-semibold shadow-sm transition-all touch-target"
            >
              <Eye className="w-4 h-4 text-[#7A1F2B]" />
              <span>Launch Mirror</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#736C65]" />
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] uppercase font-semibold text-[#736C65] tracking-wider">
                Total Dresses
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] flex items-center justify-center text-[#7A1F2B]">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <p className="font-editorial text-3xl font-bold text-[#1A1816]">{products.length}</p>
            <span className="text-[10px] text-emerald-700 font-medium flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" /> Ready for try-on
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] uppercase font-semibold text-[#736C65] tracking-wider">
                Published on MirrorFit
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <p className="font-editorial text-3xl font-bold text-[#1A1816]">{publishedCount}</p>
            <span className="text-[10px] text-[#736C65] mt-1 block">Live on smart mirror</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] uppercase font-semibold text-[#736C65] tracking-wider">
                Featured Styles
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <p className="font-editorial text-3xl font-bold text-[#1A1816]">{featuredCount}</p>
            <span className="text-[10px] text-[#736C65] mt-1 block">Highlighted showcase</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] uppercase font-semibold text-[#736C65] tracking-wider">
                Collections
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] flex items-center justify-center text-[#1A1816]">
                <FolderTree className="w-4 h-4" />
              </div>
            </div>
            <p className="font-editorial text-3xl font-bold text-[#1A1816]">{categories.length}</p>
            <span className="text-[10px] text-[#736C65] mt-1 block">Active categories</span>
          </div>
        </div>

        {/* Quick Links Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/products"
            className="group bg-white p-6 rounded-2xl border border-[#E8E2D8] hover:border-[#7A1F2B] shadow-sm transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] group-hover:bg-[#7A1F2B] group-hover:text-white transition-colors flex items-center justify-center text-[#7A1F2B] mb-3">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-editorial text-base font-bold text-[#1A1816] group-hover:text-[#7A1F2B] transition-colors">
              Manage Dresses
            </h3>
            <p className="text-xs text-[#736C65] mt-1">
              Add dresses, update prices, upload photos, and manage AI try-on prompts.
            </p>
          </Link>

          <Link
            href="/admin/categories"
            className="group bg-white p-6 rounded-2xl border border-[#E8E2D8] hover:border-[#7A1F2B] shadow-sm transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] group-hover:bg-[#7A1F2B] group-hover:text-white transition-colors flex items-center justify-center text-[#7A1F2B] mb-3">
              <FolderTree className="w-5 h-5" />
            </div>
            <h3 className="font-editorial text-base font-bold text-[#1A1816] group-hover:text-[#7A1F2B] transition-colors">
              Categories
            </h3>
            <p className="text-xs text-[#736C65] mt-1">
              Organize dresses, sarees, kurtis, and shirts into clear audience collections.
            </p>
          </Link>

          <Link
            href="/admin/settings"
            className="group bg-white p-6 rounded-2xl border border-[#E8E2D8] hover:border-[#7A1F2B] shadow-sm transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] group-hover:bg-[#7A1F2B] group-hover:text-white transition-colors flex items-center justify-center text-[#7A1F2B] mb-3">
              <Settings className="w-5 h-5" />
            </div>
            <h3 className="font-editorial text-base font-bold text-[#1A1816] group-hover:text-[#7A1F2B] transition-colors">
              MirrorFit Settings
            </h3>
            <p className="text-xs text-[#736C65] mt-1">
              Configure the fitting duration and customer recording options.
            </p>
          </Link>
        </div>
    </div>
  );
}
