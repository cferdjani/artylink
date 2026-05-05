-- 1) RLS policies for payment_proofs and payment_orders
-- Apply these with caution. Run in Supabase SQL editor or psql.

-- Enable row level security
ALTER TABLE
IF EXISTS public.payment_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE
IF EXISTS public.payment_orders ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own payment proofs (user_id must equal auth.uid())
CREATE POLICY if_not_exists_insert_payment_proofs ON public.payment_proofs
    FOR
INSERT
    WITH CHECK
    (user_id 
 auth.uid(
)
);

-- Allow users to select their own proofs
CREATE POLICY if_not_exists_select_payment_proofs ON public.payment_proofs
    FOR
SELECT USING (user_id = auth.uid());

-- Allow users to update their own proofs status only via admin actions (no general update)
CREATE POLICY if_not_exists_update_payment_proofs ON public.payment_proofs
    FOR
UPDATE USING (false);

-- For payment_orders: allow users to insert their own orders and read their orders
CREATE POLICY if_not_exists_insert_payment_orders ON public.payment_orders
    FOR
INSERT WITH CHECK
    (user_id 
 auth.uid(
)
);
CREATE POLICY if_not_exists_select_payment_orders ON public.payment_orders
    FOR
SELECT USING (user_id = auth.uid());

-- 2) Sponsored items seeds (examples)
-- Make sure you uploaded demo images into bucket `demos` before inserting (image_path values)

INSERT INTO public.sponsored_items
    (type, payload, image_path, start_at, end_at, duration_seconds, link)
VALUES
    ('artisan', jsonb_build_object('name','Kamel R.','profession','Plomberie & Chauffage'), 'mock-artisan1.jpg', now(), now()+interval
'30 days', 30, '/artisan/kamel-r'),
('artisan', jsonb_build_object
('name','Nassima A.','profession','Couture & Réparation'), 'mock-artisan2.jpg', now
(), now
()+interval '30 days', 30, '/artisan/nassima-a'),
('sponsor', jsonb_build_object
('brand_name','Outils Pro Alger','product_desc','Outillage Expert 2026'), 'mock-brand1.png', now
(), now
()+interval '60 days', 28, 'https://outillage.example'),
('sponsor', jsonb_build_object
('brand_name','Céramique El Djazaïr','product_desc','Revêtements Premium'), 'mock-brand2.png', now
(), now
()+interval '45 days', 30, 'https://ceramique.example')
ON CONFLICT DO NOTHING;

-- 3) Helpful index
CREATE INDEX
IF NOT EXISTS idx_sponsored_items_active ON public.sponsored_items
(start_at, end_at);

-- 4) Grant select on sponsored_items to anon if you want public reads (optional)
-- GRANT SELECT ON public.sponsored_items TO anon;
