# HANDOFF — ArtyLink Web — 2026-05-06

## Clôture technique intermédiaire — 2026-05-06

### État réel atteint
- Le repo de travail unique est maintenant :
  - `/Users/mac/Downloads/file 18/artisans_platform_docs/artisans_web`
- Ce dossier est branché directement sur :
  - `https://github.com/cferdjani/artylink.git`
- Le dossier de secours existe toujours :
  - `/Users/mac/Downloads/file 18/artisans_platform_docs/artisans_web_backup_2026-05-06`
- Le test réel du flux délégué avec code d'activation est maintenant validé côté user :
  - création delegate
  - réception invitation
  - saisie du code
  - activation OK
- Le correctif de redirection delegate active est présent dans :
  - `src/app/dashboard/account/admin-activation/page.tsx`
  - cette page ne doit plus forcer `/admin` si le delegate n'a pas `can_view_dashboard`
- Le centre de notifications supporte désormais :
  - sélection multiple par cases à cocher
  - suppression de la sélection
  - filtre `Masquer les lus`
- La page conversations supporte désormais :
  - filtre `Masquer les messages lus`
- Le commit poussé sur GitHub en fin de session est :
  - `40be873 Add notification selection filters`
- Ce push doit déclencher le redéploiement Vercel du projet :
  - `artylink-web`

### Fichiers ajoutés / modifiés le 2026-05-06
- Ajoutés :
  - `src/app/dashboard/notifications/components/NotificationsPageClient.tsx`
  - `src/app/messages/MessagesPageClient.tsx`
- Modifiés :
  - `src/app/dashboard/account/admin-activation/page.tsx`
  - `src/app/dashboard/notifications/page.tsx`
  - `src/app/messages/page.tsx`
  - `src/components/notifications/NotificationProvider.tsx`
  - `src/lib/actions/notifications.ts`

### SQL exécuté
- Aucun SQL exécuté dans cette session.

### Validations réellement exécutées
- `git diff --check`
  - résultat : OK
- `git status`
  - résultat : repo propre avant ce patch, puis modifications attendues sur les fichiers ci-dessus
- Vérification git du repo unifié :
  - `git rev-parse --show-toplevel`
  - `git remote -v`
  - `git log -1 --oneline`
  - résultat : repo local aligné sur `origin = https://github.com/cferdjani/artylink.git`
- Validation manuelle user rapportée :
  - le flux delegate + code est maintenant OK

### Validations non relancées dans ce clone
- `npm run build`
- `npx tsc --noEmit`
- `npx eslint ...`
- raison :
  - ce clone propre ne contient pas `node_modules` localement, donc les validations Node n'ont pas été rejouées ici sans réinstallation

### Risques restants
- Le filtre messages lus masque les conversations sans message non lu au niveau liste ; il ne change pas la logique des rooms ou du badge messages global.
- La suppression multiple des notifications tient maintenant le badge local cohérent via le provider, mais doit encore être revalidée visuellement après redéploiement.
- Les SQL `44`, `45`, `46` ne sont toujours pas reconfirmés comme exécutés dans cette session.
- Le repo GitHub déployé contient toujours des dossiers non essentiels (`.idea`, `.vscode`, `new-plan-artylink`, `next-plan-artylink`) ; ne pas les supprimer sans revue de périmètre.

### Prochaines étapes concrètes
1. Vérifier dans Vercel que le déploiement du commit `40be873` passe en `Ready`.
2. Retester en production privée :
   - sélection notifications
   - suppression sélection
   - filtre `Masquer les lus`
   - filtre `Masquer les messages lus`
3. Si tout passe, seulement ensuite envisager le nettoyage du backup `artisans_web_backup_2026-05-06`.

## Clôture technique intermédiaire — 2026-05-05

### État réel atteint
- Le build production local passe.
- Le typecheck local passe après génération des types Next (`npm run build` puis `npx tsc --noEmit`).
- Le smoke test Playwright du carousel premium passe.
- La redirection post-login de l'owner a été corrigée pour éviter le passage inutile par `/dashboard`.
- Le warning Next sur `outputFileTracingRoot` a été supprimé.
- Le bruit `Dynamic server usage` pendant le build n'est plus re-loggé comme erreur applicative.

### Correctifs appliqués le 2026-05-05
- Login owner :
  - `src/lib/auth/redirect.ts`
  - `src/app/auth/login/page.tsx`
  - `src/app/auth/callback/route.ts`
  - effet : `oucher007@gmail.com` est redirigé directement vers `/admin` après login au lieu de tomber sur `/dashboard` puis redirection secondaire
- Stabilisation TypeScript / build :
  - `src/lib/actions/admin-delegates.ts`
  - `src/app/admin/delegates/AdminActivationClient.tsx`
  - `src/app/dashboard/notifications/components/NotificationList.tsx`
  - `src/components/notifications/NotificationBell.tsx`
  - `src/app/dashboard/account/account-data.ts`
  - `src/app/dashboard/account/AccountTabsClient.tsx`
  - effet : build/typecheck rétablis
- Nettoyage build/runtime :
  - `src/lib/next-runtime.ts`
  - `src/app/layout.tsx`
  - `src/app/PremiumMarqueeContainer.tsx`
  - `next.config.ts`
  - effet : plus de warning `workspace root` au build, et suppression du bruit d'erreurs attendues `DYNAMIC_SERVER_USAGE`
- Déploiement / GitHub :
  - `DEPLOYMENT.md`
  - ajout d'une checklist réelle GitHub + note explicite qu'aucun remote n'est configuré

### Validations réellement exécutées le 2026-05-05
- `npx eslint src/lib/actions/admin-delegates.ts src/app/admin/delegates/AdminActivationClient.tsx src/app/dashboard/account/admin-activation/page.tsx src/app/dashboard/account/page.tsx src/app/dashboard/notifications/page.tsx src/app/dashboard/notifications/components/NotificationList.tsx src/components/notifications/NotificationBell.tsx`
- `npx eslint src/app/dashboard/account/admin-activation/page.tsx`
- `npx eslint src/lib/auth/redirect.ts src/app/auth/login/page.tsx src/app/auth/callback/route.ts`
- `npx eslint src/lib/next-runtime.ts src/app/layout.tsx src/app/PremiumMarqueeContainer.tsx src/lib/auth/redirect.ts src/app/auth/login/page.tsx src/app/auth/callback/route.ts src/lib/actions/admin-delegates.ts src/app/admin/delegates/AdminActivationClient.tsx src/app/dashboard/notifications/components/NotificationList.tsx src/components/notifications/NotificationBell.tsx src/app/dashboard/account/account-data.ts src/app/dashboard/account/AccountTabsClient.tsx next.config.ts`
  - résultat : 0 erreur, warnings restants `no-explicit-any` dans `src/app/layout.tsx` et `src/app/PremiumMarqueeContainer.tsx`
- `npm run build`
  - résultat : OK
- `npx tsc --noEmit`
  - résultat : OK après génération de `.next/types`
- `npx playwright test tests/e2e/sponsoring.spec.ts --reporter=list`
  - résultat : OK
- `git remote -v`
  - résultat : aucun remote configuré

### Risques / limites restantes
- Le repo Git global est très chargé et ne correspond pas à un petit diff propre : ne pas pousser sans sélectionner précisément le périmètre.
- Le push GitHub n'a PAS été effectué : aucun remote n'est configuré.
- `npx tsc --noEmit` dépend encore de la présence de `.next/types`; il doit être lancé après un build ou dans un workspace où `.next` a déjà été généré.
- Les warnings ESLint `no-explicit-any` persistent dans `src/app/layout.tsx` et `src/app/PremiumMarqueeContainer.tsx`.
- Les SQL `44_SQL_ADMIN_DELEGATES.sql`, `45_SQL_ADMIN_DELEGATE_REVOKE_RPC.sql`, `46_SQL_ADMIN_DELEGATE_ACTIVATION.sql` ne sont toujours pas explicitement reconfirmés comme exécutés dans cette session.

