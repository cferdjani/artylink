-- Vider les anciennes catégories pour éviter les doublons
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.subcategories (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id uuid REFERENCES public.categories(id) ON DELETE CASCADE,
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

TRUNCATE public.categories CASCADE;

-- 1. CONSTRUCTION & RÉNOVATION
WITH cat AS (
  INSERT INTO public.categories (slug, name, icon, color, is_popular) 
  VALUES ('construction', 'Construction & Rénovation', 'architecture', '#795548', true) 
  RETURNING id
)
INSERT INTO public.subcategories (category_id, slug, name)
SELECT id, 'maconnerie', 'Maçonnerie Générale' FROM cat UNION ALL
SELECT id, 'peinture', 'Peinture & Décoration' FROM cat UNION ALL
SELECT id, 'placoplatre', 'Placoplâtre (BA13 / Décoration)' FROM cat UNION ALL
SELECT id, 'revetement', 'Revêtement (Dalle de sol, Faïence)' FROM cat UNION ALL
SELECT id, 'etancheite', 'Étanchéité (Goudron, Résine)' FROM cat UNION ALL
SELECT id, 'architecture', 'Architecte & Plan (Génie Civil)' FROM cat UNION ALL
SELECT id, 'demolition', 'Démolition & Évacuation' FROM cat UNION ALL
SELECT id, 'forage', 'Forage & Puits' FROM cat;

-- 2. MENUISERIE & AMÉNAGEMENT
WITH cat AS (
  INSERT INTO public.categories (slug, name, icon, color, is_popular) 
  VALUES ('menuiserie', 'Menuiserie & Aménagement', 'carpenter', '#E64A19', true) 
  RETURNING id
)
INSERT INTO public.subcategories (category_id, slug, name)
SELECT id, 'aluminium-pvc', 'Menuiserie Aluminium & PVC' FROM cat UNION ALL
SELECT id, 'bois', 'Menuiserie Bois' FROM cat UNION ALL
SELECT id, 'cuisiniste', 'Cuisiniste (Cuisine Équipée, Dressing)' FROM cat UNION ALL
SELECT id, 'ferronnerie', 'Ferronnerie & Soudure' FROM cat UNION ALL
SELECT id, 'rideaux-metalliques', 'Rideaux Métalliques & Stores' FROM cat UNION ALL
SELECT id, 'vitrerie', 'Vitrerie & Miroiterie' FROM cat UNION ALL
SELECT id, 'decoupe-cnc', 'Découpe Laser & CNC' FROM cat;

-- 3. PLOMBERIE ET GAZ
WITH cat AS (
  INSERT INTO public.categories (slug, name, icon, color, is_popular) 
  VALUES ('plomberie-gaz', 'Plomberie & Gaz', 'water_drop', '#1976D2', true) 
  RETURNING id
)
INSERT INTO public.subcategories (category_id, slug, name)
SELECT id, 'fuite', 'Réparation fuite d''eau' FROM cat UNION ALL
SELECT id, 'chauffage', 'Chauffage central & Radiateurs' FROM cat UNION ALL
SELECT id, 'chauffe-eau', 'Chauffe-eau & Bain' FROM cat UNION ALL
SELECT id, 'gaz', 'Détection & Installation Gaz' FROM cat UNION ALL
SELECT id, 'pompe', 'Installation Surpresseur & Citerne' FROM cat;

-- 4. ÉLECTRICITÉ
WITH cat AS (
  INSERT INTO public.categories (slug, name, icon, color, is_popular) 
  VALUES ('electricite', 'Électricité', 'electric_bolt', '#FBC02D', true) 
  RETURNING id
)
INSERT INTO public.subcategories (category_id, slug, name)
SELECT id, 'electricite-batiment', 'Électricité Bâtiment (Maison)' FROM cat UNION ALL
SELECT id, 'electricite-industrielle', 'Électricité Industrielle (380V)' FROM cat UNION ALL
SELECT id, 'groupe-electrogene', 'Installation Groupe Électrogène' FROM cat UNION ALL
SELECT id, 'camera-alarme', 'Installation Caméras & Alarmes' FROM cat UNION ALL
SELECT id, 'solaire', 'Énergie Solaire & Panneaux' FROM cat;

-- 5. FROID & CLIMATISATION
WITH cat AS (
  INSERT INTO public.categories (slug, name, icon, color, is_popular) 
  VALUES ('climatisation', 'Climatisation & Froid', 'ac_unit', '#00BCD4', true) 
  RETURNING id
)
INSERT INTO public.subcategories (category_id, slug, name)
SELECT id, 'installation-clim', 'Installation Climatiseur' FROM cat UNION ALL
SELECT id, 'recharge-gaz-clim', 'Recharge Gaz & Nettoyage' FROM cat UNION ALL
SELECT id, 'chambre-froide', 'Chambre Froide & Froid Industriel' FROM cat UNION ALL
SELECT id, 'reparation-frigo', 'Réparation Réfrigérateurs' FROM cat;

-- 6. TRANSPORT, LOGISTIQUE & LIVRAISON
WITH cat AS (
  INSERT INTO public.categories (slug, name, icon, color, is_popular) 
  VALUES ('transport', 'Transport & Logistique', 'local_shipping', '#FF9800', true) 
  RETURNING id
)
INSERT INTO public.subcategories (category_id, slug, name)
SELECT id, 'camion-marchandises', 'Camion de Marchandises / Fret' FROM cat UNION ALL
SELECT id, 'delivery-coursier', 'Livraison Expresse (Delivery / Coursier)' FROM cat UNION ALL
SELECT id, 'demenagement', 'Déménagement & Manutention' FROM cat UNION ALL
SELECT id, 'taxi-vtc', 'Taxi & VTC (Transport de personnes)' FROM cat UNION ALL
SELECT id, 'engin-tp', 'Location Engins TP (Rétro, Chariot, Grue)' FROM cat UNION ALL
SELECT id, 'location-voiture', 'Location de Voitures' FROM cat;

-- 7. NETTOYAGE & ENVIRONNEMENT
WITH cat AS (
  INSERT INTO public.categories (slug, name, icon, color, is_popular) 
  VALUES ('nettoyage', 'Nettoyage & Environnement', 'cleaning_services', '#4CAF50', false) 
  RETURNING id
)
INSERT INTO public.subcategories (category_id, slug, name)
SELECT id, 'nettoyage-industriel', 'Nettoyage Industriel & Bureaux' FROM cat UNION ALL
SELECT id, 'femme-menage', 'Femme de ménage à domicile' FROM cat UNION ALL
SELECT id, 'eboueur', 'Ramassage Ordures & Déchets (Éboueur privé)' FROM cat UNION ALL
SELECT id, 'desinsectisation', 'Désinsectisation & Dératisation' FROM cat UNION ALL
SELECT id, 'lavage-tapis', 'Lavage Tapis & Canapés' FROM cat UNION ALL
SELECT id, 'jardinier', 'Jardinier & Paysagisme' FROM cat UNION ALL
SELECT id, 'piscine', 'Entretien de Piscines' FROM cat;

-- 8. SOUTIEN SCOLAIRE & FORMATIONS
WITH cat AS (
  INSERT INTO public.categories (slug, name, icon, color, is_popular) 
  VALUES ('formation', 'Cours & Formations', 'school', '#9C27B0', true) 
  RETURNING id
)
INSERT INTO public.subcategories (category_id, slug, name)
SELECT id, 'soutien-scolaire', 'Cours de Soutien & Privés (CEM, BAC)' FROM cat UNION ALL
SELECT id, 'langues', 'Apprentissage de Langues' FROM cat UNION ALL
SELECT id, 'formation-pro', 'Formation Professionnelle & Métiers' FROM cat UNION ALL
SELECT id, 'auto-ecole', 'Auto-école & Code de la route' FROM cat UNION ALL
SELECT id, 'musique-art', 'Cours de Musique & Arts' FROM cat;

-- 9. ÉVÉNEMENTIEL & FÊTES
WITH cat AS (
  INSERT INTO public.categories (slug, name, icon, color, is_popular) 
  VALUES ('evenementiel', 'Événementiel & Fêtes', 'celebration', '#E91E63', false) 
  RETURNING id
)
INSERT INTO public.subcategories (category_id, slug, name)
SELECT id, 'traiteur', 'Traiteur & Gâteaux (Halawiyat, Salés)' FROM cat UNION ALL
SELECT id, 'salle-fetes', 'Location Salle de Fêtes' FROM cat UNION ALL
SELECT id, 'photographe', 'Photographe & Vidéaste (Shooting)' FROM cat UNION ALL
SELECT id, 'location-chapiteau', 'Location Chapiteaux & Chaises' FROM cat UNION ALL
SELECT id, 'decoration-fetes', 'Décoration Fêtes & Mariages' FROM cat UNION ALL
SELECT id, 'dj-animation', 'DJ & Animation' FROM cat UNION ALL
SELECT id, 'location-robes', 'Location de Robes & Tasdira' FROM cat;

-- 10. MÉCANIQUE ET AUTO
WITH cat AS (
  INSERT INTO public.categories (slug, name, icon, color, is_popular) 
  VALUES ('mecanique-auto', 'Mécanique Auto', 'car_repair', '#D32F2F', false) 
  RETURNING id
)
INSERT INTO public.subcategories (category_id, slug, name)
SELECT id, 'scanner', 'Scanner Auto & Diagnostic' FROM cat UNION ALL
SELECT id, 'vulcanisateur', 'Vulcanisateur (Dépannage Pneus)' FROM cat UNION ALL
SELECT id, 'mecanique-generale', 'Mécanique Générale' FROM cat UNION ALL
SELECT id, 'tolerie-peinture', 'Tôlerie et Peinture Auto' FROM cat UNION ALL
SELECT id, 'electricite-auto', 'Électricité Auto' FROM cat UNION ALL
SELECT id, 'depannage-remorquage', 'Dépannage (Remorquage / Dépannage)' FROM cat UNION ALL
SELECT id, 'lavage-auto', 'Lavage Auto & Nettoyage à sec' FROM cat;

-- 11. SANTÉ & BIEN-ÊTRE
WITH cat AS (
  INSERT INTO public.categories (slug, name, icon, color, is_popular) 
  VALUES ('sante-bien-etre', 'Santé & Bien-être', 'spa', '#F06292', false) 
  RETURNING id
)
INSERT INTO public.subcategories (category_id, slug, name)
SELECT id, 'coiffure-domicile', 'Coiffure & Esthétique' FROM cat UNION ALL
SELECT id, 'hijama', 'Hijama & Cupping' FROM cat UNION ALL
SELECT id, 'garde-malade', 'Garde-malades & Infirmerie' FROM cat UNION ALL
SELECT id, 'garde-enfant', 'Garde d''enfants (Baby-sitting, Crèche)' FROM cat UNION ALL
SELECT id, 'kinesitherapie', 'Kinésithérapie à domicile' FROM cat;

-- 12. INFORMATIQUE & FREELANCE
WITH cat AS (
  INSERT INTO public.categories (slug, name, icon, color, is_popular) 
  VALUES ('informatique', 'Informatique & Freelance', 'computer', '#3F51B5', false) 
  RETURNING id
)
INSERT INTO public.subcategories (category_id, slug, name)
SELECT id, 'reparation-pc', 'Réparation PC, Informatique & Consoles' FROM cat UNION ALL
SELECT id, 'developpement', 'Développement Web & Applications' FROM cat UNION ALL
SELECT id, 'design', 'Création Logo & Design' FROM cat UNION ALL
SELECT id, 'marketing', 'Community Management & Marketing' FROM cat UNION ALL
SELECT id, 'traduction', 'Traduction & Rédaction' FROM cat UNION ALL
SELECT id, 'installation-reseau', 'Installation Réseau & Fibre Optique' FROM cat;

-- 13. IMPRESSION & PUBLICITÉ
WITH cat AS (
  INSERT INTO public.categories (slug, name, icon, color, is_popular) 
  VALUES ('impression', 'Impression & Publicité', 'print', '#009688', false) 
  RETURNING id
)
INSERT INTO public.subcategories (category_id, slug, name)
SELECT id, 'imprimerie', 'Imprimerie & Brochures' FROM cat UNION ALL
SELECT id, 'panneaux', 'Panneaux Publicitaires & Enseignes' FROM cat UNION ALL
SELECT id, 'habillage', 'Habillage Façades & Véhicules' FROM cat UNION ALL
SELECT id, 'cadeaux', 'Cadeaux d''Entreprise' FROM cat;

-- 14. ÉLECTROMÉNAGER & ÉLECTRONIQUE
WITH cat AS (
  INSERT INTO public.categories (slug, name, icon, color, is_popular) 
  VALUES ('electromenager-tv', 'Électroménager & Électronique', 'tv', '#673AB7', false) 
  RETURNING id
)
INSERT INTO public.subcategories (category_id, slug, name)
SELECT id, 'reparation-tv', 'Réparation Téléviseurs & Récepteurs' FROM cat UNION ALL
SELECT id, 'reparation-machine-laver', 'Réparation Machine à laver' FROM cat UNION ALL
SELECT id, 'reparation-petit-electro', 'Petit électroménager (Micro-ondes)' FROM cat UNION ALL
SELECT id, 'reparation-telephones', 'Réparation Téléphones & Tablettes' FROM cat;

-- 15. AIDES DOMESTIQUES & SERRURERIE
WITH cat AS (
  INSERT INTO public.categories (slug, name, icon, color, is_popular) 
  VALUES ('multiservices', 'Services Multi-techniques', 'home_repair_service', '#607D8B', false) 
  RETURNING id
)
INSERT INTO public.subcategories (category_id, slug, name)
SELECT id, 'serrurerie', 'Serrurerie & Ouverture de Portes' FROM cat UNION ALL
SELECT id, 'ascenseur', 'Dépannage & Maintenance Ascenseurs' FROM cat UNION ALL
SELECT id, 'installation-antenne', 'Installation Parabole & Récepteurs' FROM cat UNION ALL
SELECT id, 'bricolage', 'Petit Bricolage & Fixation' FROM cat;
