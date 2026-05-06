# PROMPT DE CONTINUITÉ — ARTYLINK MAINTENANCE & SCALE — MISE À JOUR

## ÉTAT DE REPRISE PRIORITAIRE — 2026-05-06

### Source de vérité unique
- Le seul repo de travail à utiliser est :
  - `/Users/mac/Downloads/file 18/artisans_platform_docs/artisans_web`
- Il est branché directement sur :
  - `https://github.com/cferdjani/artylink.git`
- Ne plus utiliser le dossier bureau `artylink-deploy`.
- Une sauvegarde existe encore :
  - `/Users/mac/Downloads/file 18/artisans_platform_docs/artisans_web_backup_2026-05-06`
- Ne pas la supprimer tant que les derniers tests UI ne sont pas confirmés.

### État réel atteint
- Le flux délégué avec code a été retesté manuellement et fonctionne.
- `src/app/dashboard/account/admin-activation/page.tsx` contient le correctif qui redirige un delegate actif vers sa vraie landing page permissionnelle au lieu de forcer `/admin`.
- La page notifications a été refactorée pour utiliser :
  - `src/app/dashboard/notifications/components/NotificationsPageClient.tsx`
- Fonctionnalités notifications désormais codées :
  - cases à cocher
  - suppression multiple
  - filtre `Masquer les lus`
  - suppression rapide unitaire dans le dropdown de la cloche
- Fonctionnalité messages désormais codée :
  - filtre `Masquer les messages lus`
- Le provider notifications expose maintenant aussi :
  - `removeNotifications(ids: string[])`
- Le commit poussé sur GitHub en fin de session est :
  - `40be873 Add notification selection filters`
- Vercel doit déployer ce commit sur :
  - `artylink-web`

### Fichiers critiques modifiés le 2026-05-06
- `src/app/dashboard/account/admin-activation/page.tsx`
- `src/app/dashboard/notifications/page.tsx`
- `src/app/dashboard/notifications/components/NotificationsPageClient.tsx`
- `src/app/messages/page.tsx`
- `src/app/messages/MessagesPageClient.tsx`
- `src/components/notifications/NotificationProvider.tsx`
- `src/lib/actions/notifications.ts`
- `HANDOFF.md`
- `PROMPT_AGENT_SPRINT_FINAL_PART2.md`

### Validations réellement faites
- `git diff --check` : OK
- vérification repo :
  - `git rev-parse --show-toplevel`
  - `git remote -v`
  - `git status`
  - `git log -1 --oneline`
- le clone propre actuel n'a pas `node_modules`, donc :
  - `npm run build`
  - `npx tsc --noEmit`
  - `npx eslint ...`
  n'ont pas été relancés ici

### Priorité de reprise
1. Vérifier le déploiement Vercel du commit `40be873`.
2. Tester en production privée :
   - notifications sélection/suppression
   - filtre `Masquer les lus`
   - filtre `Masquer les messages lus`
3. Mettre à jour `HANDOFF.md` et ce prompt avec les résultats réels du test live.

## ÉTAT DE CLÔTURE INTERMÉDIAIRE — 2026-05-05

### État réel à la reprise
- `npm run build` passe.
- `npx tsc --noEmit` passe après génération de `.next/types`.
- `npx playwright test tests/e2e/sponsoring.spec.ts --reporter=list` passe.
- Le login owner ne doit plus passer par `/dashboard` :
  - `oucher007@gmail.com` doit arriver directement sur `/admin`
- Le warning Next `workspace root` a été traité via `outputFileTracingRoot`.
- Les logs applicatifs ne doivent plus re-logger les erreurs attendues `DYNAMIC_SERVER_USAGE`.

### Fichiers critiques modifiés le 2026-05-05
- `src/lib/auth/redirect.ts`
- `src/app/auth/login/page.tsx`
- `src/app/auth/callback/route.ts`
- `src/lib/actions/admin-delegates.ts`
- `src/app/admin/delegates/AdminActivationClient.tsx`
- `src/app/dashboard/notifications/components/NotificationList.tsx`
- `src/components/notifications/NotificationBell.tsx`
- `src/app/dashboard/account/account-data.ts`
- `src/app/dashboard/account/AccountTabsClient.tsx`
- `src/lib/next-runtime.ts`
- `src/app/layout.tsx`
- `src/app/PremiumMarqueeContainer.tsx`
- `next.config.ts`
- `DEPLOYMENT.md`

### Règles de reprise importantes
- Ne pas réintroduire une redirection owner vers `/dashboard` après login.
- Ne pas remettre une redirection statique delegate vers `/admin` après activation.
- Ne pas retirer `outputFileTracingRoot`.
- Ne pas re-logguer `DYNAMIC_SERVER_USAGE` comme incident applicatif normal.
- Se souvenir que `npx tsc --noEmit` dépend ici de `.next/types`; rejouer un build si nécessaire avant de conclure à une panne TypeScript.

