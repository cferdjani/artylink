# ArtyLink — Regles Metier Actuelles

Derniere mise a jour: 2026-05-08

Ce fichier est la source produit/metier courte. Pour le schema technique exact, `artylink.sql` reste prioritaire.

## 1. Position Produit

ArtyLink est une plateforme de contact et de visibilite locale pour artisans, freelances, prestataires, entreprises et sponsors.

ArtyLink sert a:

- aider les visiteurs a trouver un professionnel par metier et localisation
- afficher des cartes de visite publiques et portfolios
- vendre de la visibilite payante
- diffuser des campagnes sponsorisees et publicites
- faciliter le contact direct entre utilisateurs
- afficher des avis sans les presenter comme garantie ArtyLink

ArtyLink ne sert pas a:

- certifier publiquement la qualite d'un artisan
- arbitrer les conflits
- garantir les paiements ou prestations hors plateforme
- stocker des contrats ou accords commerciaux
- promettre une absence de risque

## 2. Role et Admin

`profiles.role` est un role metier:

- `client`
- `artisan`

Le schema actuel accepte aussi `admin`, mais le code ne doit pas construire la logique admin dessus.

Les droits admin doivent rester separes:

- `admin_accounts`
- `admin_permissions`
- owner principal via email configure
- delegates permissionnels

Ne pas reutiliser `profiles.role = admin` comme garde principal.

## 3. Plans de Visibilite

Le marketing peut afficher:

- Basique
- Starter
- Pro

Le schema strict actuel dans `artylink.sql` impose pour `artisans.subscription_tier`:

- `free`
- `premium`
- `vip`

Mapping obligatoire:

- Basique -> `subscriptions.plan_type = free` -> `artisans.subscription_tier = free`
- Starter -> `subscriptions.plan_type = starter` -> `artisans.subscription_tier = premium`
- Pro -> `subscriptions.plan_type = pro` -> `artisans.subscription_tier = vip`

Un abonnement donne de la visibilite, pas une certification.

## 4. Sponsoring et Banniere Publicitaire

La banniere homepage style Alibaba est un inventaire publicitaire payant.

Elle peut afficher:

- artisan sponsorise
- sponsor marque
- produit ou service publicitaire
- promotion interne ArtyLink
- campagne ciblee par wilaya ou categorie

Une campagne doit idealement avoir:

- type
- placement
- titre
- sous-titre
- image
- lien cible
- date de debut
- date de fin
- statut
- priorite
- duree d'affichage
- traces admin

L'abonnement artisan et la campagne sponsorisee sont deux produits differents.

## 5. Recherche et Pages Publiques

La recherche doit prioriser:

1. pertinence metier
2. localisation
3. campagne sponsorisee pertinente
4. niveau de visibilite
5. activite et qualite de fiche
6. note et avis si disponibles

Interdits:

- priorite par pseudo-certification qualite
- badge public qui laisse croire a une garantie ArtyLink
- resultat sponsorise totalement hors sujet

## 6. Contact et Donnees Sensibles

La grille d'annonces peut afficher:

- avatar
- nom
- metier
- wilaya/commune generale
- note
- badge de visibilite

La fiche `/artisan/[id]` gere le detail et le masquage:

- visiteur non connecte: contacts masques
- utilisateur connecte: contacts selon regles actuelles

Ne pas dupliquer le masquage contact dans les cartes homepage.

## 7. Seeds et Demo

`seed_100_artisans.sql` est un seed de test uniquement.

Il doit respecter `artylink.sql`:

- `subscription_tier` en `free`, `premium`, `vip`
- `review_count`, pas `reviews_count`
- aucune colonne inexistante comme `status`

Ne pas executer un seed sans verifier la compatibilite DB.

## 8. Regle de Reprise

Avant toute action:

1. lire `AGENTS.md`
2. lire `HANDOFF.md`
3. lire `PROMPT_AGENT_SPRINT_FINAL_PART2.md`
4. lire `artylink.sql`
5. lire `PROJECT_CURRENT_STATE.md`
6. lire ce fichier

Fin de session:

- mettre a jour `HANDOFF.md`
- mettre a jour `PROMPT_AGENT_SPRINT_FINAL_PART2.md`
- indiquer les validations reelles
