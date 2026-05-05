# ArtyLink - Regles Metier V4.2

Derniere mise a jour: 2026-04-14

Ce document est la source de verite produit/metier. Toute nouvelle page, action serveur, table SQL ou interface admin doit respecter ce positionnement.

## 1. Position Produit

ArtyLink est une plateforme de contact et une vitrine publicitaire payante.

ArtyLink sert a:

- Aider les visiteurs a trouver des artisans, freelances, entreprises et sponsors.
- Afficher des profils publics, cartes de visite, portfolios et coordonnees.
- Vendre de la visibilite: priorite dans la recherche, mise en avant, carousel, sponsoring, landing/vitrine premium.
- Permettre aux utilisateurs de noter et commenter les profils contactes.
- Permettre aux utilisateurs de bloquer/debloquer d'autres utilisateurs.

ArtyLink ne sert pas a:

- Gerer un portefeuille utilisateur.
- Stocker des transactions utilisateur.
- Stocker des devis, contrats ou conversations.
- Arbitrer les conflits entre utilisateurs.
- Garantir la qualite, l'identite commerciale ou la fiabilite d'un profil.
- Certifier publiquement un artisan comme "verifie".
- Assumer une responsabilite sur les escroqueries, paiements externes, prestations ou accords conclus entre utilisateurs.

## 2. Donnees Que La DB Peut Stocker

La base peut stocker:

- Comptes utilisateurs.
- Role: visiteur implicite, client, artisan, admin.
- Profil public et informations d'inscription.
- Coordonnees choisies par l'utilisateur: email, telephone, liens externes.
- Forfait/niveau de visibilite.
- Portfolio/images selon forfait.
- Notes, avis et commentaires.
- Blocages/deblocages entre utilisateurs.
- Campagnes sponsorisees et contenus publicitaires.
- Logs techniques/admin necessaires a la maintenance.

La base ne doit pas stocker:

- Conversations privees entre utilisateurs.
- Devis ou negociations.
- Contrats.
- Transactions financieres entre utilisateurs.
- Recus ou preuves de paiement utilisateur, sauf decision legale/comptable explicite separee.

## 3. Roles

| Role | Description | Acces |
| --- | --- | --- |
| `visitor` | Non connecte | Recherche, categories, apercus publics |
| `client` | Cherche un contact | Profil, recherche, avis, blocages |
| `artisan` | Professionnel inscrit | Profil public, portfolio, forfait de visibilite |
| `admin` | Proprietaire/maintenance | Admin, forfaits, sponsoring, maintenance |

Regles:

- Le role vient de `profiles.role`.
- L'admin principal est `oucher007@gmail.com`.
- Un artisan est un utilisateur avec `profiles.role = 'artisan'` et une ligne `artisans`.

## 4. Forfaits De Visibilite

Nom public:

- Basique
- Starter
- Pro

Nom technique:

- `basic`
- `starter`
- `pro`

Compatibilite legacy:

- `free` = alias temporaire de `basic`.
- `premium` et `vip` = alias temporaires vers `pro`.

Matrice:

| Droit | Basique | Starter | Pro |
| --- | ---: | ---: | ---: |
| Carte de visite publique | Oui | Oui | Oui |
| Portfolio images | Limite | Plus large | Premium |
| Priorite recherche | Normale | Boost local | Priorite haute |
| Mise en avant searchbar | Non | Oui | Oui |
| Carousel/sponsoring | Achat separe | Achat separe | Achat separe / prioritaire |
| Landing/vitrine premium | Non | Non ou limitee | Oui |
| Analytics visibilite | Non | Basique | Avance |
| Badge de confiance | Non | Non | Non |

Important:

- Un forfait payant augmente la visibilite, il ne garantit jamais le profil.
- ArtyLink ne doit pas afficher "verifie", "certifie", "pro verifie" ou equivalent.
- Le paiement d'un forfait se fait hors logique portefeuille. La DB conserve seulement le forfait actif et les dates utiles.

## 5. Recherche Et Classement

Classement recommande:

1. Pertinence metier/categorie/localisation.
2. Sponsoring actif pertinent.
3. Niveau de visibilite du forfait.
4. Activite/fraicheur du profil.
5. Note moyenne et nombre d'avis, si disponibles.

Interdits:

- Priorite basee sur `is_verified`.
- Resultats sponsorises totalement hors sujet.
- Texte qui laisse croire a une verification de qualite.

## 6. Contact Libre

ArtyLink peut afficher:

- Telephone.
- Email.
- Liens externes: site, WhatsApp, reseaux sociaux.
- Boutons de contact.

ArtyLink ne doit pas conserver:

- Le contenu des conversations.
- Les negociations.
- Les devis.
- Les contrats.

Si une messagerie existe dans le code legacy:

- La neutraliser ou la remplacer par un contact externe/email.
- Ne pas en faire une source de responsabilite ArtyLink.

## 7. Avis Et Notes