### Déploiement GitHub — état réel
- `git remote -v` est vide dans cette session.
- Aucun push GitHub n'a été réalisé.
- Toute reprise qui promet un déploiement GitHub doit d'abord :
  1. confirmer le repo cible
  2. ajouter le remote
  3. sélectionner le périmètre exact à commit

### Résidus encore connus
- warnings ESLint `no-explicit-any` dans :
  - `src/app/layout.tsx`
  - `src/app/PremiumMarqueeContainer.tsx`
- SQL `44`, `45`, `46` non reconfirmés explicitement comme exécutés dans cette session

## CONSOLIDATION DE CONTINUITÉ — 2026-05-01

### Correctif complémentaire — Notifications d'invitation admin + page d'activation
- Le repo contient maintenant une vraie route :
  - `src/app/dashboard/account/admin-activation/page.tsx`
- Cette route ne doit PAS rester ouverte au owner :
  - `owner` -> redirection vers `/admin/delegates`
  - `delegate` déjà actif -> redirection vers `/admin`
  - seuls les comptes réellement en attente d'activation doivent y rester
- Cette route réutilise :
  - `src/app/admin/delegates/AdminActivationClient.tsx`
- Le composant d'activation a été simplifié :
  - champ de code secret visible directement
  - bouton `Refuser`
  - bouton `Activer mon accès`
- `src/lib/actions/admin-delegates.ts` expose maintenant :
  - `getDelegateInvitationState()`
- `src/app/dashboard/account/page.tsx` repose sur cet état structuré pour afficher la bannière d'invitation
- Les notifications affichent maintenant un CTA explicite `Voir l'invitation` dans :
  - `src/app/dashboard/notifications/page.tsx`
  - `src/app/dashboard/notifications/components/NotificationList.tsx`
  - `src/components/notifications/NotificationBell.tsx`
- IMPORTANT :
  - `createDelegate(...)` et `regenerateDelegateSecret(...)` créent maintenant une notification `sys` avec `link_url = /dashboard/account/admin-activation`
  - si les notifications d'invitation n'apparaissent pas en live, vérifier en priorité l'insertion dans `notifications`
- Validation réellement faite :
  - `npx eslint src/lib/actions/admin-delegates.ts src/app/admin/delegates/AdminActivationClient.tsx src/app/dashboard/account/admin-activation/page.tsx src/app/dashboard/account/page.tsx src/app/dashboard/notifications/page.tsx src/app/dashboard/notifications/components/NotificationList.tsx src/components/notifications/NotificationBell.tsx`
  - résultat : OK
- Risques encore ouverts :
  - test navigateur manuel non relancé dans cette session
  - exécution de `46_SQL_ADMIN_DELEGATE_ACTIVATION.sql` non reconfirmée explicitement dans cette session
  - si un user voit encore `404`, vérifier que le build local a bien recompilé la nouvelle route
- Correctif additionnel important :
  - l'activation delegate ne doit jamais forcer une redirection statique vers `/admin`
  - un délégué peut être activé sans `can_view_dashboard`
  - `respondToDelegateInvitation(...)` renvoie maintenant `redirectPath`
  - `AdminActivationClient.tsx` doit continuer à utiliser ce chemin calculé
  - ne pas revenir à une redirection forcée vers `/admin`

### Résumé technique prioritaire
- Deux blocs métier ont été fortement modifiés dans cette conversation :
  1. `dashboard/account` + `dashboard/account/info` + réutilisation de la fiche d'inscription
  2. système admin séparé `owner/delegate`
- Toute reprise doit préserver ces deux décisions.

### État réel synthétique
- Le profil utilisateur modifiable est désormais aligné sur les données de première inscription.
- `Mon Compte` et `Modifier` doivent afficher et éditer la même donnée.
- Les champs d'inscription enrichis sont déjà intégrés dans le schéma et la logique profil.
- Le système admin permissionnel `owner/delegate` est codé dans le repo.
- Le SQL admin existe mais n'a pas encore été exécuté.

### Source de vérité métier à préserver
- `profiles.role` = rôle métier uniquement :
  - `client`
  - `artisan`
- Les droits admin ne doivent PAS dépendre de `profiles.role`.
- L'inscription reste la source initiale des données perso/pro.
- La page `Modifier` ne doit jamais redevenir un formulaire divergent de `Mon Compte`.

### Chantiers déjà modifiés dans cette conversation

#### 1. Compte / inscription / édition profil
- Fichiers critiques :
  - `src/app/dashboard/account/account-data.ts`
  - `src/app/dashboard/account/page.tsx`
  - `src/app/dashboard/account/info/page.tsx`
  - `src/components/forms/account-info-form.tsx`
  - `src/lib/actions/profile.ts`
