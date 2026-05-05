-- =========================================================================
-- PHASE 7: MESSAGERIE (CONVERSATIONS + MESSAGES)
-- =========================================================================

CREATE TABLE
IF NOT EXISTS public.conversations
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4
(),
    client_id UUID NOT NULL REFERENCES public.profiles
(id) ON
DELETE CASCADE,
    artisan_id UUID
NOT NULL REFERENCES public.artisans
(id) ON
DELETE CASCADE,
    created_at TIMESTAMPTZ
NOT NULL DEFAULT NOW
(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW
(),
    UNIQUE
(client_id, artisan_id)
);

CREATE TABLE
IF NOT EXISTS public.messages
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4
(),
    conversation_id UUID NOT NULL REFERENCES public.conversations
(id) ON
DELETE CASCADE,
    sender_id UUID
NOT NULL REFERENCES public.profiles
(id) ON
DELETE CASCADE,
    content TEXT
NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW
()
);

CREATE INDEX
IF NOT EXISTS idx_messages_conversation_created_at
ON public.messages
(conversation_id, created_at DESC);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY
IF EXISTS "Users can view their conversations" ON public.conversations;
CREATE POLICY "Users can view their conversations"
ON public.conversations
FOR
SELECT
    USING (auth.uid() = client_id OR auth.uid() = artisan_id);

DROP POLICY
IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations"
ON public.conversations
FOR
INSERT
WITH CHECK (auth.uid() =
client_id
OR
auth
.uid
() = artisan_id);

DROP POLICY
IF EXISTS "Users can update their conversations" ON public.conversations;
CREATE POLICY "Users can update their conversations"
ON public.conversations
FOR
UPDATE
USING (auth.uid()
= client_id OR auth.uid
() = artisan_id)
WITH CHECK
(auth.uid
() = client_id OR auth.uid
() = artisan_id);

DROP POLICY
IF EXISTS "Users can read messages in their conversations" ON public.messages;
CREATE POLICY "Users can read messages in their conversations"
ON public.messages
FOR
SELECT
    USING (
    EXISTS (
        SELECT 1
    FROM public.conversations c
    WHERE c.id = conversation_id
        AND (c.client_id = auth.uid() OR c.artisan_id = auth.uid())
    )
);

DROP POLICY
IF EXISTS "Users can send messages in their conversations" ON public.messages;
CREATE POLICY "Users can send messages in their conversations"
ON public.messages
FOR
INSERT
WITH CHECK
    (
    sender_id
= auth.uid
()
    AND EXISTS
(
        SELECT 1
FROM public.conversations c
WHERE c.id = conversation_id
    AND (c.client_id = auth.uid() OR c.artisan_id = auth.uid())
    )
);

CREATE OR REPLACE FUNCTION public.touch_conversation_updated_at
()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations
    SET updated_at = NOW()
    WHERE id = NEW.conversation_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_touch_conversation_updated_at
ON public.messages;
CREATE TRIGGER trg_touch_conversation_updated_at
AFTER
INSERT ON public.
messages
FOR
EACH
ROW
EXECUTE
PROCEDURE public.touch_conversation_updated_at
();
