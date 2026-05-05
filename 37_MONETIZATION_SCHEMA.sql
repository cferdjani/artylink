-- =============================================================================
-- SCRIPT 37 : SCHEMA DE MONETISATION ET STATISTIQUES (Zéro Casse)
-- Ajout des tables pour le modèle "Annuaire Premium" sans toucher à l'existant.
-- =============================================================================

BEGIN;

    -- 1. EXTENSION DE LA TABLE ARTISANS (Additive uniquement)
    -- On ajoute des colonnes pour le statut Premium et le Boost, sans affecter le code existant.
    ALTER TABLE public.artisans 
ADD COLUMN
    IF NOT EXISTS subscription_tier text CHECK
    (subscription_tier IN
    ('free', 'premium', 'vip')) DEFAULT 'free',
    ADD COLUMN
    IF NOT EXISTS boost_expires_at timestamptz,
    ADD COLUMN
    IF NOT EXISTS is_sponsored boolean DEFAULT false;

-- 2. TABLE DES ABONNEMENTS / PAIEMENTS (Pour la validation Admin des paiements BaridiMob/CCP)
CREATE TABLE
IF NOT EXISTS public.artisan_payments
(
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4
(),
    artisan_id uuid NOT NULL REFERENCES public.artisans
(id) ON
DELETE CASCADE,
    amount numeric(10,2)
NOT NULL,
    payment_method text CHECK
(payment_method IN
('baridimob', 'ccp', 'cash')) NOT NULL,
    receipt_image_url text NOT NULL, -- Preuve de paiement
    plan_type text CHECK
(plan_type IN
('premium_1_month', 'premium_1_year', 'boost_7_days')) NOT NULL,
    status text CHECK
(status IN
('pending', 'approved', 'rejected')) DEFAULT 'pending',
    admin_notes text,
    created_at timestamptz DEFAULT now
(),
    updated_at timestamptz DEFAULT now
()
);

-- 3. TABLE DES STATISTIQUES : VUES DE PROFIL (Profile Views)
-- Pour dire à l'artisan: "Votre profil a été vu 45 fois cette semaine"
CREATE TABLE
IF NOT EXISTS public.profile_views
(
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4
(),
    artisan_id uuid NOT NULL REFERENCES public.artisans
(id) ON
DELETE CASCADE,
    viewer_id uuid
REFERENCES public.profiles
(id) ON
DELETE
SET NULL
, -- Null si visiteur anonyme
    viewer_ip text, -- Optionnel, pour éviter les vues en double
    created_at timestamptz DEFAULT now
()
);

-- 4. TABLE DES STATISTIQUES : LEADS / CLICS SUR LE CONTACT
-- Le nerf de la guerre: "12 clients ont cliqué pour voir votre numéro"
CREATE TABLE
IF NOT EXISTS public.lead_clicks
(
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4
(),
    artisan_id uuid NOT NULL REFERENCES public.artisans
(id) ON
DELETE CASCADE,
    viewer_id uuid
REFERENCES public.profiles
(id) ON
DELETE
SET NULL
,
    action_type text CHECK
(action_type IN
('view_phone', 'whatsapp_click', 'message_click')) NOT NULL,
    created_at timestamptz DEFAULT now
()
);

COMMIT;

-- 5. POLICIES DE SECURITE (RLS)
BEGIN;

    ALTER TABLE public.artisan_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_clicks ENABLE ROW LEVEL SECURITY;

-- Les artisans peuvent voir leurs propres historiques de paiements
CREATE POLICY "Artisans view own payments" ON public.artisan_payments 
FOR
SELECT USING (auth.uid() = artisan_id);

-- Les artisans peuvent soumettre un paiement
CREATE POLICY "Artisans insert own payments" ON public.artisan_payments 
FOR
INSERT WITH CHECK (auth.uid() =
artisan_id);

-- Tout le monde peut ajouter une vue de profil (Insert only)
CREATE POLICY "Anyone can insert profile view" ON public.profile_views 
FOR
INSERT WITH CHECK
    (true)
;

-- Les artisans voient uniquement les statistiques de LEUR profil
CREATE POLICY "Artisans view own profile stats" ON public.profile_views 
FOR
SELECT USING (auth.uid() = artisan_id);

-- Tout le monde peut ajouter un clic de contact (Insert only)
CREATE POLICY "Anyone can insert lead click" ON public.lead_clicks 
FOR
INSERT WITH CHECK
    (true)
;

-- Les artisans voient les clics sur LEUR numéro
CREATE POLICY "Artisans view own lead clicks" ON public.lead_clicks 
FOR
SELECT USING (auth.uid() = artisan_id);

COMMIT;

DO $$ 
BEGIN 
    RAISE NOTICE 'Base de données mise à jour avec succès pour le modèle Annuaire Premium. (Zéro casse effectuée)';
END $$;