import { Metadata } from 'next';
import { getActiveCategories, getMirrorFitProducts, getMirrorFitSettings } from '@/lib/products/queries';
import { MirrorFitShell } from '@/components/mirrorfit/MirrorFitShell';

export const metadata: Metadata = {
  title: 'MirrorFit — Virtual Try-On',
  description: 'Explore garments and try them on with MirrorFit.',
};

export const revalidate = 0; // Keep the customer page dynamically rendered.

export default async function HomePage() {
  const [categories, productData, settings] = await Promise.all([
    getActiveCategories(),
    getMirrorFitProducts({ page: 1, pageSize: 5 }),
    getMirrorFitSettings(),
  ]);

  return (
    <MirrorFitShell
      initialCategories={categories}
      initialProducts={productData.products}
      initialSettings={settings}
    />
  );
}
