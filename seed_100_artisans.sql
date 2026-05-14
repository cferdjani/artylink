-- --------------------------------------------------------------------------------
-- SEED SCRIPT : 100 Artisans ArtyLink (Diverses spécialités et forfaits)
-- --------------------------------------------------------------------------------
-- Exécutez ce script dans l'éditeur SQL de Supabase pour générer des données de test.
-- Il va créer 100 utilisateurs avec leurs Profils et Fiches Artisans.
-- Les mots de passe pour tous les comptes seront : password123
-- --------------------------------------------------------------------------------

DO $$
DECLARE
    i INT;
    v_user_id UUID;
    v_professions TEXT[] := ARRAY['Plombier Sanitaire', 'Électricien Bâtiment', 'Peintre Décorateur', 'Menuisier', 'Maçon', 'Développeur Web', 'Designer Graphique', 'Traiteur Événementiel', 'Coiffeur Visagiste', 'Photographe Pro'];
    v_cities TEXT[] := ARRAY['Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Tizi Ouzou', 'Sétif', 'Tlemcen', 'Batna', 'Béjaïa'];
    v_first_names TEXT[] := ARRAY['Krimo', 'Amel', 'Nour', 'Omar', 'Samir', 'Lyna', 'Sofiane', 'Sarah', 'Walid', 'Meriem'];
    v_last_names TEXT[] := ARRAY['M.', 'S.', 'H.', 'K.', 'B.', 'D.', 'T.', 'L.', 'C.', 'A.'];
    v_avatars TEXT[] := ARRAY[
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Jude',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Destiny'
    ];
    v_tier TEXT;
    v_fname TEXT;
    v_lname TEXT;
    v_profession TEXT;
    v_city TEXT;
    v_avatar TEXT;
    v_rating NUMERIC;
    v_email TEXT;
BEGIN
    FOR i IN 1..100 LOOP
        v_user_id := gen_random_uuid();
        
        v_fname := v_first_names[1 + floor(random() * 10)::int];
        v_lname := v_last_names[1 + floor(random() * 10)::int];
        v_profession := v_professions[1 + floor(random() * 10)::int];
        v_city := v_cities[1 + floor(random() * 10)::int];
        v_avatar := v_avatars[1 + floor(random() * 5)::int];
        v_rating := round((3.5 + random() * 1.5)::numeric, 1);
        
        IF i <= 15 THEN
            v_tier := 'pro';
        ELSIF i <= 40 THEN
            v_tier := 'starter';
        ELSE
            v_tier := 'basic';
        END IF;

        v_email := 'artisan' || i || '_' || v_tier || '@artylink.test';

        -- 1. Création auth.users
        INSERT INTO auth.users (id, instance_id, role, aud, email, encrypted_password, email_confirmed_at, created_at, updated_at)
        VALUES (
            v_user_id,
            '00000000-0000-0000-0000-000000000000',
            'authenticated',
            'authenticated',
            v_email,
            crypt('password123', gen_salt('bf')),
            now(),
            now(),
            now()
        );

        -- 2. Mise à jour du profil (créé par trigger Supabase)
        UPDATE public.profiles
        SET 
            full_name = v_fname || ' ' || v_lname,
            role = 'artisan',
            avatar_url = v_avatar,
            email = v_email,
            updated_at = now()
        WHERE id = v_user_id;

        -- 3. Création de la fiche Artisan
        INSERT INTO public.artisans (
            id, company_name, profession, wilaya, city,
            subscription_tier, rating, reviews_count, status,
            created_at, updated_at
        )
        VALUES (
            v_user_id,
            v_fname || ' ' || v_profession,
            v_profession,
            v_city,
            v_city,
            v_tier,
            v_rating,
            floor(random() * 50 + 1)::int,
            'approved',
            now(),
            now()
        );
    END LOOP;
END $$;
