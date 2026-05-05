-- Migration: create sponsored_items table for demo sponsors/artisans
-- Usage: psql or supabase sql tool

CREATE TABLE
IF NOT EXISTS public.sponsored_items
(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid
(),
    type text NOT NULL CHECK
(type IN
('artisan','sponsor')),
    payload jsonb,
    image_path text,
    start_at timestamptz NOT NULL DEFAULT now
(),
    end_at timestamptz NOT NULL DEFAULT
(now
() + interval '7 days'),
    duration_seconds integer DEFAULT 20,
    link text,
    created_at timestamptz NOT NULL DEFAULT now
()
);

-- Example seed rows (adjust image_path to match uploaded files in storage 'demos' bucket)
INSERT INTO public.sponsored_items
    (type, payload, image_path, start_at, end_at, duration_seconds, link)
VALUES
    ('artisan', jsonb_build_object('name','Demo Artisan A','profession','Plomberie'), 'mock-artisan1.jpg', now(), now()+interval
'14 days', 22, '/artisan/demo-a'),
('sponsor', jsonb_build_object
('brand_name','Outillage DZ','product_desc','Outils pro'), 'mock-brand1.png', now
(), now
()+interval '30 days', 18, 'https://outillage.example'),
('artisan', jsonb_build_object
('name','Demo Artisan B','profession','Électricité'), 'mock-artisan2.jpg', now
(), now
()+interval '10 days', 24, '/artisan/demo-b')
ON CONFLICT DO NOTHING;
