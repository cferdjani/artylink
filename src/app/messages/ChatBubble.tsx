"use client";
import { Check, CheckCheck } from "lucide-react";
import Image from "next/image";

export function ChatBubble({ msg, isMe }: { msg: any, isMe: boolean }) {
    return (
        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${isMe ? 'bg-primary text-white' : 'bg-white/70 backdrop-blur-sm border border-white/60 text-slate-900 shadow-[0_4px_16px_rgba(0,0,0,0.04)]'}`}>
                {msg.media_url && (
                    msg.media_type === 'image' ? (
                        <div className="mb-2">
                            <a href={msg.media_url} target="_blank" rel="noopener noreferrer">
                                <Image src={msg.media_url} alt="Média" width={240} height={240} className="rounded-lg object-cover max-w-full h-auto max-h-48" />
                            </a>
                        </div>
                    ) : msg.media_type === 'audio' ? (
                        <div className="mb-2"><audio controls src={msg.media_url} className="max-w-[200px] h-8" /></div>
                    ) : (
                        <a href={msg.media_url} target="_blank" rel="noopener noreferrer" className="underline font-bold mb-2 block">Fichier joint</a>
                    )
                )}
                {msg.content && <p className="whitespace-pre-wrap break-words text-sm">{msg.content}</p>}
                <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end text-primary-100' : 'justify-start text-slate-400'}`}>
                    <span className="text-[10px] block">{new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                    {isMe && (msg.is_read ? <CheckCheck size={12} className="text-white" /> : <Check size={12} className="text-primary-200" />)}
                </div>
            </div>
        </div>
    );
}