# 07 — Plan de Développement Design + Frontend Catégories (Vision Expert Web App)

## 1. Contexte et objectif produit
Ce plan complète les documents existants (architecture globale, frontend Flutter, admin/monitoring) et fournit une feuille de route orientée exécution pour:
- Structurer l'expérience Frontend autour des catégories métiers.
- Concevoir une UI web crédible, performante et scalable.
- Accélérer la livraison MVP sans dette UX bloquante.

Objectif principal:
- Transformer la Home en point d'entrée conversion avec accès direct aux catégories, recherche guidée, et parcours clair jusqu'à la réservation.

---

## 2. Aperçu du début (Quick Start des 10 premiers jours)
### Jour 1-2: Stabilisation UI de base
- Corriger les débordements visuels (hero, CTA, cards) sur web desktop/tablet/mobile.
- Uniformiser spacing, radius, tailles de boutons et grilles avec les tokens existants.
- Mettre en place une checklist responsive systématique sur 3 breakpoints: 390 / 768 / 1366.

### Jour 3-4: Bloc Catégories Home (MVP)
- Ajouter une section "Catégories populaires" sur la Home (8-12 items).
- Chaque catégorie renvoie vers route filtrée (search avec categorySlug).
- Ajouter états de survol/focus/accessibilité clavier pour usage web.

### Jour 5-7: Page Catégorie dédiée
- Créer route `/category/:slug` avec:
  - bannière catégorie,
  - sous-filtres (prix, note, dispo, distance),
  - tri,
  - liste artisans + pagination/chargement progressif.
- Afficher empty state utile: "Aucun artisan disponible" + suggestions proches.

### Jour 8-10: Conversion vers booking
- Optimiser le passage Search -> ArtisanDetail -> Booking:
  - CTA primaires explicites,
  - sticky action bar en web,
  - réduction du nombre de clics.
- Instrumenter les événements analytics de funnel (view_category, view_artisan, start_booking).

---

## 3. Stratégie Design Frontend (Web-First)
## 3.1 Principes UX
- Clarté avant densité: hiérarchie visuelle forte, 1 action principale par section.
- Progressivité: filtres avancés masqués par défaut, accessibles en un clic.
- Confiance: badges vérifié/disponible, avis, délai de réponse visibles tôt.
- Continuité: même structure de carte artisan partout (Home, Search, Catégorie).

## 3.2 Design System opérationnel
- Couleurs: conserver la palette actuelle (orange primaire + bleu secondaire) avec contrastes AA.
- Typographie: Poppins (titres), Inter (contenu), échelle stable (12/14/16/20/28/36).
- Spacing: appliquer strictement les tokens (`xs/sm/md/lg/xl/xxl`).
- Composants critiques:
  - `CategoryChip`
  - `CategoryCard`
  - `FilterDrawer/FilterPanel`
  - `ArtisanCard` (version standard + compacte)
  - `StickyBookingCTA`

## 3.3 Accessibilité et web ergonomie
- Navigation clavier complète (tab order logique).
- Focus ring visible sur boutons/champs/filtres.
- Cibles interactives >= 44x44.
- Labels explicites + textes alternatifs images.

---

## 4. Modèle Catégories (produit + frontend)
## 4.1 Taxonomie recommandée
Niveau 1 (domaines):
- Habitat technique
- Finition & rénovation
- Extérieur
- Services & maintenance

Niveau 2 (catégories opérationnelles):
- plomberie, electricite, maconnerie, peinture, menuiserie
- carrelage, toiture, vitrier, climatisation, serrurerie
- jardinage, nettoyage, demenagement, debarras, informatique

## 4.2 Priorisation business
P0 (lancement): plomberie, electricite, maconnerie, peinture, menuiserie
P1: carrelage, toiture, climatisation, serrurerie, jardinage
P2: nettoyage, demenagement, debarras, vitrier, informatique

## 4.3 Données front minimales par catégorie
- `slug`
- `name`
- `icon`
- `color`
- `heroImage` (optionnel)
- `seoTitle` / `seoDescription` (web)
- `isPopular`
- `order`

---

## 5. Architecture Frontend ciblée (pages catégories)
## 5.1 Pages à implémenter/prioriser
- Home enrichie:
  - Hero + recherche rapide
  - Catégories populaires
  - Artisans mis en avant
  - Bloc réassurance (avis, sécurité, délai)
- SearchPage:
  - mode liste/carte
  - tri + filtres combinés
- CategoryPage (`/category/:slug`):
  - intro catégorie
  - sous-catégories/services fréquents
  - résultats contextualisés
