import { NextRequest, NextResponse } from 'next/server';
import { getMirrorFitProducts } from '@/lib/products/queries';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('categoryId') || undefined;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '5', 10);

  const result = await getMirrorFitProducts({
    categoryId,
    page,
    pageSize,
  });

  return NextResponse.json(result);
}
