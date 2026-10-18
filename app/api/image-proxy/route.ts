import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side image proxy to fetch garment images without CORS issues.
 * Allows the client to get Unsplash / Supabase Storage images as Blobs
 * for passing to the Decart SDK's `image` field.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  // Allow only trusted image hosts
  const allowedHosts = ['images.unsplash.com', 'supabase.co', 'storage.googleapis.com', 'localhost', '127.0.0.1'];
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  const isAllowed = allowedHosts.some((host) => parsedUrl.hostname.endsWith(host));
  if (!isAllowed) {
    return NextResponse.json({ error: 'Host not allowed' }, { status: 403 });
  }

  const imageRes = await fetch(url, {
    headers: { 'User-Agent': 'MirrorFit-VirtualDressingRoom/1.0' },
  });

  if (!imageRes.ok) {
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 502 });
  }

  const contentType = imageRes.headers.get('content-type') || 'image/jpeg';
  const buffer = await imageRes.arrayBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
