-- Vue et fonction pour retourner les éléments du carousel dans un bon enchaînement
-- 1) La vue `vw_sponsored_carousel` sélectionne les items actifs (date) et leur applique
--    un `row_number()` partitionné par `type` pour permettre un ordonnancement alterné.
-- 2) La fonction `fn_sponsored_carousel_json()` retourne un JSON prêt à consommer côté frontend.

CREATE OR REPLACE VIEW public.vw_sponsored_carousel AS
WITH
    active
    AS
    (
        SELECT *
        FROM public.sponsored_items
        WHERE now() BETWEEN start_at AND end_at
        ORDER BY COALESCE(priority, 0) DESC, created_at DESC
  LIMIT 200
),
ranked
     AS
(
  SELECT a.*,
    row_number() OVER (PARTITION BY type ORDER BY COALESCE(priority,0) DESC, created_at DESC) AS rn
FROM active a
)
,
normalized AS
(
  SELECT
    r.id,
    r.type,
    CASE WHEN r.type = 'artisan' THEN r.payload->> 'name' ELSE r.payload->> 'brand_name' END AS title,
    CASE WHEN r.type = 'artisan' THEN r.payload->> 'profession' ELSE r.payload->> 'product_desc' END AS subtitle,
    r.image_path,
    r.link,
    r.duration_seconds,
    r.rn,
    COALESCE(r.payload->> 'specialty', '') AS specialty
FROM ranked r
)
SELECT id, type, title, subtitle, image_path, link, duration_seconds, specialty
FROM normalized
ORDER BY rn, CASE WHEN type = 'artisan' THEN 0 ELSE 1 END, title;


-- Fonction utile : retourne un JSON array prêt à consommer côté frontend.
-- Note : la construction complète de l'URL (avec le domaine Supabase + /storage/...) se fait typiquement
-- côté application (NEXT_PUBLIC_SUPABASE_URL). Cette fonction renvoie `image_path` pour laisser
-- le front reconstituer l'URL ou utiliser un CDN.

CREATE OR REPLACE FUNCTION public.fn_sponsored_carousel_json
(p_limit integer DEFAULT 40)
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
SELECT coalesce(jsonb_agg(to_jsonb(t) - 'rn'), '[]'
::jsonb) FROM
(
    SELECT id, type, title, subtitle, image_path, link, duration_seconds, specialty
FROM public.vw_sponsored_carousel
    LIMIT
p_limit
  ) t;
$$;

-- Exemple d'utilisation :
-- SELECT * FROM public.vw_sponsored_carousel; -- vue relationnelle
-- SELECT public.fn_sponsored_carousel_json(20); -- JSON prêt à l'emploi
