# Plan deploiement recherche geo canonique

## Objectif
Passer d'une recherche texte fragile (wilaya/city en string) a une recherche canonique basee sur `city_id` et `wilaya_code`, tout en gardant les URLs SEO lisibles.

## Etape 1 - Base de donnees (immediate)
1. Executer `35_SQL_GEO_NORMALIZATION_AND_SEARCH.sql`.
2. Verifier le taux de mapping geo:

```sql
SELECT
  COUNT(*) AS total_artisans,
  COUNT(city_id) AS mapped_city_id,
  COUNT(wilaya_code) AS mapped_wilaya_code,
  COUNT(*) - COUNT(city_id) AS missing_city_id
FROM public.artisans;
```

3. Lister les cas non mappes pour correction manuelle:

```sql
SELECT id, wilaya, city
FROM public.artisans
WHERE city_id IS NULL
ORDER BY wilaya, city;
```

## Etape 2 - Contrat API recherche (serveur)
Input canonique:
- `q?: string`
- `category?: string`
- `wilayaCode?: string` (format 2 chiffres)
- `cityId?: number`
- `minRating?: number`
- `verifiedOnly?: boolean`
- `limit?: number`
- `offset?: number`

Requete recommandee:
- appeler `public.search_artisans_advanced(...)` via RPC Supabase.

## Etape 3 - Next.js (recherche simple + avancee)
1. `hero-search.tsx`
- remplacer les donnees statiques communes par donnees canoniques (json/endpoint) issues de `algeria_cities`.
- garder affichage humain (`Alger`, `Baba Hassen`) mais stocker/envoyer `wilayaCode` + `cityId`.

2. `/recherche/[category]/[wilaya]/[commune]`
- conserver l'URL SEO.
- resoudre slug -> (`wilayaCode`, `cityId`) avant appel recherche.
- supprimer fallbacks durs de localisation.

3. `/search`
- aligner les filtres avances sur le contrat canonique.
- pagination DB stricte (limit/offset), sans filtrage principal en memoire.

## Etape 4 - Qualite et performance
1. Tests minimaux:
- route SEO -> ids canoniques
- wilaya/commune incoherente => 0 resultat
- city_id valide => resultats stables

2. Metriques a logger:
- filtres utilises
- requetes sans resultat
- temps moyen de reponse recherche

3. Index a surveiller:
- `idx_artisans_city_id`
- `idx_artisans_wilaya_code`
- `idx_artisans_verified_rating`
- trigram indexes (q texte)

## Etape 5 - Hardening (optionnel, phase 2)
1. Rendre `wilaya_code` derive de `city_id` via trigger (coherence stricte).
2. Deprecier progressivement `artisans.wilaya` et `artisans.city` en ecriture.
3. Ajouter cache applicatif (ISR ou cache serveur) pour listes wilaya/communes.

## Definition de done
- 100% des nouveaux artisans avec `city_id` non null.
- recherche simple et avancee n'utilisent plus `ilike` sur wilaya/city comme critere principal.
- latence P95 recherche < 300 ms sur index chaud.
