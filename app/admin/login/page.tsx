import { redirect } from 'next/navigation';
import { AdminLoginForm } from '@/components/admin/AdminLoginForm';
import { isAdminSessionValid } from '@/lib/auth/admin';

export default async function AdminLoginPage() {
  if (await isAdminSessionValid()) {
    redirect('/admin');
  }

  return <AdminLoginForm />;
}
