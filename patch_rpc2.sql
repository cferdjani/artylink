DROP FUNCTION IF EXISTS public.search_artisans_advanced(text, text, varchar, integer, numeric, boolean, integer, integer);

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
