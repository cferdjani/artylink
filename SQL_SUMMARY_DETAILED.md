# SQL — Résumé détaillé du schéma actuel

Ce document reprend l'« état actuel » du schéma que tu as fourni, avec pour chaque table : colonnes clés, clés primaires/étrangères, remarques et recommandations pratiques (indexes manquants, contraintes à vérifier, bonnes pratiques de migration/tests).

---

**Table `algeria_cities`**
- PK : `id` (integer)
- Colonnes : `commune_name`, `commune_name_ascii`, `daira_name`, `daira_name_ascii`, `wilaya_code`, `wilaya_name`, `wilaya_name_ascii`
- Remarques : données géographiques/lookup utilisées pour normaliser `artisans.city_id`.
- Reco : indexer `wilaya_code` et `commune_name_ascii` si recherches fréquentes. Assurer unicité si applicable.

**Table `artisans`**
- PK : `id` (uuid) — FK → `profiles(id)`
- Colonnes importantes : `bio`, `company_name`, `wilaya`, `city`, `city_id` (FK → `algeria_cities.id`), `longitude/latitude`, `years_of_experience`, `rating`, `review_count`, `is_verified`, `availability_status`, `subscription_tier`, `boost_expires_at`, `is_sponsored`, `created_at`, `updated_at`.
- Remarques : `wilaya_code` a une CHECK pour deux chiffres; `availability_status` et `subscription_tier` ont des CHECKs.
- Reco : indexer `city_id`, `wilaya_code`, et champs utilisés pour recherche full-text/trgm (`company_name`, maybe `bio`). Ajouter trigger/update automatique `updated_at` on UPDATE si absent.

**Table `profiles`**
- PK : `id` (uuid) — FK → `auth.users(id)`
- Colonnes : `email` (UNIQUE), `full_name`, `phone` (UNIQUE), `role`, `avatar_url`, `created_at`, `updated_at`.
- Reco : valider la cohérence entre `auth.users` et `public.profiles` (ordre de migrations). Prévoir RLS sur `profiles` si nécessaire.

**Table `categories` / `subcategories` / `artisan_categories` / `artisan_subcategories`**
- `categories.id`, `subcategories.id` (FK → `categories.id`), `slug` uniques.
- `artisan_categories` PK composé `(artisan_id, category_id)` — FK → `artisans(id)` et `categories(id)`.
- Reco : indexer `category_id` dans `artisan_categories` si on requête catégories → artisans. Vérifier integrité referentielle lors des migrations massives (seed).

**Tables de messagerie / chat / conversations**
- `conversations`, `messages`, `chat_rooms`, `chat_messages` avec FK entre elles pour participants/messages.
- Reco : indexer `conversation_id`, `room_id`, `sender_id` et ajouter partial index sur `is_read` si besoin de requêtes non-lues fréquentes.

