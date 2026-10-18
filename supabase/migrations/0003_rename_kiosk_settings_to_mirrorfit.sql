DO $$
BEGIN
    IF to_regclass('public.mirrorfit_settings') IS NULL
       AND to_regclass('public.kiosk_settings') IS NOT NULL THEN
        ALTER TABLE public.kiosk_settings RENAME TO mirrorfit_settings;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = to_regclass('public.mirrorfit_settings')
          AND conname = 'kiosk_settings_pkey'
    ) THEN
        ALTER TABLE public.mirrorfit_settings
            RENAME CONSTRAINT kiosk_settings_pkey TO mirrorfit_settings_pkey;
    END IF;
END;
$$;

DROP TRIGGER IF EXISTS set_kiosk_settings_updated_at ON public.mirrorfit_settings;
DROP TRIGGER IF EXISTS set_mirrorfit_settings_updated_at ON public.mirrorfit_settings;
CREATE TRIGGER set_mirrorfit_settings_updated_at
    BEFORE UPDATE ON public.mirrorfit_settings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.mirrorfit_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mirrorfit_settings
    ALTER COLUMN shop_name SET DEFAULT 'MirrorFit — Virtual Dressing Room';

UPDATE public.mirrorfit_settings
SET shop_name = 'MirrorFit — Virtual Dressing Room'
WHERE shop_name IN (
    'AURA Couture Virtual Dressing Room',
    'AURA Atelier — Virtual Dressing Room'
);

DROP POLICY IF EXISTS "Anyone can view kiosk settings" ON public.mirrorfit_settings;
DROP POLICY IF EXISTS "Admins can update kiosk settings" ON public.mirrorfit_settings;
DROP POLICY IF EXISTS "Public can manage kiosk settings" ON public.mirrorfit_settings;
DROP POLICY IF EXISTS "Public can manage MirrorFit settings" ON public.mirrorfit_settings;
CREATE POLICY "Public can manage MirrorFit settings"
    ON public.mirrorfit_settings FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);
