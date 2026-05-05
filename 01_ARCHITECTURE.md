-- =========================================================================
-- TAXONOMIE CANONIQUE EXHAUSTIVE (SAFE MIGRATION)
-- Non destructive: UPSERT categories/subcategories from canonical list.
-- =========================================================================

BEGIN;

    -- Ensure compatibility with existing RPCs/triggers relying on artisan_categories
    CREATE TABLE
    IF NOT EXISTS public.artisan_categories
    (
artisan_id uuid REFERENCES public.artisans
(id) ON
DELETE CASCADE,
category_id uuid
REFERENCES public.categories
(id) ON
DELETE CASCADE,
is_primary boolean
DEFAULT false,
PRIMARY KEY
(artisan_id, category_id)
);

    CREATE INDEX
    IF NOT EXISTS idx_artisan_categories_cat
ON public.artisan_categories
(category_id);

    CREATE INDEX
    IF NOT EXISTS idx_artisan_categories_art
ON public.artisan_categories
(artisan_id);

    -- Canonical categories
    WITH categories_seed(slug, name, icon, color, is_popular) AS (
VALUES
('construction', 'Construction & Rénovation', 'architecture', '#795548', true),
('menuiserie', 'Menuiserie & Aménagement', 'carpenter', '#E64A19', true),
('plomberie-gaz', 'Plomberie & Gaz', 'water_drop', '#1976D2', true),
('electricite', 'Électricité', 'electric_bolt', '#FBC02D', true),
('climatisation', 'Climatisation & Froid', 'ac_unit', '#00BCD4', true),
('transport', 'Transport & Logistique', 'local_shipping', '#FF9800', true),
('nettoyage', 'Nettoyage & Environnement', 'cleaning_services', '#4CAF50', false),
('formation', 'Cours & Formations', 'school', '#9C27B0', true),
('evenementiel', 'Événementiel & Fêtes', 'celebration', '#E91E63', false),
('mecanique-auto', 'Mécanique Auto', 'car_repair', '#D32F2F', false),
('sante-bien-etre', 'Santé & Bien-être', 'spa', '#F06292', false),
('informatique', 'Informatique & Freelance', 'computer', '#3F51B5', false),
('impression', 'Impression & Publicité', 'print', '#009688', false),
('electromenager-tv', 'Électroménager & Électronique', 'tv', '#673AB7', false),
('multiservices', 'Services Multi-techniques', 'home_repair_service', '#607D8B', false),
('couture', 'Couture & Confection', 'checkroom', '#C2185B', false),
('beaute', 'Beauté & Esthétique', 'face_retouching_natural', '#F48FB1', false),
('securite', 'Sécurité & Gardiennage', 'security', '#455A64', false),
('juridique-admin', 'Services Juridiques & Admin', 'gavel', '#00796B', false),
('jardinage-agri', 'Jardinage & Agriculture', 'eco', '#33691E', false),
('artisanat-art', 'Artisanat d''Art & Tradition', 'brush', '#8D6E63', false),
('restauration', 'Restauration & Gastronomie', 'restaurant', '#FF5722', false),
('animaux', 'Animaux & Vétérinaire', 'pets', '#795548', false),
('audiovisuel', 'Audiovisuel & Média', 'videocam', '#6200EA', false),
('immobilier', 'Immobilier & Courtage', 'real_estate_agent', '#0277BD', false)
)
INSERT INTO public.categories
(slug, name, icon, color, is_popular)
SELECT slug, name, icon, color, is_popular
FROM categories_seed
ON CONFLICT
(slug) DO
UPDATE SET
name = EXCLUDED.name,
icon = EXCLUDED.icon,
color = EXCLUDED.color,
is_popular = EXCLUDED.is_popular;

    -- Canonical subcategories
    WITH subcategories_seed(category_slug, slug, name) AS (
VALUES
-- CONSTRUCTION
('construction', 'maconnerie', 'Maçonnerie Générale'),
('construction', 'peinture', 'Peinture & Décoration'),
('construction', 'placoplatre', 'Placoplâtre (BA13 / Décoration)'),
('construction', 'revetement', 'Revêtement (Dalle de sol, Faïence)'),
('construction', 'etancheite', 'Étanchéité (Goudron, Résine)'),
('construction', 'architecture', 'Architecte & Plan (Génie Civil)'),
('construction', 'demolition', 'Démolition & Évacuation'),
('construction', 'forage', 'Forage & Puits'),
('construction', 'charpente', 'Charpente & Couverture'),
('construction', 'vitrage-facade', 'Vitrage & Façade (Mur rideau)'),

    -- MENUISERIE
    ('menuiserie', 'aluminium-pvc', 'Menuiserie Aluminium & PVC'),
    ('menuiserie', 'bois', 'Menuiserie Bois'),
    ('menuiserie', 'cuisiniste', 'Cuisiniste (Cuisine Équipée, Dressing)'),
    ('menuiserie', 'ferronnerie', 'Ferronnerie & Soudure'),
    ('menuiserie', 'rideaux-metalliques', 'Rideaux Métalliques & Stores'),
    ('menuiserie', 'vitrerie', 'Vitrerie & Miroiterie'),
    ('menuiserie', 'decoupe-cnc', 'Découpe Laser & CNC'),
    ('menuiserie', 'tapisserie-ameublement', 'Tapisserie d''ameublement (Salons)'),

    -- PLOMBERIE GAZ
    ('plomberie-gaz', 'fuite', 'Réparation fuite d''eau'),
    ('plomberie-gaz', 'chauffage', 'Chauffage central & Radiateurs'),
    ('plomberie-gaz', 'chauffe-eau', 'Chauffe-eau & Bain'),
    ('plomberie-gaz', 'gaz', 'Détection & Installation Gaz'),
    ('plomberie-gaz', 'pompe', 'Installation Surpresseur & Citerne'),
    ('plomberie-gaz', 'debouchage', 'Débouchage Canalisations'),

    -- ELECTRICITE
    ('electricite', 'electricite-batiment', 'Électricité Bâtiment (Maison)'),
    ('electricite', 'electricite-industrielle', 'Électricité Industrielle (380V)'),
    ('electricite', 'groupe-electrogene', 'Installation Groupe Électrogène'),
    ('electricite', 'solaire', 'Énergie Solaire & Panneaux'),
    ('electricite', 'domotique', 'Smart Home & Domotique'),

    -- CLIMATISATION
    ('climatisation', 'installation-clim', 'Installation Climatiseur'),
    ('climatisation', 'recharge-gaz-clim', 'Recharge Gaz & Nettoyage'),
    ('climatisation', 'chambre-froide', 'Chambre Froide & Froid Industriel'),
    ('climatisation', 'reparation-frigo', 'Réparation Réfrigérateurs'),
    ('climatisation', 'ventilation', 'Systèmes de Ventilation (VMC)'),

    -- TRANSPORT
    ('transport', 'camion-marchandises', 'Camion de Marchandises / Fret'),
    ('transport', 'delivery-coursier', 'Livraison Expresse (Delivery / Coursier)'),
    ('transport', 'demenagement', 'Déménagement & Manutention'),
    ('transport', 'taxi-vtc', 'Taxi & VTC (Transport de personnes)'),
    ('transport', 'engin-tp', 'Location Engins TP (Rétro, Chariot, Grue)'),
    ('transport', 'location-voiture', 'Location de Voitures'),
    ('transport', 'transport-scolaire', 'Transport Scolaire / Universitaire'),

    -- NETTOYAGE
    ('nettoyage', 'nettoyage-industriel', 'Nettoyage Industriel & Bureaux'),
    ('nettoyage', 'femme-menage', 'Femme de ménage à domicile'),
    ('nettoyage', 'eboueur', 'Ramassage Ordures & Déchets (Éboueur privé)'),
    ('nettoyage', 'desinsectisation', 'Désinsectisation & Dératisation'),
    ('nettoyage', 'lavage-tapis', 'Lavage Tapis & Canapés'),
    ('nettoyage', 'piscine', 'Entretien de Piscines'),
    ('nettoyage', 'nettoyage-fin-chantier', 'Nettoyage Fin de Chantier'),

    -- FORMATION
    ('formation', 'soutien-scolaire', 'Cours de Soutien & Privés (CEM, BAC)'),
    ('formation', 'langues', 'Apprentissage de Langues'),
    ('formation', 'formation-pro', 'Formation Professionnelle & Métiers'),
    ('formation', 'auto-ecole', 'Auto-école & Code de la route'),
    ('formation', 'musique-art', 'Cours de Musique & Arts'),
    ('formation', 'coaching-sportif', 'Coaching Sportif Privé'),

    -- EVENEMENTIEL
    ('evenementiel', 'salle-fetes', 'Location Salle de Fêtes'),
    ('evenementiel', 'location-chapiteau', 'Location Chapiteaux & Chaises'),
    ('evenementiel', 'decoration-fetes', 'Décoration Fêtes & Mariages'),
    ('evenementiel', 'dj-animation', 'DJ & Animation'),
    ('evenementiel', 'location-robes', 'Location de Robes & Tasdira'),
    ('evenementiel', 'clown-enfant', 'Animation pour Enfants (Clown, Magie)'),

    -- MECANIQUE AUTO
    ('mecanique-auto', 'scanner', 'Scanner Auto & Diagnostic'),
    ('mecanique-auto', 'vulcanisateur', 'Vulcanisateur (Dépannage Pneus)'),
    ('mecanique-auto', 'mecanique-generale', 'Mécanique Générale'),
    ('mecanique-auto', 'tolerie-peinture', 'Tôlerie et Peinture Auto'),
    ('mecanique-auto', 'electricite-auto', 'Électricité Auto'),
    ('mecanique-auto', 'depannage-remorquage', 'Dépannage (Remorquage / Dépannage)'),
    ('mecanique-auto', 'lavage-auto', 'Lavage Auto & Nettoyage à sec'),
    ('mecanique-auto', 'installation-gpl', 'Installation Kit Sirghaz (GPL)'),

    -- SANTE
    ('sante-bien-etre', 'garde-malade', 'Garde-malades & Infirmerie'),
    ('sante-bien-etre', 'garde-enfant', 'Garde d''enfants (Baby-sitting, Crèche)'),
    ('sante-bien-etre', 'kinesitherapie', 'Kinésithérapie à domicile'),
    ('sante-bien-etre', 'orthophonie', 'Orthophonie à domicile'),
    ('sante-bien-etre', 'aide-personnes-agees', 'Aide aux Personnes Âgées'),
    ('sante-bien-etre', 'hijama', 'Hijama & Cupping Médical'),

    -- INFORMATIQUE
    ('informatique', 'reparation-pc', 'Réparation PC, Informatique & Consoles'),
    ('informatique', 'developpement', 'Développement Web & Applications'),
    ('informatique', 'design', 'Création Logo & Design'),
    ('informatique', 'marketing', 'Community Management & Marketing'),
    ('informatique', 'traduction', 'Traduction & Rédaction'),
    ('informatique', 'installation-reseau', 'Installation Réseau & Fibre Optique'),
    ('informatique', 'recuperation-donnees', 'Récupération de Données'),

    -- IMPRESSION
    ('impression', 'imprimerie', 'Imprimerie & Brochures'),
    ('impression', 'panneaux', 'Panneaux Publicitaires & Enseignes'),
    ('impression', 'habillage', 'Habillage Façades & Véhicules'),
    ('impression', 'cadeaux', 'Cadeaux d''Entreprise (Goodies)'),
    ('impression', 'serigraphie', 'Sérigraphie & Flocage'),

    -- ELECTROMENAGER
    ('electromenager-tv', 'reparation-tv', 'Réparation Téléviseurs & Récepteurs'),
    ('electromenager-tv', 'reparation-machine-laver', 'Réparation Machine à laver'),
    ('electromenager-tv', 'reparation-petit-electro', 'Petit électroménager (Micro-ondes)'),
    ('electromenager-tv', 'reparation-telephones', 'Réparation Téléphones & Tablettes'),
    ('electromenager-tv', 'flashage-demo', 'Flashage Récepteurs & Décodeurs'),

    -- MULTISERVICES
    ('multiservices', 'serrurerie', 'Serrurerie & Ouverture de Portes'),
    ('multiservices', 'ascenseur', 'Dépannage & Maintenance Ascenseurs'),
    ('multiservices', 'installation-antenne', 'Installation Parabole & Récepteurs'),
    ('multiservices', 'bricolage', 'Petit Bricolage & Fixation'),
    ('multiservices', 'homme-toutes-mains', 'Homme Toutes Mains'),

    -- NOUVELLE : COUTURE
    ('couture', 'couture-traditionnelle', 'Couturière (Tenues Traditionnelles)'),
    ('couture', 'retouche-vetements', 'Retouche & Réparation Vêtements'),
    ('couture', 'tailleur', 'Tailleur sur Mesure'),
    ('couture', 'broderie', 'Broderie (Fetla, Majboud, etc.)'),
    ('couture', 'modelisme', 'Modélisme & Patronage'),

    -- NOUVELLE : BEAUTE
    ('beaute', 'coiffure-domicile', 'Coiffure à domicile'),
    ('beaute', 'maquillage', 'Maquilleuse Professionnelle'),
    ('beaute', 'onglerie', 'Onglerie & Manucure'),
    ('beaute', 'soin-visage', 'Soins du Visage & Corps'),
    ('beaute', 'epilation', 'Épilation'),

    -- NOUVELLE : SECURITE
    ('securite', 'camera-alarme', 'Installation Caméras & Alarmes'),
    ('securite', 'agent-securite', 'Agent de Sécurité (Garde Corps)'),
    ('securite', 'gardien-nuit', 'Gardien de Nuit'),
    ('securite', 'controle-acces', 'Contrôle d''Accès & Interphones'),

    -- NOUVELLE : JURIDIQUE & ADMIN
    ('juridique-admin', 'ecrivain-public', 'Écrivain Public'),
    ('juridique-admin', 'traducteur-assermente', 'Traducteur Assermenté'),
    ('juridique-admin', 'dossiers-visa', 'Accompagnement Dossiers Visa'),
    ('juridique-admin', 'creation-entreprise', 'Création d''Entreprise (Registre de Commerce)'),
    ('juridique-admin', 'comptabilite', 'Comptabilité & Déclarations Fiscales'),

    -- NOUVELLE : JARDINAGE & AGRI
    ('jardinage-agri', 'jardinier', 'Jardinier & Entretien Espaces Verts'),
    ('jardinage-agri', 'elagage', 'Élagage & Abattage d''Arbres'),
    ('jardinage-agri', 'pepiniere', 'Pépiniériste & Plantation'),
    ('jardinage-agri', 'apiculture', 'Apiculture & Extraction de Miel'),

    -- NOUVELLE : ARTISANAT D'ART
    ('artisanat-art', 'poterie', 'Poterie & Céramique'),
    ('artisanat-art', 'dinanderie', 'Dinanderie (Cuivre, Laiton)'),
    ('artisanat-art', 'tissage', 'Tissage & Tapis Traditionnels'),
    ('artisanat-art', 'maroquinerie', 'Maroquinerie Artisanal'),
    ('artisanat-art', 'bijouterie', 'Bijouterie Artisanale'),

    -- NOUVELLE : RESTAURATION
    ('restauration', 'traiteur', 'Traiteur (Salé/Sucré)'),
    ('restauration', 'gateaux-traditionnels', 'Gâteaux Traditionnels Algériens (Halawiyat)'),
    ('restauration', 'cuisinier-domicile', 'Cuisinier à Domicile'),
    ('restauration', 'boulangerie-artisanale', 'Boulangerie & Pâtisserie Artisanale'),

    -- NOUVELLE : ANIMAUX
    ('animaux', 'veterinaire-domicile', 'Vétérinaire à Domicile'),
    ('animaux', 'toilettage', 'Toilettage pour Animaux'),
    ('animaux', 'dressage', 'Dressage & Éducation Canine'),
    ('animaux', 'pension', 'Pension pour Animaux (Garde)'),

    -- NOUVELLE : AUDIOVISUEL
    ('audiovisuel', 'photographe', 'Photographe & Vidéaste (Shooting, Événements)'),
    ('audiovisuel', 'montage-video', 'Montage Vidéo & Post-Production'),
    ('audiovisuel', 'pilote-drone', 'Pilote de Drone (Prises de vue)'),
    ('audiovisuel', 'voix-off', 'Voix-Off & Enregistrement Audio'),

    -- NOUVELLE : IMMOBILIER
    ('immobilier', 'agent-immobilier', 'Agent Immobilier Indépendant'),
    ('immobilier', 'courtier', 'Courtier (Vehicules, Materiel, Immo)'),
    ('immobilier', 'expertise', 'Expertise Immobilière & Évaluation')
)
INSERT INTO public.subcategories
(category_id, slug, name)
SELECT c.id, s.slug, s.name
FROM subcategories_seed s
JOIN public.categories c ON c.slug = s.category_slug
ON CONFLICT
(slug) DO
UPDATE SET
category_id = EXCLUDED.category_id,
name = EXCLUDED.name;

    COMMIT;