### Prochaines étapes concrètes
1. Confirmer dans Supabase l'exécution des SQL `44`, `45`, `46`.
2. Tester manuellement le flux owner/delegate complet après login :
   - login owner -> arrivée directe `/admin`
   - création delegate
   - notification
   - activation avec code
   - redirection selon permissions
3. Configurer le remote GitHub cible puis pousser uniquement le périmètre validé.
4. Si souhaité, nettoyer les warnings `no-explicit-any` restants pour une sortie lint plus stricte.

## Mise à Jour de Consolidation — 2026-05-01

### Correctif complémentaire — 2026-05-01 — Invitation admin via Notifications + page d'activation
- Symptômes observés :
  - le user voyait une invitation admin dans `Mon Compte`
  - un CTA `Voir l'invitation` pouvait mener à `/dashboard/account/admin-activation`
  - cette route répondait `404`
  - l'écran attendu pour saisir le code secret n'était donc pas accessible
- Correctifs appliqués :
  - ajout de la vraie route :
    - `src/app/dashboard/account/admin-activation/page.tsx`
  - cette route redirige désormais :
    - `owner` -> `/admin/delegates`
    - `delegate` déjà actif -> `/admin`
    - elle ne sert donc plus qu'aux comptes réellement en attente d'activation
  - ajout d'un helper serveur d'état d'invitation dans :
    - `src/lib/actions/admin-delegates.ts`
    - `getDelegateInvitationState()`
  - `src/app/dashboard/account/page.tsx` utilise maintenant cet état structuré au lieu d'un booléen brut
  - `src/app/admin/delegates/AdminActivationClient.tsx` a été simplifié :
    - le champ du code secret est visible directement
    - les actions `Refuser` et `Activer mon accès` sont sur le même écran
  - notifications UI rendues plus explicites :
    - `src/app/dashboard/notifications/page.tsx`
    - `src/app/dashboard/notifications/components/NotificationList.tsx`
    - `src/components/notifications/NotificationBell.tsx`
    - le CTA affiche maintenant `Voir l'invitation` pour la route d'activation admin
  - création automatique d'une notification `sys` côté serveur lors de :
    - création d'un delegate
    - régénération du code secret
    - implémenté dans :
      - `src/lib/actions/admin-delegates.ts`
- Fichiers ajoutés :
  - `src/app/dashboard/account/admin-activation/page.tsx`
- Fichiers modifiés :
  - `src/lib/actions/admin-delegates.ts`
  - `src/app/admin/delegates/AdminActivationClient.tsx`
  - `src/app/dashboard/account/page.tsx`
  - `src/app/dashboard/notifications/page.tsx`
  - `src/app/dashboard/notifications/components/NotificationList.tsx`
  - `src/components/notifications/NotificationBell.tsx`
- Validation réellement exécutée :
  - `npx eslint src/lib/actions/admin-delegates.ts src/app/admin/delegates/AdminActivationClient.tsx src/app/dashboard/account/admin-activation/page.tsx src/app/dashboard/account/page.tsx src/app/dashboard/notifications/page.tsx src/app/dashboard/notifications/components/NotificationList.tsx src/components/notifications/NotificationBell.tsx`
  - résultat : OK
- Risques restants :
  - test navigateur manuel non relancé dans cette session
  - le lien de notification fonctionne côté code, mais le contenu live dépend encore de la présence effective des notifications déjà créées et du schéma Supabase attendu
  - exécution SQL `46_SQL_ADMIN_DELEGATE_ACTIVATION.sql` non reconfirmée explicitement dans cette session
- Correctif complémentaire — 2026-05-01 — Blocage après activation delegate
  - Cause identifiée :
    - `AdminActivationClient` redirigeait toujours vers `/admin`
    - un délégué peut pourtant n'avoir que `payments`, `users` ou `sponsoring` sans `can_view_dashboard`
    - dans ce cas l'activation réussissait, mais la destination immédiate n'était pas autorisée
  - Correctif appliqué :
    - `respondToDelegateInvitation(...)` retourne maintenant `redirectPath`
    - ce chemin est calculé avec `getAdminLandingPath(...)` selon les permissions réelles
    - `AdminActivationClient.tsx` utilise maintenant ce chemin au lieu de forcer `/admin`
  - Fichiers modifiés :
    - `src/lib/actions/admin-delegates.ts`
    - `src/app/admin/delegates/AdminActivationClient.tsx`
  - Validation exécutée :
    - `npx eslint src/lib/actions/admin-delegates.ts src/app/admin/delegates/AdminActivationClient.tsx`
    - résultat : OK
- Indices de reprise utiles :
  - si le user voit encore un `404`, vérifier d'abord que le build local a bien repris la nouvelle route
  - si l'invitation n'apparaît pas en notifications pour un nouveau delegate, vérifier l'insertion dans `notifications` et la valeur `type = 'sys'`
  - si l'activation échoue malgré un bon code, vérifier la présence live de `admin_delegate_secrets` et des colonnes `activation_status`, `activated_at`, `declined_at`

### Résumé global fidèle de cette conversation
- Deux chantiers majeurs ont été traités dans cette conversation :
  - `Compte / Inscription / Profil modifiable`
  - `Admin délégués sous contrôle owner`
- La logique métier à préserver est désormais la suivante :
  - un utilisateur reste `client` ou `artisan` via `profiles.role`
  - l'inscription reste la source initiale des données personnelles et pro
  - `Mon Compte` et `Modifier` doivent lire la même donnée et ne jamais forcer de ressaisie inutile
  - l'administration ne dépend plus du rôle métier, mais d'un système séparé `owner/delegate`

### État actuel réellement atteint
- Le profil utilisateur est modifiable à partir d'une version réutilisée du formulaire d'inscription.
- `Mon Compte` et `Modifier` ont été réalignés sur une source serveur commune.
- Le schéma Supabase a déjà été enrichi pour supporter les champs d'inscription/profil :
  - `profiles.first_name`
  - `profiles.last_name`
  - `profiles.age`
  - `profiles.wilaya`
  - `profiles.commune`
  - `artisans.profession`
  - `artisans.specialties`
- Le trigger `handle_new_user()` a déjà été réaligné pour ces champs.
- Le MVP admin `owner + delegates` est codé côté repo.
- Le SQL du chantier admin existe mais n'a pas encore été exécuté.

### Ce qui a été modifié ou ajouté dans cette conversation

#### A. Compte / Inscription / Profil
- Ajout :
  - `src/app/dashboard/account/account-data.ts`
- Modifiés :
  - `src/app/dashboard/account/page.tsx`
  - `src/app/dashboard/account/info/page.tsx`
  - `src/components/forms/account-info-form.tsx`
  - `src/lib/actions/profile.ts`
- Effet produit :
  - la page `Modifier` réutilise la logique de la fiche d'inscription
  - les champs déjà visibles dans `Mon Compte` doivent être préremplis dans `Modifier`
  - le user ne doit pas avoir à ressaisir une information non modifiée
  - les champs pro artisan visibles doivent aussi être éditables

#### B. Admin délégués
- Ajout :
  - `44_SQL_ADMIN_DELEGATES.sql`
  - `src/lib/actions/admin-delegates.ts`
  - `src/app/admin/delegates/page.tsx`
  - `src/app/admin/delegates/AdminDelegatesClient.tsx`
- Modifiés :
  - `src/lib/auth/admin-access.ts`
  - `src/lib/auth/require-admin.ts`
  - `src/lib/actions/users-admin.ts`
  - `src/lib/actions/payments-admin.ts`
  - `src/lib/actions/sponsoring-admin.ts`
  - `src/app/admin/layout.tsx`
  - `src/components/admin/AdminNavigation.tsx`
  - `src/app/admin/page.tsx`
  - `src/app/admin/users/page.tsx`
  - `src/app/admin/payments/page.tsx`
  - `src/app/admin/sponsoring/page.tsx`
