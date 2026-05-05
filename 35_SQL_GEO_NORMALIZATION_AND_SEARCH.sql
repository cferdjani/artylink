-- =============================================================================
-- SCRIPT 35 : NORMALISATION GEO + BASE RECHERCHE AVANCEE
-- Objectif:
-- 1) Relier artisans -> algeria_cities par city_id (FK)
-- 2) Conserver un filtre rapide wilaya_code
-- 3) Preparer des indexes pour recherche simple/avancee
-- =============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 0) Table de reference geo (creation minimale si absente)
-- Important: ce script cree la structure; les donnees doivent etre chargees via algeria_cities_postgres.sql.
CREATE TABLE IF NOT EXISTS public.algeria_cities (
    id integer NOT NULL PRIMARY KEY,
    commune_name varchar(255) NOT NULL,
    commune_name_ascii varchar(255) NOT NULL,
    daira_name varchar(255) NOT NULL,
    daira_name_ascii varchar(255) NOT NULL,
    wilaya_code varchar(4) NOT NULL,
    wilaya_name varchar(255) NOT NULL,
    wilaya_name_ascii varchar(255) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_algeria_cities_wilaya_code
    ON public.algeria_cities (wilaya_code);

CREATE INDEX IF NOT EXISTS idx_algeria_cities_wilaya_ascii
    ON public.algeria_cities (wilaya_name_ascii);

CREATE INDEX IF NOT EXISTS idx_algeria_cities_commune_ascii
    ON public.algeria_cities (commune_name_ascii);

-- Garde-fou: ce script de normalisation exige que la table geo soit deja peuplee.
-- Si vide, l'INSERT echoue sur la contrainte CHECK (comportement volontaire).
CREATE TEMP TABLE _geo_data_guard (
    rows_count integer NOT NULL,
    CONSTRAINT geo_data_required_chk CHECK (rows_count > 0)
);

INSERT INTO _geo_data_guard (rows_count)
SELECT COUNT(*)::integer
FROM public.algeria_cities;

DROP TABLE _geo_data_guard;

-- 1) Colonnes canoniques geo sur artisans
ALTER TABLE public.artisans
    ADD COLUMN IF NOT EXISTS city_id integer,
    ADD COLUMN IF NOT EXISTS wilaya_code varchar(2);

-- 2) Backfill wilaya_code depuis le texte existant artisans.wilaya
WITH wilaya_map AS (
    SELECT DISTINCT
        c.wilaya_code,
        lower(regexp_replace(unaccent(COALESCE(c.wilaya_name_ascii, '')), '[[:space:]''-]+', '', 'g')) AS wilaya_norm
    FROM public.algeria_cities c
    UNION
    SELECT DISTINCT
        c.wilaya_code,
        lower(regexp_replace(unaccent(COALESCE(c.wilaya_name, '')), '[[:space:]''-]+', '', 'g')) AS wilaya_norm
    FROM public.algeria_cities c
), artisan_wilaya_norm AS (
    SELECT
        a.id,
        lower(regexp_replace(unaccent(COALESCE(a.wilaya, '')), '[[:space:]''-]+', '', 'g')) AS wilaya_norm
    FROM public.artisans a
)
UPDATE public.artisans a
SET wilaya_code = wm.wilaya_code
FROM artisan_wilaya_norm awn
JOIN wilaya_map wm ON wm.wilaya_norm = awn.wilaya_norm
WHERE a.id = awn.id
  AND (a.wilaya_code IS NULL OR a.wilaya_code = '');