-- Verification helpers
-- SELECT COUNT(*) AS categories_count FROM public.categories;
-- SELECT COUNT(*) AS subcategories_count FROM public.subcategories;
-- SELECT slug, name, is_popular FROM public.categories ORDER BY is_popular DESC, name ASC;
cd artisans_app && flutter run -d chrome# 🏗️ Architecture Système Globale — Plateforme Artisans

---

## 📐 Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                               │
│                                                                     │
│   Flutter Web (Desktop ≥1024px · Tablet 600-1024px · Mobile <600)  │
│   Flutter Android APK                                               │
│                                                                     │
└──────────────────────────┬──────────────────────────────────────────┘
                            │ HTTPS + WSS (WebSocket Realtime)
                            │ PostgREST (REST auto-généré)
                            │ Supabase SDK Flutter
┌──────────────────────────▼──────────────────────────────────────────┐
│                        SUPABASE BACKEND                             │
│                                                                     │
│   ┌────────────────┐   ┌─────────────────┐   ┌──────────────────┐  │
│   │  Auth Service   │   │   PostgREST     │   │  Realtime Engine │  │
│   │  JWT + RLS      │   │   REST API      │   │  WebSocket       │  │
│   │  OAuth (Google) │   │   Auto-généré   │   │  Messages/Notif  │  │
│   └────────────────┘   └─────────────────┘   └──────────────────┘  │
│                                                                     │
│   ┌────────────────┐   ┌─────────────────┐   ┌──────────────────┐  │
│   │  Storage       │   │  Edge Functions │   │  pg_cron Jobs    │  │
│   │  Avatars       │   │  Deno/TypeScript│   │  Automatisations │  │
│   │  Portfolio     │   │  Stripe/FCM/Mail│   │  Rappels/Cleanup │  │
│   │  Documents     │   │                 │   │                  │  │
│   └────────────────┘   └─────────────────┘   └──────────────────┘  │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                  PostgreSQL 15 (Core)                       │   │
│   │                                                             │   │
│   │   Extensions actives :                                      │   │
│   │   • PostGIS      → Géolocalisation GPS                      │   │
│   │   • pg_trgm      → Recherche full-text fuzzy                │   │
│   │   • pgcrypto     → Chiffrement données sensibles            │   │
│   │   • uuid-ossp    → Génération UUIDs                         │   │
│   │   • unaccent     → Recherche sans accents                   │   │
│   │   • pg_cron      → Jobs planifiés                           │   │
│   │                                                             │   │
│   └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                            │
              ┌─────────────┼──────────────┐
              ▼             ▼              ▼
         ┌─────────┐  ┌──────────┐  ┌──────────────┐
         │ Stripe  │  │  FCM     │  │   Resend     │
         │Paiements│  │  Push    │  │   Emails     │
         │         │  │  Notifs  │  │ Transact.    │
         └─────────┘  └──────────┘  └──────────────┘
