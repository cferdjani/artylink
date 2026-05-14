"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Vérifie que l'utilisateur est bien participant de la room.
 * Retourne true si oui, false sinon.
 */
async function isRoomParticipant(
    supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
    roomId: string,
    userId: string
): Promise<boolean> {
    const { data: room } = await supabase
        .from("chat_rooms")
        .select("participant_1, participant_2")
        .eq("id", roomId)
        .single();

    if (!room) return false;
    return room.participant_1 === userId || room.participant_2 === userId;
}

export async function createOrGetChatRoom(otherUserId: string) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: "Vous devez être connecté." };
        }

        if (otherUserId === user.id) {
            return { error: "Vous ne pouvez pas créer une conversation avec vous-même." };
        }

        const participant1 = user.id < otherUserId ? user.id : otherUserId;
        const participant2 = user.id < otherUserId ? otherUserId : user.id;

        // Chercher une room existante
        const { data: existingRoom, error: searchError } = await supabase
            .from("chat_rooms")
            .select("id")
            .eq("participant_1", participant1)
            .eq("participant_2", participant2)
            .single();

        let room = existingRoom;

        if (searchError && searchError.code !== 'PGRST116') {
            return { error: "Erreur lors de la recherche de conversation." };
        }

        // Si pas de room, on crée
        if (!room) {
            const { data: newRoom, error: insertError } = await supabase
                .from("chat_rooms")
                .insert({
                    participant_1: participant1,
                    participant_2: participant2,
                })
                .select("id")
                .single();

            if (insertError) {
                return { error: "Impossible de créer la conversation." };
            }
            room = newRoom;
        }

        return { roomId: room.id };
    } catch {
        return { error: "Erreur inattendue." };
    }
}

export async function sendMessage(roomId: string, content: string, mediaUrl?: string, mediaType?: string) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: "Non autorisé" };
        }

        // Vérifier que l'utilisateur est participant de la room
        const isParticipant = await isRoomParticipant(supabase, roomId, user.id);
        if (!isParticipant) {
            return { error: "Accès refusé à cette conversation." };
        }

        // Validation basique du contenu
        const trimmedContent = content?.trim() || "";
        if (!trimmedContent && !mediaUrl) {
            return { error: "Le message ne peut pas être vide." };
        }

        const { error } = await supabase
            .from("chat_messages")
            .insert({
                room_id: roomId,
                sender_id: user.id,
                content: trimmedContent,
                media_url: mediaUrl,
                media_type: mediaType,
            });

        if (error) {
            console.error("[sendMessage] Erreur:", error);
            return { error: "Impossible d'envoyer le message." };
        }

        // Update last_message_at
        await supabase
            .from("chat_rooms")
            .update({ last_message_at: new Date().toISOString() })
            .eq("id", roomId);

        return { success: true };
    } catch {
        return { error: "Erreur inattendue." };
    }
}

export async function getMessages(roomId: string, limit = 50, before?: string) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Non autorisé", data: null };
    }

    // Vérifier que l'utilisateur est participant de la room
    const isParticipant = await isRoomParticipant(supabase, roomId, user.id);
    if (!isParticipant) {
        return { error: "Accès refusé à cette conversation.", data: null };
    }

    let query = supabase
        .from("chat_messages")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: false })
        .limit(Math.min(limit, 100)); // Cap le limit à 100

    if (before) {
        query = query.lt("created_at", before);
    }

    const { data, error } = await query;
    if (error) return { error: "Impossible de charger les messages.", data: null };

    return { data: data.reverse() }; // ascending for display
}

export async function getRooms() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Non autorisé", data: null };

    const { data: rooms, error } = await supabase
        .from("chat_rooms")
        .select(`
            id, 
            last_message_at, 
            participant_1, 
            participant_2
        `)
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order("last_message_at", { ascending: false });

    if (error) return { error: "Impossible de charger les conversations.", data: null };

    // Fetch details for the *other* participant
    const roomsWithDetails = await Promise.all(rooms.map(async (room) => {
        const otherUserId = room.participant_1 === user.id ? room.participant_2 : room.participant_1;
        const { data: profile } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url, role")
            .eq("id", otherUserId)
            .single();

        // Fetch last message
        const { data: lastMessage } = await supabase
            .from("chat_messages")
            .select("content, is_read, sender_id")
            .eq("room_id", room.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        return {
            ...room,
            otherUser: profile,
            lastMessage
        };
    }));

    return { data: roomsWithDetails };
}

export async function markAsRead(roomId: string) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Vérifier que l'utilisateur est participant de la room
    const isParticipant = await isRoomParticipant(supabase, roomId, user.id);
    if (!isParticipant) return;

    await supabase
        .from("chat_messages")
        .update({ is_read: true })
        .eq("room_id", roomId)
        .neq("sender_id", user.id)
        .eq("is_read", false);
}

export async function getUnreadCount() {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { data: 0 };
        }

        // D'abord récupérer les rooms de l'utilisateur
        const { data: rooms, error: roomsError } = await supabase
            .from("chat_rooms")
            .select("id")
            .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`);

        if (roomsError || !rooms || rooms.length === 0) {
            return { data: 0 };
        }

        const roomIds = rooms.map((r) => r.id);

        // Compter les messages non lus uniquement dans les rooms de l'utilisateur
        const { count, error } = await supabase
            .from("chat_messages")
            .select("id", { count: "exact", head: true })
            .in("room_id", roomIds)
            .eq("is_read", false)
            .neq("sender_id", user.id);

        if (error) {
            return { data: 0 };
        }

        return { data: count || 0 };
    } catch {
        return { data: 0 };
    }
}

// L'upload est fait coté client directement vers le storage public/privé, 
// mais on peut fournir un helper ou signer des url.
// Par defaut, on utilise le JS client dans le composant.