-- 3) Backfill city_id en priorite sur (ville + wilaya_code)
WITH city_catalog AS (
    SELECT
        c.id,
        c.wilaya_code,
        lower(regexp_replace(unaccent(COALESCE(c.commune_name_ascii, '')), '[[:space:]''-]+', '', 'g')) AS commune_norm_ascii,
        lower(regexp_replace(unaccent(COALESCE(c.commune_name, '')), '[[:space:]''-]+', '', 'g')) AS commune_norm_native
    FROM public.algeria_cities c
), city_candidates AS (
    SELECT
        a.id AS artisan_id,
        cc.id AS city_id,
        row_number() OVER (
            PARTITION BY a.id
            ORDER BY cc.id
        ) AS rn
    FROM public.artisans a
    JOIN city_catalog cc
      ON (
            lower(regexp_replace(unaccent(COALESCE(a.city, '')), '[[:space:]''-]+', '', 'g')) = cc.commune_norm_ascii
            OR lower(regexp_replace(unaccent(COALESCE(a.city, '')), '[[:space:]''-]+', '', 'g')) = cc.commune_norm_native
         )
     AND (
            a.wilaya_code IS NULL
            OR a.wilaya_code = ''
            OR cc.wilaya_code = a.wilaya_code
         )
    WHERE a.city IS NOT NULL
      AND a.city <> ''
      AND a.city_id IS NULL
)
UPDATE public.artisans a
SET city_id = cc.city_id
FROM city_candidates cc
WHERE a.id = cc.artisan_id
  AND cc.rn = 1
  AND a.city_id IS NULL;

-- 3-quater) Fallback administratif: si city_id reste NULL mais wilaya_code est connu,
-- on assigne la commune chef-lieu (quand detectable), sinon la premiere commune de la wilaya.
WITH wilaya_default_city AS (
    SELECT
        c.wilaya_code,
        c.id AS city_id,
        row_number() OVER (
            PARTITION BY c.wilaya_code
            ORDER BY
                CASE
                    WHEN lower(regexp_replace(unaccent(COALESCE(c.commune_name_ascii, '')), '[[:space:]''-]+', '', 'g')) =
                         lower(regexp_replace(unaccent(COALESCE(c.wilaya_name_ascii, '')), '[[:space:]''-]+', '', 'g'))
                    THEN 0
                    ELSE 1
                END,
                c.id
        ) AS rn
    FROM public.algeria_cities c
)
UPDATE public.artisans a
SET city_id = wdc.city_id
FROM wilaya_default_city wdc
WHERE a.city_id IS NULL
  AND a.wilaya_code IS NOT NULL
  AND a.wilaya_code <> ''
  AND a.wilaya_code = wdc.wilaya_code
  AND wdc.rn = 1;

-- 3-ter) Fallback fuzzy: meme wilaya, meilleure similarite trigram sur nom de commune
-- Utilise quand le texte city n'est pas strictement egal a la reference (variantes, fautes, apostrophes).
WITH city_catalog AS (
    SELECT
        c.id,
        c.wilaya_code,
        lower(regexp_replace(unaccent(COALESCE(c.commune_name_ascii, '')), '[[:space:]''-]+', '', 'g')) AS commune_norm_ascii,
        lower(regexp_replace(unaccent(COALESCE(c.commune_name, '')), '[[:space:]''-]+', '', 'g')) AS commune_norm_native
    FROM public.algeria_cities c
), scored_candidates AS (
    SELECT
        a.id AS artisan_id,
        cc.id AS city_id,
        GREATEST(
            similarity(
                lower(regexp_replace(unaccent(COALESCE(a.city, '')), '[[:space:]''-]+', '', 'g')),
                cc.commune_norm_ascii
            ),
            similarity(
                lower(regexp_replace(unaccent(COALESCE(a.city, '')), '[[:space:]''-]+', '', 'g')),
                cc.commune_norm_native
            )
        ) AS sim_score,
        row_number() OVER (
            PARTITION BY a.id
            ORDER BY
                GREATEST(
                    similarity(
                        lower(regexp_replace(unaccent(COALESCE(a.city, '')), '[[:space:]''-]+', '', 'g')),
                        cc.commune_norm_ascii
                    ),
                    similarity(
                        lower(regexp_replace(unaccent(COALESCE(a.city, '')), '[[:space:]''-]+', '', 'g')),
                        cc.commune_norm_native
                    )
                ) DESC,
                cc.id
        ) AS rn
    FROM public.artisans a
    JOIN city_catalog cc
      ON cc.wilaya_code = a.wilaya_code
    WHERE a.city IS NOT NULL
      AND a.city <> ''
      AND a.city_id IS NULL
      AND a.wilaya_code IS NOT NULL
      AND a.wilaya_code <> ''
)
UPDATE public.artisans a
SET city_id = sc.city_id
FROM scored_candidates sc
WHERE a.id = sc.artisan_id
  AND sc.rn = 1
  AND sc.sim_score >= 0.55
  AND a.city_id IS NULL;