```

---

## 🔄 Flux de Données Principaux

### Flux 1 — Recherche Artisan

```
[Client] 
  │ Saisit ville + catégorie + filtres
  ▼
[Flutter SearchPage]
  │ SearchProvider.searchArtisans(filters)
  ▼
[ArtisanRepository]
  │ supabase.rpc('search_artisans', params)
  ▼
[PostgreSQL — Fonction SQL search_artisans()]
  │ PostGIS: ST_DWithin() — rayon géographique
  │ pg_trgm: similarité textuelle
  │ Filtres: rating, disponibilité, catégorie
  ▼
[Résultats JSON → Modèles Dart]
  │
  ▼
[Flutter ListView/MapView]
  └── ArtisanCard x N
```

### Flux 2 — Réservation

```
[Client]
  │ Sélectionne artisan + service + créneau
  ▼
[Flutter BookingPage]
  │ BookingProvider.createBooking(data)
  ▼
[BookingRepository]
  │ supabase.from('bookings').insert(booking)
  ▼
[PostgreSQL + RLS check]
  │ Vérifie : client_id = auth.uid()
  │ Créneau disponible → availability_slots
  ▼
[Trigger: notification_on_booking_created]
  │ INSERT INTO notifications (artisan)
  │ Edge Function: send-notification (FCM push)
  ▼