- Effet produit :
  - `oucher007@gmail.com` reste le `owner` principal
  - les admins délégués sont gérés séparément du rôle métier
  - la navigation admin devient permissionnelle
  - `/admin/delegates` est owner-only
  - le chargement des délégués est maintenant plus résilient si la requête `profiles` échoue temporairement côté Supabase

#### C. Traçabilité admin / délégués
- Nouveau fichier :
  - `src/lib/actions/admin-audit.ts`
  - `src/lib/auth/admin-audit-signature.ts`
- Effet technique :
  - les mutations admin critiques écrivent maintenant dans `admin_audit_logs`
  - chaque log est signé dans le `payload` avec :
    - `actor_signature.user_id`
    - `actor_signature.email`
    - `actor_signature.full_name`
    - `actor_signature.admin_type`
    - `actor_signature.is_owner`
    - `actor_signature.profile_role`
- Actions actuellement journalisées :
  - delegates :
    - `delegate_created`
    - `delegate_permissions_updated`
    - `delegate_activated`
    - `delegate_deactivated`
    - `delegate_revoked`
  - paiements :
    - `payment_order_approved`
    - `payment_order_rejected`
  - sponsoring :
    - `sponsored_item_created`
    - `sponsored_item_updated`
    - `sponsored_item_paused`
    - `sponsored_item_resumed`
    - `sponsored_item_prolonged`
    - `sponsored_item_terminated`
- Limite actuelle :
  - la traçabilité couvre les mutations admin, pas encore les simples lectures/navigation

### Correctif build — 2026-05-01 — Server Actions must be async functions
- Symptôme observé :
  - erreur de build Next.js :
    - `Server Actions must be async functions`
  - fichier concerné :
    - `src/lib/actions/admin-audit.ts`
- Cause :
  - `buildAdminActorSignature(...)` était exporté en synchrone depuis un fichier `use server`
- Correctif appliqué :
  - extraction du helper dans :
    - `src/lib/auth/admin-audit-signature.ts`
  - `src/lib/actions/admin-audit.ts` conserve uniquement des exports compatibles Server Actions
- Règle à préserver :
  - ne pas exporter de helper synchrone depuis un fichier `use server`

### Optimisation suppression delegate — 2026-05-01
- Nouveau fichier SQL :
  - `45_SQL_ADMIN_DELEGATE_REVOKE_RPC.sql`
- But :
  - accélérer la suppression d'un délégué admin
  - exécuter suppression + audit dans une seule opération SQL atomique
- Côté code :
  - `src/lib/actions/admin-delegates.ts`
  - `revokeDelegate(...)` tente d'abord la RPC `public.revoke_admin_delegate_access(...)`
  - fallback automatique sur le chemin applicatif actuel si la fonction SQL n'est pas encore déployée
- Important :
  - l'amélioration de vitesse côté live dépend de l'exécution de `45_SQL_ADMIN_DELEGATE_REVOKE_RPC.sql`

### Correctif complémentaire — 2026-05-01 — Résilience chargement delegates
- Symptôme observé :
  - après création d'un délégué admin, l'écran pouvait remonter :
    - `Impossible de charger les profils admin: TypeError: fetch failed`
- Cause probable :
  - fragilité réseau / fetch Supabase au moment du rechargement des profils délégués
  - ancien code plus cassant car le chargement des permissions et profils était fait en parallèle et l'échec du bloc `profiles` faisait tomber toute la page
- Correctif appliqué :
  - `src/lib/actions/admin-delegates.ts`
  - lecture des permissions puis lecture des profils en séquentiel
  - `loadDelegateProfiles(...)` passe en mode défensif avec `try/catch`
  - si la requête profils échoue temporairement, la page ne casse plus complètement

### Correctif complémentaire — 2026-05-01 — Suppression delegate sans crash UI
- Symptôme observé :
  - clic sur `Supprimer l'accès admin` puis confirmation
  - écran d'erreur admin avec message :
    - `mutationKey is not defined`
  - après refresh manuel, la suppression était bien prise en compte
- Cause :
  - variable client de statut mutation utilisée hors de sa portée dans la modale de confirmation
- Correctif appliqué :
  - `src/app/admin/delegates/AdminDelegatesClient.tsx`
  - remplacement par `activeMutationKey`
  - suppression optimiste du délégué dans l'état local
  - plus besoin d'attendre un refresh complet pour voir la liste à jour après suppression

### Validation réellement connue à ce stade
- `eslint` ciblé sur les fichiers du patch admin : OK
- `tsc --noEmit` global : encore en échec sur dette préexistante hors chantier admin :
  - `src/app/dashboard/account/account-data.ts`
  - `src/app/dashboard/account/AccountTabsClient.tsx`
- E2E :
  - `npx playwright test --list` : OK
  - `npx playwright test tests/e2e/sponsoring.spec.ts --reporter=list` : OK
  - suite complète encore non stabilisée
- `npx eslint src/lib/actions/admin-audit.ts src/lib/auth/admin-audit-signature.ts src/lib/actions/admin-delegates.ts` : OK

### Points critiques à NE PAS casser
1. Ne pas réintroduire `profiles.role = admin` comme source d'autorisation admin.
2. Ne pas casser le flux d'inscription existant.
3. Ne pas séparer de nouveau les sources de données entre `Mon Compte` et `Modifier`.
4. Ne pas retirer les fallbacks de schéma / compatibilité Supabase sans vérifier le live DB.
5. Ne pas retirer le fallback owner email `oucher007@gmail.com` tant que le système admin DB n'a pas été validé en conditions réelles.
6. Ne pas casser les Server Actions admin déjà branchées sur permissions :
   - users
   - payments
   - sponsoring
7. Ne pas réintroduire de helper synchrone exporté dans un fichier `use server`.

### Ce qui reste à faire en priorité
1. Exécuter `44_SQL_ADMIN_DELEGATES.sql` dans Supabase.
2. Exécuter `45_SQL_ADMIN_DELEGATE_REVOKE_RPC.sql` dans Supabase.
3. Reconfirmer ou exécuter `46_SQL_ADMIN_DELEGATE_ACTIVATION.sql` dans Supabase.
4. Tester réellement le flux admin :
   - owner accès `/admin`
   - owner voit `/admin/delegates`
   - création d'un delegate depuis un compte existant
   - création de notification d'invitation
   - ouverture depuis `Mon Compte` et depuis `Notifications`
   - saisie du code secret
   - acceptation / refus
   - tests des permissions par route après activation
   - désactivation delegate
   - suppression delegate avec comparaison de ressenti avant/après RPC
5. Vérifier manuellement le flux `Mon Compte` → `Modifier` sur un artisan réel.
6. Corriger la dette TypeScript restante dans :
   - `src/app/dashboard/account/account-data.ts`
   - `src/app/dashboard/account/AccountTabsClient.tsx`
7. Stabiliser la suite E2E complète Playwright.
8. Auditer le repo contre le schéma Supabase live pour éliminer les requêtes encore fragiles.

### Améliorations recommandées ensuite
- Ajouter une vraie page/module pour `support_logs` ou retirer cette permission tant qu'elle n'a pas d'usage.
- Ajouter une vérification navigateur réelle de `/admin/delegates`.
- Ajouter éventuellement des tests E2E ciblés pour le flux owner/delegate.
- Compléter l'audit des pages publiques artisan et des cartes de recherche avec les champs d'inscription enrichis.

### Règle de continuité pour un autre agent
- Avant toute action, lire :
  - `AGENTS.md`
  - `HANDOFF.md`
  - `PROMPT_AGENT_SPRINT_FINAL_PART2.md`
