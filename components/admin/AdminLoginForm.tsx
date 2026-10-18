'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Crown, Eye, EyeOff, LoaderCircle, LockKeyhole, UserRound } from 'lucide-react';

export function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(result.error || 'Unable to sign in. Please try again.');
        return;
      }

      router.replace('/admin');
      router.refresh();
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF8F5] px-4 py-8 text-[#1A1816]">
      <section className="w-full max-w-sm rounded-2xl border border-[#E8E2D8] bg-white p-6 shadow-lg shadow-[#1A1816]/5">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#7A1F2B] text-white shadow-sm">
            <Crown className="h-5 w-5 text-[#C5A880]" aria-hidden="true" />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#7A1F2B]">
            MirrorFit
          </p>
          <h1 className="mt-1 font-editorial text-2xl font-semibold">Admin sign in</h1>
          <p className="mt-1 text-sm text-[#736C65]">
            Manage your MirrorFit dresses and categories.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="mb-1.5 block text-sm font-medium">
              Username
            </label>
            <div className="relative">
              <UserRound
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B8178]"
                aria-hidden="true"
              />
              <input
                autoComplete="username"
                className="w-full rounded-lg border border-[#E8E2D8] bg-[#FAF8F5] py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#7A1F2B] focus:ring-2 focus:ring-[#7A1F2B]/15"
                disabled={isSubmitting}
                id="username"
                name="username"
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter your username"
                required
                value={username}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <LockKeyhole
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B8178]"
                aria-hidden="true"
              />
              <input
                autoComplete="current-password"
                className="w-full rounded-lg border border-[#E8E2D8] bg-[#FAF8F5] py-2.5 pl-10 pr-12 text-sm outline-none transition focus:border-[#7A1F2B] focus:ring-2 focus:ring-[#7A1F2B]/15"
                disabled={isSubmitting}
                id="password"
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
              />
              <button
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#736C65] hover:text-[#1A1816] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7A1F2B]"
                onClick={() => setShowPassword((visible) => !visible)}
                type="button"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#7A1F2B] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5E1721] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A1F2B] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {isSubmitting ? 'Signing in…' : 'Sign in to admin'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-[#8B8178]">
          Authorized admin access only
        </p>
      </section>
    </main>
  );
}