[Artisan reçoit notification push]
  │ Confirme/Refuse
  ▼
[Booking status → 'confirmed']
  │ Trigger: notification_on_booking_confirmed
  │ Edge Function: send-email (Resend)
  ▼
[Client reçoit email + push confirmation]
```

### Flux 3 — Messagerie Temps Réel

```
[Client/Artisan]
  │ Envoie message dans conversation
  ▼
[Flutter MessagePage]
  │ supabase.from('messages').insert(message)
  ▼
[PostgreSQL INSERT]
  │ RLS: sender_id = auth.uid() ✓
  ▼
[Supabase Realtime — LISTEN/NOTIFY]
  │ Broadcast à tous les abonnés du booking_id
  ▼
[Destinataire reçoit message en temps réel]
  └── setState() → nouveau message affiché
```

### Flux 4 — Auth & Onboarding

```
[Visiteur]
  │ Choisit rôle: Client ou Artisan
  ▼
[Supabase Auth — signUp()]
  │ Crée auth.users record
  ▼
[Trigger: handle_new_user()]
  │ INSERT INTO profiles (id, email, role)
  ▼
[Si rôle = 'artisan']
  │ INSERT INTO artisans (profile_id)
  │ Redirection → Dashboard Artisan (compléter profil)
[Si rôle = 'client']
  │ Redirection → HomePage
