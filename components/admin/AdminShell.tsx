'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Layers,
  Settings,
  Eye,
  FolderTree,
  Crown,
  LogOut,
} from 'lucide-react';

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dresses', href: '/admin/products', icon: Layers },
    { label: 'Category', href: '/admin/categories', icon: FolderTree },
    { label: 'MirrorFit Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1816] flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-[#E8E2D8] flex flex-col justify-between p-6">
        <div>
          {/* Logo */}
          <div className="flex items-center space-x-3 pb-6 border-b border-[#E8E2D8] mb-6">
            <div className="w-9 h-9 rounded-xl bg-[#7A1F2B] text-white flex items-center justify-center shadow-sm">
              <Crown className="w-4 h-4 text-[#C5A880]" />
            </div>
            <div>
              <span className="font-editorial text-lg font-bold text-[#1A1816] tracking-tight block">
                MirrorFit
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#736C65] font-semibold">
                Admin Console
              </span>
            </div>
          </div>

          {/* Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch
                  className={`navigation-label flex items-center space-x-3 px-4 py-2.5 rounded-xl tracking-wide transition-colors ${
                    isActive
                      ? 'bg-[#7A1F2B] text-white shadow-sm'
                      : 'text-[#736C65] hover:text-[#1A1816] hover:bg-[#F4EFEB]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="pt-6 border-t border-[#E8E2D8] space-y-2 mt-6">
          <Link
            href="/home"
            target="_blank"
            className="flex items-center space-x-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#1A1816] hover:bg-[#F4EFEB] transition-colors"
          >
            <Eye className="w-4 h-4 text-[#7A1F2B]" />
            <span>Launch MirrorFit</span>
          </Link>
          <form action="/api/admin/logout" method="post">
            <button
              type="submit"
              className="flex w-full items-center space-x-2.5 rounded-xl px-4 py-2.5 text-left text-xs font-semibold text-[#736C65] transition-colors hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
