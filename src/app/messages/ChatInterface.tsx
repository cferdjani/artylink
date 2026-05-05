"use client";
import { useToast } from "@/components/ui/toast";
import { sendMessage } from "@/lib/actions/chat";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChatBubble } from "./ChatBubble";
import { ChatInput } from "./ChatInput";

export default function ChatInterface({ roomId, currentUserId, otherUser, initialMessages }: { roomId: string; currentUserId: string; otherUser: any; initialMessages: any[]; }) {
    const [messages, setMessages] = useState(initialMessages);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const supabase = createSupabaseBrowserClient();
    const { toast } = useToast();

    useEffect(() => {
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        const channel = supabase
            .channel(`room:${roomId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` }, (payload) => {
                setMessages((prev) => [...prev, payload.new]);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [roomId, supabase]);

    const handleSend = async (content: string, url?: string, type?: string) => {
        const result = await sendMessage(roomId, content, url, type);
        if (result.error) {
            toast(result.error, "error");
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4 sm:p-6 overscroll-none" style={{ touchAction: 'none' }}>
            <div className="flex flex-col w-full max-w-md h-full max-h-[700px] bg-white/80 backdrop-blur-3xl border border-white/60 shadow-[0_20px_60px_rgba(0,0,0,0.2)] rounded-[2.5rem] overflow-hidden">
                <div className="p-4 border-b border-white/60 bg-white/50 flex items-center justify-between shrink-0 z-10 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden relative border-2 border-white shadow-sm shrink-0">
                            {otherUser?.avatar_url ? (
                                <Image src={otherUser.avatar_url} alt="Avatar" fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 bg-slate-100">{(otherUser?.full_name || '?').charAt(0).toUpperCase()}</div>
                            )}
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-base font-black text-slate-900 tracking-tight truncate">{otherUser?.full_name || 'Utilisateur'}</h2>
                            <p className="text-[11px] font-bold text-emerald-500 flex items-center gap-1.5 mt-0.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span> En ligne</p>
                        </div>
                    </div>
                    <Link href="/messages" className="p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors shrink-0 bg-white/50">
                        <X size={20} strokeWidth={2.5} />
                    </Link>
                </div>

                <div ref={scrollContainerRef} className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4 bg-slate-50/40 relative">
                    {messages.map((msg) => (
                        <ChatBubble key={msg.id} msg={msg} isMe={msg.sender_id === currentUserId} />
                    ))}
                </div>

                <div className="z-10">
                    <ChatInput roomId={roomId} onSend={handleSend} />
                </div>
            </div>
        </div>
    );
}