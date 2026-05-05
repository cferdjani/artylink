-- =========================================================================
-- TAXONOMIE CANONIQUE EXHAUSTIVE (SAFE MIGRATION)
-- Non destructive: UPSERT categories/subcategories from canonical list.
-- =========================================================================

BEGIN;

    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

    CREATE TABLE
    IF NOT EXISTS public.subcategories
    (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id uuid REFERENCES public.categories
    (id) ON
    DELETE CASCADE,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  meta_title text,
  meta_description text,
  created_at timestamptz DEFAULT now()
);

    ALTER TABLE public.subcategories
        ADD COLUMN IF NOT EXISTS meta_title text,
        ADD COLUMN IF NOT EXISTS meta_description text,
        ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

    -- Compatibility layer for older schemas created with icon_name / color_hex
    ALTER TABLE public.categories
        ADD COLUMN IF NOT EXISTS icon text,
        ADD COLUMN IF NOT EXISTS color text,
        ADD COLUMN IF NOT EXISTS is_popular boolean DEFAULT false;

    DO $$
    BEGIN
        IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'categories'
              AND column_name = 'icon_name'
        ) THEN
            EXECUTE 'UPDATE public.categories
                     SET icon = COALESCE(icon, icon_name)
                     WHERE icon IS NULL';
        END IF;

        IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'categories'
              AND column_name = 'color_hex'
        ) THEN
            EXECUTE 'UPDATE public.categories
                     SET color = COALESCE(color, color_hex)
                     WHERE color IS NULL';
        END IF;
    END
    $$;

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
