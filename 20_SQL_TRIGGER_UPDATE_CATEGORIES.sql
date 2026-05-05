-- =========================================================================
-- MISE A JOUR DU TRIGGER D'INSCRIPTION POUR INCLURE LA CATEGORIE (PHASE 8/9)
-- =========================================================================

-- Met à jour le trigger pour que lorsqu'un artisan s'inscrit, il soit
-- automatiquement associé à sa catégorie et ses sous-catégories sélectionnées.

CREATE OR REPLACE FUNCTION public.handle_new_user
() 
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
  v_phone TEXT;
  v_city TEXT;
  v_business_name TEXT;
  v_description TEXT;
  v_category_id UUID;
  v_subcats JSONB;
  v_subcat_id TEXT;
BEGIN
  -- Extract Metadata
  v_role := COALESCE
(NEW.raw_user_meta_data->>'role', 'client');
  v_phone := NEW.raw_user_meta_data->>'phone';
  v_city := NEW.raw_user_meta_data->>'city';

-- 1. Insert into profiles (common for everyone)
INSERT INTO public.profiles
  (id, email, full_name, role, phone, city)
VALUES
  (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    v_role,
    v_phone,
    v_city
  )
ON CONFLICT
(id) DO
UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    role = EXCLUDED.role,
    phone = EXCLUDED.phone,
    city = EXCLUDED.city;

-- 2. Insert into artisans if role is artisan
IF v_role = 'artisan' THEN
    v_business_name := NEW.raw_user_meta_data->>'business_name';
    v_description := NEW.raw_user_meta_data->>'description';

INSERT INTO public.artisans
  (id, profile_id, business_name, bio)
VALUES
  (
    NEW.id,
    NEW.id,
    v_business_name,
    v_description
    )
ON CONFLICT
(id) DO
UPDATE SET business_name = EXCLUDED.business_name;

-- 3. Lier la catégorie sélectionnée principale
BEGIN
      v_category_id :=
(NEW.raw_user_meta_data->>'category_id')::UUID;
IF v_category_id IS NOT NULL THEN
INSERT INTO public.artisan_categories
  (artisan_id, category_id, is_primary)
VALUES
  (NEW.id, v_category_id, TRUE)
ON CONFLICT DO NOTHING;
END
IF;
    EXCEPTION WHEN OTHERS THEN
-- Silence les erreurs de cast UUID
END;

-- 4. Insérer les sous-catégories associées
BEGIN
      v_subcats := NEW.raw_user_meta_data->'subcategories';
IF v_subcats IS NOT NULL AND jsonb_typeof(v_subcats) = 'array' THEN
        FOR v_subcat_id IN
SELECT *
FROM jsonb_array_elements_text(v_subcats)
        LOOP
INSERT INTO public.artisan_subcategories
  (artisan_id, subcategory_id)
VALUES
  (NEW.id, v_subcat_id::UUID)
ON CONFLICT DO NOTHING;
END LOOP;
END
IF;
    EXCEPTION WHEN OTHERS THEN
-- Handle any json parsing or uuid casting errors silently
END;

END
IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