- ArtisanDetailPage:
  - preuve sociale en haut de page
  - CTA réservation toujours visible

## 5.2 Composants UI prioritaires
- `CategoriesGridWidget` (responsive)
- `CategoryHeroBanner`
- `SortOptionsWidget`
- `ActiveFiltersBar`
- `NoResultsSuggestionWidget`

## 5.3 Gestion d'état et navigation
- `SearchProvider` devient source unique des filtres actifs.
- `GoRouter` avec query params partagés (category, city, rating, price).
- Deep links web natifs pour partage/reprise session.

---

## 6. Plan de développement détaillé (6 semaines)
## Semaine 1 — Fondations UX/UI
- Corriger overflow, spacing, comportements responsive.
- Refactor des composants visuels critiques (AppBar, Hero, Cards).
- Mettre en place une page de preview interne des composants (catalogue UI).

Livrables:
- Home stable sur 3 breakpoints.
- Tokens appliqués de façon homogène.

## Semaine 2 — Domaine Catégories
- Implémenter `Category` model complet + mapping JSON.
- Construire `CategoriesGridWidget` + navigation vers recherche/category.
- Intégrer les 15 catégories définies dans l'architecture.

Livrables:
- Section catégories utilisable en production.
- Routing fonctionnel par slug.

## Semaine 3 — CategoryPage complète
- Développer layout catégorie avec filtres rapides.
- Ajouter tri + empty states + skeleton loading.
- Brancher provider/repository sur requêtes filtrées.

Livrables:
- Funnel catégorie -> liste artisans opérationnel.

## Semaine 4 — Conversion et booking
- Harmoniser CTA sur Search/Detail/Category.
- Ajouter sticky CTA web et simplifier booking step 1.
- Réduire friction formulaire (auto-complétion, validation inline).

Livrables:
- Funnel complet jusqu'à création de réservation.

## Semaine 5 — Qualité web app
- Accessibilité (focus, contrastes, labels, clavier).
- Performance UI (lazy list, images optimisées, cache).
- QA visuelle cross-browser (Chrome, Safari, Firefox).

Livrables:
- Score Lighthouse cible:
  - Performance >= 80
  - Accessibility >= 90
  - Best Practices >= 90

## Semaine 6 — Finition et industrialisation
- Instrumentation analytics funnel.
- Documentation composants/pages.
- Préparation release checklist + rollback plan.

Livrables:
- Version release candidate.
- Plan post-lancement (améliorations P1/P2).

---

## 7. Backlog fonctionnel Catégories (priorisé)
P0:
- Grille catégories Home
- Navigation vers Search filtrée
- CategoryPage avec listing
- Filtres essentiels (note, disponibilité, prix)
- CTA booking clair

P1:
- Sous-catégories et services fréquents
- Bloc FAQ catégorie
- SEO title/description catégorie
- Recommandations d'artisans similaires

P2:
- Personnalisation par ville
- Tendances saisonnières (catégories en avant)
- Suggestion intelligente selon historique utilisateur

---

## 8. KPIs produit et UX (à suivre dès MVP)
- CTR bloc catégories Home.
- Taux de passage Home -> Search/Category.
- Taux de passage Category -> ArtisanDetail.
- Taux de démarrage réservation depuis CategoryPage.
- Taux de complétion réservation.
- Temps moyen pour trouver un artisan (objectif < 2 min).

---

## 9. Gouvernance de livraison
- Sprint planning hebdo (objectifs mesurables).
- Revue design/front conjointe (30 min, 2 fois/semaine).
- Démo fin de sprint avec checklist UX.
- Décisions formalisées dans changelog produit.

Definition of Done (par feature):
- Responsive validé 3 breakpoints.
- Accessibilité minimale vérifiée.
- États loading/empty/error implémentés.
- Tracking analytics branché.
- Tests widget de base passants.

---

## 10. Risques et mitigation
- Risque: dérive visuelle entre pages.
  - Mitigation: composants partagés + tokens stricts.
- Risque: lenteur perçue sur recherche.
  - Mitigation: skeletons, pagination, cache, debounce.
- Risque: complexité filtres.
  - Mitigation: filtres de base visibles, avancés en panneau.
- Risque: faible conversion booking.
  - Mitigation: CTA persistants + simplification formulaire.

---

## 11. Actions immédiates recommandées
1. Finaliser la Home responsive sans overflow ni collisions.
2. Implémenter la grille catégories P0 et route `/category/:slug`.
3. Standardiser `ArtisanCard` et CTA de réservation.
4. Ajouter instrumentation analytics des étapes clés.
5. Lancer un sprint UX d'optimisation du funnel catégorie -> booking.