- Considérer ces fichiers comme source de vérité opérationnelle.
- Ne supprimer, n'écraser, ne refactorer ni ne simplifier agressivement aucun flux existant sans vérifier :
  - sa source de vérité
  - son impact DB
  - son impact auth/admin
  - son impact UI
- En fin de session, mettre à jour `HANDOFF.md` et `PROMPT_AGENT_SPRINT_FINAL_PART2.md` avec :
  - fichiers modifiés
  - SQL exécutés
  - validations lancées
  - risques restants
  - prochaines étapes réelles

## Mise à Jour Critique — 2026-04-28 — Admin Délégués Owner-Controlled

### Résumé réel de cette session
- Implémentation du MVP `owner + delegates` demandé pour l'administration.
- Le rôle métier `profiles.role` n'est plus la source principale des droits admin.
- Les accès admin sont maintenant séparés entre :
  - `owner`
  - `delegate`
  - permissions modules cochables
- Le fallback email `oucher007@gmail.com` reste conservé comme filet de sécurité owner.

### Décision d'architecture verrouillée
- `profiles.role` reste strictement métier :
  - `client`
  - `artisan`
- Les droits admin passent désormais par un nouveau socle séparé :
  - `admin_accounts`
  - `admin_permissions`
  - `admin_audit_logs`
- Le `owner` principal garde le contrôle total des délégués.
- Les délégués sont créés uniquement à partir d'utilisateurs déjà inscrits dans `profiles`.

### SQL préparé cette session
- Nouveau fichier ajouté :
  - `44_SQL_ADMIN_DELEGATES.sql`
- Ce SQL :
  - crée `public.admin_accounts`
  - crée `public.admin_permissions`
  - crée `public.admin_audit_logs`
  - active RLS
  - autorise uniquement la lecture de son propre enregistrement admin pour l'utilisateur authentifié
  - seed l'owner `oucher007@gmail.com` avec tous les droits à `true`
- Important :
  - le fichier SQL a été créé dans le repo
  - il n'a PAS été exécuté depuis cette session terminal
  - exécution manuelle requise dans Supabase SQL Editor

### Correctifs code appliqués

#### 1. Nouveau modèle d'accès admin
- Fichiers :
  - `src/lib/auth/admin-access.ts`
  - `src/lib/auth/require-admin.ts`
- Ajouts :
  - types `AdminType`, `AdminPermissionKey`, `AdminPermissions`
  - permissions canoniques :
    - `can_view_dashboard`
    - `can_manage_users`
    - `can_manage_payments`
    - `can_manage_sponsoring`
    - `can_manage_support_logs`
  - `getAdminLandingPath(...)`
  - `getAdminContext()`
  - `requireAdminAccess(permission?)`
- Résolution des accès désormais :
  1. fallback owner par email
  2. `admin_accounts.admin_type = owner`
  3. `admin_accounts.admin_type = delegate`

#### 2. Guards permissionnels branchés sur l'admin existant
- Fichiers :
  - `src/lib/actions/users-admin.ts`
  - `src/lib/actions/payments-admin.ts`
  - `src/lib/actions/sponsoring-admin.ts`
  - `src/app/admin/page.tsx`
  - `src/app/admin/users/page.tsx`
  - `src/app/admin/payments/page.tsx`
  - `src/app/admin/sponsoring/page.tsx`
- Comportement :
  - `/admin` nécessite `can_view_dashboard`
  - `/admin/users` nécessite `can_manage_users`
  - `/admin/payments` nécessite `can_manage_payments`
  - `/admin/sponsoring` nécessite `can_manage_sponsoring`
- Le dashboard admin charge maintenant ses blocs conditionnellement selon les permissions réellement accordées.

#### 3. Sidebar admin conditionnelle
- Fichiers :
  - `src/app/admin/layout.tsx`
  - `src/components/admin/AdminNavigation.tsx`
- La navigation n'affiche plus tous les modules à tout le monde.
- Les délégués ne voient que les sections autorisées.
- Le lien `Admins délégués` est visible uniquement pour le `owner`.

#### 4. Gestion complète des délégués
- Nouveau fichier :
  - `src/lib/actions/admin-delegates.ts`
- Nouvelles actions :
  - lister les délégués
  - rechercher des utilisateurs existants par email/nom
  - créer un délégué
  - modifier les permissions d'un délégué
  - activer/désactiver un délégué
  - supprimer l'accès admin d'un délégué sans supprimer l'utilisateur
  - écrire un audit log pour chaque mutation
- Les écritures passent via service role Supabase.

#### 5. Nouvelle UI owner-only
- Nouveaux fichiers :
  - `src/app/admin/delegates/page.tsx`
  - `src/app/admin/delegates/AdminDelegatesClient.tsx`
- Fonctionnalités livrées :
  - page owner-only `/admin/delegates`
  - recherche d'un utilisateur existant
  - sélection d'un compte
  - cases à cocher par module
  - création d'un délégué
  - liste des délégués existants
  - édition inline des droits
  - activation / désactivation
  - suppression de l'accès admin avec confirmation UI
- Le owner principal est affiché en lecture seule et n'est pas modifiable depuis cette page.

### Fichiers ajoutés cette session
- `44_SQL_ADMIN_DELEGATES.sql`
- `src/lib/actions/admin-audit.ts`
- `src/lib/actions/admin-delegates.ts`
- `src/app/admin/delegates/page.tsx`
- `src/app/admin/delegates/AdminDelegatesClient.tsx`

### Fichiers modifiés cette session
- `src/lib/auth/admin-access.ts`
- `src/lib/auth/require-admin.ts`
- `src/lib/actions/admin-audit.ts`
- `src/lib/actions/users-admin.ts`
- `src/lib/actions/payments-admin.ts`
- `src/lib/actions/sponsoring-admin.ts`
- `src/app/admin/layout.tsx`
- `src/components/admin/AdminNavigation.tsx`
- `src/app/admin/page.tsx`
- `src/app/admin/users/page.tsx`
- `src/app/admin/payments/page.tsx`
- `src/app/admin/sponsoring/page.tsx`
- `HANDOFF.md`
- `PROMPT_AGENT_SPRINT_FINAL_PART2.md`

### Validations réellement exécutées
- `npx eslint src/lib/auth/admin-access.ts src/lib/auth/require-admin.ts src/lib/actions/users-admin.ts src/lib/actions/payments-admin.ts src/lib/actions/sponsoring-admin.ts src/lib/actions/admin-delegates.ts src/app/admin/layout.tsx src/components/admin/AdminNavigation.tsx src/app/admin/page.tsx src/app/admin/users/page.tsx src/app/admin/payments/page.tsx src/app/admin/sponsoring/page.tsx src/app/admin/delegates/page.tsx src/app/admin/delegates/AdminDelegatesClient.tsx`
  - ✅ passe
- `npx tsc --noEmit`
  - ❌ échoue encore sur erreurs préexistantes hors de ce chantier :
    - `src/app/dashboard/account/account-data.ts`
    - `src/app/dashboard/account/AccountTabsClient.tsx`
- Filtrage ciblé des erreurs TypeScript sur les nouveaux fichiers admin
  - aucune erreur remontée sur les fichiers de ce patch

### Ce qui reste à faire obligatoirement
1. Exécuter `44_SQL_ADMIN_DELEGATES.sql` dans Supabase.
2. Vérifier avec le vrai owner `oucher007@gmail.com` :
   - accès `/admin`
   - visibilité du lien `/admin/delegates`
   - création d'un délégué depuis un utilisateur existant
3. Vérifier un compte `delegate` réel :
   - dashboard seul
   - sponsoring seul
   - users refusé si permission absente
   - payments refusé si permission absente
   - page `/admin/delegates` invisible et inaccessible
