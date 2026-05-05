# 08 - Plan Strategique Detaille (Algerie) - Code, Marketing, Architecture Metier

## 1. Vision et perimetre
Objectif: construire une plateforme services/artisans robuste, monetisable et securisee pour l'Algerie, avec:
- Catalogue large categories + sous-categories.
- Acquisition et conversion rapides (marketing + UX).
- Paiement local (BaridiMob, CCP) + sponsoring publicitaire.
- Geolocalisation utilisateurs/artisans fiable.
- Architecture backend et logique metier solides et difficilement contournables.

Ce plan est concu pour une execution pragmatique en 4 phases, avec gouvernance securite des le debut.

---

## 2. Catalogue categories/sous-categories (base produit)
## 2.1 Categories prioritaires ajoutees
- Depannage ascenseurs
- Ferronnier
- Freelancer
- Depannage informatique
- Assistant IA
- Vulcanisateur
- Lavage voiture
- Electricien auto
- Electricien batiments
- Electricien industriel
- Demolition

## 2.2 Domaines metier (niveau macro)
- Habitat et batiment
- Automobile et mobilite
- Digital et services pro
- Maintenance et depannage
- Nettoyage et logistique

## 2.3 Strategie sous-categories
Pour chaque categorie:
- 3 a 8 sous-categories standardisees.
- Mapping vers tags de recherche (synonymes FR/AR).
- Mapping vers niveau d'urgence: immediate, 24h, planifie.

Exemple:
- Electricien batiments:
  - Mise aux normes
  - Installation reseau
  - Tableau electrique
  - Diagnostic panne

---

## 3. Parcours utilisateur et conversion
## 3.1 Funnel principal
1. Acquisition (SEO/Ads/Referral)
2. Home + categorie
3. Liste artisans filtree
4. Detail artisan
5. Contact rapide (appel, WhatsApp, message)
6. Reservation
7. Paiement/acomptes
8. Avis et reengagement

## 3.2 Contact multi-canal
Canaux a integrer cote front et backend:
- Appel telephonique (click-to-call)
- SMS (liens pre-remplis + OTP)
- WhatsApp (message pre-rempli)
- Chat interne (historise et moderable)

Regle metier:
- Les coordonnees directes completes ne sont visibles qu'apres action qualifiante (demande/reservation) pour limiter la desintermediation.

---

## 4. Inscription et authentification (Gmail, tel, SMS, WhatsApp)
## 4.1 Modes d'inscription
- Email + mot de passe
- Google (Gmail OAuth)
- Telephone + OTP SMS

## 4.2 Validation et anti-fraude
- OTP obligatoire pour telephone.
- Verification email obligatoire pour comptes sensibles.
- Device fingerprint + limitation tentatives connexion.
- Blocage progressif (rate limit + cooldown) en cas d'abus.

## 4.3 Workflow recommande
1. User choisit mode d'inscription.
2. Verification OTP/email.
3. Completion profil minimal.
4. KYC artisan (documents) si role artisan.
5. Activation role selon verification admin.

---

## 5. Paiements Algerie: BaridiMob et CCP
## 5.1 Strategie d'integration
- Mode 1 (court terme): paiement hors-ligne assiste, preuve de paiement upload, verification admin/ops.
- Mode 2 (moyen terme): integration API partenaire PSP local compatible BaridiMob/CCP.

## 5.2 Etats de transaction
- initiated
- pending_verification
- verified
- failed
- refunded

## 5.3 Regles critiques
- Jamais de validation paiement uniquement cote client.
- Verification serveur obligatoire.
- Journal comptable immutable (ledger) pour toutes operations.
- Reconciliation quotidienne automatique + alertes anomalies.

---

## 6. Sponsoring, banniere auto et monetisation pub
## 6.1 Formats publicitaires
- Banniere horizontale auto-rotative (home/search/category).
- Suggestions sponsorisees dans listing artisans (badge Sponsorise).
- Boost categorie pour artisans premium.

## 6.2 Moteur de diffusion
- Ciblage geographique (wilaya/commune).
- Ciblage categorie/sous-categorie.
- Frequency cap par utilisateur.
- Pacing budget journalier.

## 6.3 Transparence et conformité UX
- Marquage clair Sponsorise.
- Separation visuelle entre organique et sponsorise.
- Limite de densite pub pour ne pas casser la conversion.

---

## 7. Geolocalisation artisans et users
## 7.1 Donnees geographiques
- Artisan: wilaya, commune, geohash, lat/lng, rayon d'intervention.
- User: position approx + adresse d'intervention.

## 7.2 Regles privacy
- Position precise jamais exposee publiquement.
- Affichage distance approximate (ex: 2.3 km) et zone.
- Consentement explicite geolocalisation.