- Contraintes :
  - ne pas forcer de ressaisie inutile
  - ne pas dissocier lecture `Mon Compte` et préremplissage `Modifier`
  - préserver la compatibilité schéma live Supabase

#### 2. Admin owner/delegate
- Fichiers critiques :
  - `44_SQL_ADMIN_DELEGATES.sql`
  - `src/lib/auth/admin-access.ts`
  - `src/lib/auth/require-admin.ts`
  - `src/lib/actions/admin-delegates.ts`
  - `src/app/admin/delegates/page.tsx`
  - `src/app/admin/delegates/AdminDelegatesClient.tsx`
  - `src/components/admin/AdminNavigation.tsx`
  - `src/app/admin/layout.tsx`
- Contraintes :
  - garder `oucher007@gmail.com` comme fallback owner
  - ne pas réintroduire `role = admin`
  - `/admin/delegates` doit rester owner-only
  - les permissions par route doivent rester actives
  - conserver la version défensive de `src/lib/actions/admin-delegates.ts` sur le chargement des profils delegates

#### 3. Audit trail admin
- Nouveau fichier critique :
  - `src/lib/actions/admin-audit.ts`
  - `src/lib/auth/admin-audit-signature.ts`
- Règle actuelle :
  - les mutations admin doivent être journalisées dans `admin_audit_logs`
  - le `payload` doit conserver une signature d'acteur :
    - `user_id`
    - `email`
    - `full_name`
    - `admin_type`
    - `is_owner`
    - `profile_role`
- Déjà branché sur :
  - gestion delegates
  - approbation/rejet paiements
  - mutations sponsoring
- Ne pas supprimer ou contourner cette couche de traçabilité sans mécanisme équivalent.
- Contrainte Next.js :
  - ne pas exporter de helper synchrone depuis un fichier `use server`
  - `buildAdminActorSignature(...)` vit maintenant dans `src/lib/auth/admin-audit-signature.ts`

#### 4. Optimisation suppression delegate
- Nouveau fichier SQL :
  - `45_SQL_ADMIN_DELEGATE_REVOKE_RPC.sql`
- Objectif :
  - rendre `revokeDelegate(...)` plus rapide
  - exécuter suppression `admin_permissions` + `admin_accounts` + audit en une seule RPC SQL
- État actuel :
  - le code tente déjà la RPC
  - fallback automatique si la fonction SQL n'est pas encore déployée
- Conséquence :
  - sans exécution du SQL `45_SQL_ADMIN_DELEGATE_REVOKE_RPC.sql`, le système reste fonctionnel mais plus lent
  - après exécution, la suppression delegate doit devenir plus rapide

### Bug déjà observé sur delegates
- Symptôme déjà vu :
  - `Impossible de charger les profils admin: TypeError: fetch failed`
- Un correctif défensif a déjà été appliqué dans :
  - `src/lib/actions/admin-delegates.ts`
- Ne pas réintroduire une version fragile du chargement qui fait tomber toute la page si la requête `profiles` échoue ponctuellement.

### Bug UI déjà observé sur suppression delegate
- Symptôme déjà vu :
  - suppression confirmée
  - page erreur admin avec :
    - `mutationKey is not defined`
  - refresh manuel ensuite montrait que la suppression DB avait bien eu lieu
- Correctif déjà appliqué :
  - `src/app/admin/delegates/AdminDelegatesClient.tsx`
  - usage de `activeMutationKey`
  - retrait optimiste du délégué côté état local
- Ne pas revenir à une version dépendante d'une variable hors scope dans la modale de confirmation.

### Bug build déjà observé sur audit admin
- Symptôme déjà vu :
  - `Server Actions must be async functions`
- Cause déjà identifiée :
  - helper synchrone exporté depuis `src/lib/actions/admin-audit.ts`
- Correctif déjà appliqué :
  - extraction dans `src/lib/auth/admin-audit-signature.ts`
- Ne pas réintroduire ce pattern.

#### 5. Couche d'activation Delegates
- Nouveau fichier SQL :
  - `46_SQL_ADMIN_DELEGATE_ACTIVATION.sql`
- Mécanique :
  - `admin_accounts` dispose maintenant d'un `activation_status` (`pending`, `active`, `declined`).
  - `admin_delegate_secrets` stocke un hash du code pour activer.
- Nouvelles interfaces :
  - Côté owner : la modale affiche le code d'activation 1 seule fois. Le owner a un bouton pour "Régénérer le code".
  - Côté user : une page `/dashboard/account/admin-activation` permet de refuser ou d'activer directement avec saisie visible du code.
- Modèle d'Audit :
  - `admin-delegates.ts` a été refactoré pour utiliser l'existant `appendAdminAuditLog` et conserver les `actor_signature`.
