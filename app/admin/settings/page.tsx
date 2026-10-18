import React from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { SettingsForm } from '@/components/admin/SettingsForm';
import { getMirrorFitSettings } from '@/lib/products/queries';
import { requireAdminSession } from '@/lib/auth/admin';

export const revalidate = 0;

export default async function AdminSettingsPage() {
  await requireAdminSession();
  const settings = await getMirrorFitSettings();

  return (
    <AdminShell>
      <SettingsForm initialSettings={settings} />
    </AdminShell>
  );
}
