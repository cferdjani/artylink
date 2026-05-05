-- Sample seeded sponsored items for carousel demo
-- These items reference images uploaded to the `demos` storage bucket.
-- Replace the UUIDs and timestamps as appropriate for your environment.

INSERT INTO public.sponsored_items
    (id, type, payload, image_path, link, duration_seconds, start_at, end_at, created_at)
VALUES
    -- Artisan 1 (Plomberie)
    ('11111111-1111-4111-8111-111111111111', 'artisan', '{"name":"Kamel R.", "profession":"Plomberie & Chauffage"}'
::jsonb, 'demo-artisan1.jpg', NULL, 30, now
() - interval '1 hour', now
() + interval '7 days', now
()),

-- Artisan 2 (Électricité)
('22222222-2222-4222-8222-222222222222', 'artisan', '{"name":"Leila B.", "profession":"Électricité - Domotique"}'::jsonb, 'demo-artisan2.jpg', NULL, 30, now
() - interval '1 hour', now
() + interval '7 days', now
()),

-- Sponsor 1
('33333333-3333-4333-8333-333333333333', 'sponsor', '{"brand_name":"Céramique El Djazaïr", "product_desc":"Revêtements Premium 2026"}'::jsonb, 'demo-brand1.jpg', 'https://ceramique.example', 30, now
() - interval '1 hour', now
() + interval '7 days', now
()),

-- Sponsor 2
('44444444-4444-4444-8444-444444444444', 'sponsor', '{"brand_name":"Outillage DZ", "product_desc":"Outils pro, livraison rapide"}'::jsonb, 'demo-product1.jpg', 'https://outillage.example', 30, now
() - interval '1 hour', now
() + interval '7 days', now
());

-- Important: upload the referenced images to your Supabase storage bucket `demos`.
-- Example upload script (bash + supabase CLI):
-- supabase storage cp ./images/demo-artisan1.jpg demos/demo-artisan1.jpg
-- supabase storage cp ./images/demo-artisan2.jpg demos/demo-artisan2.jpg
-- supabase storage cp ./images/demo-brand1.jpg demos/demo-brand1.jpg
-- supabase storage cp ./images/demo-product1.jpg demos/demo-product1.jpg

-- If you prefer to insert into profiles/artisans instead, create profiles and artisans records and set image_path accordingly.
