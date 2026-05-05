-- 0. Migration du schéma legacy (client_id/artisan_id) vers le nouveau schéma (participant_1/participant_2)
DO $$
BEGIN
  -- Migration pour chat_rooms
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='chat_rooms' AND column_name='client_id') THEN
      ALTER TABLE public.chat_rooms DROP CONSTRAINT IF EXISTS chat_rooms_client_id_fkey;
      ALTER TABLE public.chat_rooms DROP CONSTRAINT IF EXISTS chat_rooms_artisan_id_fkey;
      ALTER TABLE public.chat_rooms RENAME COLUMN client_id TO participant_1;
      ALTER TABLE public.chat_rooms RENAME COLUMN artisan_id TO participant_2;
      ALTER TABLE public.chat_rooms ADD CONSTRAINT chat_rooms_participant_1_fkey FOREIGN KEY (participant_1) REFERENCES public.profiles(id) ON DELETE CASCADE;
      ALTER TABLE public.chat_rooms ADD CONSTRAINT chat_rooms_participant_2_fkey FOREIGN KEY (participant_2) REFERENCES public.profiles(id) ON DELETE CASCADE;
      ALTER TABLE public.chat_rooms ADD CONSTRAINT chat_rooms_participants_key UNIQUE (participant_1, participant_2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='chat_rooms' AND column_name='last_message_at') THEN
      ALTER TABLE public.chat_rooms ADD COLUMN last_message_at TIMESTAMPTZ DEFAULT now();
  END IF;

  -- Migration pour chat_messages
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='chat_messages' AND column_name='file_url') THEN
      ALTER TABLE public.chat_messages RENAME COLUMN file_url TO media_url;
      ALTER TABLE public.chat_messages RENAME COLUMN message_type TO media_type;
      ALTER TABLE public.chat_messages ALTER COLUMN media_type DROP NOT NULL;
      ALTER TABLE public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_message_type_check;
  END IF;
END $$;

-- Nettoyage des anciennes policies avant d'appliquer les nouvelles
DROP POLICY IF EXISTS "Participants voient leurs chat rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "Participants peuvent créer une room" ON public.chat_rooms;
DROP POLICY IF EXISTS "Participants voient les messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Participants écrivent des messages" ON public.chat_messages;

-- 1. Activer Supabase Realtime pour la table des messages
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- 2. Activer Row Level Security (RLS)
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 3. Policies pour chat_rooms
CREATE POLICY "Users can see own rooms" ON chat_rooms
  FOR SELECT USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "Users can create rooms" ON chat_rooms
  FOR INSERT WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- 4. Policies pour chat_messages
CREATE POLICY "Users can see room messages" ON chat_messages
  FOR SELECT USING (
    room_id IN (SELECT id FROM chat_rooms WHERE participant_1 = auth.uid() OR participant_2 = auth.uid())
  );

CREATE POLICY "Users can send messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can mark messages read" ON chat_messages
  FOR UPDATE USING (
    room_id IN (SELECT id FROM chat_rooms WHERE participant_1 = auth.uid() OR participant_2 = auth.uid())
  ) WITH CHECK (is_read = true);