- La bannière `Mon Compte` pointant vers `/dashboard/account/admin-activation` est maintenant en place.
- Une notification `sys` vers cette même route est maintenant créée à l'invitation et à la régénération du code.

### Ce qui n'est PAS encore validé end-to-end
- `44_SQL_ADMIN_DELEGATES.sql` non exécuté
- `45_SQL_ADMIN_DELEGATE_REVOKE_RPC.sql` non exécuté
- `46_SQL_ADMIN_DELEGATE_ACTIVATION.sql` non exécuté
- validation navigateur réelle de `/admin/delegates` non faite
- tests delegate réels non faits
- typecheck global encore non vert à cause de dette antérieure sur `dashboard/account/*`
- suite Playwright complète encore non stabilisée

### Priorités réelles pour le prochain agent
1. Exécuter `44_SQL_ADMIN_DELEGATES.sql`, `45_SQL_ADMIN_DELEGATE_REVOKE_RPC.sql`, et `46_SQL_ADMIN_DELEGATE_ACTIVATION.sql`.
2. Tester le flux complet owner/delegate : création, notification visible, ouverture de `/dashboard/account/admin-activation`, saisie du code, acceptation user avec code.
3. Vérifier les refus, régénérations, désactivations, et le comportement de la notification après chaque action.
4. Vérifier le flux `Mon Compte` / `Modifier` sur un vrai artisan.
5. Corriger les erreurs TypeScript restantes hors patch admin.
6. Stabiliser la suite E2E complète.

### Interdictions explicites
- Ne pas supprimer des fallbacks DB juste parce qu'ils semblent redondants.
- Ne pas remplacer brutalement la logique `account-data.ts` sans vérifier l'impact sur `Mon Compte` et `Modifier`.
- Ne pas supprimer le fallback owner email.
- Ne pas nettoyer le système admin en retirant des couches sans validation du live DB.
- Ne pas déclarer le chantier admin “fini” tant que SQL + tests owner/delegate ne sont pas validés.

### Mise à jour de fin de session obligatoire
- Mettre à jour `HANDOFF.md`
- Mettre à jour `PROMPT_AGENT_SPRINT_FINAL_PART2.md`
- Mentionner explicitement :
  - l'état réel atteint
  - les fichiers modifiés
  - les SQL exécutés ou non exécutés
  - les validations lancées ou non lancées
  - les risques restants
  - les prochaines étapes concrètes

## MISE À JOUR MAJEURE — 2026-04-28 — ADMIN DÉLÉGUÉS OWNER-CONTROLLED

### État réel à la reprise
- Le MVP `owner + delegates` a été codé.
- Les droits admin ne doivent plus être pensés via `profiles.role`.
- Le fallback owner par email `oucher007@gmail.com` reste actif.
- Les permissions modules livrées sont :
  - `can_view_dashboard`
  - `can_manage_users`
  - `can_manage_payments`
  - `can_manage_sponsoring`
  - `can_manage_support_logs`

### Fichiers nouveaux / critiques de ce chantier
- `44_SQL_ADMIN_DELEGATES.sql`
- `src/lib/actions/admin-delegates.ts`
- `src/app/admin/delegates/page.tsx`
- `src/app/admin/delegates/AdminDelegatesClient.tsx`

### Fichiers modifiés critiques
- `src/lib/auth/admin-access.ts`
- `src/lib/auth/require-admin.ts`
- `src/app/admin/layout.tsx`
- `src/components/admin/AdminNavigation.tsx`
- `src/app/admin/page.tsx`
- `src/app/admin/users/page.tsx`
- `src/app/admin/payments/page.tsx`
- `src/app/admin/sponsoring/page.tsx`
- `src/lib/actions/users-admin.ts`
- `src/lib/actions/payments-admin.ts`
- `src/lib/actions/sponsoring-admin.ts`

### Modèle actuellement attendu
- `profiles.role` reste métier uniquement :
  - `client`
  - `artisan`
- Nouveau modèle admin séparé :
  - `admin_accounts`
  - `admin_permissions`
  - `admin_audit_logs`
- Hiérarchie v1 :
  - `owner`
  - `delegate`
- Seul le `owner` peut :
  - créer un delegate
  - modifier ses permissions
  - l'activer / désactiver
  - supprimer son accès admin sans supprimer l'utilisateur

### État SQL
- Le fichier `44_SQL_ADMIN_DELEGATES.sql` a été ajouté.
- Il N'A PAS été exécuté depuis cette session.
- Avant toute validation fonctionnelle du système delegates, exécuter ce SQL dans Supabase.

### Résolution d'accès désormais attendue
1. fallback owner email
2. `admin_accounts.admin_type = owner`
3. `admin_accounts.admin_type = delegate`