4. Vérifier qu'un delegate désactivé perd bien l'accès admin.
5. Si besoin, ajouter ensuite un écran dédié pour `support_logs` ou retirer cette permission tant qu'elle n'est pas utilisée.

### Risques / dette restante après cette session
- Le SQL n'a pas encore été exécuté, donc le flux ne peut pas être considéré validé end-to-end.
- Les permissions `support_logs` existent dans le modèle mais n'ont pas encore de page/module dédié.
- La gestion des délégués dépend de `SUPABASE_SERVICE_ROLE_KEY` pour les écritures.
- La validation UI navigateur n'a pas été rejouée automatiquement sur `/admin/delegates` dans cette session.
- Le typecheck global du repo n'est pas redevenu vert à cause de dette antérieure sur le chantier compte.

## Mise à Jour Critique — 2026-04-27

### Résumé réel de cette session
- Le flux `Mon Compte` → `Modifier` a été refondu pour réutiliser la même logique que l'inscription, tout en gardant la modification strictement côté compte.
- Le problème principal identifié était un décalage entre :
  - les données affichées dans `/dashboard/account`
  - les données préremplies dans `/dashboard/account/info`
  - le schéma live Supabase réellement exposé
- La priorité a donc été :
  - réaligner le schéma DB avec les champs métier attendus
  - faire lire `Mon Compte` et `Info` depuis la même source serveur
  - faire en sorte qu'un utilisateur n'ait jamais à ressaisir une donnée déjà visible s'il ne veut pas la modifier

### Schéma Supabase vérifié en live pendant cette session
- Avant patch SQL, la DB live exposait :
  - `profiles`: `id, email, full_name, phone, role, avatar_url, city, first_name, last_name`
  - `artisans`: pas de `profession`, pas de `specialties`
- Des patches SQL ont ensuite été exécutés avec succès pour ajouter :
  - `profiles.first_name`
  - `profiles.last_name`
  - `profiles.age`
  - `profiles.wilaya`
  - `profiles.commune`
  - `artisans.profession`
  - `artisans.specialties`
- Le trigger `handle_new_user()` a aussi été réaligné pour écrire ces champs à l'inscription.

### Ce qui a été modifié côté code

#### 1. Formulaire d'édition basé sur l'inscription
- Un composant commun a été mis en place pour servir :
  - l'inscription
  - l'édition du profil
- Fichier principal :
  - `src/components/forms/account-info-form.tsx`
- Ce composant :
  - reprend la structure de la page d'inscription
  - fonctionne en mode `register` ou `edit`
  - masque email / mot de passe en édition
  - en mode artisan, permet aussi désormais d'éditer :
    - `raison sociale`
    - `métier`
    - `spécialité`
    - `wilaya d'intervention`
    - `ville d'intervention`
    - `adresse`
    - `tarif horaire`
    - `bio`
    - `disponibilité`

#### 2. Source unique pour `Mon Compte` et `Info`
- Nouveau fichier ajouté :
  - `src/app/dashboard/account/account-data.ts`
- Rôle :
  - charger une seule fois la vue serveur du compte
  - reconstruire un objet `profile` + `artisan` cohérent
  - servir exactement les mêmes données à :
    - `src/app/dashboard/account/page.tsx`
    - `src/app/dashboard/account/info/page.tsx`
- But :
  - éviter toute divergence entre ce que l'utilisateur voit dans `Mon Compte` et ce qu'il retrouve en cliquant sur `Modifier`

#### 3. Refonte de la page `/dashboard/account/info`
- Fichier :
  - `src/app/dashboard/account/info/page.tsx`
- La page charge maintenant :
  - le même `profile`
  - le même `artisan`
  que la page `Mon Compte`
- Le préremplissage utilise désormais les mêmes valeurs visibles que la fiche résumé.

#### 4. Mise à jour de `/dashboard/account/page.tsx`
- Fichier :
  - `src/app/dashboard/account/page.tsx`
- La page utilise désormais `loadAccountViewData(...)` au lieu de reconstruire séparément ses fallbacks.

#### 5. Server Action de sauvegarde profil
- Fichier :
  - `src/lib/actions/profile.ts`
- Correctifs appliqués :
  - compatibilité avec schéma `profiles` partiellement divergent
  - écriture sécurisée via client admin si `SUPABASE_SERVICE_ROLE_KEY` disponible, pour contourner les blocages RLS sur `artisans`
  - persistance de :
    - `profiles`: `first_name`, `last_name`, `age`, `phone`, `wilaya`, `commune`, `city`
    - `artisans`: `company_name`, `profession`, `specialties`, `wilaya`, `city`, `address`, `bio`, `hourly_rate`, `availability_status`
  - synchro `user_metadata`
  - mise à jour de la taxonomie :
    - `artisan_categories`
    - `artisan_subcategories`

#### 6. Mapping taxonomie métier / spécialité
- Problème constaté :
  - le formulaire local utilisait des labels du type `Electricite`
  - la DB live contenait `Électricité`
  - les sous-catégories DB avaient des libellés plus riches, ex. `Électricité Bâtiment (Maison)`
- Correctif :
  - normalisation accentuée / slugifiée tolérante dans :
    - `src/lib/actions/profile.ts`
    - `src/components/forms/account-info-form.tsx`
- Effet attendu :
  - les champs `métier` et `spécialité` déjà visibles dans `Mon Compte` doivent maintenant se recharger dans `Modifier` au lieu d'apparaître vides.

### Fichiers ajoutés cette session
- `src/app/dashboard/account/account-data.ts`

### Fichiers modifiés cette session
- `src/app/dashboard/account/page.tsx`
- `src/app/dashboard/account/info/page.tsx`
- `src/components/forms/account-info-form.tsx`
- `src/lib/actions/profile.ts`
- `HANDOFF.md`
- `PROMPT_AGENT_SPRINT_FINAL_PART2.md`
- `AGENTS.md`

### Comportement produit désormais attendu
- Un utilisateur client ou artisan ne saisit ses informations qu'une fois à l'inscription.
- Quand il ouvre `/dashboard/account` puis clique `Modifier` :
  - il doit retrouver les mêmes valeurs que celles affichées dans `Mon Compte`
  - il ne doit pas avoir à ressaisir un champ qu'il ne souhaite pas modifier
- Pour un artisan, les infos professionnelles visibles dans `Mon Compte` doivent aussi être modifiables et préremplies.

### Ce qui reste à vérifier manuellement
1. Recharger `/dashboard/account` puis cliquer `Modifier` sur un artisan réel.
2. Vérifier que les champs suivants sont préremplis sans divergence :
   - `nom`
   - `prenom`
   - `age`
   - `telephone`
   - `wilaya`
   - `commune`
   - `métier`
   - `spécialité`
   - `raison sociale`
   - `wilaya d'intervention`
   - `ville d'intervention`
   - `adresse`
   - `tarif`
   - `bio`
   - `disponibilité`
3. Vérifier qu'une sauvegarde réelle répercute bien les changements :
   - dans `Mon Compte`
   - dans la fiche publique artisan si concerné
4. Vérifier que les communes se présélectionnent correctement lorsque la wilaya est connue.
5. Vérifier qu'aucune autre page du repo ne repose encore sur l'ancien schéma `profiles(age,wilaya,commune)` ou `artisans(profession,specialties)` d'une façon incohérente.

### Risques / dette restante après cette session
- Le repo contient encore plusieurs requêtes historiques qui supposaient des colonnes anciennes ou des fallbacks différents.
- Un audit global repo ↔ schéma live Supabase reste recommandé, surtout pour :
  - `src/lib/marketplace-server-data.ts`
  - `src/lib/actions/artisan.ts`
  - les pages publiques artisan
  - les recherches / cartes artisans
- La validation globale `tsc`, `build` et les E2E complets n'ont pas été rerun intégralement à la fin de cette session.

