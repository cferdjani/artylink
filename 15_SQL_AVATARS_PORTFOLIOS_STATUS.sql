-- ==========================================
-- 15. AVATARS, PORTFOLIOS & STATUT (PHASE 6)
-- ==========================================

-- 0. Création des tables de base si elles n'existent pas encore
CREATE TABLE
IF NOT EXISTS public.profiles
(
    id UUID PRIMARY KEY REFERENCES auth.users
(id) ON
DELETE CASCADE,
    role TEXT,
    full_name TEXT,
    phone TEXT,
    city TEXT
);

CREATE TABLE
IF NOT EXISTS public.artisans
(
    id UUID PRIMARY KEY REFERENCES public.profiles
(id) ON
DELETE CASCADE,
    business_name TEXT,
    bio TEXT
);

-- 1. Ajout de l'URL de l'avatar dans la table profiles
ALTER TABLE public.profiles ADD COLUMN
IF NOT EXISTS avatar_url TEXT;

-- 2. Ajout des colonnes de statut dans la table artisans
ALTER TABLE public.artisans 
    ADD COLUMN
IF NOT EXISTS is_available BOOLEAN DEFAULT true,
ADD COLUMN
IF NOT EXISTS status_text TEXT,
ADD COLUMN
IF NOT EXISTS portfolio_urls TEXT[] DEFAULT '{}';

-- 3. Création des buckets de stockage (Storage)
-- IGNORÉ : Les buckets ('avatars', 'portfolios', 'chat-images', etc.) 
-- existent déjà dans le projet Supabase avec leurs propres configurations 
-- (limites de taille et types MIME).

-- 4. Politiques de sécurité (RLS) pour le stockage
-- Bucket: 'avatars'
DROP POLICY
IF EXISTS "Avatars publicly accessible" ON storage.objects;
CREATE POLICY "Avatars publicly accessible" ON storage.objects FOR
SELECT USING (bucket_id = 'avatars');

DROP POLICY
IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (
bucket_id
=
'avatars'
AND auth.uid
()::text =
(storage.foldername
(name))[1]);

DROP POLICY
IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR
UPDATE TO authenticated USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY
IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR
DELETE TO authenticated USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Bucket: 'portfolios'
DROP POLICY
IF EXISTS "Portfolios publicly accessible" ON storage.objects;
CREATE POLICY "Portfolios publicly accessible" ON storage.objects FOR
SELECT USING (bucket_id = 'portfolios');

DROP POLICY
IF EXISTS "Artisans can upload portfolio images" ON storage.objects;
CREATE POLICY "Artisans can upload portfolio images" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (
bucket_id
=
'portfolios'
AND auth.uid
()::text =
(storage.foldername
(name))[1]);

DROP POLICY
IF EXISTS "Artisans can update portfolio images" ON storage.objects;
CREATE POLICY "Artisans can update portfolio images" ON storage.objects FOR
UPDATE TO authenticated USING (bucket_id = 'portfolios' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY
IF EXISTS "Artisans can delete portfolio images" ON storage.objects;
CREATE POLICY "Artisans can delete portfolio images" ON storage.objects FOR
DELETE TO authenticated USING (bucket_id = 'portfolios' AND auth.uid()::text = (storage.foldername(name))[1]
);