ArtyLink peut stocker:

- Note.
- Avis/commentaire.
- Auteur.
- Profil concerne.
- Date.
- Type d'avis: `client_to_artisan` ou `artisan_to_client`.
- Visibilite: `registered_users` ou `artisans_only`.

Regles:

- Les avis sur un artisan sont visibles par tous les utilisateurs inscrits qui ouvrent la fiche artisan.
- Un client ne peut pas voir les avis laisses sur un autre client.
- Un artisan peut laisser une note/avis sur un client seulement si ce client l'a sollicite.
- Les avis sur un client sont visibles uniquement par les autres artisans dans un contexte de sollicitation/contact.
- Le user contacte ne peut pas modifier directement les avis le concernant.
- Prevoir signalement/moderation minimale pour spam, injure grave, contenu illegal ou obligation legale.
- Les avis ne doivent pas etre presentes comme une garantie ArtyLink.

## 8. Favoris

Un utilisateur inscrit peut:

- Ajouter un artisan aux favoris.
- Retirer un artisan des favoris.
- Retrouver ses cartes artisans sauvegardees.

Regles:

- Les favoris sont personnels.
- Un artisan ne doit pas voir la liste nominative des utilisateurs qui l'ont ajoute en favori.
- Les favoris ne sont pas une validation qualite, seulement un outil de confort utilisateur.

## 9. Blocage Utilisateur

Un utilisateur peut:

- Bloquer un autre utilisateur.
- Debloquer un autre utilisateur.

Effets recommandes:

- Masquer ou limiter les actions de contact entre les deux comptes.
- Eviter de recommander fortement un profil bloque.
- Ne pas supprimer les avis deja publies sans moderation explicite.

## 10. Admin

L'admin doit gerer:

- Maintenance plateforme.
- Utilisateurs et profils publics.
- Forfaits/niveaux de visibilite.
- Sponsoring/carousel.
- Contenus abusifs ou illegaux.
- Logs techniques.
- Mise a jour manuelle d'un forfait apres paiement externe.

L'admin ne doit pas gerer:

- Litiges commerciaux entre utilisateurs.
- Remboursements entre utilisateurs.
- Verification de qualite d'un artisan.
- Conversations, devis ou contrats.
- Portefeuilles utilisateurs.

## 11. Paiement Et Monétisation

Principe:

- ArtyLink est paye pour la visibilite.
- La DB ne stocke pas un portefeuille utilisateur.
- La DB ne stocke pas les transactions utilisateur.
- Le forfait actif peut etre stocke.
- Les campagnes sponsorisees peuvent etre stockees.

Flux recommande:

1. User choisit Starter, Pro ou sponsoring.
2. Page explique le prix et la visibilite obtenue.
3. Paiement externe ou process commercial hors plateforme.
4. Admin active le niveau de visibilite.
5. La plateforme affiche le forfait actif, pas l'historique de paiement.

## 12. Pages A Conserver

Prioritaires:

- `/`
- `/search`
- `/recherche/...`
- `/artisan/[id]`
- `/pricing`
- `/dashboard`
- `/dashboard/account`
- `/dashboard/account/portfolio`
- `/dashboard/subscription`
- `/admin`
- `/admin/users`
- `/admin/sponsoring`

Legacy a neutraliser ou remplacer:

- `/dashboard/wallet`
- `/rfq`
- `/messages` si stockage DB de conversation.
- Pages de reservations/devis si elles enregistrent des relations contractuelles.

## 13. Tests Produit

Tests minimum:

- Un visiteur peut chercher et voir les resultats limites.
- Un user inscrit peut voir plus de details profil selon gating.
- Un artisan peut modifier son profil et portfolio.
- Un artisan peut demander un forfait de visibilite sans creation de wallet/transaction DB.
- Admin peut modifier le niveau de visibilite.
- Aucun badge public "verifie/certifie" n'apparait.
- Aucun texte ne promet garantie, securite prestation ou arbitrage.
- Les avis s'affichent sur le profil concerne.
- Les avis artisans sont visibles aux users inscrits.
- Les avis clients ne sont visibles qu'aux artisans.
- Les favoris ajoutent/retirent une carte artisan sans effet de certification.
- Un user bloque ne peut plus contacter facilement l'autre.

## 14. Prompt Court De Continuite

```text
ArtyLink V4.2 = plateforme de contact + vitrine publicitaire payante.
Ne pas reconstruire marketplace lourde, wallet, RFQ, devis, chat persistant ou arbitrage.
La DB stocke comptes, profils, forfaits/niveaux de visibilite, inscriptions, avis, notes, blocages, sponsoring.
La DB ne stocke pas conversations, devis, contrats, transactions utilisateur ou preuves de paiement.
Les forfaits vendent uniquement de la visibilite: searchbar, priorite recherche, carousel, vitrine premium.
ArtyLink ne garantit pas les profils et n'est pas responsable des relations entre utilisateurs.
```
