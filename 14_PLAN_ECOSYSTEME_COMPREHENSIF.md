# Stratégie et Plan d'Architecture de l'Écosystème "Artisans"

## 1. Vision Fonctionnelle : De l'Annuaire au Compagnon du Quotidien

La demande actuelle vise à transformer une simple liste d'artisans en un véritable réseau social de services :
- **Profils enrichis** : Avatars personnalisables, statuts en temps réel ("En Chantier", "Disponible")
- **Messagerie intra-app** : Communication directe et sécurisée entre le client et l'artisan sans quitter l'app
- **Portfolio avec modération** : Photos des travaux passés
- **IA & Tutoriels** : Moteur de recherche sémantique avec suggestions de vidéos tutoriels ("Faites-le vous-même ou engagez ce pro").

---

## 2. Architecture Code et Base de Données

### A. Avatars et Portfolios Modérés
**Technologie** : Supabase Storage + Edge Functions + Flutter `image_picker`.
**Flow** :
1. L'artisan upload une photo. Elle s'inscrit dans un bucket `portfolios_pending`.
2. Une *Edge Function* Supabase (via un webhook ou trigger) passe l'image dans un outil d'AI Vision (comme Google Vision) pour modérer la nudité/violence.
3. Si elle est conforme, elle est déplacée vers le bucket public `portfolios_approved`.

### B. Statut ("En Chantier" / "Disponible" / "Hors Ligne")
**Technologie** : Supabase Realtime (Presence) + PostgreSQL.
**Flow** :
1. **Statut d'application (En Ligne / Hors ligne)** : Contrôlé automatiquement via les WebSockets Supabase Realtime dès que le pro ouvre ou ferme l'application.
2. **Disponibilité métier (Disponible / En Chantier)** : Un champ `current_status` dans la table `artisans` (modifié via un switch UI par le pro). L'UI des clients écoute cette ligne en temps réel pour afficher une pastille Verte ou Rouge.

### C. Messagerie intra-app (Chat Corner)
**Technologie** : Supabase Realtime (INSERT subscriptions) + Flutter `flutter_chat_ui`.
**Flow** :
1. Table `conversations` (UUID, client_id, artisan_id).
2. Table `messages` (UUID, conversation_id, sender_id, text, created_at).
3. L'UI s'abonne via `supabase.from('messages').stream(primaryKey: ['id'])`.
4. Intégration de Firebase Cloud Messaging (FCM) / Supabase Push pour notifier quand l'app est fermée.

### D. Recherche par IA et Tutoriels (Smart Search)
**Technologie** : PostgreSQL `pgvector` + OpenAI Embeddings.
**Flow** :
1. Au lieu de `LIKE '%plombier%'`, le client écrit "Mon robinet fuit".
2. L'application Flutter appelle une Edge Function Supabase.
3. L'Edge Function convertit le texte de l'utilisateur en vecteur via l'API OpenAI, et cherche les Tutos *et* les Artisans dont la description vectorielle est la plus proche (Cosine Distance).
4. Le résultat mixe des *Shorts YouTube/Locaux* sur la plomberie et des *cartes d'artisans plombiers*.

---

## 3. Plan de Continuité, de Développement et de Maintenance

Voici comment nous scindons ce chantier monstrueux sans casser le travail actuel :

### Sprint 1 : Base Sociale (Immédiat)
- [ ] Ajout du champ `avatar_url` dans `profiles` et d'une UI pour l'uploader.
- [ ] Ajout d'un booléen `is_available` et d'un string `status_text` dans `artisans` avec toggle UI.
- [ ] Mise en place du bucket Storage `avatars`.

### Sprint 2 : Portfolios et Tutos
- [ ] Table `artisan_portfolios` pour les photos de travaux.
- [ ] Section UI sur `ArtisanDetailPage` pour afficher la galerie.
- [ ] Création visuelle de bulles ou carousels "Tutoriels" dans la recherche.

### Sprint 3 : Le Chat et la Réservation
- [ ] Création de la table `messages` avec RLS strict (Seuls les membres d'une conversation peuvent lire/écrire).
- [ ] Écrans UI `MessageList` et `ChatRoom`.
- [ ] Flux de réservation (Booking Calendar) directement intégré dans la discussion ou sur le profil.

### Sprint 4 : Moteur IA Sémanique
- [ ] Ajout du module PGVector sur Supabase.
- [ ] Écriture de la fonction de recherche par Similarité.
- [ ] Remplacement de la barre de texte actuelle par un chatbot de prompt "Que recherchez-vous ?".

---

> Ce plan couvre la montée en puissance de l'application. Sa solidité réside dans l'utilisation exclusive du backend Supabase (Realtime, Edge Functions, Storage, Vector) permettant à Flutter de n'être qu'un simple relais d'affichage réactif et propre.
