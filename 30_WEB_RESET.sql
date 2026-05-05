-- =============================================================================
-- SCRIPT 1/3 : RESET DESTRUCTIF TOTAL (WEB-ONLY V2)
-- Attention : Ce script supprime TOUTES les tables métier, fonctions, policies
-- et configurations Storage associées à l'ancien projet (particulièrement Flutter).
-- =============================================================================

-- 1. DESACTIVER LE REALTIME (Nettoyage de la publication)
-- Note: PostgreSQL dans Supabase peut ne pas supporter IF EXISTS sur ALTER PUBLICATION.
-- La suppression des tables avec CASCADE plus bas s'occupera de nettoyer la publication automatiquement.

-- 2. SUPPRESSION DES POLICIES ET TRIGGERS (pour éviter les blocages de dépendances)
BEGIN;
    DROP TRIGGER IF EXISTS on_auth_user_created
    ON auth.users CASCADE;
    DROP FUNCTION IF EXISTS public.handle_new_user
    () CASCADE;
    DROP FUNCTION IF EXISTS public.update_updated_at_column
    () CASCADE;
    DROP FUNCTION IF EXISTS public.calculate_artisan_rating
    () CASCADE;
    COMMIT;

    -- 3. SUPPRESSION DES TABLES METIER (Ordre inverse des dépendances)
    BEGIN;
        DROP TABLE IF EXISTS public.reviews
        CASCADE;
    DROP TABLE IF EXISTS public.messages
    CASCADE;
DROP TABLE IF EXISTS public.bookings
CASCADE;
DROP TABLE IF EXISTS public.portfolio_items
CASCADE;
DROP TABLE IF EXISTS public.artisan_documents
CASCADE;
DROP TABLE IF EXISTS public.artisan_categories
CASCADE;
DROP TABLE IF EXISTS public.subcategories
CASCADE;
DROP TABLE IF EXISTS public.categories
CASCADE;
DROP TABLE IF EXISTS public.artisans
CASCADE;
DROP TABLE IF EXISTS public.profiles
CASCADE;
COMMIT;

-- 4. SUPPRESSION DES POLICIES STORAGE (Idempotent)
BEGIN;
    -- Policies sur les objets (pour nettoyer proprement)
    DROP POLICY
    IF EXISTS "Public avatars" ON storage.objects;
DROP POLICY
IF EXISTS "Public portfolios" ON storage.objects;
DROP POLICY
IF EXISTS "Private documents" ON storage.objects;
DROP POLICY
IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY
IF EXISTS "Artisans can upload portfolios" ON storage.objects;

-- Les buckets et objets doivent être supprimés depuis l'interface Supabase (Dashboard -> Storage)
-- car Supabase bloque la suppression directe via SQL pour éviter les fichiers orphelins.
COMMIT;

-- 5. SUPPRESSION DES ENUMS (Si utilisés)
BEGIN;
    DROP TYPE IF EXISTS public.booking_status CASCADE;
    DROP TYPE IF EXISTS public.user_role CASCADE;
    COMMIT;

    -- Verification
    DO $$ 
    BEGIN 
    RAISE NOTICE 'Reset complet terminé. La base de données est prête pour le nouveau schéma Web.';
END $$;
