import { getMessages, markAsRead } from "@/lib/actions/chat";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import ChatInterface from "./ChatInterface";

export const dynamic = "force-dynamic";

export default async function ChatRoomPage({ params }: { params: Promise<{ roomId: string }> }) {
    const { roomId } = await params;
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    const { data: room, error: roomError } = await supabase
        .from("chat_rooms")
        .select("*")
        .eq("id", roomId)
        .single();

    if (roomError || !room) {
        redirect("/messages");
    }

    const otherUserId = room.participant_1 === user.id ? room.participant_2 : room.participant_1;
    const { data: otherUser } = await supabase.from("profiles").select("full_name, avatar_url").eq("id", otherUserId).single();

    await markAsRead(roomId);
    const { data: initialMessages } = await getMessages(roomId);

    return (
        <Suspense fallback={<div className="p-8 text-center text-slate-500 font-medium">Chargement de la conversation...</div>}>
            <ChatInterface roomId={roomId} currentUserId={user.id} otherUser={otherUser} initialMessages={initialMessages || []} />
        </Suspense>
    );
}