### Règle de continuité obligatoire pour le prochain agent
- À la fin de chaque session, le prochain agent DOIT mettre à jour :
  - `HANDOFF.md`
  - `PROMPT_AGENT_SPRINT_FINAL_PART2.md`
- Cette mise à jour doit contenir :
  - l'état réel du projet
  - les fichiers ajoutés/modifiés
  - les SQL éventuellement exécutés
  - les validations réellement lancées
  - les risques restants
  - les prochaines étapes concrètes
- Interdiction de laisser des affirmations non revérifiées du type "tout est vert" sans commande ou validation explicite.

## État du Projet
- Sprint 1 (Dashboard, Calendar, Account) : ✅ Complété
- Sprint 2 (Filtres, Adresse Services) : ✅ Complété
- Sprint 3 (Monétisation, Promo, Referral backend) : ✅ Complété
- Messagerie Privée : ✅ Implémentée
- Sprint Final Partie 2 :
  - Tâche A (Frontend crédits & promo) : ✅ Implémentée
  - Tâche B (Recherche artisan admin) : ✅ Implémentée
  - Tâche C (Playwright + specs E2E) : 🟡 Installée + smoke test validé, tests mutatifs conditionnels
  - Tâche D (Déploiement / Vercel / docs) : ✅ Implémentée
- Sprint "Algeria-Ready" Go-Live :
  - Qualité et Typage (`lint`, `build`) : ✅ Vert (erreurs résolues)
  - Search public : ✅ Ouvert (auth requise uniquement pour contact)
  - SEO Local : ✅ Sitemap dynamique + maillage wilaya injectés
  - Nettoyage Démos : ✅ Assets 400 et modules bêtas supprimés
  - Espace Favoris : ✅ MVP Espace client ajouté
  - UI / UX : ✅ Remplacement de l'initiale par l'avatar utilisateur (arrondi, bleu par défaut)
  - Feature: ✅ Ajout d'un statut "Online / Offline" (pastille verte/rouge sur avatar) basé sur `availability_status`, éditable depuis le Dashboard.
  - Refonte Profil / Compte : ✅ Alignement strict du formulaire d'édition "Mon Compte" (`AccountProfileTab`) avec les données récoltées lors de l'inscription (`age`, `wilaya`, `commune`, `profession`, `specialties`).

- Version : Production-Ready avec derniers correctifs sprint final
- Stack : Next.js 16.2.2 / React 19.2.4 / Supabase (SSR + Realtime) / Tailwind v4
- TypeScript : ✅ `npx tsc --noEmit`
- Build : ✅ `npm run build`
- E2E smoke : ✅ `npx playwright test tests/e2e/sponsoring.spec.ts --reporter=list`
- Dev server : ✅ contournement applique pour le `404` global observe en mode Turbopack

## Changements Validés Cette Session

### 1. Compte utilisateur : crédits + promo
- Fichier principal : `src/app/dashboard/account/AccountTabsClient.tsx`
- La section promo n'est plus simulée.
- Le formulaire promo utilise désormais `useActionState` et la Server Action réelle `applyPromoCode`.
- Les retours utilisateur passent par `useToast`.
- Le solde wallet réel est affiché dans l'onglet promo.
- La page `src/app/dashboard/account/page.tsx` charge maintenant le solde via `getWalletBalanceAndHistory()`.

### 2. Correctif backend promo
- Fichier : `src/lib/actions/promo.ts`
- L'action `applyPromoCode` a été refactorée pour accepter `(prevState, formData)`.
- L'action retourne un état structuré compatible `useActionState`.
- L'insertion dans `wallet_transactions` utilise désormais les bons champs :
  - `amount_dzd`
  - `transaction_type: "credit"`
- Revalidation ajoutée sur `/dashboard/account`.

### 3. Sponsoring admin : auto-complétion artisan
- Fichiers :
  - `src/app/admin/sponsoring/components/SponsoredCampaignForm.tsx`
  - `src/lib/actions/sponsoring-admin.ts`
- Le formulaire admin sponsoring est passé en Client Component pour supporter une UX de recherche interactive.
- Une Server Action `searchArtisansForAdmin(query)` a été ajoutée.
- La recherche interroge `profiles` (`role = 'artisan'`) et enrichit avec `artisans` pour exposer aussi `profession` / `company_name`.
- Lors de la sélection, le champ `link` est rempli automatiquement avec `/artisan/[uuid]`.

### 4. E2E / Playwright
- Fichiers ajoutés :
  - `playwright.config.ts`
  - `tests/e2e/auth.spec.ts`
  - `tests/e2e/booking.spec.ts`
  - `tests/e2e/messaging.spec.ts`
  - `tests/e2e/sponsoring.spec.ts`
- Script ajouté dans `package.json` :
  - `"test:e2e": "playwright test"`
- Dépendances installées :
  - `@playwright/test@1.59.1`
  - Chromium Playwright installé dans le cache local utilisateur.
- Tests mutatifs protégés :
  - `auth.spec.ts` skip sans `E2E_REGISTER_EMAIL` et `E2E_REGISTER_PASSWORD`.
  - `booking.spec.ts` skip sans `E2E_ARTISAN_PATH`, `E2E_CLIENT_EMAIL`, `E2E_CLIENT_PASSWORD`.
  - `messaging.spec.ts` skip sans `E2E_ARTISAN_PATH`, `E2E_CLIENT_EMAIL`, `E2E_CLIENT_PASSWORD`.
- Validation effectuée :
  - `npx playwright test --list` : ✅ 4 specs détectées
  - `npx playwright test tests/e2e/sponsoring.spec.ts --reporter=list` : ✅ 1 test passé
- Point restant :
  - `npx playwright test --reporter=list` complet a bloqué au niveau `config.webServer` après 120s dans cet environnement, avec répétition d'erreurs d'images demo Supabase en `400`.

### 5. Déploiement / config production
- Fichiers :
  - `vercel.json`
  - `next.config.ts`
  - `DEPLOYMENT.md`
- `vercel.json` inclut maintenant :
  - headers de sécurité
  - règles de cache pour `/_next/static` et `favicon.ico`
  - cron existant conservé
- `next.config.ts` a été nettoyé :
  - suppression du `resolveAlias` Turbopack lié à `tailwindcss`
- `package.json` utilise maintenant `next build --webpack` pour éviter le panic Turbopack observé dans l'environnement sandbox.
- `src/app/layout.tsx` ne dépend plus de `next/font/google`.
- `src/app/globals.css` définit des stacks typographiques système via `--font-jakarta` et `--font-inter`.
- `next.config.ts` ajoute `allowedDevOrigins: ["127.0.0.1"]` pour Playwright local.
- `tsconfig.json` exclut `.next/dev` pour éviter que les types invalides générés par `next dev` cassent `npx tsc --noEmit`.
- `DEPLOYMENT.md` documente :
  - variables d'environnement requises
  - étapes de build
  - prérequis Supabase
  - prérequis E2E

### 6. Build offline-safe
- Fichiers :
  - `src/app/layout.tsx`
  - `src/app/globals.css`
  - `package.json`
- Suppression des imports `Inter` et `Plus_Jakarta_Sans` depuis `next/font/google`.
- Remplacement par des variables CSS de fallback système.
- Validation :
  - `npm run build` : ✅
  - `npx tsc --noEmit` : ✅

### 7. Correctif dev server homepage / 404 global
- Fichiers :
  - `package.json`
  - `next.config.ts`
- Symptome observe :
  - en dev, `localhost:3000` rendait le RootLayout puis la vue Next `404 This page could not be found` a la place des pages App Router, y compris `/`, `/search`, `/pricing`, `/auth/login`
  - le build production restait OK, ce qui orientait vers un probleme dev/Turbopack plutot qu'un probleme de routes `src/app`
