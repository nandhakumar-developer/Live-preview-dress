-- Public admin access: anyone with the project URL and publishable key can manage these resources.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'garment-images',
    'garment-images',
    true,
    8388608,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Anyone can view active categories" ON public.categories;
DROP POLICY IF EXISTS "Admins have full access to categories" ON public.categories;
DROP POLICY IF EXISTS "Public can manage categories" ON public.categories;
CREATE POLICY "Public can manage categories"
    ON public.categories FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view published products" ON public.products;
DROP POLICY IF EXISTS "Admins have full access to products" ON public.products;
DROP POLICY IF EXISTS "Public can manage products" ON public.products;
CREATE POLICY "Public can manage products"
    ON public.products FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view kiosk settings" ON public.kiosk_settings;
DROP POLICY IF EXISTS "Admins can update kiosk settings" ON public.kiosk_settings;
DROP POLICY IF EXISTS "Public can manage kiosk settings" ON public.kiosk_settings;
CREATE POLICY "Public can manage kiosk settings"
    ON public.kiosk_settings FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Public read garment images" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload garment images" ON storage.objects;
DROP POLICY IF EXISTS "Admin update garment images" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete garment images" ON storage.objects;
DROP POLICY IF EXISTS "Public manage garment images" ON storage.objects;
CREATE POLICY "Public manage garment images"
    ON storage.objects FOR ALL
    TO anon, authenticated
    USING (bucket_id = 'garment-images')
    WITH CHECK (bucket_id = 'garment-images');
