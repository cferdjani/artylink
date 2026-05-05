-- =============================================================================
-- SCRIPT 35 : FONDATIONS PREMIUM, CHAT & ENCHERES
-- Tables: Subscriptions, Portfolios, Chat Rooms, Messages, RFQ, Bids, Notifs
-- =============================================================================

BEGIN;

-- 1. ABONNEMENTS (Subscriptions)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_type text NOT NULL CHECK (plan_type IN ('free', 'starter', 'pro')),
    status text NOT NULL CHECK (status IN ('active', 'cancelled', 'expired')),
    valid_until timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id) -- Un seul abo actif par utilisateur pour l'instant
);

-- 2. PORTFOLIOS ARTISANS (Phase B)
CREATE TABLE IF NOT EXISTS public.artisan_portfolios (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    artisan_id uuid NOT NULL REFERENCES public.artisans(id) ON DELETE CASCADE,
    image_url text NOT NULL,
    caption text,
    display_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- 3. MESSAGERIE MULTIMODALE (Phase C)
CREATE TABLE IF NOT EXISTS public.chat_rooms (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    artisan_id uuid NOT NULL REFERENCES public.artisans(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id uuid NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message_type text NOT NULL CHECK (message_type IN ('text', 'image', 'audio', 'video')),
    content text,
    file_url text,
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- 4. APPELS D'OFFRES / ENCHERES (Phase D)
CREATE TABLE IF NOT EXISTS public.rfq_posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text NOT NULL,
    budget_range text,
    wilaya text,
    status text DEFAULT 'open' CHECK (status IN ('open', 'closed', 'completed')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rfq_bids (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id uuid NOT NULL REFERENCES public.rfq_posts(id) ON DELETE CASCADE,
    artisan_id uuid NOT NULL REFERENCES public.artisans(id) ON DELETE CASCADE,
    proposal text NOT NULL,
    price numeric(10,2),
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at timestamptz DEFAULT now()
);

-- 5. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type text NOT NULL CHECK (type IN ('rfq_new', 'bid_received', 'message', 'sys')),
    title text NOT NULL,
    content text NOT NULL,
    link_url text,
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);
COMMIT;

-- Policies do not support IF NOT EXISTS in CREATE POLICY natively without DO $blocks
-- Therefore, we run them outside a transaction with DO block wrapper.
DO $$
BEGIN
    DROP POLICY IF EXISTS "Les utilisateurs peuvents voir leur propre abonnement" ON public.subscriptions;
    DROP POLICY IF EXISTS "Portfolios publics en lecture" ON public.artisan_portfolios;
    DROP POLICY IF EXISTS "Artisans modifient leur propre portfolio" ON public.artisan_portfolios;
    DROP POLICY IF EXISTS "Participants voient leurs chat rooms" ON public.chat_rooms;
    DROP POLICY IF EXISTS "Participants peuvent créer une room" ON public.chat_rooms;
    DROP POLICY IF EXISTS "Participants voient les messages" ON public.chat_messages;
    DROP POLICY IF EXISTS "Participants écrivent des messages" ON public.chat_messages;
    DROP POLICY IF EXISTS "RFQ publiques en lecture" ON public.rfq_posts;
    DROP POLICY IF EXISTS "Clients créent et gèrent leurs RFQ" ON public.rfq_posts;
    DROP POLICY IF EXISTS "Proprio RFQ ou Auteur bid lisent les offres" ON public.rfq_bids;
    DROP POLICY IF EXISTS "Artisans créent leurs offres" ON public.rfq_bids;
    DROP POLICY IF EXISTS "Voir ses propres notifications" ON public.notifications;
    DROP POLICY IF EXISTS "Modifier ses propres notifications" ON public.notifications;
END $$;

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artisan_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfq_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfq_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Subscriptions RLS (Lecture seule pour soi-même)
CREATE POLICY "Les utilisateurs peuvents voir leur propre abonnement" 
ON public.subscriptions FOR SELECT TO authenticated 
USING (user_id = auth.uid());

-- Portfolios (Ouvert à tous en lecture, écriture pour l'artisan)
CREATE POLICY "Portfolios publics en lecture" 
ON public.artisan_portfolios FOR SELECT USING (true);

CREATE POLICY "Artisans modifient leur propre portfolio" 
ON public.artisan_portfolios FOR ALL TO authenticated 
USING (artisan_id = auth.uid()) WITH CHECK (artisan_id = auth.uid());

-- Chat Rooms (Participant = lecture/écriture)
CREATE POLICY "Participants voient leurs chat rooms" 
ON public.chat_rooms FOR SELECT TO authenticated 
USING (client_id = auth.uid() OR artisan_id = auth.uid());

CREATE POLICY "Participants peuvent créer une room" 
ON public.chat_rooms FOR INSERT TO authenticated 
WITH CHECK (client_id = auth.uid() OR artisan_id = auth.uid());

-- Chat Messages (Participant = lecture/écriture)
CREATE POLICY "Participants voient les messages" 
ON public.chat_messages FOR SELECT TO authenticated 
USING (
   EXISTS (
       SELECT 1 FROM public.chat_rooms r 
       WHERE r.id = room_id AND (r.client_id = auth.uid() OR r.artisan_id = auth.uid())
   )
);

CREATE POLICY "Participants écrivent des messages" 
ON public.chat_messages FOR INSERT TO authenticated 
WITH CHECK (
   EXISTS (
       SELECT 1 FROM public.chat_rooms r 
       WHERE r.id = room_id AND (r.client_id = auth.uid() OR r.artisan_id = auth.uid())
   )
   AND sender_id = auth.uid()
);

-- RFQ Posts (Public en lecture, Admin/Proprio en écriture)
CREATE POLICY "RFQ publiques en lecture" 
ON public.rfq_posts FOR SELECT USING (true);

CREATE POLICY "Clients créent et gèrent leurs RFQ" 
ON public.rfq_posts FOR ALL TO authenticated 
USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid());

-- RFQ Bids (Lecture proprio RFQ ou artisan lui-même)
CREATE POLICY "Proprio RFQ ou Auteur bid lisent les offres" 
ON public.rfq_bids FOR SELECT TO authenticated 
USING (
    artisan_id = auth.uid() 
    OR EXISTS (SELECT 1 FROM public.rfq_posts r WHERE r.id = rfq_id AND r.client_id = auth.uid())
);

CREATE POLICY "Artisans créent leurs offres" 
ON public.rfq_bids FOR INSERT TO authenticated 
WITH CHECK (artisan_id = auth.uid());

-- Notifications
CREATE POLICY "Voir ses propres notifications" 
ON public.notifications FOR SELECT TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Modifier ses propres notifications" 
ON public.notifications FOR UPDATE TO authenticated 
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