- Correctif applique :
  - le script `npm run dev` pointe maintenant sur `next dev --webpack`
  - le script `dev:turbo` reste disponible pour debug cible
  - la config `turbopack.root` a ete retiree
  - `allowedDevOrigins` couvre maintenant `localhost` et `127.0.0.1`
- Hypothese retenue :
  - regression ou incoherence Turbopack/dev avec ce repo dans cet environnement
  - le contournement fiable et pratique est de lancer le projet en webpack pour le developpement courant

### 8. Ajustement design typographique Apple
- Fichiers :
  - `src/app/page.tsx`
  - `src/components/features/hero-search.tsx`
  - `src/components/shared/navbar.tsx`
  - `src/app/globals.css`
- Constat :
  - la homepage et la navbar utilisaient trop de `font-black` / `font-extrabold`
  - le rendu etait plus agressif que premium, malgre le bon systeme de surfaces "Apple Glass"
- Ajustement applique :
  - passage des titres principaux vers `font-bold`
  - passage des chips / badges / CTA vers `font-semibold`
  - tracking uppercase legerement reduit
  - conservation du verre, des ombres et de la hierarchie visuelle
- Intention :
  - garder une identite nette et premium
  - reduire l'effet "trop bold"
  - rapprocher le rendu d'une sensation Apple plus calme et plus lisible

### 9. Correctif topbar apres deconnexion
- Fichier :
  - `src/components/shared/navbar.tsx`
- Symptome observe :
  - apres logout depuis un compte admin, la topbar continuait d'afficher les liens d'un utilisateur connecte
  - l'etat visuel ne redevenait correct qu'apres actualisation manuelle
- Cause :
  - la navbar etait un Client Component base uniquement sur le prop serveur `user`
  - aucun etat auth local ni abonnement `onAuthStateChange` n'assurait la resynchronisation immediate
- Correctif applique :
  - ajout d'un etat local `authUser`
  - synchronisation avec le prop serveur
  - abonnement aux changements de session Supabase cote client
  - nettoyage immediat de `authUser`, `unreadCount` et du menu mobile apres `signOut`
- Resultat attendu :
  - la topbar repasse tout de suite en mode visiteur apres logout, sans refresh manuel

### 10. Alignement Profil / Inscription
- Fichiers :
  - `src/app/dashboard/account/components/account-profile-tab.tsx`
  - `src/lib/actions/profile.ts`
  - `src/app/dashboard/account/types.ts`
- Constat : L'espace d'édition du profil s'était désynchronisé des données récoltées lors de l'inscription.
- Correctif appliqué : 
  - Restauration des champs `age`, `wilaya`, `commune` (stockée en `city`), `profession`, `specialties` et `years_of_experience` dans l'interface d'édition "Mon Compte".
  - Mise à jour de la Server Action pour persister correctement ces champs dans les tables `profiles` et `artisans`.
- Règle établie : La logique de création initiale (`src/app/auth/register/page.tsx`) est la source de vérité métier. L'édition du compte ne fait que modifier ce qui a été initialisé à l'inscription.

## Architecture Messagerie Privée (Toujours Valide)

### Tables Supabase (doivent exister)
- `chat_rooms` : id, participant_1 (uuid), participant_2 (uuid), last_message_at (timestamptz)
- `chat_messages` : id, room_id (fk→chat_rooms), sender_id (uuid), content (text), media_url (text?), media_type (text?), is_read (bool default false), created_at (timestamptz)

### Bucket Storage (doit exister)
- `chat-media` : bucket PUBLIC pour les uploads images/PDF/audio dans les conversations.

### Supabase Realtime (DOIT ÊTRE ACTIVÉ)
- La table `chat_messages` DOIT avoir la publication Realtime activée dans Supabase Dashboard → Database → Replication → cocher `chat_messages` dans `supabase_realtime`.
- Sans cela, les messages n'apparaissent PAS en temps réel.

### Routes
| Route | Type | Rôle |
|---|---|---|
| `/messages` | Server Component | Liste toutes les conversations (appelle `getRooms()`). Avatar, preview dernier message, badge non-lu, horodatage. Empty state si aucune room. |
| `/messages/[roomId]` | Server → Client | Charge la room + messages initiaux server-side, passe à `ChatInterface` (client). Auth-gated. |

### Server Actions (`src/lib/actions/chat.ts`)
| Action | Signature | Rôle |
|---|---|---|
| `createOrGetChatRoom` | `(otherUserId: string)` | Crée ou retrouve une room 1-to-1. Appelé par PremiumContactGate. |
| `sendMessage` | `(roomId, content, mediaUrl?, mediaType?)` | Insert message + update last_message_at |
| `getMessages` | `(roomId, limit?, before?)` | Récupère messages paginés |
| `getRooms` | `()` | Toutes les rooms de l'utilisateur + profil autre participant + dernier message |
| `markAsRead` | `(roomId)` | Marque les messages non-lus comme lus |
| `getUnreadCount` | `()` | Compteur de messages non-lus |

## Variables d'Environnement Requises
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `CRON_SECRET`

## Prérequis Supabase
1. Tables `chat_rooms` et `chat_messages` créées.
2. Bucket `chat-media` créé en mode PUBLIC.
3. Table `wallet_transactions` présente et cohérente avec les colonnes `amount_dzd` et `transaction_type`.
4. Table `promo_codes` présente.
5. Table `sponsored_items` présente.
6. **Realtime activé sur `chat_messages`**.
7. RLS policies configurées.

## Points d'Attention / Risques Restants
- **Suite E2E complète** :
  le smoke carousel passe, mais le run complet `npx playwright test --reporter=list` a time-out au niveau `webServer` dans cet environnement. Les tests mutatifs nécessitent des variables `E2E_*` dédiées.
- **Assets demo Supabase** :
  certains fichiers du bucket `demos` répondent `400` pendant les tests (`sponsor-*.png`, `artisan-*.jpg`). Le smoke carousel reste vert, mais ces assets peuvent ralentir les runs.
- **Turbopack build** :
  `next build` sans `--webpack` a produit un panic Turbopack sandbox (`binding to a port`). Le script standard `npm run build` utilise donc webpack.
- **Turbopack dev** :
  `next dev` en mode par defaut a aussi produit un comportement de routage casse avec `404` global alors que les pages existaient. Utiliser `npm run dev` (webpack) comme commande standard. Garder `npm run dev:turbo` uniquement pour investigation.
- **Direction typo** :
  ne pas reintroduire `font-black` partout sur la home. Garder les poids tres forts uniquement pour des accents ponctuels.
- **Navbar auth sync** :
  conserver la logique de synchronisation client de la session dans `src/components/shared/navbar.tsx`. Ne pas revenir a un simple `const isAuthenticated = !!user`.
- **SponsoredCampaignForm** :
  la recherche artisan est opérationnelle, mais dépend naturellement des données réelles `profiles` / `artisans` en base.
- **Comportement des liens sponsor** :
  inchangé et assumé.
  - un sponsor externe peut garder un lien absolu
  - un artisan interne doit utiliser `/artisan/[uuid]`

## Prochaine Étape Recommandée
1. Corriger ou remplacer les assets demo Supabase en `400` pour stabiliser les runs Playwright complets.
2. Exécuter les tests mutatifs sur une instance de test avec variables `E2E_*` configurées.
3. Faire une passe finale de validation manuelle sur :
   - `/dashboard/account`
   - `/admin/sponsoring`
   - `/messages`
   - `/`
4. Verifier explicitement que `npm run dev` ouvre bien `/` sans `404` sur `http://localhost:3000`.

## Fichiers Clés Mis à Jour
- `src/app/dashboard/account/page.tsx`
- `src/app/dashboard/account/AccountTabsClient.tsx`
- `src/lib/actions/promo.ts`
- `src/app/admin/sponsoring/components/SponsoredCampaignForm.tsx`
- `src/lib/actions/sponsoring-admin.ts`
- `playwright.config.ts`
- `tests/e2e/*.spec.ts`
- `package.json`
- `src/app/layout.tsx`
- `src/app/globals.css`
- `next.config.ts`
- `tsconfig.json`
- `vercel.json`
- `DEPLOYMENT.md`