### Guards déjà branchés
- `/admin` → `can_view_dashboard`
- `/admin/users` → `can_manage_users`
- `/admin/payments` → `can_manage_payments`
- `/admin/sponsoring` → `can_manage_sponsoring`
- `/admin/delegates` → owner only

### Contraintes importantes à préserver
- Ne pas réintroduire `profiles.role = admin` comme source principale d'autorisation.
- Ne pas ouvrir la gestion des delegates à un delegate.
- Ne pas supprimer le fallback owner email tant que la migration n'est pas validée en prod.
- Ne pas casser les flux `Mon Compte`, `Modifier`, inscription, sponsoring admin ou paiements admin.

### Validation réellement faite
- `eslint` ciblé sur tous les fichiers du patch admin : OK
- `tsc --noEmit` global : encore en échec, mais uniquement sur dette préexistante `dashboard/account/*`
- Aucune validation navigateur automatique n'a été faite sur `/admin/delegates`

### Première priorité pour le prochain agent
1. Exécuter `44_SQL_ADMIN_DELEGATES.sql`.
2. Vérifier le compte owner réel `oucher007@gmail.com`.
3. Créer un delegate de test depuis un compte existant.
4. Valider les permissions route par route.
5. Vérifier le blocage d'un delegate désactivé.

### Fin de session obligatoire
- Mettre à jour `HANDOFF.md`
- Mettre à jour `PROMPT_AGENT_SPRINT_FINAL_PART2.md`
- Préciser :
  - SQL exécutés ou non exécutés
  - validations réellement lancées
  - routes testées
  - risques restants
  - dette restante sur `dashboard/account/*`

## CONTEXTE ET RÈGLES GLOBALES
Tu interviens sur le projet ArtyLink en phase de maintenance post Go-Live. L'architecture est **Production-Ready** (Next.js 16.2.2, React 19.2.4, Supabase SSR/JS, Tailwind v4). Le design system imposé reste **Apple Glass**.

**RÈGLES ABSOLUES (CRITIQUES) :**
1. Langage purement technique. Zéro politesse, zéro émotion, zéro introduction.
2. Ne JAMAIS utiliser `alert()` ou `console.log()` côté application (utiliser `useToast` si retour UI requis).
3. Ne JAMAIS modifier le RootLayout ou l'architecture d'authentification existante sans nécessité critique.
4. Les Server Actions utilisent `createSupabaseServerClient()`. Les Client Components utilisent `createBrowserClient()` de `@supabase/ssr`.
5. Si tu dois générer un UUID manuellement, n'utilise pas de code client `uuidv4`, laisse Supabase le gérer ou utilise `crypto`.
6. Ne pas casser les correctifs déjà appliqués sur `dashboard/account`, `sponsoring-admin`, `vercel.json`, `DEPLOYMENT.md` et la base E2E Playwright.
7. En fin de session, tu DOIS mettre à jour `HANDOFF.md` ET ce fichier `PROMPT_AGENT_SPRINT_FINAL_PART2.md` avec l'état réel atteint pendant ta session.
8. Interdiction de laisser une continuité floue : toute mise à jour de handoff doit préciser les fichiers modifiés, les validations lancées, les SQL exécutés et ce qu'il reste réellement à faire.

---

## ÉTAT RÉEL AU MOMENT DE LA REPRISE

### Mise à jour majeure — 2026-04-27 — Compte / Inscription / Profil modifiable
- Le chantier prioritaire récent concerne la cohérence entre :
  - la fiche visible dans `/dashboard/account`
  - la page `Modifier` `/dashboard/account/info`
  - les données réelles issues de l'inscription
  - le schéma live Supabase
- Attente produit formalisée :
  - si une information est visible dans `Mon Compte`, elle doit être préremplie dans `Modifier`
  - l'utilisateur client ou artisan ne doit jamais ressaisir une donnée qu'il ne souhaite pas modifier
  - pour un artisan, les informations professionnelles visibles doivent aussi être modifiables depuis `Modifier`

### Schéma DB réaligné pendant la session du 2026-04-27
- Des SQL ont été exécutés avec succès pour ajouter :
  - `profiles.first_name`
  - `profiles.last_name`
  - `profiles.age`
  - `profiles.wilaya`
  - `profiles.commune`
  - `artisans.profession`
  - `artisans.specialties`
- Le trigger `handle_new_user()` a aussi été patché pour réécrire correctement ces champs à l'inscription.

### Correctifs code déjà appliqués et à préserver
- Nouveau chargeur serveur unique :
  - `src/app/dashboard/account/account-data.ts`
- Ce fichier sert maintenant de source commune pour :
  - `src/app/dashboard/account/page.tsx`
  - `src/app/dashboard/account/info/page.tsx`
