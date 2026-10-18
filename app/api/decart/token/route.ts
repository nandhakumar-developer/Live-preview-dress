import { NextResponse } from 'next/server';
import { getDecartClientSession } from '@/lib/decart/server';

/**
 * POST /api/decart/token
 * Server-side endpoint that mints a short-lived Decart client token.
 * Returns { isConfigured, apiKey } — the ephemeral apiKey is safe to expose to the browser.
 * The permanent DECART_API_KEY never leaves the server.
 */
export async function POST() {
  const result = await getDecartClientSession();
  return NextResponse.json(result);
}

export async function GET() {
  const result = await getDecartClientSession();
  return NextResponse.json(result);
}