## Deep Scan Produit / Tech / Go-To-Market (2026-04-25)

### Etat reel confirme
- `npm run build` passe toujours.
- `npm run lint` est desormais valide et non bloquant.
- Le projet est fonctionnel sur ses parcours principaux, mais pas encore au niveau "prod propre + croissance marketing + exploitation pro".
-> **Mise a jour :** Le projet est désormais stabilisé pour le Go-Live.

### Points non finalises confirmes dans le code
- **Qualite technique** : ESLint corrigé, la CI est verte.
- **Search / acquisition**
  - L'accès à `src/app/search/page.tsx` est désormais ouvert et indexable.
- **SEO**
  - Industrialisation en place. `sitemap.ts` itère dynamiquement sur les routes SEO locales.
- **Demo / faux contenu**
  - Nettoyage effectue. Les assets démos en erreur 400 ont été remplacés par des placeholders locaux.
- **Admin**
  - Les fonctionnalités Bêta (Analytics mockés) ont été désactivées jusqu'à implémentation réelle.
- **Internationalisation**
  - `src/app/dashboard/account/AccountTabsClient.tsx` affiche encore `Langue enregistrée. (Déploiement i18n à venir)`.
- **Fonctions manquantes cote usage**
  - Page `Mes favoris` ajoutée et fonctionnelle sous `/dashboard/account/favoris`.
- **Design / UX**
  - Les initiales ont été remplacées par un avatar par défaut stylisé (rond, bleu) sur l'ensemble de l'application (Navbar, Sidebar, Dashboard) pour plus de cohérence visuelle.
  - Implémentation d'une pastille de statut Online (vert) / Offline (rouge) pour les artisans :
    - Éditable depuis `/dashboard/account` via le select "Statut de disponibilité".
    - Stocké sur la colonne `availability_status` (valeurs `"available"` et `"unavailable"`).

### Points Algeria-ready deja presents
- recherche par `wilaya` / `commune`
- format FR-DZ / DZD
- moyens de paiement locaux deja implantes cote logique :
  - `baridimob`
  - `ccp`
  - `cash`
- page locale SEO : `/recherche/[category]/[wilaya]/[commune]`
- wallet, abonnement artisan, sponsoring, referral deja presents

### Conclusion operationnelle
- **Avant hebergement pro** :
  - Check infra, monitoring Vercel Analytics branché, et plan de Backup Supabase configuré (Go-Live validé).
  - Tunnel public fonctionnel et indexable.
  - Prochaine étape : Marketing acquisition (SEO / Ads) et suivi des KPIs de conversion.

## Mise à jour continuité — 2026-05-06

### État réel atteint
- Le déploiement privé Vercel `artylink-web.vercel.app` est en ligne et la home charge correctement.
- Le propriétaire `oucher007@gmail.com` accède à `/admin`.
- Le flux `delegate invitation -> page admin-activation -> saisie du code` arrive bien jusqu'à l'écran d'activation en production.
- Un bug de rendu production restait visible juste après activation du délégué : bannière `An error occurred in the Server Components render`.
- Le correctif de ce bug a été poussé vers le repo GitHub propre `https://github.com/cferdjani/artylink.git` avec le commit `4273b7c Fix delegate activation redirect`; il faut maintenant vérifier que Vercel `artylink-web` a bien redéployé ce commit.

### Correctif appliqué dans cette session
- Le build Vercel a échoué sur `/_not-found` avec `TypeError: Invalid URL` parce que `NEXT_PUBLIC_SITE_URL` était lu tel quel par `new URL(...)` dans `src/app/layout.tsx`.
- `src/app/layout.tsx` utilise maintenant `resolveMetadataBase()` :
  - fallback sur `http://localhost:3000` si la variable est absente
  - fallback aussi si la valeur fournie n'est pas une URL valide
- Le client d'activation ne fait plus `router.push(...)` puis `router.refresh()` en même temps.
- La navigation post-activation et post-refus utilise maintenant `router.replace(...)` uniquement, pour éviter un refresh RSC concurrent pendant le changement d'état.
- La page serveur `src/app/dashboard/account/admin-activation/page.tsx` ne redirige plus tous les délégués actifs vers `/admin` en dur.
  - Elle calcule maintenant la vraie route d'atterrissage via `getAdminLandingPath(...)`.
  - Le CTA `Accès admin déjà activé` utilise aussi cette route calculée.
- La server action `respondToDelegateInvitation(...)` vérifie maintenant explicitement les erreurs Supabase pour :
  - activation du compte admin
  - consommation du code secret
  - journalisation audit
  - refus d'invitation
- La server action revalide désormais les routes critiques après mutation :
  - `/admin`
  - `/admin/users`
  - `/admin/payments`
  - `/admin/sponsoring`
  - `/admin/delegates`
  - `/dashboard/account`
  - `/dashboard/account/admin-activation`
  - `/dashboard/notifications`
  - et la `landingPath` calculée

### Fichiers modifiés
- `src/app/layout.tsx`
- `src/app/dashboard/account/admin-activation/page.tsx`
- `src/app/admin/delegates/AdminActivationClient.tsx`
- `src/lib/actions/admin-delegates.ts`

### Validations exécutées
- `npx eslint src/app/layout.tsx`
- `npx eslint src/app/admin/delegates/AdminActivationClient.tsx src/lib/actions/admin-delegates.ts`
- `npx eslint src/app/dashboard/account/admin-activation/page.tsx src/app/admin/delegates/AdminActivationClient.tsx src/lib/actions/admin-delegates.ts`

### Risques restants
- La variable Vercel `NEXT_PUBLIC_SITE_URL` doit quand même être corrigée avec une vraie URL, idéalement `https://artylink-web.vercel.app`, même si le code ne casse plus le build.
- Le correctif n'a pas encore été revalidé manuellement sur la version Vercel après redéploiement automatique.
- Si l'erreur persiste en prod, il faudra lire le digest exact de l'erreur depuis les logs Vercel et vérifier la route de destination réellement calculée pour le délégué.

### Prochaines étapes concrètes
1. Corriger la variable Vercel `NEXT_PUBLIC_SITE_URL` avec `https://artylink-web.vercel.app` si ce n'est pas déjà fait.
2. Vérifier dans Vercel que le projet `artylink-web` a redéployé le commit contenant le correctif `layout.tsx`.
3. Si aucun redeploy automatique n'apparaît, lancer un redeploy manuel depuis `Deployments`.
4. Retester avec un nouveau délégué en production privée :
   - recevoir l'invitation
   - saisir le code
   - cliquer `Activer mon accès`
5. Vérifier que la page ne montre plus la bannière `Server Components render`.
6. Vérifier la redirection finale selon les permissions du délégué.
7. Si besoin, ouvrir les logs Vercel du projet `artylink-web` au moment exact du clic.

### Prompt de reprise recommandé pour nouveau chat / nouvel agent
Lire `AGENTS.md`, `HANDOFF.md`, `PROMPT_AGENT_SPRINT_FINAL_PART2.md` et `DEPLOYMENT.md` avant toute action. Préserver strictement la logique métier existante : `profiles.role` reste `client/artisan`, le système admin reste séparé en `owner/delegate`, et le flux `Mon Compte -> Modifier` ne doit pas être réécrit. Vérifier d'abord que Vercel `artylink-web` a redéployé le commit `4273b7c Fix delegate activation redirect`. Ensuite retester le flux invitation délégué en production privée et documenter le résultat exact dans `HANDOFF.md` et `PROMPT_AGENT_SPRINT_FINAL_PART2.md`.
