-- =========================================================================
-- CREATION DES BUCKETS STORAGE ET POLICIES
-- =========================================================================

-- Creation du bucket avatars s'il n'existe pas
INSERT INTO storage.buckets
    (id, name, public)
VALUES
    ('avatars', 'avatars', true)
ON CONFLICT
(id) DO NOTHING;

-- Policies pour les avatars
DROP POLICY
IF EXISTS "Public Access avatars" ON storage.objects;
DROP POLICY
IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY
IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY
IF EXISTS "Users can delete their own avatar" ON storage.objects;

CREATE POLICY "Public Access avatars" ON storage.objects FOR
SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR
INSERT WITH CHECK
    (bucket_id 
 'avatars' AND auth.uid(
)
::text =
(string_to_array
(name, '/'))[1]);
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR
UPDATE USING (bucket_id = 'avatars'
AND auth.uid
()::text =
(string_to_array
(name, '/'))[1]);
CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR
DELETE USING (bucket_id
= 'avatars' AND auth.uid
()::text =
(string_to_array
(name, '/'))[1]);

-- Creation du bucket portfolios s'il n'existe pas
INSERT INTO storage.buckets
    (id, name, public)
VALUES
    ('portfolios', 'portfolios', true)
ON CONFLICT
(id) DO NOTHING;

-- Policies pour les portfolios
DROP POLICY
IF EXISTS "Public Access portfolios" ON storage.objects;
DROP POLICY
IF EXISTS "Users can upload their own portfolio" ON storage.objects;
DROP POLICY
IF EXISTS "Users can update their own portfolio" ON storage.objects;
DROP POLICY
IF EXISTS "Users can delete their own portfolio" ON storage.objects;

CREATE POLICY "Public Access portfolios" ON storage.objects FOR
SELECT USING (bucket_id = 'portfolios');
CREATE POLICY "Users can upload their own portfolio" ON storage.objects FOR
INSERT WITH CHECK
    (bucket_id 
 'portfolios' AND auth.uid(
)
::text =
(string_to_array
(name, '/'))[1]);
CREATE POLICY "Users can update their own portfolio" ON storage.objects FOR
UPDATE USING (bucket_id = 'portfolios'
AND auth.uid
()::text =
(string_to_array
(name, '/'))[1]);
CREATE POLICY "Users can delete their own portfolio" ON storage.objects FOR
DELETE USING (bucket_id
= 'portfolios' AND auth.uid
()::text =
(string_to_array
(name, '/'))[1]);