-- 3-bis) Fallback: si toujours non mappe, tentative sans contrainte wilaya
WITH city_catalog AS (
    SELECT
        c.id,
        lower(regexp_replace(unaccent(COALESCE(c.commune_name_ascii, '')), '[[:space:]''-]+', '', 'g')) AS commune_norm_ascii,
        lower(regexp_replace(unaccent(COALESCE(c.commune_name, '')), '[[:space:]''-]+', '', 'g')) AS commune_norm_native
    FROM public.algeria_cities c
), city_candidates AS (
    SELECT
        a.id AS artisan_id,
        cc.id AS city_id,
        row_number() OVER (
            PARTITION BY a.id
            ORDER BY cc.id
        ) AS rn
    FROM public.artisans a
    JOIN city_catalog cc
      ON (
            lower(regexp_replace(unaccent(COALESCE(a.city, '')), '[[:space:]''-]+', '', 'g')) = cc.commune_norm_ascii
            OR lower(regexp_replace(unaccent(COALESCE(a.city, '')), '[[:space:]''-]+', '', 'g')) = cc.commune_norm_native
         )
    WHERE a.city IS NOT NULL
      AND a.city <> ''
      AND a.city_id IS NULL
)
UPDATE public.artisans a
SET city_id = cc.city_id
FROM city_candidates cc
WHERE a.id = cc.artisan_id
  AND cc.rn = 1
  AND a.city_id IS NULL;

-- 4) Reconciliation wilaya_code depuis city_id quand possible
UPDATE public.artisans a
SET wilaya_code = c.wilaya_code
FROM public.algeria_cities c
WHERE a.city_id = c.id
  AND (a.wilaya_code IS NULL OR a.wilaya_code = '');

-- 5) FK + contraintes de base
ALTER TABLE public.artisans
    DROP CONSTRAINT IF EXISTS artisans_city_id_fkey;

ALTER TABLE public.artisans
    ADD CONSTRAINT artisans_city_id_fkey
    FOREIGN KEY (city_id)
    REFERENCES public.algeria_cities(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL;

ALTER TABLE public.artisans
    DROP CONSTRAINT IF EXISTS artisans_wilaya_code_format_chk;

ALTER TABLE public.artisans
    ADD CONSTRAINT artisans_wilaya_code_format_chk
    CHECK (wilaya_code IS NULL OR wilaya_code ~ '^[0-9]{2}$');

-- 6) Indexes recherche geo/categorie/qualite
CREATE INDEX IF NOT EXISTS idx_artisans_city_id
    ON public.artisans (city_id);

CREATE INDEX IF NOT EXISTS idx_artisans_wilaya_code
    ON public.artisans (wilaya_code);

CREATE INDEX IF NOT EXISTS idx_artisans_verified_rating
    ON public.artisans (is_verified DESC, rating DESC, review_count DESC);