## 7.3 Logique de matching
Score global = distance + disponibilite + note + taux de reponse + sponsor weight controle.

Contraintes:
- Le sponsoring ne doit jamais depasser des seuils qui detruisent la pertinence metier.

---

## 8. Architecture technique solide et inviolable
## 8.1 Architecture cible
- Frontend Flutter Web/Mobile
- API BFF (Edge Functions) pour cas sensibles
- PostgreSQL + RLS stricte
- Storage securise (documents, preuves paiement)
- Event bus pour notifications et tracking

## 8.2 Separation des responsabilites
- Provider/UI: etat visuel et interactions
- Repository: acces donnees
- Services metier: regles complexes
- Edge Functions: operations sensibles (paiement, moderation, scoring)

## 8.3 Securite defensive (obligatoire)
- RLS sur toutes tables metier critiques.
- Policies zero trust par role.
- Secrets uniquement cote serveur.
- Signature webhook + anti-replay.
- Chiffrement donnees sensibles au repos et en transit.
- Audit trail non modifiable sur actions admin.

---

## 9. Logique metier robuste
## 9.1 Noyau metier (entities)
- users
- artisan_profiles
- categories
- subcategories
- service_offers
- leads
- bookings
- payments
- sponsorship_campaigns
- ad_impressions
- audit_logs

## 9.2 Regles metier prioritaires
- Un lead a une origine traquable (organique/sponsorise/campagne).
- Une reservation ne passe confirmee qu'apres validation metier.
- Les changements d'etat critiques sont atomiques et historises.
- Les penalites/restrictions artisan sont traçables et reversibles par workflow admin.

## 9.3 Prevention contournement plateforme
- Contact direct masque avant qualification lead.
- Detection numerique motifs de contournement dans chat.
- Alertes anti-fraude sur patterns anormaux.

---

## 10. Plan marketing (acquisition + retention)
## 10.1 Acquisition
- SEO local par categorie + wilaya.
- Campagnes Meta/Google geociblees.
- Partenariats locaux (quincailleries, concessions, syndics).
- Programme referral client et artisan.

## 10.2 Conversion
- Landing pages categorie optimisées.
- Preuves sociales (avis, badges, realisations).
- CTA contact rapide (WhatsApp/Appel).
- Relances automation abandon de reservation.

## 10.3 Retention
- CRM notifications (push, SMS, WhatsApp, email).
- Campagnes saisonnieres (climatisation ete, chauffage hiver).
- Programme fidelite utilisateurs recurrents.

---

## 11. Roadmap execution (12 semaines)
## Phase A (S1-S3): fondations securisees
- Stabiliser model categories/sous-categories.
- Auth multi-mode (email/google/telephone OTP).
- Tracking funnel complet.
- RLS/policies de base + audit logs.

## Phase B (S4-S6): monetisation initiale
- Banniere auto sponsorisee + moteur ciblage basique.
- Gestion campagnes sponsor artisan.
- Contact multi-canal (call/SMS/WhatsApp).

## Phase C (S7-S9): paiements Algerie
- Workflow BaridiMob/CCP mode verification.
- Backoffice verification + reconciliation.
- Reporting finance et anti-fraude.

## Phase D (S10-S12): optimisation et scale
- Matching score avance.
- Optimisations conversion UX.
- Hardening securite + tests de charge.

---

## 12. KPIs et pilotage
Produit:
- Conversion Home -> lead
- Conversion lead -> booking
- Delai moyen prise en charge
- Taux completion reservations

Marketing:
- CAC par canal
- ROI campagnes sponsor
- CTR bannieres et suggestions

Qualite/Securite:
- Taux fraude detectee
- Temps detection incidents
- Taux echec OTP / connexion
- Incidents P0 securite

---

## 13. Checklist inviolabilite (go-live)
- Tous endpoints critiques proteges par verification role + ownership.
- Toutes mutations sensibles passent par fonctions serveur.
- Logs admin immuables actifs.
- Alerting securite (auth anormale, pics fraude, erreurs webhook).
- Sauvegardes automatisees + test restauration.
- Plan de reponse incident documente et teste.

---

## 14. Prochaines actions immediates
1. Ajouter table subcategories + relation categories en base.
2. Mettre en place auth telephone OTP et Google OAuth.
3. Concevoir module contact multi-canal (call/SMS/WhatsApp/chat).
4. Definir schema paiements BaridiMob/CCP (workflow verifie).
5. Creer moteur sponsoring v1 (banniere + resultats sponsorises).
6. Activer audit logs et regles anti-fraude essentielles.
