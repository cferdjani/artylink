# PROGRESS_LOG_AND_NEXT_STEPS.md

## 1. Fonctionnalités livrées

- Authentification (inscription, connexion, guest mode)
- Navbar avec bouton Accueil, menu utilisateur (Accueil, Dashboard, Déconnexion)
- Accueil principal, recherche et catégories accessibles à tous
- Gating popup (glassmorphism) sur détails artisan pour non-abonnés/non-connectés
- Fiche artisan complète (portfolio, avis, contact, booking, gating premium)
- Messagerie (rooms, chat)
- Dashboard utilisateur (abonnement, notifications, wallet, services)
- RFQ (demande/projet)
- Structure Next.js 16, React 19, Tailwind 4, Supabase

## 2. Roadmap priorisée (Sprints)

### Sprint 1 (impact fort, risque faible)
1. Page client "Mes services" (/dashboard/services)
   - Onglets : Mes réservations, Mes demandes, Services confirmés
   - CTA états vides (chercher pro, nouvelle demande, voir agenda)
2. Page "Calendrier" (Agenda + Historique) (/dashboard/calendar)
   - Sous-onglets : Agenda (à venir), Historique (terminés/annulés)
   - Filtres : Tout / Terminés / Annulés
3. Centre compte web (/dashboard/account)
   - Sections : Langue, profil, mot de passe, codes promo, referral, support

### Sprint 2 (qualification et conversion)
4. Filtre "Calendrier" sur listing artisans (/search)
   - Ajout date/slots, pré-filtrage via disponibilités artisan
5. Filtre "Questions" métier (UI configurable par catégorie)
6. Adresse de service (modal web) lors de la réservation

### Sprint 3 (monétisation légère)
7. Wallet credits/coins (solde, historique, usage premium)
8. Codes promo + referral (application sur abonnement, génération/suivi invitations)

## 3. Conseils de maintenance

- Ne pas casser la structure existante : ajouter routes/pages, ne pas refondre la navigation globale.
- Garder les checks d’accès côté serveur (RLS, Supabase).
- Préférer les composants réutilisables (GlassCard, pills, empty states).
- Garder les pages vides actionnables (CTA utiles).
- Éviter d’exposer des données sensibles côté client.
- Documenter chaque nouvelle route et composant dans le README.

## 4. Prochaines étapes immédiates

- Démarrer Sprint 1 :
  - Créer la page /dashboard/services avec onglets et CTA vides
  - Créer la page /dashboard/calendar avec sous-onglets et filtres
  - Créer la page /dashboard/account avec sections de base

---

*Ce fichier doit être mis à jour à chaque livraison ou début de sprint.*
