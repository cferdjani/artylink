-- =========================================================================
-- REGISTRATION PROFILE DETAILS
-- =========================================================================
-- Ajoute les champs complets d'inscription et met a jour le trigger auth
-- pour alimenter profiles + artisans des la creation du compte.

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS first_name TEXT,
    ADD COLUMN IF NOT EXISTS last_name TEXT,
    ADD COLUMN IF NOT EXISTS age INTEGER,
    ADD COLUMN IF NOT EXISTS wilaya TEXT,
    ADD COLUMN IF NOT EXISTS commune TEXT;

ALTER TABLE public.profiles
    DROP CONSTRAINT IF EXISTS profiles_age_check;

ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_age_check CHECK (age IS NULL OR (age >= 18 AND age <= 100));

ALTER TABLE public.artisans
    ADD COLUMN IF NOT EXISTS profession TEXT,
    ADD COLUMN IF NOT EXISTS specialties TEXT[] DEFAULT '{}';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role TEXT;
    v_phone TEXT;
    v_full_name TEXT;
    v_first_name TEXT;
    v_last_name TEXT;
    v_wilaya TEXT;
    v_commune TEXT;
    v_city TEXT;
    v_profession TEXT;
    v_specialties TEXT[];
    v_age INTEGER;
BEGIN
    v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'client');
    v_phone := NULLIF(NEW.raw_user_meta_data->>'phone', '');
    v_first_name := NULLIF(NEW.raw_user_meta_data->>'first_name', '');
    v_last_name := NULLIF(NEW.raw_user_meta_data->>'last_name', '');
    v_full_name := COALESCE(
        NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
        NULLIF(CONCAT_WS(' ', v_first_name, v_last_name), '')
    );
    v_wilaya := NULLIF(NEW.raw_user_meta_data->>'wilaya', '');
    v_commune := NULLIF(NEW.raw_user_meta_data->>'commune', '');
    v_city := COALESCE(NULLIF(NEW.raw_user_meta_data->>'city', ''), v_commune);
    v_profession := NULLIF(NEW.raw_user_meta_data->>'profession', '');
    v_age := NULLIF(NEW.raw_user_meta_data->>'age', '')::INTEGER;

    SELECT COALESCE(array_agg(value), '{}')
    INTO v_specialties
    FROM jsonb_array_elements_text(COALESCE(NEW.raw_user_meta_data->'specialties', '[]'::jsonb)) AS value;

    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        first_name,
        last_name,
        age,
        role,
        phone,
        city,
        wilaya,
        commune
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(v_full_name, NEW.email),
        v_first_name,
        v_last_name,
        v_age,
        v_role,
        v_phone,
        v_city,
        v_wilaya,
        v_commune
    )
    ON CONFLICT (id) DO UPDATE
    SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        first_name = COALESCE(EXCLUDED.first_name, public.profiles.first_name),
        last_name = COALESCE(EXCLUDED.last_name, public.profiles.last_name),
        age = COALESCE(EXCLUDED.age, public.profiles.age),
        role = EXCLUDED.role,
        phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
        city = COALESCE(EXCLUDED.city, public.profiles.city),
        wilaya = COALESCE(EXCLUDED.wilaya, public.profiles.wilaya),
        commune = COALESCE(EXCLUDED.commune, public.profiles.commune);

    IF v_role = 'artisan' THEN
        INSERT INTO public.artisans (
            id,
            profile_id,
            company_name,
            business_name,
            profession,
            specialties,
            wilaya,
            city
        )
        VALUES (
            NEW.id,
            NEW.id,
            v_profession,
            v_profession,
            v_profession,
            v_specialties,
            v_wilaya,
            v_city
        )
        ON CONFLICT (id) DO UPDATE
        SET
            profile_id = EXCLUDED.profile_id,
            company_name = COALESCE(EXCLUDED.company_name, public.artisans.company_name),
            business_name = COALESCE(EXCLUDED.business_name, public.artisans.business_name),
            profession = COALESCE(EXCLUDED.profession, public.artisans.profession),
            specialties = CASE
                WHEN array_length(EXCLUDED.specialties, 1) IS NULL THEN public.artisans.specialties
                ELSE EXCLUDED.specialties
            END,
            wilaya = COALESCE(EXCLUDED.wilaya, public.artisans.wilaya),
            city = COALESCE(EXCLUDED.city, public.artisans.city);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
