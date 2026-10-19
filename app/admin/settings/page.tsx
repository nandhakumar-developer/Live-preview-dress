import React from 'react';
import { SettingsForm } from '@/components/admin/SettingsForm';
import { getMirrorFitSettings } from '@/lib/products/queries';
import { requireAdminSession } from '@/lib/auth/admin';

export default async function AdminSettingsPage() {
  await requireAdminSession();
  const settings = await getMirrorFitSettings();

  return (
    <SettingsForm initialSettings={settings} />
  );
}