```

---

## 🗺️ Architecture Navigation (GoRouter)

```
/ (HomePage)
├── /artisans                       → SearchPage (liste + carte)
│   └── /artisans/:id               → ArtisanDetailPage
│       └── /artisans/:id/book      → BookingPage
│           └── /artisans/:id/book/confirm → BookingConfirmPage
│
├── /category/:slug                 → CategoryPage (artisans par catégorie)
│
├── /auth
│   ├── /auth/login                 → LoginPage
│   └── /auth/register              → RegisterPage (choix rôle)
│
├── /dashboard                      → Redirection selon rôle
│   ├── /dashboard/client           → ClientDashboardPage
│   │   ├── /dashboard/client/bookings  → MesReservations
│   │   ├── /dashboard/client/messages  → MessagesPage
│   │   └── /dashboard/client/favorites → FavorisPage
│   │
│   └── /dashboard/artisan          → ArtisanDashboardPage
│       ├── /dashboard/artisan/agenda    → AgendaPage
│       ├── /dashboard/artisan/requests  → DemandesPage
│       ├── /dashboard/artisan/earnings  → RevenusPage
│       └── /dashboard/artisan/profile   → EditProfilArtisan
│
├── /admin (rôle admin requis)
│   ├── /admin/dashboard            → AdminDashboard
│   ├── /admin/artisans             → ModerationArtisans
│   ├── /admin/bookings             → GestionReservations
│   ├── /admin/payments             → GestionPaiements
│   └── /admin/reports              → Signalements
│
└── /profile/:id                    → ProfilPublicPage
```

---

## 🎨 Design System

```dart
// Palette de couleurs
class AppColors {
  // Primaire — Orange Artisan (chaleur, action, confiance)
  static const primary       = Color(0xFFFF6B35);
  static const primaryLight  = Color(0xFFFF8C5A);
  static const primaryDark   = Color(0xFFE54E18);

