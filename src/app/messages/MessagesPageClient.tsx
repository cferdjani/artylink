"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { Clock, MessageSquare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type Room = {
    id: string;
    last_message_at: string;
    otherUser: {
        id: string;
        full_name: string | null;
        avatar_url: string | null;
        role: string | null;
    } | null;
    lastMessage: {
        content: string | null;
        is_read: boolean | null;
        sender_id: string | null;
    } | null;
    unreadByMe: boolean;
};

export function MessagesPageClient({ rooms }: { rooms: Room[] }) {
    const [hideRead, setHideRead] = useState(false);

    const visibleRooms = useMemo(() => {
        return rooms.filter((room) => {
            if (hideRead && !room.unreadByMe) {
                return false;
            }

            return true;
        });
    }, [hideRead, rooms]);

    if (rooms.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[40vh] text-slate-500">
                <GlassCard className="p-8 max-w-sm w-full text-center flex flex-col items-center gap-4">
                    <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
                        <MessageSquare size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Aucune conversation</h2>
                    <p className="text-sm">Sélectionnez une conversation dans votre historique ou discutez avec un artisan depuis son profil.</p>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <input
                        type="checkbox"
                        checked={hideRead}
                        onChange={(event) => setHideRead(event.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                    />
                    Masquer les messages lus
                </label>
            </div>

            {visibleRooms.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm font-medium text-slate-500 shadow-sm">
                    Toutes vos conversations sont actuellement lues.
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {visibleRooms.map((room) => (
                        <Link key={room.id} href={`/messages/${room.id}`} className="block group">
                            <GlassCard className={`p-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:border-primary/30 flex items-center gap-4 ${room.unreadByMe ? "bg-white/80 border-primary/20" : "bg-white/40"}`}>
                                <div className="relative h-14 w-14 rounded-full overflow-hidden bg-slate-200 shrink-0 shadow-inner flex items-center justify-center">
                                    {room.otherUser?.avatar_url ? (
                                        <Image src={room.otherUser.avatar_url} alt="Avatar" fill className="object-cover" />
                                    ) : (
                                        <span className="font-bold text-slate-400 text-lg">
                                            {(room.otherUser?.full_name || "U").charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className={`truncate font-bold ${room.unreadByMe ? "text-slate-900" : "text-slate-700"}`}>
                                            {room.otherUser?.full_name || "Utilisateur"}
                                        </h3>
                                        <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0 whitespace-nowrap">
                                            <Clock size={12} />
                                            {new Date(room.last_message_at).toLocaleDateString("fr-DZ", {
                                                day: "numeric",
                                                month: "short",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <p className={`text-sm truncate ${room.unreadByMe ? "font-semibold text-slate-800" : "text-slate-500"}`}>
                                            {room.lastMessage ? room.lastMessage.content || "Fichier joint" : "Aucun message"}
                                        </p>
                                        {room.unreadByMe ? (
                                            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                                        ) : null}
                                    </div>
                                </div>
                            </GlassCard>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
