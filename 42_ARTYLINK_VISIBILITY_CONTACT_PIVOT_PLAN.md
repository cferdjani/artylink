# ArtyLink - Plan Pivot V4.1 Visibilite Et Contact Libre

Date: 2026-04-14

## 1. Nouvelle Position Produit

ArtyLink n'est pas un arbitre de prestations et ne vend pas une garantie de confiance.

ArtyLink vend:

- La visibilite dans la recherche.
- La mise en avant des cartes de visite.
- Le sponsoring et le carousel publicitaire.
- Des vitrines/landing pages premium.
- Des outils pour faciliter la mise en contact.

ArtyLink ne vend pas:

- Une certification artisan.
- Une garantie anti-escroquerie.
- Une mediation des litiges.
- Une responsabilite sur les paiements conclus hors plateforme.
- Une validation de qualite des prestations.
- Un portefeuille utilisateur.
- Le stockage des devis, conversations, contrats ou transactions.

## 2. Regles Business A Appliquer

- Supprimer tous les badges publics "verifie", "certifie", "pro verifie".
- Ne jamais classer un artisan en priorite parce qu'il est "verifie".
- Les forfaits Starter et Pro doivent parler de visibilite, portfolio, analytics, sponsoring et branding.
- L'admin gere paiements, forfaits, campagnes, maintenance et contenus illegaux/spam.
- L'admin ne gere pas les conflits client/artisan.
- Les CGU doivent dire clairement que les utilisateurs echangent sous leur propre responsabilite.
- La DB ne doit stocker que profils, forfaits/niveaux de visibilite, informations d'inscription, avis, notes, blocages et sponsoring.

## 3. Parcours Public

Visiteur:

- Recherche par metier, categorie, wilaya, commune.
- Resultats limites sans details sensibles.
- Acces aux cartes publiques.
- Connexion requise pour contact complet ou details avances si le profil l'exige.

Client:

- Peut contacter, publier une demande, comparer et gerer ses echanges.
- Reste responsable de ses choix, paiements externes et accords.
- Peut bloquer/debloquer un utilisateur.
- Peut noter et laisser un avis visible sur le profil contacte.
- Peut ajouter des cartes artisans en favoris.

Artisan:

- Basique par defaut.
- Peut acheter plus de visibilite via Starter/Pro.
- Peut acheter du sponsoring/carousel selon duree et tarif.

## 4. Admin

Admin doit gerer:

- Activation manuelle des forfaits/niveaux de visibilite.
- Campagnes visibles, suspendues ou expirees.
- Cartes artisans et donnees de profil.
- Logs, analytics, maintenance.
- Retrait de contenu illegal, spam ou abus manifeste.

Admin ne doit pas gerer:

- Litiges commerciaux.
- Qualite de prestation.
- Remboursements entre utilisateurs hors plateforme.
- Certification publique d'un artisan.
- Portefeuilles, conversations, devis ou transactions utilisateur.

## 5. Nettoyage Code Prioritaire

Fait dans cette passe:

- Home: suppression du discours "professionnels verifies".
- Recherche: suppression du tri "verifie d'abord".
- Profil artisan: suppression des badges/statuts publics "Profil Verifie".
- Dashboard artisan: remplacement du statut verification par "Carte de visite visible".
- Pricing/subscription: suppression des badges "Recommande/PRO Certifie" comme avantage.
- Admin users: remplacement de la moderation verification par consultation des cartes artisans.
- Legal/a-propos/footer: repositionnement vers visibilite et contact libre.
- Handoff V4.1: ajout du pivot et des contraintes pour le prochain agent.
- V4.2: `/dashboard/wallet` redirige vers `/dashboard/subscription`; les demandes Starter/Pro ne creent plus de `payment_order`.
- Patch 43: favoris, blocages, avis artisans visibles aux inscrits, avis clients visibles artisans uniquement.

A faire ensuite:

- Auditer les fonctions SQL/RPC pour supprimer tout tri interne par `is_verified`.
- Neutraliser les routes legacy `/rfq`, `/messages` et reservations si elles stockent devis/conversations/relations contractuelles.
- Ajouter un vrai champ de visibilite payante si besoin: `visibility_boost_level`, `sponsored_until`, `plan_rank`.
- Ajouter logs admin pour modifications de forfaits et campagnes, sans conserver de transactions utilisateur.
- Ajouter une page "Mes favoris" dans l'espace compte.
- Ajouter une page/section reputation client visible seulement par les artisans, apres sollicitation.
- Ajouter analytics de visibilite: impressions, clics, contacts, conversions.
- Mettre a jour CGU completes avec limitation de responsabilite detaillee.

## 6. Tests Minimum

- `npx tsc --noEmit`
- `npm run lint -- <fichiers touches>`
- Tester `/`, `/search`, `/recherche/...`, `/artisan/:id`, `/dashboard`, `/admin`, `/admin/users`, `/pricing`.
