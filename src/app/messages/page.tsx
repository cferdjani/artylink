import { MessagesPageClient } from "@/app/messages/MessagesPageClient";
import { getRooms } from "@/lib/actions/chat";
import { MessageSquare } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MessagesIndexPage() {
    const { data: rooms, error } = await getRooms();

    if (error === "Non autorisé") {
        redirect("/auth/login");
    }

    const roomsWithUnreadState = (rooms || []).map((room) => {
        const otherUser = room.otherUser;
        const lastMsg = room.lastMessage;

        return {
            ...room,
            unreadByMe: Boolean(lastMsg && lastMsg.is_read === false && lastMsg.sender_id === otherUser?.id),
        };
    });

    return (
        <div className="max-w-3xl mx-auto flex flex-col gap-6 animate-fade-in-up">
            <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <MessageSquare size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Vos conversations</h1>
                    <p className="text-sm text-slate-500 font-medium">Gérez vos échanges avec les artisans et clients.</p>
                </div>
            </div>

            <MessagesPageClient rooms={roomsWithUnreadState} />
        </div>
    );
}
