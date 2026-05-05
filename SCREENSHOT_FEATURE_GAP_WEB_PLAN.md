# Plan d'enrichissement Web inspire des screenshots APK (sans Flutter)

Date: 2026-04-05
Portee: Next.js web uniquement, sans modification de direction graphique ni changement de logique metier existante.

## 1) Ce que montrent clairement les screenshots

### A. Recherche orientee conversion
- Recherche combinee Localisation + Service.
- Categories visuelles rapides.
- CTA direct: Reserver / Publier une demande.
- Liste prestataires avec badges (verifie/nouveau), note, mini-galerie.

### B. Filtres metier en 3 axes
- Onglet Services: filtrage simple des prestataires.
- Onglet Calendrier: filtrage par date + creneaux.
- Onglet Questions: qualification metier (checklist/reponses).

### C. Tunnel reservation
- Selection adresse de service (bottom sheet).
- Selection disponibilite (date + heures).
- Validation finale.

### D. Espace client exploitable
- Mes reservations / Mes demandes / Services confirmes.
- Agenda + Historique (Termines, Annules).
- Etats vides avec CTA utiles (chercher pro, nouvelle demande, voir agenda).

### E. Fidelisation et compte
- Credits/coins et services exclusifs.
- Codes promo.
- Inviter des amis.
- Devenir professionnel.
- Support client, FAQ, feedback.
- Messagerie vide mais structuree.

## 2) Mapping avec votre web actuel (constat)

Deja present dans le web:
- Recherche + listing + pagination.
- Fiche artisan + avis + portfolio + gate premium contact.
- Messagerie (rooms + chat).
- Dashboard + notifications + abonnement.
- RFQ (demande/projet).

Manques prioritaires par rapport aux screenshots:
- Vue "Mes services" (reservations, demandes, confirmes) dediee client.
- Vue Agenda/Historique avec filtres statut.
- Filtrage "Calendrier" dans la recherche prestataires.
- Filtrage "Questions de qualification" (metier-specifique).
- Selection adresse de service dans le parcours de reservation.
- Centre compte unifie (langue, profil, mot de passe, support, promo, referral).

## 3) Backlog recommande (zero rupture)

## Sprint 1 (impact fort, risque faible)

### 1. Page client "Mes services"
- Route: /dashboard/services
- Onglets:
  - Mes reservations (bookings initiees)
  - Mes demandes (RFQ creees)
  - Services confirmes (bookings accepted/completed)
- CTA etats vides:
  - Chercher un professionnel -> /search
  - Nouvelle demande -> /rfq/new
  - Voir agenda -> /dashboard/calendar

### 2. Page "Calendrier" (Agenda + Historique)
- Route: /dashboard/calendar
- Sous-onglets:
  - Agenda (a venir)
  - Historique (termines/annules)
- Filtres:
  - Tout / Termines / Annules
- Source:
  - bookings + rfq_bids (si confirme)

### 3. Centre compte web
- Route: /dashboard/account
- Sections:
  - Langue
  - Editer profil
  - Changer mot de passe
  - Codes promo
  - Inviter des amis
  - Devenir professionnel
  - Support client, FAQ, Feedback

## Sprint 2 (qualification et conversion)

### 4. Filtre "Calendrier" sur listing artisans
- Ajout dans /search:
  - date (optionnelle)
  - slots[] (matin/apres-midi/soir ou heures exactes)
- Application:
  - pre-filtrage via disponibilites artisan
  - fallback sans rupture si data indisponible

### 5. Filtre "Questions" metier
- Configurable par categorie (schema JSON).
- UI accordion avec checkboxes/select.
- Injecter en query params et dans RPC de recherche avancee.

### 6. Adresse de service (modal web)
- Au clic reserver:
  - modal "Adresse du service"
  - choix adresse existante ou ajout rapide
- Enregistrement dans booking_request.address_snapshot.

## Sprint 3 (monetisation legere)

### 7. Wallet credits / coins
- Affichage simple du solde + historique mouvement.
- Usage initial:
  - debloquer options premium (ex: contact direct, mise en avant, quote prioritaire).

### 8. Codes promo + referral
- Promo code apply sur abonnement.
- Referral code generation + suivi invitations.

## 4) Contrat technique minimal (sans casser)

### UI/UX
- Reutiliser vos composants existants (GlassCard, cards, pills, empty states).
- Ne pas modifier la DA globale (couleurs/typos/layout principal).
- Ajouter des routes et sections, pas de refonte de structure.

### Data model (propose)
- user_addresses (id, user_id, label, line1, city, wilaya, is_default)
- booking_slots (id, artisan_id, start_at, end_at, status)
- qualification_templates (id, category_slug, schema_json)
- qualification_answers (id, user_id, artisan_id, payload_json)
- wallet_ledger (id, user_id, delta, reason, ref_type, ref_id)
- promo_codes, promo_redemptions
- referrals

### API/Server actions
- getClientServicesSummary()
- getCalendarEvents(range, status)
- searchArtisansAdvancedV2({q, geo, category, date, slots, qualifiers})
- upsertUserAddress()
- createBookingWithAddress()
- applyPromoCode()

## 5) Priorisation concrete (ordre recommande)

1. /dashboard/services
2. /dashboard/calendar
3. /dashboard/account
4. Adresse de service dans reservation
5. Filtres calendrier + questions dans /search
6. Promo + referral
7. Wallet coins

## 6) Criteres d'acceptation

- Aucun changement visuel majeur (look & feel conserve).
- Aucune regression auth, search, artisan detail, messages.
- Pages vides toutes actionnables avec CTA utiles.
- Temps de chargement stable (pas de requetes bloquantes non necessaires).
- Nouvelles features guardees par RLS et server-side checks.

## 7) Risques a eviter

- Coupler trop tot wallet/paiement reel (commencer ledger simple).
- Mettre des filtres questions "hard-coded" au lieu d'un schema par categorie.
- Exposer donnees sensibles dans payload client (garder checks server-side).
- Introduire des routes sans etats vides et CTA de sortie.
