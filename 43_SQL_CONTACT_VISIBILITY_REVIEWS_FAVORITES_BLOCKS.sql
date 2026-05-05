-- =============================================================================
-- PATCH 43 : ArtyLink V4.2 - favoris, blocages, avis publics artisans,
--            reputation client visible artisans uniquement
-- =============================================================================

BEGIN;

-- Favoris: un utilisateur inscrit peut enregistrer une carte artisan.
CREATE TABLE IF NOT EXISTS public.favorites (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    artisan_id UUID NOT NULL REFERENCES public.artisans(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, artisan_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own favorites" ON public.favorites;
CREATE POLICY "Users manage own favorites"
ON public.favorites
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Blocages: relation simple user -> user.
CREATE TABLE IF NOT EXISTS public.blocked_users (
    blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (blocker_id, blocked_id),
    CHECK (blocker_id <> blocked_id)
);

ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own blocks" ON public.blocked_users;
CREATE POLICY "Users manage own blocks"
ON public.blocked_users
FOR ALL
TO authenticated
USING (auth.uid() = blocker_id)
WITH CHECK (auth.uid() = blocker_id);

-- Avis V4.2:
-- - client_to_artisan: visible par tous les utilisateurs inscrits.
-- - artisan_to_client: visible uniquement par les artisans/admins.
ALTER TABLE public.reviews
    ADD COLUMN IF NOT EXISTS reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS target_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS target_artisan_id UUID REFERENCES public.artisans(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS review_type TEXT NOT NULL DEFAULT 'client_to_artisan',
    ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'registered_users',
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved';

ALTER TABLE public.reviews
    DROP CONSTRAINT IF EXISTS reviews_review_type_check,
    ADD CONSTRAINT reviews_review_type_check
    CHECK (review_type IN ('client_to_artisan', 'artisan_to_client'));

ALTER TABLE public.reviews
    DROP CONSTRAINT IF EXISTS reviews_visibility_check,
    ADD CONSTRAINT reviews_visibility_check
    CHECK (visibility IN ('registered_users', 'artisans_only'));

ALTER TABLE public.reviews
    DROP CONSTRAINT IF EXISTS reviews_status_check,
    ADD CONSTRAINT reviews_status_check
    CHECK (status IN ('approved', 'rejected', 'hidden'));

UPDATE public.reviews
SET
    reviewer_id = COALESCE(reviewer_id, client_id),
    target_artisan_id = COALESCE(target_artisan_id, artisan_id),
    review_type = COALESCE(review_type, 'client_to_artisan'),
    visibility = COALESCE(visibility, 'registered_users'),
    status = CASE WHEN status = 'pending' THEN 'approved' ELSE COALESCE(status, 'approved') END
WHERE reviewer_id IS NULL
   OR target_artisan_id IS NULL
   OR status = 'pending';

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reviews are viewable by everyone." ON public.reviews;
DROP POLICY IF EXISTS "Clients can create reviews." ON public.reviews;
DROP POLICY IF EXISTS "Les avis approuves sont publics" ON public.reviews;
DROP POLICY IF EXISTS "Les clients peuvent creer des avis" ON public.reviews;
DROP POLICY IF EXISTS "Registered users can view artisan reviews" ON public.reviews;
DROP POLICY IF EXISTS "Artisans can view client reputation reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can create own reviews" ON public.reviews;

CREATE POLICY "Registered users can view artisan reviews"
ON public.reviews
FOR SELECT
TO authenticated
USING (
    status = 'approved'
    AND review_type = 'client_to_artisan'
    AND visibility = 'registered_users'
);

CREATE POLICY "Artisans can view client reputation reviews"
ON public.reviews
FOR SELECT
TO authenticated
USING (
    status = 'approved'
    AND review_type = 'artisan_to_client'
    AND visibility = 'artisans_only'
    AND EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.role IN ('artisan', 'admin')
    )
);

CREATE POLICY "Users can create own reviews"
ON public.reviews
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = reviewer_id
    AND status = 'approved'
    AND (
        (
            review_type = 'client_to_artisan'
            AND visibility = 'registered_users'
            AND target_artisan_id IS NOT NULL
        )
        OR
        (
            review_type = 'artisan_to_client'
            AND visibility = 'artisans_only'
            AND target_user_id IS NOT NULL
            AND EXISTS (
                SELECT 1
                FROM public.profiles p
                WHERE p.id = auth.uid()
                  AND p.role = 'artisan'
            )
        )
    )
);

COMMIT;
