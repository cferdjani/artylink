import { GlassCard } from "@/components/ui/glass-card";
import { getRooms } from "@/lib/actions/chat";
import { Clock, MessageSquare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MessagesIndexPage() {
    const { data: rooms, error } = await getRooms();

    if (error === "Non autorisé") {
        redirect("/auth/login");
    }

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

            {!rooms || rooms.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center min-h-[40vh] text-slate-500">
                    <GlassCard className="p-8 max-w-sm w-full text-center flex flex-col items-center gap-4">
                        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
                            <MessageSquare size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">Aucune conversation</h2>
                        <p className="text-sm">Sélectionnez une conversation dans votre historique ou discutez avec un artisan depuis son profil.</p>
                    </GlassCard>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {rooms.map((room) => {
                        const otherUser = room.otherUser;
                        const lastMsg = room.lastMessage;
                        const unreadByMe = lastMsg && lastMsg.is_read === false && lastMsg.sender_id === otherUser?.id;

                        return (
                            <Link key={room.id} href={`/messages/${room.id}`} className="block group">
                                <GlassCard className={`p-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:border-primary/30 flex items-center gap-4 ${unreadByMe ? 'bg-white/80 border-primary/20' : 'bg-white/40'}`}>
                                    <div className="relative h-14 w-14 rounded-full overflow-hidden bg-slate-200 shrink-0 shadow-inner flex items-center justify-center">
                                        {otherUser?.avatar_url ? <Image src={otherUser.avatar_url} alt="Avatar" fill className="object-cover" /> : <span className="font-bold text-slate-400 text-lg">{(otherUser?.full_name || 'U').charAt(0).toUpperCase()}</span>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <h3 className={`truncate font-bold ${unreadByMe ? 'text-slate-900' : 'text-slate-700'}`}>{otherUser?.full_name || 'Utilisateur'}</h3>
                                            <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0 whitespace-nowrap"><Clock size={12} />{new Date(room.last_message_at).toLocaleDateString("fr-DZ", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-4">
                                            <p className={`text-sm truncate ${unreadByMe ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>{lastMsg ? (lastMsg.content || 'Fichier joint') : 'Aucun message'}</p>
                                            {unreadByMe && <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />}
                                        </div>
                                    </div>
                                </GlassCard>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
