-- =========================================================================
-- PHASE 8: RÉSERVATIONS (BOOKINGS)
-- =========================================================================

-- 1. Types ENUM remplaces par des contraintes CHECK pour eviter les blocs DO

-- 2. Création de la table bookings
CREATE TABLE
IF NOT EXISTS public.bookings
(
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4
(),
    booking_ref         TEXT UNIQUE DEFAULT 'BK-' || UPPER
(substring
(gen_random_uuid
()::text, 1, 8)),
    
    -- Parties impliquées
    client_id           UUID NOT NULL REFERENCES public.profiles
(id) ON
DELETE CASCADE,
    artisan_id          UUID
NOT NULL REFERENCES public.artisans
(id) ON
DELETE CASCADE,

    -- Planification
    scheduled_date      DATE NOT NULL,
    scheduled_time      TIME, -- Rendu optionnel pour flexibilité MVP
    estimated_duration  INTEGER, -- Minutes

    -- Adresse d'intervention
    address_line        TEXT
NOT NULL,
    city                TEXT, -- Rendu optionnel pour flexibilité MVP
    postal_code         TEXT, -- Rendu optionnel pour flexibilité MVP
    -- location            GEOGRAPHY(POINT, 4326), (Optionnel si PostGIS n'est pas actif tout de suite)

    -- Description du travail
    description         TEXT,
    notes               TEXT,
    photos_before       TEXT
[] DEFAULT '{}',
    photos_after        TEXT[] DEFAULT '{}',

    -- Statut
    status              TEXT DEFAULT 'pending' CHECK
(status IN
('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed')),
    payment_status      TEXT DEFAULT 'unpaid' CHECK
(payment_status IN
('unpaid', 'pending', 'paid', 'refunded', 'failed')),

    -- Financier
    price_estimate      DECIMAL
(10,2),
    price_final         DECIMAL
(10,2),
    commission_rate     DECIMAL
(5,2) DEFAULT 5.00,
    commission_amount   DECIMAL
(10,2) GENERATED ALWAYS AS
(price_final * commission_rate / 100) STORED,

    -- Timestamps
    confirmed_at        TIMESTAMPTZ,
    started_at          TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW
(),
    updated_at          TIMESTAMPTZ DEFAULT NOW
()
);

-- Trigger de mise à jour de timestamps
DROP TRIGGER IF EXISTS on_bookings_update
ON public.bookings;
CREATE TRIGGER on_bookings_update
    BEFORE
UPDATE ON public.bookings
    FOR EACH ROW
EXECUTE
PROCEDURE
public.update_updated_at_column
();

-- 3. Sécurité (RLS)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY
IF EXISTS "Les clients voient leurs propres réservations" ON public.bookings;
CREATE POLICY "Les clients voient leurs propres réservations" 
ON public.bookings FOR
SELECT
    TO authenticated
USING
(auth.uid
() = client_id);

DROP POLICY
IF EXISTS "Les artisans voient les réservations qui leur sont assignées" ON public.bookings;
CREATE POLICY "Les artisans voient les réservations qui leur sont assignées" 
ON public.bookings FOR
SELECT
    TO authenticated
USING
(auth.uid
() = artisan_id);

DROP POLICY
IF EXISTS "Les clients peuvent créer une réservation" ON public.bookings;
CREATE POLICY "Les clients peuvent créer une réservation" 
ON public.bookings FOR
INSERT 
TO authenticated 
WITH CHECK (
auth.uid()
= client_id);

DROP POLICY
IF EXISTS "Les clients peuvent modifier ou annuler leurs réservations en attente" ON public.bookings;
CREATE POLICY "Les clients peuvent modifier ou annuler leurs réservations en attente" 
ON public.bookings FOR
UPDATE 
TO authenticated 
USING (auth.uid() = client_id AND status = 'pending')
WITH CHECK
(auth.uid
() = client_id);

DROP POLICY
IF EXISTS "Les artisans peuvent accepter ou modifier le statut des réservations" ON public.bookings;
CREATE POLICY "Les artisans peuvent accepter ou modifier le statut des réservations" 
ON public.bookings FOR
UPDATE 
TO authenticated 
USING (auth.uid() = artisan_id)
WITH CHECK
(auth.uid
() = artisan_id);
