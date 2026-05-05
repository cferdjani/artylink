-- =============================================================================
-- PATCH 40 : Autoriser le marquage "lu" des messages de chat par le destinataire
-- =============================================================================

BEGIN;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Participants update read status" ON public.chat_messages;
END $$;

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
          AND (r.client_id = auth.uid() OR r.artisan_id = auth.uid())
    )
)
WITH CHECK (
    sender_id <> auth.uid()
    AND EXISTS (
        SELECT 1
        FROM public.chat_rooms r
        WHERE r.id = room_id
          AND (r.client_id = auth.uid() OR r.artisan_id = auth.uid())
    )
);

COMMIT;