  // Secondaire — Bleu Marine (sérieux, professionnel)
  static const secondary     = Color(0xFF2C3E50);
  static const secondaryLight= Color(0xFF3D5166);
  static const secondaryDark = Color(0xFF1A2634);

  // Accent — Vert (disponible, validé, succès)
  static const success       = Color(0xFF27AE60);
  static const warning       = Color(0xFFF39C12);
  static const error         = Color(0xFFE74C3C);
  static const info          = Color(0xFF3498DB);

  // Neutres
  static const background    = Color(0xFFF8F9FA);
  static const surface       = Color(0xFFFFFFFF);
  static const divider       = Color(0xFFECECEC);
  static const textPrimary   = Color(0xFF1A1A2E);
  static const textSecondary = Color(0xFF6B7280);
  static const textHint      = Color(0xFF9CA3AF);
}

// Typographie
// Fonts: Poppins (titres) + Inter (corps)
// Ajouter dans pubspec.yaml:
// fonts:
//   - family: Poppins
//     fonts:
//       - asset: assets/fonts/Poppins-Regular.ttf
//       - asset: assets/fonts/Poppins-SemiBold.ttf  weight: 600
//       - asset: assets/fonts/Poppins-Bold.ttf       weight: 700
//   - family: Inter
//     fonts:
//       - asset: assets/fonts/Inter-Regular.ttf
//       - asset: assets/fonts/Inter-Medium.ttf       weight: 500

// Breakpoints Responsive
class AppBreakpoints {
  static const double mobile  = 600;
  static const double tablet  = 1024;
  static const double desktop = 1280;
}

