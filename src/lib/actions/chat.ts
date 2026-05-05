"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createOrGetChatRoom(otherUserId: string) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: "Vous devez être connecté." };
        }

        const participant1 = user.id < otherUserId ? user.id : otherUserId;
        const participant2 = user.id < otherUserId ? otherUserId : user.id;

        // Chercher une room existante
        let { data: room, error: searchError } = await supabase
            .from("chat_rooms")
            .select("id")
            .eq("participant_1", participant1)
            .eq("participant_2", participant2)
            .single();

        if (searchError && searchError.code !== 'PGRST116') {
            return { error: searchError.message };
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
                return { error: insertError.message };
            }
            room = newRoom;
        }

        return { roomId: room.id };
    } catch (e: any) {
        return { error: e.message || "Erreur inattendue" };
    }
}

export async function sendMessage(roomId: string, content: string, mediaUrl?: string, mediaType?: string) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: "Non autorisé" };
        }

        const { error } = await supabase
            .from("chat_messages")
            .insert({
                room_id: roomId,
                sender_id: user.id,
                content,
                media_url: mediaUrl,
                media_type: mediaType,
            });

        if (error) {
            return { error: error.message };
        }

        // Update last_message_at
        await supabase
            .from("chat_rooms")
            .update({ last_message_at: new Date().toISOString() })
            .eq("id", roomId);

        return { success: true };
    } catch (e: any) {
        return { error: e.message || "Erreur inattendue" };
    }
}

export async function getMessages(roomId: string, limit = 50, before?: string) {
    const supabase = await createSupabaseServerClient();
    let query = supabase
        .from("chat_messages")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (before) {
        query = query.lt("created_at", before);
    }

    const { data, error } = await query;
    if (error) return { error: error.message, data: null };

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

    if (error) return { error: error.message, data: null };

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

        const { count, error } = await supabase
            .from("chat_messages")
            .select("id", { count: "exact", head: true })
            .eq("is_read", false)
            .neq("sender_id", user.id);

        if (error) {
            return { error: error.message, data: 0 };
        }

        return { data: count || 0 };
    } catch (e: any) {
        return { error: e.message || "Erreur inattendue", data: 0 };
    }
}

// L'upload est fait coté client directement vers le storage public/privé, 
// mais on peut fournir un helper ou signer des url.
// Par defaut, on utilise le JS client dans le composant.
