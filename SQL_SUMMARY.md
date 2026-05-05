# Résumé des fichiers SQL

Ce document liste et résume rapidement les fichiers SQL présents dans le dépôt (migrations, seeds, RLS, triggers, index, geonormalisation, paiements, premium features).

- `11_CATEGORIES_EXHAUSTIVE.sql` : seed complet des `categories` et `subcategories` (inserts massifs pour la taxonomie).
- `12_SQL_TRIGGER_REGISTRATION.sql` : triggers / logique d'insertion lors de l'enregistrement (profiles → artisans, catégories, sous-categories).
- `13_SQL_REVIEWS_FOLLOWERS_SPONSORS.sql` : tables `reviews`, `followers`, `sponsorship_campaigns`; triggers pour approbation d'avis; RLS pour lecture/écriture.
- `15_SQL_AVATARS_PORTFOLIOS_STATUS.sql` : modifications de schéma (`profiles`, `artisans`) + policies de `storage.objects` pour avatars et portfolios (upload/update/delete/public read).
- `16_SQL_CHAT_MESSAGERIE.sql` : tables `conversations`, `messages`; index; triggers (mise à jour `updated_at`); policies RLS pour participants.
- `17_SQL_RESERVATIONS_BOOKINGS.sql` : schéma pour réservations / bookings (création de la table, index, RLS probable).
- `18_SQL_FINAL_DB_SEARCH_ET_AUTRES.sql` : tables utilitaires (availability_slots, favorites, etc.) et index liés à la recherche et la disponibilité.
- `20_SQL_TRIGGER_UPDATE_CATEGORIES.sql` : script d'insertion lié à l'inscription (INSERT dans `profiles`, `artisans`, `artisan_categories`, `artisan_subcategories`).
- `21_SQL_STORAGE_BUCKETS.sql` : création / seed des `storage.buckets` (avatars, portfolios) et policies détaillées pour accès public et opérations utilisateur.
- `22_SQL_TAXONOMY_CANONICAL_MIGRATION.sql` : migration canonique de la taxonomie (création tables, index, inserts massifs `categories`/`subcategories`).
- `30_WEB_RESET.sql` / `31_WEB_SCHEMA.sql` / `32_WEB_SEED.sql` : scripts schema/reset et seed pour l'instance web (schema complet + seeds de données).
- `33_WEB_FAKE_DATA.sql` : seeds de données factices pour développement (utilisateurs, artisans, bookings, reviews...).
- `35_SQL_GEO_NORMALIZATION_AND_SEARCH.sql` : création de `algeria_cities`, normalisation géo, index (wilaya, commune, trigram), ajouts/alter sur `artisans` pour support géographique et indexes de recherche (trgm).
- `35_WEB_PREMIUM_FEATURES.sql` : schéma et policies pour fonctionnalités premium (subscriptions, artisan_portfolios, chat_rooms/messages, rfq posts/bids, notifications) + triggers qui insèrent notifications.
- `36_WEB_FAKE_PREMIUM_DATA.sql` : seeds factices pour les fonctionnalités premium (subscriptions, portfolios, rfq, chat messages).
- `37_MONETIZATION_SCHEMA.sql` : tables `artisan_payments`, `profile_views`, `lead_clicks`; activation RLS et policies pour lecture/insertion selon `auth.uid()` et rôle.
- `37_SQL_QUALIFICATION_QUESTIONS.sql` : templates de qualification + réponses, seeds d'exemples; RLS pour templates/answers (lecture publique selon règles).
- `38_SQL_ALGERIA_PAYMENTS.sql` : schéma paiements local (wallet_transactions, payment_orders, payment_proofs, promo_codes, referral_codes), indexes et policies RLS pour isolation utilisateur.
- `41_SQL_REGISTRATION_PROFILE_DETAILS.sql` : extension de l'inscription avec `first_name`, `last_name`, `age`, `wilaya`, `commune`, `profession`, `specialties` et trigger auth mis a jour pour remplir `profiles` et `artisans`.
- `algeria_cities.sql` / `algeria_cities_postgres.sql` : jeux de données des villes wilaya/communes (import CSV/SQL pour table `algeria_cities`).
- `migrations/` : scripts de migration structurés (ex: `001_create_artisan_categories.sql`) avec CREATE TABLE, INDEX et policies RLS.
- `artisans_web/sql/*` : SQL spécifiques au frontend web (sponsored items, seeds étendus, etc.).

Observations générales :

- Le projet utilise largement Row-Level Security (RLS) : la plupart des tables métier ont `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` et policies explicites (lecture/insert/update) basées sur `auth.uid()` ou rôles.
- Usage fort de Supabase `storage.objects` policies pour gérer avatars et portfolios.
- Plusieurs scripts sont des seeds (fake data / premium data / catégories) — utiles pour dev/local.
- Indexs de recherche (trigrammes, GIN/GIST) et tables de normalisation géographique (pour recherche locale par wilaya/commune).
- Triggers pour notifications et mise à jour des timestamps (`trg_touch_*`, `trg_after_insert_rfq_bid`, etc.).

Prochaine étape possible : générer un résumé détaillé fichier-par-fichier (extraits des CREATE TABLE, colonnes clés, policies associées). Dis-moi si tu veux ce détail et je le produis dans `artisans_platform_docs/SQL_SUMMARY_DETAILED.md`.