- Le formulaire commun d'inscription / édition :
  - `src/components/forms/account-info-form.tsx`
  supporte maintenant :
  - les champs perso préremplis
  - les champs pro artisan préremplis
  - le mapping tolérant des taxonomies accentuées
- La Server Action :
  - `src/lib/actions/profile.ts`
  a été renforcée pour :
  - écrire dans `profiles`
  - écrire dans `artisans`
  - synchroniser `artisan_categories` et `artisan_subcategories`
  - utiliser le client admin si disponible pour contourner les blocages RLS d'écriture métier

### Cas bug confirmé et corrigé
- Des divergences existaient entre l'affichage `Mon Compte` et la page `Modifier`.
- Exemple réel observé :
  - `Mon Compte` affichait `Bouzareah`, `Électricité`, `Alger`
  - `Modifier` ouvrait avec wilaya et catégorie vides
- Cause :
  - lecture de données différente entre les deux pages
  - mapping insuffisant entre labels frontend (`Electricite`) et taxonomie DB (`Électricité`)
- Correctif appliqué :
  - source serveur unique
  - résolution métier/spécialité par normalisation de texte et slugs

### Point de contrôle obligatoire à la reprise
- Avant toute autre évolution produit, vérifier manuellement sur un vrai compte artisan :
  1. `/dashboard/account` affiche correctement les infos perso et pro
  2. le clic sur `Modifier` ouvre la même fiche préremplie
  3. la sauvegarde remet bien à jour la vue compte
  4. aucun champ déjà visible n'oblige à une ressaisie inutile

### Dette technique restante sur ce chantier
- Un audit repo ↔ schéma Supabase live reste conseillé, surtout pour :
  - `src/lib/marketplace-server-data.ts`
  - `src/lib/actions/artisan.ts`
  - les fiches publiques artisan
  - les cartes et recherches artisans
- Ne pas supposer que toutes les anciennes requêtes sont alignées tant que l'audit n'a pas été fait.

### DÉJÀ TERMINÉ

#### Tâche A : Frontend crédits & promo
- `src/app/dashboard/account/AccountTabsClient.tsx` est déjà branché sur `applyPromoCode`.
- La promo utilise `useActionState`.
- Les retours UI passent par `useToast`.
- Le solde wallet réel est affiché.
- `src/app/dashboard/account/page.tsx` charge `getWalletBalanceAndHistory()`.
- `src/lib/actions/promo.ts` a été corrigé pour écrire dans `wallet_transactions` avec :
  - `amount_dzd`
  - `transaction_type: "credit"`

#### Tâche B : UX admin auto-complétion artisan
- `src/app/admin/sponsoring/components/SponsoredCampaignForm.tsx` a été transformé en Client Component.
- La recherche artisan interactive est déjà en place.
- `src/lib/actions/sponsoring-admin.ts` expose `searchArtisansForAdmin(query)`.
- Le champ `link` s'auto-remplit avec `/artisan/[uuid]`.

#### Tâche D : Déploiement & CI/CD
- `vercel.json` a été enrichi avec :
  - cron
  - headers de sécurité
  - règles de cache
- `next.config.ts` a été nettoyé.
- `DEPLOYMENT.md` existe et documente les variables d'environnement et le processus de build.

#### Correctif dev server 404
- Un incident dev a ete observe le 2026-04-23 :
  - `localhost:3000` chargeait le `RootLayout` mais rendait la vue Next `404 This page could not be found` dans le slot principal
  - le probleme touchait aussi `/search`, `/pricing`, `/auth/login`
- Le build applicatif restait OK, donc la piste retenue est un probleme `next dev` / Turbopack dans cet environnement.
- Correctif applique :
  - `npm run dev` utilise maintenant `next dev --webpack`
  - `npm run dev:turbo` reste disponible uniquement pour debug
  - `next.config.ts` n'utilise plus `turbopack.root`
  - `allowedDevOrigins` contient `localhost` et `127.0.0.1`

#### Ajustement design typographique
- Une correction UI a ete appliquee pour calmer le rendu "trop bold" de la homepage et de la navbar.
- Fichiers touches :
  - `src/app/page.tsx`
  - `src/components/features/hero-search.tsx`
  - `src/components/shared/navbar.tsx`
  - `src/app/globals.css`
- Regle a conserver :
  - preferer `font-bold` pour les titres principaux
  - preferer `font-semibold` pour chips, badges et CTA
  - eviter `font-black` repete sur toute une page
  - conserver la direction "Apple Glass", mais avec une hierarchie typographique plus calme

#### Correctif topbar apres logout
- Un bug UX a ete corrige dans `src/components/shared/navbar.tsx`.
- Symptome :
  - apres deconnexion, la topbar pouvait continuer a afficher les items d'un utilisateur connecte jusqu'au refresh manuel
