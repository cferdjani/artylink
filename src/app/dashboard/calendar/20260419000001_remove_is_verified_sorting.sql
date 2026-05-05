-- =======================================================================================
-- Migration V4.2 : Pivot de positionnement - Suppression de la logique is_verified
-- =======================================================================================

-- 1. Redéfinition de la fonction de recherche (ex: search_artisans)
-- On retire `is_verified DESC` de l'ORDER BY pour utiliser uniquement la visibilité payante.
CREATE OR REPLACE FUNCTION public.search_artisans(
    search_term text DEFAULT '',
    wilaya_filter text DEFAULT NULL,
    commune_filter text DEFAULT NULL,
    category_filter uuid DEFAULT NULL
)
RETURNS SETOF public.artisans
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT a.*
    FROM public.artisans a
    LEFT JOIN public.artisan_categories ac ON a.id = ac.artisan_id
    WHERE
        (search_term = '' OR a.company_name ILIKE '%' || search_term || '%' OR a.bio ILIKE '%' || search_term || '%')
        AND (wilaya_filter IS NULL OR a.wilaya = wilaya_filter)
        AND (commune_filter IS NULL OR a.city = commune_filter)
        AND (category_filter IS NULL OR ac.category_id = category_filter)
    ORDER BY
        -- 🚫 SUPPRIMÉ : a.is_verified DESC (Règle V4.2)
        a.is_sponsored DESC NULLS LAST,
        CASE a.subscription_tier
            WHEN 'pro' THEN 3
            WHEN 'starter' THEN 2
            WHEN 'basic' THEN 1
            ELSE 0
        END DESC,
        a.rating DESC NULLS LAST,
        a.review_count DESC NULLS LAST,
        a.created_at DESC;
END;
$$;

-- 2. Nettoyage des anciens indexes basés sur la vérification
DROP INDEX IF EXISTS idx_artisans_is_verified;

-- 3. Création d'un index optimisé pour le nouveau système de classement V4.2
CREATE INDEX IF NOT EXISTS idx_artisans_visibility_ranking 
ON public.artisans (is_sponsored DESC, subscription_tier DESC, rating DESC);

-- Note: Si is_verified n'est plus du tout utilisé en back-office, exécuter :
-- ALTER TABLE public.artisans DROP COLUMN IF EXISTS is_verified;