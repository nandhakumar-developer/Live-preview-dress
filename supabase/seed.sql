-- Seed Initial Categories
INSERT INTO public.categories (id, name, slug, audience, sort_order, is_active)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Designer Dresses', 'dresses', 'women', 1, true),
    ('c2222222-2222-2222-2222-222222222222', 'Royal Sarees', 'sarees', 'women', 2, true),
    ('c3333333-3333-3333-3333-333333333333', 'Ethnic Kurtis', 'kurtis', 'women', 3, true),
    ('c4444444-4444-4444-4444-444444444444', 'Men Formal Shirts', 'shirts', 'men', 4, true),
    ('c5555555-5555-5555-5555-555555555555', 'Kids Couture', 'kids', 'kids', 5, true)
ON CONFLICT (slug) DO NOTHING;

-- Seed 5 signature garments for the MirrorFit customer experience
INSERT INTO public.products (id, name, sku, category_id, description, price, currency, garment_type, color, image_path, thumbnail_path, try_on_prompt, is_published, is_featured, sort_order)
VALUES
    (
        'd1111111-1111-1111-1111-111111111111',
        'Crimson Velvet Evening Gown',
        'DRS-VEL-001',
        'c1111111-1111-1111-1111-111111111111',
        'Opulent floor-length crimson velvet gown with structured corset bodice, sweetheart neckline, and sweeping silhouette.',
        18500,
        'INR',
        'dress',
        'Crimson Red',
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80',
        'Floor-length crimson red velvet evening gown with structured corset bodice and elegant draping',
        true,
        true,
        1
    ),
    (
        'd2222222-2222-2222-2222-222222222222',
        'Emerald Silk Halter Maxi',
        'DRS-SLK-002',
        'c1111111-1111-1111-1111-111111111111',
        'Fluid bias-cut mulberry silk maxi dress in rich jewel emerald green with delicate halter straps and side-slit.',
        14900,
        'INR',
        'dress',
        'Emerald Green',
        'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=400&q=80',
        'Fluid emerald green silk halter maxi dress with delicate straps and bias cut silhouette',
        true,
        true,
        2
    ),
    (
        'd3333333-3333-3333-3333-333333333333',
        'Midnight Sapphire Sequin Cocktail',
        'DRS-SEQ-003',
        'c1111111-1111-1111-1111-111111111111',
        'Dazzling micro-sequin sheath dress shimmering in deep sapphire blue, featuring capped sleeves and graceful back cut-out.',
        12500,
        'INR',
        'dress',
        'Sapphire Blue',
        'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=400&q=80',
        'Midnight sapphire blue sequined cocktail dress with capped sleeves and radiant light reflection',
        true,
        true,
        3
    ),
    (
        'd4444444-4444-4444-4444-444444444444',
        'Golden Champagne Tiered Organza',
        'DRS-ORG-004',
        'c1111111-1111-1111-1111-111111111111',
        'Ethereal tiered organza A-line dress woven with subtle golden metallic threading, flutter sleeves, and romantic tiered skirt.',
        22000,
        'INR',
        'dress',
        'Champagne Gold',
        'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=400&q=80',
        'Champagne gold tiered organza dress with metallic threading and romantic flowing silhouette',
        true,
        true,
        4
    ),
    (
        'd5555555-5555-5555-5555-555555555555',
        'Obsidian Black Tuxedo Blazer Dress',
        'DRS-TUX-005',
        'c1111111-1111-1111-1111-111111111111',
        'Sharply tailored double-breasted tuxedo dress in crepe with duchess satin peaked lapels and gold lion-head buttons.',
        16800,
        'INR',
        'dress',
        'Obsidian Black',
        'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=400&q=80',
        'Sharp black double-breasted tuxedo blazer dress with satin peak lapels and tailored silhouette',
        true,
        true,
        5
    )
ON CONFLICT (id) DO NOTHING;

-- Seed default MirrorFit settings
INSERT INTO public.mirrorfit_settings (id, shop_name, preview_seconds, recording_enabled, idle_timeout_seconds)
VALUES ('00000000-0000-0000-0000-000000000001', 'MirrorFit — Virtual Dressing Room', 30, true, 60)
ON CONFLICT (id) DO NOTHING;
