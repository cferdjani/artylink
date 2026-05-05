# 10 — Insertion des Catégories et Sous-catégories (Marché Algérien)

Ce script SQL va remplir votre base de données Supabase avec une liste exhaustive et structurée de tous les métiers d'artisanat pertinents en Algérie.

## ⚠️ Instructions
1. Allez dans **Supabase > SQL Editor**.
2. Créez une nouvelle requête (New Query).
3. Copiez-collez l'intégralité du code ci-dessous et cliquez sur **Run**.

```sql
-- D'abord, on vide les tables au cas où pour éviter les doublons (Optionnel)
-- TRUNCATE public.categories CASCADE;

-- 1. PLOMBERIE ET GAZ
WITH cat AS (
  INSERT INTO public.categories (slug, name, icon, color, is_popular)
  VALUES ('plomberie-gaz', 'Plomberie & Gaz', 'water_drop', '#1976D2', true)
  RETURNING id
)
INSERT INTO public.subcategories (category_id, slug, name)
SELECT id, 'reparation-fuite', 'Réparation fuite d''eau' FROM cat UNION ALL
SELECT id, 'installation-chauffage', 'Chauffage central & Radiateurs' FROM cat UNION ALL
SELECT id, 'chauffe-eau-bain', 'Installation / Maintenance Chauffe-eau' FROM cat UNION ALL
SELECT id, 'depannage-gaz', 'Dépannage & Installation Gaz de ville' FROM cat UNION ALL
SELECT id, 'pompe-a-eau', 'Installation Surpresseur (Pompe)' FROM cat;

-- 2. ÉLECTRICITÉ
WITH cat AS (
  INSERT INTO public.categories (slug, name, icon, color, is_popular)
  VALUES ('electricite', 'Électricité', 'electric_bolt', '#FBC02D', true)
  RETURNING id
)
INSERT INTO public.subcategories (category_id, slug, name)
SELECT id, 'electricite-batiment', 'Électricité Bâtiment (Maison)' FROM cat UNION ALL
SELECT id, 'electricite-industrielle', 'Électricité Industrielle (380V)' FROM cat UNION ALL
SELECT id, 'installation-groupe-electrogene', 'Installation Groupe Électrogène' FROM cat UNION ALL
SELECT id, 'camera-surveillance', 'Installation Caméras & Alarmes' FROM cat UNION ALL
SELECT id, 'panneaux-solaires', 'Énergie Solaire' FROM cat;

-- 3. MÉCANIQUE ET AUTO
WITH cat AS (
  INSERT INTO public.categories (slug, name, icon, color, is_popular)
  VALUES ('mecanique-auto', 'Mécanique Auto', 'car_repair', '#D32F2F', true)
  RETURNING id
)
INSERT INTO public.subcategories (category_id, slug, name)
SELECT id, 'scanner-auto', 'Scanner Auto & Diagnostic' FROM cat UNION ALL
SELECT id, 'vulcanisateur', 'Vulcanisateur (Dépannage Pneus)' FROM cat UNION ALL
SELECT id, 'mecanique-generale', 'Mécanique Générale' FROM cat UNION ALL
SELECT id, 'tôlerie-peinture', 'Tôlerie et Peinture Auto' FROM cat UNION ALL
SELECT id, 'electricite-auto', 'Électricité Auto' FROM cat UNION ALL
SELECT id, 'depannage-remorquage', 'Dépannage (Remorquage / Dépannage)' FROM cat;

-- 4. FROID ET CLIMATISATION
WITH cat AS (
  INSERT INTO public.categories (slug, name, icon, color, is_popular)
  VALUES ('froid-climatisation', 'Climatisation & Froid', 'ac_unit', '#00BCD4', true)
  RETURNING id
)
INSERT INTO public.subcategories (category_id, slug, name)
SELECT id, 'installation-climatiseur', 'Installation Climatiseur' FROM cat UNION ALL
SELECT id, 'recharge-gaz-clim', 'Recharge Gaz & Nettoyage' FROM cat UNION ALL
SELECT id, 'chambre-froide', 'Chambre Froide & Froid Industriel' FROM cat UNION ALL
SELECT id, 'reparation-frigo', 'Réparation Réfrigérateurs' FROM cat;

-- 5. CONSTRUCTION & RÉNOVATION
WITH cat AS (
  INSERT INTO public.categories (slug, name, icon, color, is_popular)
  VALUES ('construction-renovation', 'Construction & Rénovation', 'architecture', '#795548', true)
  RETURNING id
)
INSERT INTO public.subcategories (category_id, slug, name)
SELECT id, 'maconnerie', 'Maçonnerie Générale' FROM cat UNION ALL
SELECT id, 'peinture-decoration', 'Peinture & Décoration' FROM cat UNION ALL
SELECT id, 'platrerie-ba13', 'Placoplâtre (BA13)' FROM cat UNION ALL
SELECT id, 'revetement-sol', 'Revêtement (Dalle de sol, Faïence)' FROM cat UNION ALL
SELECT id, 'etancheite', 'Étanchéité (Goudron, Résine)' FROM cat;

-- 6. MENUISERIE & FERRONNERIE
WITH cat AS (
  INSERT INTO public.categories (slug, name, icon, color, is_popular)
  VALUES ('menuiserie-metal', 'Menuiserie & Ferronnerie', 'carpenter', '#E64A19', false)
  RETURNING id
)
INSERT INTO public.subcategories (category_id, slug, name)
SELECT id, 'menuiserie-aluminium', 'Menuiserie Aluminium & PVC' FROM cat UNION ALL
SELECT id, 'menuiserie-bois', 'Menuiserie Bois' FROM cat UNION ALL
SELECT id, 'ferronnerie', 'Ferronnerie d''Art & Soudure' FROM cat UNION ALL
SELECT id, 'rideaux-metalliques', 'Installation & Réparation Rideaux Métalliques' FROM cat;

-- 7. ÉLECTROMÉNAGER & ÉLECTRONIQUE
WITH cat AS (
  INSERT INTO public.categories (slug, name, icon, color, is_popular)
  VALUES ('electromenager-tv', 'Électroménager & TV', 'tv', '#673AB7', false)
  RETURNING id
)
INSERT INTO public.subcategories (category_id, slug, name)
SELECT id, 'reparation-tv', 'Réparation Téléviseurs & Récepteurs' FROM cat UNION ALL
SELECT id, 'reparation-machine-laver', 'Réparation Machine à laver' FROM cat UNION ALL
SELECT id, 'reparation-petit-electromenager', 'Petit électroménager (Micro-ondes, etc)' FROM cat UNION ALL
SELECT id, 'reparation-telephones', 'Réparation Téléphones & Tablettes' FROM cat;

-- 8. AUTRES SERVICES SPÉCIALISÉS
WITH cat AS (
  INSERT INTO public.categories (slug, name, icon, color, is_popular)
  VALUES ('services-multiservices', 'Services Multi-techniques', 'build', '#607D8B', false)
  RETURNING id
)
INSERT INTO public.subcategories (category_id, slug, name)
SELECT id, 'depannage-ascenseur', 'Maintenance & Dépannage Ascenseurs' FROM cat UNION ALL
SELECT id, 'demenagement-transport', 'Transport & Déménagement' FROM cat UNION ALL
SELECT id, 'nettoyage-industriel', 'Nettoyage & Désinsectisation' FROM cat UNION ALL
SELECT id, 'vitrerie', 'Vitrerie & Miroiterie' FROM cat UNION ALL
SELECT id, 'serrurerie', 'Serrurerie (Ouverture de portes)' FROM cat;

```
