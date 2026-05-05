-- =========================================================================
-- SCRIPT 3/3 : SEED & TAXONOMIE CANONIQUE EXHAUSTIVE (WEB-ONLY V2)
-- Non destructif: UPSERT categories/subcategories avec ajout SEO Metadata.
-- =========================================================================

BEGIN;

    -- 1. Canonical Categories (Avec SEO)
    WITH categories_seed(slug, name, icon, color, is_popular, meta_title, meta_description) AS (
    VALUES
    ('construction', 'Construction & Rénovation', 'architecture', '#795548', true, 'Experts en Construction et Rénovation', 'Trouvez les meilleurs artisans pour tous vos projets de construction et rénovation.'),
    ('menuiserie', 'Menuiserie & Aménagement', 'carpenter', '#E64A19', true, 'Services de Menuiserie et Aménagement Intérieur', 'Menuisiers qualifiés pour cuisines, dressings et rénovations bois.'),
    ('plomberie-gaz', 'Plomberie & Gaz', 'water_drop', '#1976D2', true, 'Plombiers Chauffagistes Professionnels', 'Dépannage rapide, installation de chauffage et réparations plomberie.'),
    ('electricite', 'Électricité', 'electric_bolt', '#FBC02D', true, 'Électriciens Certifiés', 'Installations électriques bâtiment et industrie, dépannage express.'),
    ('climatisation', 'Climatisation & Froid', 'ac_unit', '#00BCD4', true, 'Installation et Réparation de Climatisation', 'Techniciens en climatisation chambre froide et ventilation.'),
    ('transport', 'Transport & Logistique', 'local_shipping', '#FF9800', true, 'Transport de Marchandises et Déménagement', 'Services fiables de transport, livraison et déménageurs pros.'),
    ('nettoyage', 'Nettoyage & Environnement', 'cleaning_services', '#4CAF50', false, 'Entreprises de Nettoyage et Entretien', 'Femmes de ménage, nettoyage industriel et fin de chantier.'),
    ('formation', 'Cours & Formations', 'school', '#9C27B0', true, 'Cours de Soutien et Formations Pros', 'Trouvez le meilleur prof pour soutien scolaire, langues et coaching.'),
    ('evenementiel', 'Événementiel & Fêtes', 'celebration', '#E91E63', false, 'Organisation d''Événements et Fêtes', 'Location de salles, décoration, traiteur et animation dj.'),
    ('mecanique-auto', 'Mécanique Auto', 'car_repair', '#D32F2F', false, 'Mécaniciens et Garages Auto', 'Diagnostic scanner, réparation tôlerie, vulgarisateur et électricité auto.'),
    ('sante-bien-etre', 'Santé & Bien-être', 'spa', '#F06292', false, 'Services de Garde-Malades et Soins', 'Garde d''enfants, orthophonie, kinésithérapie à domicile.'),
    ('informatique', 'Informatique & Freelance', 'computer', '#3F51B5', false, 'Dépannage PC et Services Informatiques', 'Réparation, développement web et installation réseaux.'),
    ('impression', 'Impression & Publicité', 'print', '#009688', false, 'Imprimeries et Agences de Com', 'Impression grand format, sérigraphie et habillage façades.'),
    ('electromenager-tv', 'Électroménager & Électronique', 'tv', '#673AB7', false, 'Réparation Électroménager', 'Techniciens pour réfrigérateurs, machines à laver et téléviseurs.'),
    ('multiservices', 'Services Multi-techniques', 'home_repair_service', '#607D8B', false, 'Homme Toutes Mains et Bricolage', 'Petits travaux, serrurerie, installation parabole.'),
    ('couture', 'Couture & Confection', 'checkroom', '#C2185B', false, 'Couturières et Tailleuses', 'Création sur mesure, tenues traditionnelles et retouches.'),
    ('beaute', 'Beauté & Esthétique', 'face_retouching_natural', '#F48FB1', false, 'Esthéticiennes et Coiffeuses à Domicile', 'Maquillage, soins du visage, onglerie et esthétique.'),
    ('securite', 'Sécurité & Gardiennage', 'security', '#455A64', false, 'Agences de Sécurité et Alarmes', 'Installation caméras, interphones et agents de sécurité.'),
    ('juridique-admin', 'Services Juridiques & Admin', 'gavel', '#00796B', false, 'Traducteurs et Comptables', 'Écrivains publics, création d''entreprises, accompagnement visa.'),
    ('jardinage-agri', 'Jardinage & Agriculture', 'eco', '#33691E', false, 'Jardiniers et Paysagistes', 'Entretien espaces verts, élagage et pépiniéristes.'),
    ('artisanat-art', 'Artisanat d''Art & Tradition', 'brush', '#8D6E63', false, 'Poterie et Artisanat d''Art', 'Artisans d''art, céramique, tissage et maroquinerie.'),
    ('restauration', 'Restauration & Gastronomie', 'restaurant', '#FF5722', false, 'Traiteurs et Cuisiniers', 'Spécialistes gâteaux traditionnels et boulangerie artisanale.'),
    ('animaux', 'Animaux & Vétérinaire', 'pets', '#795548', false, 'Vétérinaires et Garde Animaux', 'Soins à domicile, toilettage et éducation canine.'),
    ('audiovisuel', 'Audiovisuel & Média', 'videocam', '#6200EA', false, 'Photographes et Vidéastes Pros', 'Couverture mariages, prises de vue drone et montage vidéo.'),
    ('immobilier', 'Immobilier & Courtage', 'real_estate_agent', '#0277BD', false, 'Agences Immobilières et Courtiers', 'Achat, vente, location et expertise immobilière.')
)
    INSERT INTO public.categories
        (slug, name, icon, color, is_popular, meta_title, meta_description)
    SELECT slug, name, icon, color, is_popular, meta_title, meta_description
    FROM categories_seed
    ON CONFLICT
    (slug) DO
    UPDATE SET
    name = EXCLUDED.name,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    is_popular = EXCLUDED.is_popular,
    meta_title = EXCLUDED.meta_title,
    meta_description = EXCLUDED.meta_description;

    -- 2. Canonical Subcategories
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
    -- Insertion sécurisée (les sous categories seront liées grâce au slug)
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
