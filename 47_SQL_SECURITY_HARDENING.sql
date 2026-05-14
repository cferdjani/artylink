-- =============================================================================
-- PATCH 47 : Durcissement sécurité — RLS manquant + fix policy chat
-- =============================================================================

BEGIN;

-- =============================================
-- 1. Fix policy 40 : les colonnes correctes sont participant_1/participant_2
--    (l'ancienne policy référençait client_id/artisan_id qui n'existent pas)
-- =============================================
DROP POLICY IF EXISTS "Participants update read status" ON public.chat_messages;
CREATE POLICY "Participants update read status"
ON public.chat_messages
FOR UPDATE
TO authenticated
USING (
    sender_id <> auth.uid()
    AND EXISTS (
        SELECT 1
        FROM public.chat_rooms r
        WHERE r.id = room_id
          AND (r.participant_1 = auth.uid() OR r.participant_2 = auth.uid())
    )
)
WITH CHECK (
    sender_id <> auth.uid()
    AND EXISTS (
        SELECT 1
        FROM public.chat_rooms r
        WHERE r.id = room_id
          AND (r.participant_1 = auth.uid() OR r.participant_2 = auth.uid())
    )
);

-- =============================================
-- 2. Activer RLS sur les tables non protégées
-- =============================================
ALTER TABLE public.sponsored_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsored_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artisan_subcategories ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 3. Policies de lecture publique pour les tables qui doivent rester lisibles
-- =============================================

-- sponsored_items : affichage homepage (uniquement les campagnes actives)
DROP POLICY IF EXISTS "Public read active sponsored items" ON public.sponsored_items;
CREATE POLICY "Public read active sponsored items"
ON public.sponsored_items
FOR SELECT
TO anon, authenticated
USING (end_at > now());

-- sponsored_ads : affichage bannières actives
DROP POLICY IF EXISTS "Public read active sponsored ads" ON public.sponsored_ads;
CREATE POLICY "Public read active sponsored ads"
ON public.sponsored_ads
FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- artisan_subcategories : lecture publique pour la recherche
DROP POLICY IF EXISTS "Public read artisan subcategories" ON public.artisan_subcategories;
CREATE POLICY "Public read artisan subcategories"
ON public.artisan_subcategories
FOR SELECT
TO anon, authenticated
USING (true);

-- artisan_subcategories : les artisans gèrent leurs propres sous-catégories
DROP POLICY IF EXISTS "Artisans manage own subcategories" ON public.artisan_subcategories;
CREATE POLICY "Artisans manage own subcategories"
ON public.artisan_subcategories
FOR ALL
TO authenticated
USING (auth.uid() = artisan_id)
WITH CHECK (auth.uid() = artisan_id);

-- leads : un utilisateur peut voir ses propres leads
DROP POLICY IF EXISTS "Users read own leads" ON public.leads;
CREATE POLICY "Users read own leads"
ON public.leads
FOR SELECT
TO authenticated
USING (client_id = auth.uid() OR artisan_id = auth.uid());

-- leads : un utilisateur authentifié peut créer un lead
DROP POLICY IF EXISTS "Authenticated users create leads" ON public.leads;
CREATE POLICY "Authenticated users create leads"
ON public.leads
FOR INSERT
TO authenticated
WITH CHECK (client_id = auth.uid());

-- payments : un utilisateur voit ses propres paiements
DROP POLICY IF EXISTS "Users read own payments" ON public.payments;
CREATE POLICY "Users read own payments"
ON public.payments
FOR SELECT
TO authenticated
USING (client_id = auth.uid());

COMMIT;