- Cause :
  - la navbar dependait seulement du prop serveur `user`
  - aucun etat local ni abonnement Supabase `onAuthStateChange`
- Correctif applique :
  - ajout d'un etat local `authUser`
  - synchronisation avec le prop serveur
  - abonnement client `supabase.auth.onAuthStateChange(...)`
  - remise a zero immediate de l'etat visuel apres `signOut`
- Regle a conserver :
  - pour toute UI auth persistante en Client Component, ne pas dependre uniquement du prop serveur initial

### PARTIELLEMENT TERMINÉ / À STABILISER

#### Tâche C : Tests E2E
- Les fichiers suivants existent déjà :
  - `playwright.config.ts`
  - `tests/e2e/auth.spec.ts`
  - `tests/e2e/booking.spec.ts`
  - `tests/e2e/messaging.spec.ts`
  - `tests/e2e/sponsoring.spec.ts`
- Le script `"test:e2e": "playwright test"` est déjà présent dans `package.json`.
- `@playwright/test@1.59.1` est installé.
- Chromium Playwright est installé.
- Validation actuelle :
  - `npx playwright test --list` : OK, 4 specs détectées
  - `npx playwright test tests/e2e/sponsoring.spec.ts --reporter=list` : OK, 1 test passé
- Les tests `auth`, `booking`, `messaging` sont mutatifs et sont protégés par variables `E2E_*`.
- Blocage restant :
  - `npx playwright test --reporter=list` complet time-out au niveau `config.webServer` dans cet environnement.
  - Les logs montrent des erreurs répétées d'assets demo Supabase en `400` pendant le run complet.

### BLOQUAGE BUILD ACTUEL
- Aucun blocage build applicatif actif.
- `npm run build` passe avec `next build --webpack`.
- `next/font/google` a été retiré de `src/app/layout.tsx`.
- `src/app/globals.css` fournit maintenant les variables typographiques système `--font-jakarta` et `--font-inter`.
- Note : `next build` sans `--webpack` a produit un panic Turbopack dans l'environnement sandbox (`binding to a port`). Le script standard `npm run build` utilise donc webpack.
- Note additionnelle : pour le developpement local, utiliser `npm run dev` et non `npm run dev:turbo` tant que le `404` global Turbopack n'est pas investigue a la racine.

---

## NOUVEL OBJECTIF PRIORITAIRE

### PRIORITÉ 1 — FINALISER PLAYWRIGHT
**Objectif** : rendre la suite E2E réellement exécutable.

1. Corriger ou remplacer les assets demo Supabase qui répondent `400`.
2. Relancer `npx playwright test --reporter=list`.
3. Vérifier que `playwright.config.ts` reste cohérent avec le projet Next.
4. Exécuter les tests mutatifs avec variables `E2E_*` sur une base de test.
5. Ajuster les specs si les labels réels ont dérivé.

### PRIORITÉ 2 — VALIDATION FINALE
**Objectif** : clôturer proprement le sprint final.

1. Vérifier `/dashboard/account` :
   - affichage solde
   - application d'un code promo
2. Vérifier `/admin/sponsoring` :
   - recherche artisan
   - remplissage auto du lien
3. Vérifier `/messages`
4. Vérifier le rendu du carousel homepage
5. Confirmer le build production
6. Verifier explicitement que la homepage ne tombe plus sur `404` en dev avec `npm run dev`

---

## EXÉCUTION RECOMMANDÉE
0. Lire `HANDOFF.md` et synchroniser ce fichier si l'état réel a déjà évolué depuis sa dernière mise à jour.
1. Stabiliser les assets demo Supabase en `400`.
2. Relancer le smoke carousel, puis la suite complète.
3. Exécuter les tests E2E mutatifs avec variables `E2E_*`.
4. Exécuter les validations manuelles, y compris le check homepage en dev webpack.
5. Relancer `npm run build` et `npx tsc --noEmit`.
6. Mettre à jour `HANDOFF.md` ET `PROMPT_AGENT_SPRINT_FINAL_PART2.md` à la fin avec l'état exact.

---

## FICHIERS CLÉS À LIRE EN PREMIER
1. `HANDOFF.md`
2. `next.config.ts`
3. `DEPLOYMENT.md`
4. `package.json`
5. `src/app/layout.tsx`
6. `src/app/globals.css`
7. `src/app/dashboard/account/AccountTabsClient.tsx`
8. `src/lib/actions/promo.ts`
9. `src/app/admin/sponsoring/components/SponsoredCampaignForm.tsx`
10. `src/lib/actions/sponsoring-admin.ts`
11. `playwright.config.ts`
12. `tests/e2e/*.spec.ts`

---

## NOUVEAU DIAGNOSTIC GLOBAL CONFIRMÉ (2026-04-25)

