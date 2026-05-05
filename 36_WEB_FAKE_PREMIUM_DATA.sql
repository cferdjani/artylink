-- =========================================================================
-- SCRIPT 36 : GENERATION DE FAKE DATA PREMIUM (Abonnements, RFQ, Chat)
-- =========================================================================
-- Ce script injecte des données pour tester les fonctionnalités Premium 
-- (Phase E & D) : Abonnements Pro/Starter, Appels d'offres (RFQ), et Messagerie.
-- =========================================================================

DO $$
DECLARE
    -- Récupération des IDs générés par 33_WEB_FAKE_DATA.sql
    v_artisan1_id uuid; -- Karim Elec (Pro)
    v_artisan2_id uuid; -- Salim Plomb (Starter)
    v_client1_id uuid;  -- Hamid Client1
    v_cat_elec uuid;
    
    -- IDs pour les nouvelles données
    v_rfq_id uuid := gen_random_uuid();
    v_room_id uuid := gen_random_uuid();
BEGIN
    -- 1. Récupération des utilisateurs existants
    SELECT id INTO v_artisan1_id FROM auth.users WHERE email = 'electricien@test.com' LIMIT 1;
    SELECT id INTO v_artisan2_id FROM auth.users WHERE email = 'plombier@test.com' LIMIT 1;
    SELECT id INTO v_client1_id FROM auth.users WHERE email = 'client1@test.com' LIMIT 1;
    SELECT id INTO v_cat_elec FROM public.categories WHERE slug = 'electricite' LIMIT 1;

    -- Si les données de base n'existent pas, on arrête l'exécution
    IF v_artisan1_id IS NULL OR v_client1_id IS NULL THEN
        RAISE NOTICE 'Les utilisateurs de base sont introuvables. Exécutez 33_WEB_FAKE_DATA.sql d''abord.';
        RETURN;
    END IF;

    -------------------------------------------------------------------------
    -- 2. ABONNEMENTS (Subscriptions)
    -------------------------------------------------------------------------
    -- L'électricien prend l'abonnement PRO
    INSERT INTO public.subscriptions (user_id, plan_type, status, valid_until)
    VALUES (v_artisan1_id, 'pro', 'active', now() + interval '1 year')
    ON CONFLICT (user_id) DO UPDATE 
    SET plan_type = 'pro', status = 'active', valid_until = now() + interval '1 year';

    -- Le plombier prend l'abonnement STARTER
    INSERT INTO public.subscriptions (user_id, plan_type, status, valid_until)
    VALUES (v_artisan2_id, 'starter', 'active', now() + interval '1 month')
    ON CONFLICT (user_id) DO UPDATE 
    SET plan_type = 'starter', status = 'active', valid_until = now() + interval '1 month';

    -------------------------------------------------------------------------
    -- 3. PORTFOLIOS (Images pour l'artisan Pro)
    -------------------------------------------------------------------------
    INSERT INTO public.artisan_portfolios (artisan_id, image_url, caption, display_order)
    VALUES 
    (v_artisan1_id, 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=500&q=80', 'Rénovation Électrique Villa', 1),
    (v_artisan1_id, 'https://images.unsplash.com/photo-1540104539509-733af94628d0?w=500&q=80', 'Tableau électrique industriel', 2);

    -------------------------------------------------------------------------
    -- 4. APPEL D'OFFRES (RFQ) & DEVIS
    -------------------------------------------------------------------------
    -- Le client publie un nouvel appel d'offres pour un électricien
    INSERT INTO public.rfq_posts (id, client_id, category_id, title, description, budget_range, wilaya, status)
    VALUES (
        v_rfq_id, 
        v_client1_id, 
        v_cat_elec, 
        'Installation complète électricité pour un F4', 
        'Je cherche un artisan qualifié pour refaire toute l''installation électrique (câblage, prises, tableau) pour un F4 de 100m² en cours de rénovation aux Eucalyptus.', 
        '100000 - 250000 DZD', 
        'Alger', 
        'open'
    );

    -- L'électricien (PRO) soumet rapidement un devis (cela déclenchera le trigger pour envoyer une notif)
    INSERT INTO public.rfq_bids (rfq_id, artisan_id, proposal, price, status)
    VALUES (
        v_rfq_id, 
        v_artisan1_id, 
        'Bonjour, je suis disponible pour ce chantier. Je propose l''utilisation de matériel Schneider. Le prix estimé est de 180,000 DZD pour la main d''oeuvre et fourniture partielle.', 
        180000.00, 
        'pending'
    );

    -------------------------------------------------------------------------
    -- 5. MESSAGERIE (Chat Room et Messages)
    -------------------------------------------------------------------------
    -- Création d'une room entre le Client 1 et l'Électricien (suite au devis)
    INSERT INTO public.chat_rooms (id, client_id, artisan_id)
    VALUES (v_room_id, v_client1_id, v_artisan1_id);

    -- Début de la conversation
    INSERT INTO public.chat_messages (room_id, sender_id, message_type, content)
    VALUES 
    (v_room_id, v_client1_id, 'text', 'Bonjour Karim, j''ai vu votre devis pour mon F4.'),
    (v_room_id, v_artisan1_id, 'text', 'Bonjour Hamid. Oui absolument, êtes-vous disponible pour une visite de chantier ce weekend ?'),
    (v_room_id, v_client1_id, 'text', 'Je serai libre samedi matin vers 10h. Cela vous convient ?');

    -- Les triggers s'occuperont de la création automatique des notifications RFQ,
    -- donc nous n'avons pas besoin d'insérer les notifications rfq_new/bid_received manuellement ici !

END $$;