**Tables bookings / reviews / payments / payment_orders / payment_proofs / payments**
- `bookings` relie `client_id` → `profiles` et `artisan_id` → `artisans`.
- `reviews` a `booking_id` UNIQUE : empêche plusieurs avis par booking (vérifier que c'est voulu).
- Paiements : mélange de `uuid_generate_v4()` et `gen_random_uuid()` pour defaults.
- Reco : standardiser UUID generation (pgcrypto `gen_random_uuid()` vs `uuid-ossp`). Ajouter index sur `bookings(artisan_id, status, scheduled_date)` si recherche planning.

**Tables monétisation / promo / wallet**
- `artisan_payments`, `payment_orders`, `payment_proofs`, `promo_codes`, `referral_codes`, `wallet_transactions`.
- RLS & policies sont nécessaires (déjà présents dans d'autres scripts). Exemple : policies `Users can view own wallet transactions`.
- Reco : indexer `user_id`/`artisan_id` dans transactions, ajouter unique/constraints business (par ex. `promo_codes.code` UNIQUE déjà présent).

**Tables RFQ / bids / sponsored / sponsorship_campaigns**
- `rfq_posts`, `rfq_bids` — prévoir index sur `category_id`, `status`, `created_at`.
- `sponsored_items` / `sponsored_ads` : vérifier TTL / expiration automatique pour `end_at`.

**Tables qualification & profiling**
- `qualification_templates` et `qualification_answers` (answers has UNIQUE on `artisan_id`).

**Audit / Notifications / Profile Views / Lead Clicks**
- `audit_logs` (FK → `auth.users`), `notifications` (FK → `profiles`), `profile_views`, `lead_clicks`.
- Reco : partitionnement temporel ou TTL pour tables volumineuses comme `profile_views` si trafic important.

---

Observations transverses et points d'attention
- UUID generation : le schéma mélange `uuid_generate_v4()` et `gen_random_uuid()`. Choisir une méthode et documenter l'extension requise (`uuid-ossp` vs `pgcrypto`).
- Ordre de création / FK cycles : plusieurs FK pointent vers `auth.users` et `profiles`. Les migrations doivent gérer l'ordre (créer `auth.users` puis `profiles` puis `artisans`).
- Indexes manquants : beaucoup de FK semblent ne pas avoir d'index dédiés (Postgres crée des indexes pour PK/UNIQUE, mais pas pour FK). Ajouter index pour : `bookings.artisan_id`, `profile_views.artisan_id`, `lead_clicks.artisan_id`, `rfq_posts.category_id`, `artisan_categories.category_id`, `artisans.city_id`, etc.
- `updated_at` fields : plusieurs tables ont `updated_at` par défaut à `now()` mais sans trigger pour maintenir la valeur à chaque UPDATE — prévoir trigger commun pour `updated_at`.
- CHECKs & enums : le schéma utilise des CHECK(...) = ANY(ARRAY[...]) — ok, mais envisager `CREATE TYPE` pour les énumérations si stabilité et réutilisation souhaitées.
- RLS / policies : le projet utilise RLS dans d'autres scripts ; vérifier que pour chaque table sensible (payments, artisan_payments, subscriptions, profile_views, wallet_transactions, notifications) il existe des policies appropriées.
- Seeds & idempotence : les scripts de seed semblent massifs; rendre les migrations idempotentes (ex: `CREATE TABLE IF NOT EXISTS`, `INSERT ... ON CONFLICT DO NOTHING`) pour faciliter déploiements.

Recommandations concrètes (prioritaires)
1. Standardiser la génération UUID (`gen_random_uuid()` recommandé si `pgcrypto` disponible) et mettre la dépendance dans la doc/migration.
2. Ajouter indexes sur FK et colonnes filtrées fréquemment (liste ci-dessus).
3. Ajouter trigger `set_updated_at()` pour maintenir `updated_at` sur UPDATE.
4. Vérifier et documenter la séquence de migration (auth schema → profiles → artisans → autres tables) pour éviter erreurs FK.
5. Rendre les seeding scripts idempotents et éviter les blocs `DO $$` dans migrations si des formatters risquent de casser les délimiteurs.
6. Écrire tests d'intégrité (pgTAP) et exécuter les migrations sur une base Postgres éphémère (docker) avant déploiement.

Commandes rapides pour tester localement (Docker + psql)
```bash
# run postgres
docker run --name artisans-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15

# copy / run schema (exemple)
PGPASSWORD=postgres psql -h localhost -U postgres -f artisans_platform_docs/22_SQL_TAXONOMY_CANONICAL_MIGRATION.sql

# run seeds incrementally (ex: categories)
PGPASSWORD=postgres psql -h localhost -U postgres -f artisans_platform_docs/11_CATEGORIES_EXHAUSTIVE.sql

# optionally run pgTAP tests (install pgTAP in the container or run a test image)
```

Prochaines étapes que je peux prendre pour toi
- Générer automatiquement une liste d'indexes recommandés et un patch de migration (`ALTER TABLE ... ADD INDEX`) prêt à appliquer.
- Produire un script de création de trigger `set_updated_at()` et l'ajouter au dossier `migrations/`.
- Exécuter les migrations/seed dans une base Postgres Docker et signaler erreurs.

Dis-moi quelle action tu veux que je fasse en premier ; je peux :
- créer les migrations d'indexes recommandés,
- créer le trigger `updated_at`, ou
- exécuter le schéma en local (docker) et te rendre un rapport d'erreurs.
