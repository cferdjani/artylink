# Checklist par écran — UI / éléments à afficher

## `Splash` / `Onboarding`
- Logo
- Animation / Lottie
- Bouton continuer / skip
- Carousel d'écrans onboarding

## `Auth` (Login / Register / Forgot Password)
- Champs email, mot de passe
- Bouton primaire (Se connecter / S'inscrire)
- Lien mot de passe oublié
- Validation erreurs et loader
- CTA vers onboarding / home après login

## `Home` (Landing)
- Hero Search (barre de recherche)
- Categories Grid (icônes + nom)
- Featured Artisans (carousel ou liste)
- How It Works / Testimonials
- Footer / navigation principale

## `Search` (Résultats)
- Search bar persistante
- Filtres (panel rétractable)
- Boutons tri
- Liste d'artisans (`ArtisanCard`) avec: avatar, nom, ville, note, tags, disponibilité, prix
- Option basculer vers `Map View`
- Chargement infini / message "plus de résultats"

## `Artisan Detail`
- En-tête (photo, nom, badge premium/certif)
- Statistiques (note moyenne, avis count, completed jobs)
- Services listés avec prix
- Portfolio gallery (images cliquables)
- Reviews section (liste + bouton écrire un avis)
- Availability calendar
- Boutons `Réserver` et `Contacter`

## `Booking` (flow)
- Choix du service
- Choix date & créneau horaire
- Récapitulatif réservation (prix, adresse)
- Paiement (Stripe) ou paiement à la confirmation selon config
- Confirmation et page succès

## `Messages` / `Chat`
- Liste conversations (preview dernier message, time)
- Chat page: messages en bulles, input, envoi média
- Indicateur de lecture / typing
- Push notification on new message

## `Notifications`
- Liste notifications triées par date
- Marquer lu / supprimer
- Click to open (ex: ouvrir booking/messages)

## `Profile` / `Edit Profile`
- Infos publiques: photo, bio, ville, services
- Edition: champs modifiables, upload images
- Paramètres confidentialité (masquer email/phone si non abonné)

## `Dashboards` (Client & Artisan)
- Client: liste réservations, favorites, accès profil
- Artisan: agenda (vue jour/semaine), demandes entrantes, revenus, statistiques
- Actions rapides: accepter/refuser demande, marquer comme complété

## `Admin` Panel
- Liste artisans et recherche
- Modération contenus (avis, portfolios)
- Rapports & analytics
- Actions: bannir, changer rôle, désactiver profil

## Composants communs
- `CustomAppBar`, `CustomButton`, `CustomTextField`
- `LoadingWidget`, `ErrorState`, `EmptyState`
- Dialogues de confirmation

---

_Cocher chaque item lors de l'implémentation UI._
