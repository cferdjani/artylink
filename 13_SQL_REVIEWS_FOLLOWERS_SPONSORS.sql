-- =========================================================================
-- PHASE 4 & 5: AVIS (REVIEWS), ABONNES (FOLLOWERS) ET SPONSORING
-- =========================================================================

-- 0) GARDE-FOUS SCHEMA (compatibilite avec versions anterieures)
ALTER TABLE public.artisans
    ADD COLUMN
IF NOT EXISTS rating_avg NUMERIC
(3, 2) DEFAULT 0,
ADD COLUMN
IF NOT EXISTS review_count INTEGER DEFAULT 0;

CREATE TABLE
IF NOT EXISTS public.sponsorship_campaigns
(
    id UUID PRIMARY KEY,
    artisan_id UUID REFERENCES public.artisans
(id) ON
DELETE CASCADE,
    status TEXT
DEFAULT 'active',
    start_date TIMESTAMPTZ DEFAULT NOW
(),
    end_date TIMESTAMPTZ
);

-- 1) TABLE DES AVIS ET NOTATIONS
CREATE TABLE
IF NOT EXISTS public.reviews
(
    id UUID DEFAULT uuid_generate_v4
() PRIMARY KEY,
    client_id UUID REFERENCES public.profiles
(id) ON
DELETE CASCADE,
    artisan_id UUID
REFERENCES public.artisans
(id) ON
DELETE CASCADE,
    rating INTEGER
CHECK
(rating >= 1 AND rating <= 5),
    comment TEXT,
    status TEXT DEFAULT 'pending' CHECK
(status IN
('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW
(),
    UNIQUE
(client_id, artisan_id)
);

ALTER TABLE public.reviews
    ADD COLUMN
IF NOT EXISTS client_id UUID REFERENCES public.profiles
(id) ON
DELETE CASCADE,
ADD COLUMN
IF NOT EXISTS artisan_id UUID REFERENCES public.artisans
(id) ON
DELETE CASCADE,
ADD COLUMN
IF NOT EXISTS rating INTEGER CHECK
(rating >= 1 AND rating <= 5),
ADD COLUMN
IF NOT EXISTS comment TEXT,
ADD COLUMN
IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK
(status IN
('pending', 'approved', 'rejected'));

UPDATE public.reviews
SET status = 'pending'
WHERE status IS NULL;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY
IF EXISTS "Les avis approuves sont publics" ON public.reviews;
CREATE POLICY "Les avis approuves sont publics"
ON public.reviews
FOR
SELECT
    USING (status = 'approved');

DROP POLICY
IF EXISTS "Les clients peuvent creer des avis" ON public.reviews;
CREATE POLICY "Les clients peuvent creer des avis"
ON public.reviews
FOR
INSERT
WITH CHECK (auth.uid() =
client_id
AND
status
= 'pending');

-- 2) FONCTION + TRIGGER: MAJ NOTE MOYENNE ARTISAN
CREATE OR REPLACE FUNCTION public.update_artisan_rating
()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.artisans
    SET
        rating_avg = (
            SELECT COALESCE(ROUND(AVG(rating), 2), 0)
    FROM public.reviews
    WHERE artisan_id = NEW.artisan_id AND status = 'approved'
        ),
        review_count = (
            SELECT COUNT(*)
    FROM public.reviews
    WHERE artisan_id = NEW.artisan_id AND status = 'approved'
        )
    WHERE id = NEW.artisan_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_review_approved
ON public.reviews;
CREATE TRIGGER on_review_approved
AFTER
UPDATE OF status ON public.reviews
FOR EACH ROW
WHEN
(NEW.status = 'approved' AND OLD.status <> 'approved')
EXECUTE
PROCEDURE public.update_artisan_rating
();

-- 3) TABLE DES ABONNES (FOLLOWERS)
CREATE TABLE
IF NOT EXISTS public.followers
(
    client_id UUID REFERENCES public.profiles
(id) ON
DELETE CASCADE,
    artisan_id UUID
REFERENCES public.artisans
(id) ON
DELETE CASCADE,
    created_at TIMESTAMPTZ
DEFAULT NOW
(),
    PRIMARY KEY
(client_id, artisan_id)
);

ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

DROP POLICY
IF EXISTS "Lecture des abonnements publique" ON public.followers;
CREATE POLICY "Lecture des abonnements publique"
ON public.followers
FOR
SELECT
    USING (true);

DROP POLICY
IF EXISTS "Les clients gerent leurs abonnements" ON public.followers;
CREATE POLICY "Les clients gerent leurs abonnements"
ON public.followers
FOR ALL
USING
(auth.uid
() = client_id)
WITH CHECK
(auth.uid
() = client_id);

-- 4) SPONSORING (RLS)
ALTER TABLE public.sponsorship_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY
IF EXISTS "Voir campagnes actives publiques" ON public.sponsorship_campaigns;
CREATE POLICY "Voir campagnes actives publiques"
ON public.sponsorship_campaigns
FOR
SELECT
    USING (
    status = 'active'
        AND start_date <= NOW()
        AND (end_date IS NULL OR end_date >= NOW())
);

DROP POLICY
IF EXISTS "Les artisans voient leurs campagnes" ON public.sponsorship_campaigns;
CREATE POLICY "Les artisans voient leurs campagnes"
ON public.sponsorship_campaigns
FOR
SELECT
    USING (auth.uid() = artisan_id);

