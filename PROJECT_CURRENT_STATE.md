# ArtyLink — Etat Courant du Projet

Derniere mise a jour: 2026-05-08

Ce fichier remplace les anciens prompts/plans eparpilles. Pour toute reprise, lire dans cet ordre:

1. `AGENTS.md`
2. `HANDOFF.md`
3. `PROMPT_AGENT_SPRINT_FINAL_PART2.md`
4. `artylink.sql`
5. `PROJECT_CURRENT_STATE.md`
6. `41_ARTYLINK_BUSINESS_RULES.md`

## Source de verite

- Schema DB strict: `artylink.sql`
- Continuite agent: `HANDOFF.md` et `PROMPT_AGENT_SPRINT_FINAL_PART2.md`
- Regles metier: `41_ARTYLINK_BUSINESS_RULES.md`
- Ne jamais supposer un chemin local fixe: le projet est souvent duplique.

## Position Produit

ArtyLink est une plateforme de contact, cartes de visite publiques, recherche locale et visibilite payante.

ArtyLink vend:

- visibilite dans les recherches
- cartes artisans mises en avant
- campagnes sponsorisees
- banniere publicitaire style Alibaba
- portfolio et presence locale

ArtyLink ne vend pas:

- certification qualite
- garantie anti-arnaque
- arbitrage de conflits
- gestion de contrats ou devis

## Plans et Mapping DB

Le marketing peut afficher `Basique`, `Starter`, `Pro`.

Tant que `artylink.sql` reste strict, le code doit ecrire:

- `Basique` -> `subscriptions.plan_type = free` -> `artisans.subscription_tier = free`
- `Starter` -> `subscriptions.plan_type = starter` -> `artisans.subscription_tier = premium`
- `Pro` -> `subscriptions.plan_type = pro` -> `artisans.subscription_tier = vip`

Ne pas ecrire `basic`, `starter` ou `pro` dans `artisans.subscription_tier`.

## Homepage Active

La homepage active est `src/app/page.tsx`.

Composants actifs:

- `src/components/shared/navbar.tsx`
- `src/components/shared/CategoryNavBar.tsx`
- `src/components/shared/MegaMenu.tsx`
- `src/components/features/PromoBanner.tsx`
- `src/components/features/TrustBar.tsx`
- `src/components/features/ArtisanAnnonces.tsx`
- `src/components/features/home-options.tsx`
- `src/components/shared/footer.tsx`

Logique actuelle:

- barre de recherche dans la navbar desktop
- sous-barre categories sans scroll horizontal cache
- desktop: `Toutes les categories` + mega-menu, raccourcis metier prioritaires, bouton `Plus`
- mobile/tablette: bouton `Categories` ouvrant un panneau bottom sheet avec recherche locale
- grande banniere homepage type Alibaba
- trust bar
- grille annonces artisans
- sections valeur, forfaits et CTA

Evolution voulue:

- brancher la grande banniere sur un vrai inventaire publicitaire payant
- utiliser `sponsored_items` ou une table equivalente
- gerer type, image, lien, statut, priorite, date debut, date fin, duree et ciblage

## Pages Affichables

Pages publiques:

- `/`
- `/search`
- `/recherche/[category]/[wilaya]/[commune]`
- `/artisan/[id]`
- `/pricing`
- `/onboarding/freelance`
- `/a-propos`
- `/legal`
- `/privacy`

Auth:

- `/auth/login`
- `/auth/register`
- `/auth/register-type`
- `/auth/callback`

Dashboard:

- `/dashboard`
- `/dashboard/account`
- `/dashboard/account/info`
- `/dashboard/account/portfolio`
- `/dashboard/account/referral`
- `/dashboard/account/admin-activation`
- `/dashboard/services`
- `/dashboard/subscription`
- `/dashboard/calendar`
- `/dashboard/notifications`
- `/dashboard/wallet` redirige vers `/dashboard/subscription`

Admin:

- `/admin`
- `/admin/users`
- `/admin/payments`
- `/admin/sponsoring`
- `/admin/delegates`

Messages et demandes:

- `/messages`
- `/messages/[roomId]`
- `/rfq`
- `/rfq/new`
- `/rfq/[id]`

## Etat Technique Verifie

Apres le cleanup du 2026-05-08:

- `npm run build` passe.
- `npx tsc --noEmit` passe.
- `npm run lint` passe avec 0 erreur et 43 warnings.
- `git diff --check` passe.
- `seed_100_artisans.sql` reste desynchronise du schema strict et ne doit pas etre execute tel quel.

Apres toute modification, relancer:

1. `npm run build`
2. `npx tsc --noEmit`
3. `npm run lint`
4. `git diff --check`

## Seeds et Donnees Demo

`seed_100_artisans.sql` est un seed de test uniquement.

Il doit rester aligne avec `artylink.sql`:

- `subscription_tier`: `free`, `premium`, `vip`
- `review_count`, pas `reviews_count`
- ne pas inserer de colonne absente comme `status`

Ne pas executer un seed sans verifier ces contraintes.