// Espacements
class AppSpacing {
  static const double xs  = 4.0;
  static const double sm  = 8.0;
  static const double md  = 16.0;
  static const double lg  = 24.0;
  static const double xl  = 32.0;
  static const double xxl = 48.0;
}

// Border Radius
class AppRadius {
  static const double sm  = 8.0;
  static const double md  = 12.0;
  static const double lg  = 16.0;
  static const double xl  = 24.0;
  static const double full= 999.0;
}
```

---

## 📐 Responsive Layout Pattern

```dart
// lib/presentation/widgets/responsive/responsive_layout.dart

class ResponsiveLayout extends StatelessWidget {
  final Widget mobile;
  final Widget? tablet;
  final Widget? desktop;

  const ResponsiveLayout({
    required this.mobile,
    this.tablet,
    this.desktop,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth >= AppBreakpoints.desktop) {
          return desktop ?? tablet ?? mobile;
        } else if (constraints.maxWidth >= AppBreakpoints.mobile) {
          return tablet ?? mobile;
        }
        return mobile;
      },
    );
  }
}

// Usage dans une page :
// ResponsiveLayout(
//   mobile:  MobileHomePage(),
//   tablet:  TabletHomePage(),
//   desktop: DesktopHomePage(),
// )
```

---

## 🔧 Pattern Repository — Exemple ArtisanRepository

```dart
// lib/data/repositories/artisan_repository.dart

abstract class ArtisanRepositoryInterface {
  Future<List<Artisan>> searchArtisans(SearchFilters filters);
  Future<Artisan?> getArtisanById(String id);
  Future<void> updateArtisanProfile(String id, Map<String, dynamic> data);
  Future<List<PortfolioItem>> getPortfolio(String artisanId);
  Future<bool> toggleFavorite(String artisanId);
}

class ArtisanRepository implements ArtisanRepositoryInterface {
  final SupabaseClient _supabase;

  ArtisanRepository(this._supabase);

  @override
  Future<List<Artisan>> searchArtisans(SearchFilters filters) async {
    try {
      final response = await _supabase.rpc('search_artisans', params: {
        'p_lat':           filters.latitude,
        'p_lng':           filters.longitude,
        'p_radius_km':     filters.radiusKm,
        'p_category_slug': filters.categorySlug,
        'p_min_rating':    filters.minRating,
        'p_available':     filters.availableOnly,
      });
      return (response as List).map((e) => Artisan.fromJson(e)).toList();
    } on PostgrestException catch (e) {
      throw RepositoryException('Erreur recherche: ${e.message}');
    }
  }

  @override
  Future<Artisan?> getArtisanById(String id) async {
    final response = await _supabase
        .from('artisans')
        .select('''
          *,
          profile:profiles(*),
          services(*),
          portfolio_items(*),
          artisan_categories(*, category:categories(*))
        ''')
        .eq('id', id)
        .single();
    return Artisan.fromJson(response);
  }
}
```

---

## 🏷️ Catégories par Domaine

| Slug | Nom | Icône | Couleur |
|------|-----|-------|---------|
| `plomberie` | Plomberie | `plumbing` | `#2196F3` |
| `electricite` | Électricité | `electrical_services` | `#FF9800` |
| `maconnerie` | Maçonnerie | `foundation` | `#795548` |
| `peinture` | Peinture | `format_paint` | `#E91E63` |
| `menuiserie` | Menuiserie | `carpenter` | `#8D6E63` |
| `jardinage` | Jardinage | `yard` | `#4CAF50` |
| `nettoyage` | Nettoyage | `cleaning_services` | `#00BCD4` |
| `demenagement` | Déménagement | `local_shipping` | `#9C27B0` |
| `climatisation` | Climatisation | `ac_unit` | `#03A9F4` |
| `carrelage` | Carrelage | `grid_on` | `#FF5722` |
| `serrurerie` | Serrurerie | `lock` | `#607D8B` |
| `toiture` | Toiture | `roofing` | `#F44336` |
| `vitrier` | Vitrier | `window` | `#00BCD4` |
| `informatique` | Informatique | `computer` | `#3F51B5` |
| `debarras` | Débarras | `delete_sweep` | `#9E9E9E` |

---

*→ Voir 02_SQL_SUPABASE.md pour le schéma complet*  
*→ Voir 03_FLUTTER_FRONTEND.md pour le code Flutter*