### État du projet
- Le projet est en production. Les parcours principaux, le SEO local et la qualité technique (Build & Lint) sont validés.
- L'UI a été affinée (affichage de l'avatar arrondi, bleu par défaut, et puce Online/Offline).

### Ce qui reste non finalise
-> **Tous les points de blocage acquisition, démo, UI de base et qualité ont été résolus.**

### Axes obligatoires pour la suite
1. **Maintenance & Monitoring** : Surveiller activement les logs (Vercel / Supabase) pour corriger les éventuels bugs remontés par les vrais utilisateurs.
2. **Acquisition & Conversion** : Accompagner les campagnes de lancement et optimiser le tunnel utilisateur si nécessaire.
3. **Features Scale** : Préparer l'itération i18n complète (Arabe) et affiner les leviers de monétisation.
4. **Tests E2E** : Terminer la configuration de la suite E2E Playwright.
5. **Enrichissement UI via Inscription** : Utiliser les champs validés de la fiche d'inscription (`age`, `wilaya`, `commune`, `profession`, `specialties`) pour enrichir les fiches publiques et cartes artisans, sans JAMAIS modifier le flux d'inscription lui-même.

---

## CONTINUITÉ TECHNIQUE — 2026-05-06

### État réel à la reprise
- Le projet est déployé en privé sur `https://artylink-web.vercel.app`.
- Le owner `oucher007@gmail.com` accède à `/admin`.
- Le flux `notification -> /dashboard/account/admin-activation -> saisie du code secret` est en place en production.
- Un bug prod a été corrigé localement : après activation d'un délégué, une bannière `An error occurred in the Server Components render` pouvait apparaître.
- Le correctif a été poussé vers le repo GitHub propre `https://github.com/cferdjani/artylink.git` avec le commit `4273b7c Fix delegate activation redirect`. La vérification restante est côté Vercel : confirmer que `artylink-web` a bien redéployé ce commit.
- Un second problème est apparu au build Vercel : `TypeError: Invalid URL` sur `/_not-found`, causé par `new URL(process.env.NEXT_PUBLIC_SITE_URL)` dans `src/app/layout.tsx` quand la variable Vercel ne contient pas une vraie URL.

### Correctif appliqué
- `src/app/layout.tsx`
  - ajout de `resolveMetadataBase()`
  - fallback sur `http://localhost:3000` si `NEXT_PUBLIC_SITE_URL` est absente ou invalide
- `src/app/admin/delegates/AdminActivationClient.tsx`
  - suppression du duo fragile `router.push(...) + router.refresh()`
  - navigation remplacée par `router.replace(...)`
- `src/lib/actions/admin-delegates.ts`
  - `respondToDelegateInvitation(...)` vérifie maintenant les erreurs Supabase au lieu de les ignorer
  - revalidation explicite des routes admin / account / notifications après activation ou refus

### Validation réellement exécutée
- `npx eslint src/app/layout.tsx`
- `npx eslint src/app/admin/delegates/AdminActivationClient.tsx src/lib/actions/admin-delegates.ts`

### Point à ne pas recasser
- Ne pas réintroduire `router.refresh()` juste après un `push/replace` dans le flux d'activation admin.
- Ne pas laisser des appels Supabase critiques sans vérification de `error` dans `respondToDelegateInvitation(...)`.

### Prochaine vérification obligatoire
1. Corriger la variable Vercel `NEXT_PUBLIC_SITE_URL` avec `https://artylink-web.vercel.app`.
2. Vérifier que Vercel `artylink-web` a bien redéployé le commit qui contient le correctif `layout.tsx`.
3. Si besoin, lancer un redeploy manuel depuis l'onglet `Deployments`.
4. Retester en prod privée avec un nouveau délégué.
5. Confirmer que l'activation n'affiche plus la bannière d'erreur RSC.
6. Confirmer la redirection finale vers la bonne route selon les permissions du délégué.
7. Si l'erreur persiste, lire les logs Vercel et récupérer le digest exact.

### Prompt opérationnel à donner au prochain agent
Avant toute action, lis `AGENTS.md`, `HANDOFF.md`, `PROMPT_AGENT_SPRINT_FINAL_PART2.md` et `DEPLOYMENT.md`. Ne réécris pas les flux existants. Préserve la séparation `profiles.role = client/artisan` et `admin_accounts = owner/delegate`. Préserve le flux `Mon Compte -> Modifier` et le système d'audit admin. La priorité est de vérifier que Vercel `artylink-web` a bien redéployé le commit `4273b7c Fix delegate activation redirect`. Ensuite, teste en production privée : création d'un nouveau délégué, notification, saisie du code, activation, redirection selon permissions, absence de bannière `Server Components render`. Termine la session en mettant à jour `HANDOFF.md` et ce prompt avec l'état réel, les fichiers touchés, les validations, les risques et les prochaines étapes.
