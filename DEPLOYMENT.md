# Déploiement ArtyLink

## Variables d'environnement requises

### Application
- `NEXT_PUBLIC_SITE_URL`
  URL canonique de l'application. Exemple: `https://artylink.com`
- `NEXT_PUBLIC_SUPABASE_URL`
  URL du projet Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  Clé anonyme publique utilisée par le client web et le SSR.
- `SUPABASE_SERVICE_ROLE_KEY`
  Clé serveur requise pour les actions admin, le sponsoring, certains accès serveur et les tâches planifiées. Ne jamais la préfixer avec `NEXT_PUBLIC_`.
- `CRON_SECRET`
  Secret Bearer attendu par `src/app/api/cron/route.ts` pour autoriser l'appel Vercel Cron.

### E2E optionnelles
- `E2E_BASE_URL`
  URL d'une instance déjà démarrée. Si absente, Playwright tente de lancer `npm run dev`.
- `E2E_CLIENT_EMAIL`
  Compte client de test pour les scénarios réservation et messagerie.
- `E2E_CLIENT_PASSWORD`
  Mot de passe du compte client de test.
- `E2E_ARTISAN_PATH`
  Route absolue ou relative d'une fiche artisan exploitable en test. Exemple: `/artisan/uuid`.
- `E2E_REGISTER_EMAIL`
  Adresse forcée pour le scénario d'inscription si l'on ne veut pas générer d'email jetable.
- `E2E_REGISTER_PASSWORD`
  Mot de passe utilisé pour le scénario d'inscription.

## Pré-requis plateforme

1. Créer le projet Supabase et renseigner les variables ci-dessus dans Vercel.
2. Vérifier l'existence des tables utilisées par l'application: `profiles`, `artisans`, `bookings`, `chat_rooms`, `chat_messages`, `wallet_transactions`, `sponsored_items`, `promo_codes`.
3. Vérifier les buckets Supabase nécessaires:
   `demos`, `chat-media`, ainsi que ceux utilisés pour avatar/portfolio si activés dans l'instance.
4. Activer Supabase Realtime sur `chat_messages`.
5. Configurer le cron Vercel sur `/api/cron` avec le header `Authorization: Bearer ${CRON_SECRET}`.

## Build production

1. Installer les dépendances:
   `npm install`
2. Générer les types Next + vérifier le typage:
   `npm run build`
3. Rejouer le typecheck si nécessaire après génération de `.next/types`:
   `npx tsc --noEmit`
4. Démarrer localement pour validation:
   `npm run start`

## GitHub release checklist

État observé en local au 2026-05-05:
- aucun remote GitHub n'est configuré (`git remote -v` vide)
- le worktree global est très chargé; vérifier le périmètre exact avant tout commit massif

Procédure recommandée:
1. Vérifier le remote:
   `git remote -v`
2. Si absent, ajouter le dépôt GitHub cible:
   `git remote add origin <URL_GITHUB_DU_REPO>`
3. Vérifier la branche courante:
   `git branch --show-current`
4. Relire le diff réellement voulu:
   `git status --short`
   `git diff -- src/ HANDOFF.md PROMPT_AGENT_SPRINT_FINAL_PART2.md DEPLOYMENT.md next.config.ts`
5. Ajouter uniquement le périmètre validé:
   `git add src/ HANDOFF.md PROMPT_AGENT_SPRINT_FINAL_PART2.md DEPLOYMENT.md next.config.ts 44_SQL_ADMIN_DELEGATES.sql 45_SQL_ADMIN_DELEGATE_REVOKE_RPC.sql 46_SQL_ADMIN_DELEGATE_ACTIVATION.sql`
6. Créer un commit clair:
   `git commit -m "Finalize admin delegates, account flow, and deployment docs"`
7. Pousser sur GitHub:
   `git push -u origin <branche>`

Ne pas pousser avant d'avoir confirmé:
- le repo GitHub cible
- la branche voulue (`main`, `master`, `develop` ou feature branch)
- les fichiers hors périmètre à exclure du commit

## Tests E2E

1. Installer les dépendances:
   `npm install`
2. Installer le navigateur Chromium localement si nécessaire:
   `npx playwright install chromium`
3. Vérifier la détection des specs:
   `npx playwright test --list`
4. Lancer le smoke test non mutatif du carousel:
   `npx playwright test tests/e2e/sponsoring.spec.ts --reporter=list`
5. Lancer la suite complète sur une instance de test avec variables `E2E_*` configurées:
   `npm run test:e2e`

## Vérifications post-déploiement

1. Ouvrir `/`, `/auth/login`, `/dashboard/account`, `/messages` et `/admin/sponsoring`.
2. Vérifier que le carousel premium s'affiche sans erreur.
3. Vérifier qu'un code promo crédite bien `wallet_transactions`.
4. Vérifier que la recherche artisan du sponsoring admin remplit bien un lien `/artisan/[uuid]`.
5. Vérifier que `/api/cron` refuse une requête sans `CRON_SECRET`.
