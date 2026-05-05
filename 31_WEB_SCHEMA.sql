-- =============================================================================
-- SCRIPT 2/3 : CREATION DU SCHEMA WEB-ONLY V2
-- Schéma optimal pour Next.js (SEO, marketing, conversion, Realtime ciblé)
-- =============================================================================

BEGIN;

    -- NETTOYAGE PREALABLE (Garantie d'idempotence)
    DROP TABLE IF EXISTS public.reviews
    CASCADE;
DROP TABLE IF EXISTS public.bookings
CASCADE;
DROP TABLE IF EXISTS public.artisan_categories
CASCADE;
DROP TABLE IF EXISTS public.artisans
CASCADE;
DROP TABLE IF EXISTS public.subcategories
CASCADE;
DROP TABLE IF EXISTS public.categories
CASCADE;
DROP TABLE IF EXISTS public.profiles
CASCADE;

-- 1. ACTIVATION DES EXTENSIONS
CREATE EXTENSION
IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION
IF NOT EXISTS "postgis";
-- Optionnel, pour la recherche géo si nécessaire.

-- 2. TABLE PROFILES (Base user unifiée)
CREATE TABLE public.profiles
(
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text UNIQUE NOT NULL,
    full_name text NOT NULL,
    phone text UNIQUE,
    role text NOT NULL CHECK (role IN ('client', 'artisan', 'admin')) DEFAULT 'client',
    avatar_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 3. TABLES SEO-FRIENDLY CATEGORIES & SOUS-CATEGORIES
CREATE TABLE public.categories
(
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug text UNIQUE NOT NULL,
    -- Essentiel pour URL Next.js
    name text NOT NULL,
    icon text,
    color text,
    is_popular boolean DEFAULT false,
    meta_title text,
    -- NOUVEAU SEO Web
    meta_description text,
    -- NOUVEAU SEO Web
    created_at timestamptz DEFAULT now()
);

CREATE TABLE public.subcategories
(
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id uuid REFERENCES public.categories(id) ON DELETE CASCADE,
    slug text UNIQUE NOT NULL,
    name text NOT NULL,
    meta_title text,
    -- NOUVEAU SEO Web
    meta_description text,
    -- NOUVEAU SEO Web
    created_at timestamptz DEFAULT now()
);

-- 4. TABLE ARTISANS (Profil métier étendu pour conversion & marketing)
CREATE TABLE public.artisans
(
    id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    bio text,
    company_name text,
    wilaya text NOT NULL,
    city text,
    address text,
    longitude double precision,
    latitude double precision,
    years_of_experience integer DEFAULT 0,
    rating double precision DEFAULT 0,
    review_count integer DEFAULT 0,
    is_verified boolean DEFAULT false,
    -- Badge de confiance marketing
    verification_date timestamptz,
    hourly_rate numeric(10,2),
    -- Prix indicatif pour la conversion
    currency text DEFAULT 'DZD',
    availability_status text CHECK (availability_status IN ('available', 'busy', 'unavailable')) DEFAULT 'available',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 5. LIAISON: ARTISAN -> CATEGORIES (Possibilité multi-services)
CREATE TABLE public.artisan_categories
(
    artisan_id uuid REFERENCES public.artisans(id) ON DELETE CASCADE,
    category_id uuid REFERENCES public.categories(id) ON DELETE CASCADE,
    is_primary boolean DEFAULT false,
    PRIMARY KEY (artisan_id, category_id)
);

-- 6. TABLES DE TRANSACTION : RESERVATIONS (BOOKINGS)
CREATE TABLE public.bookings
(
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id uuid NOT NULL REFERENCES public.profiles(id),
    artisan_id uuid NOT NULL REFERENCES public.artisans(id),
    description text NOT NULL,
    status text CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')) DEFAULT 'pending',
    scheduled_date timestamptz,
    price_agreed numeric(10,2),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 7. REVIEWS ET CONFIANCE MULTILATERALE
CREATE TABLE public.reviews
(
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id uuid REFERENCES public.bookings(id) UNIQUE,
    client_id uuid NOT NULL REFERENCES public.profiles(id),
    artisan_id uuid NOT NULL REFERENCES public.artisans(id),
    rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment text,
    created_at timestamptz DEFAULT now()
);

-- 8. FONCTION DE CREATION AUTO PROFIL (ON SIGNUP)
CREATE OR REPLACE FUNCTION public.handle_new_user
() 
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles
        (id, email, full_name, role)
    VALUES
        (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
            COALESCE(NEW.raw_user_meta_data->>'role', 'client')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER
INSERT ON
auth.users
FOR EACH ROW
EXECUTE
PROCEDURE public.handle_new_user
();

-- 9. REALTIME PUBLICATION (Ciblée pour le portail Next.js)
ALTER PUBLICATION supabase_realtime
ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime
ADD TABLE public.profiles;
-- Pratique pour le statut 'en ligne'
ALTER PUBLICATION supabase_realtime
ADD TABLE public.reviews;

COMMIT;

-- 10. RLS & POLICIES (Simples et robustes)
BEGIN;

    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artisans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artisan_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Exempes de policies (à adapter suivant votre auth setup)
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR
SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR
INSERT WITH CHECK (auth.uid() =
id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR
UPDATE USING (auth.uid()
= id);

CREATE POLICY "Categories are viewable by everyone." ON public.categories FOR
SELECT USING (true);
CREATE POLICY "Subcategories are viewable by everyone." ON public.subcategories FOR
SELECT USING (true);

CREATE POLICY "Artisans are viewable by everyone." ON public.artisans FOR
SELECT USING (true);
CREATE POLICY "Artisans can update own data." ON public.artisans FOR
UPDATE USING (auth.uid()
= id);

-- Bookings : Les clients voient les leurs, les artisans voient les leurs
CREATE POLICY "Users can view own bookings." ON public.bookings FOR
SELECT USING (auth.uid() = client_id OR auth.uid() = artisan_id);
CREATE POLICY "Clients can create bookings." ON public.bookings FOR
INSERT WITH CHECK (auth.uid() =
client_id);
CREATE POLICY "Involved parties can update bookings." ON public.bookings FOR
UPDATE USING (auth.uid()
= client_id OR auth.uid
() = artisan_id);

-- Reviews
CREATE POLICY "Reviews are viewable by everyone." ON public.reviews FOR
SELECT USING (true);
CREATE POLICY "Clients can create reviews." ON public.reviews FOR
INSERT WITH CHECK (auth.uid() =
client_id);

COMMIT;

-- 11. BUCKETS STORAGE POLICIES 
-- (Les buckets existants étant vides, on réapplique juste les droits d'accès RLS)
BEGIN;

    -- Active la sécurité RLS sur la table des objets de stockage
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public avatars" ON storage.objects FOR
SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR
INSERT WITH CHECK
    (bucket_id
= 'avatars' AND CAST
(auth.uid
() AS text) =
(storage.foldername
(name))[1]);
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR
UPDATE USING (bucket_id = 'avatars'
AND CAST
(auth.uid
() AS text) =
(storage.foldername
(name))[1]);
CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR
DELETE USING (bucket_id
= 'avatars' AND CAST
(auth.uid
() AS text) =
(storage.foldername
(name))[1]);

CREATE POLICY "Public portfolios" ON storage.objects FOR
SELECT USING (bucket_id = 'portfolios');
CREATE POLICY "Artisans can upload portfolios" ON storage.objects FOR
INSERT WITH CHECK
    (bucket_id
= 'portfolios' AND CAST
(auth.uid
() AS text) =
(storage.foldername
(name))[1]);
CREATE POLICY "Artisans can update portfolios" ON storage.objects FOR
UPDATE USING (bucket_id = 'portfolios'
AND CAST
(auth.uid
() AS text) =
(storage.foldername
(name))[1]);
CREATE POLICY "Artisans can delete portfolios" ON storage.objects FOR
DELETE USING (bucket_id
= 'portfolios' AND CAST
(auth.uid
() AS text) =
(storage.foldername
(name))[1]);

COMMIT;