CREATE INDEX IF NOT EXISTS idx_artisans_city_text_trgm
    ON public.artisans USING gin (city gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_artisans_wilaya_text_trgm
    ON public.artisans USING gin (wilaya gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_profiles_full_name_trgm
    ON public.profiles USING gin (full_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_artisan_categories_category_artisan
    ON public.artisan_categories (category_id, artisan_id);

COMMIT;

-- =============================================================================
-- FONCTION RECHERCHE AVANCEE (serveur)
-- Usage: SELECT * FROM public.search_artisans_advanced(...);
-- =============================================================================

CREATE OR REPLACE FUNCTION public.search_artisans_advanced(
    p_q text DEFAULT NULL,
    p_category_slug text DEFAULT NULL,
    p_wilaya_code varchar(2) DEFAULT NULL,
    p_city_id integer DEFAULT NULL,
    p_min_rating numeric DEFAULT NULL,
    p_verified_only boolean DEFAULT false,
    p_limit integer DEFAULT 36,
    p_offset integer DEFAULT 0
)
RETURNS TABLE (
    artisan_id uuid,
    full_name text,
    wilaya text,
    city text,
    wilaya_code varchar(2),
    city_id integer,
    is_verified boolean,
    rating double precision,
    review_count integer,
    category_slug text,
    category_name text,
    rank_score numeric,
    total_count bigint,
    phone text,
    email text,
    avatar_url text
)
LANGUAGE sql
STABLE
AS $$
    WITH base AS (
        SELECT
            a.id AS artisan_id,
            p.full_name,
            COALESCE(alc.wilaya_name_ascii, a.wilaya) AS wilaya,
            COALESCE(alc.commune_name_ascii, a.city) AS city,
            a.wilaya_code,
            a.city_id,
            a.is_verified,
            COALESCE(a.rating, 0) AS rating,
            COALESCE(a.review_count, 0) AS review_count,
            c.slug AS category_slug,
            c.name AS category_name,
            p.phone,
            p.email,
            p.avatar_url,
            (
                CASE WHEN a.is_verified THEN 100 ELSE 0 END
                + COALESCE(a.rating, 0) * 10
                + LEAST(COALESCE(a.review_count, 0), 100)
            )::numeric AS trust_score,
            CASE
                WHEN p_q IS NULL OR btrim(p_q) = '' THEN 0::numeric
                ELSE (
                    similarity(COALESCE(p.full_name, ''), p_q)
                    + similarity(COALESCE(alc.commune_name_ascii, a.city, ''), p_q)
                    + similarity(COALESCE(alc.wilaya_name_ascii, a.wilaya, ''), p_q)
                    + similarity(COALESCE(c.name, ''), p_q)
                )::numeric
            END AS text_score
        FROM public.artisans a
        JOIN public.profiles p ON p.id = a.id
        LEFT JOIN public.artisan_categories ac ON ac.artisan_id = a.id
        LEFT JOIN public.categories c ON c.id = ac.category_id
        LEFT JOIN public.algeria_cities alc ON alc.id = a.city_id
        WHERE (p_wilaya_code IS NULL OR p_wilaya_code = '' OR a.wilaya_code = p_wilaya_code)
          AND (p_city_id IS NULL OR a.city_id = p_city_id)
          AND (p_verified_only = false OR a.is_verified = true)
          AND (p_min_rating IS NULL OR COALESCE(a.rating, 0) >= p_min_rating)
          AND (
                p_category_slug IS NULL
                OR p_category_slug = ''
                OR p_category_slug = 'tous-services'
                OR c.slug = p_category_slug
          )
          AND (
                p_q IS NULL
                OR btrim(p_q) = ''
                OR COALESCE(p.full_name, '') ILIKE '%' || p_q || '%'
                OR COALESCE(alc.commune_name_ascii, a.city, '') ILIKE '%' || p_q || '%'
                OR COALESCE(alc.wilaya_name_ascii, a.wilaya, '') ILIKE '%' || p_q || '%'
                OR COALESCE(c.name, '') ILIKE '%' || p_q || '%'
          )
    )
    SELECT
        b.artisan_id,
        b.full_name,
        b.wilaya,
        b.city,
        b.wilaya_code,
        b.city_id,
        b.is_verified,
        b.rating,
        b.review_count,
        b.category_slug,
        b.category_name,
        (b.trust_score + b.text_score) AS rank_score,
        COUNT(*) OVER() AS total_count,
        b.phone,
        b.email,
        b.avatar_url
    FROM base b
    ORDER BY
        (b.trust_score + b.text_score) DESC,
        b.is_verified DESC,
        b.rating DESC,
        b.review_count DESC,
        b.artisan_id
    LIMIT GREATEST(COALESCE(p_limit, 36), 1)
    OFFSET GREATEST(COALESCE(p_offset, 0), 0);
$$;

COMMENT ON FUNCTION public.search_artisans_advanced(text, text, varchar, integer, numeric, boolean, integer, integer)
IS 'Recherche avancee artisan (geo canonique + score confiance + texte).';
