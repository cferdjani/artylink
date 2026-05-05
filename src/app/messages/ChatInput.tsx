"use client";
import { useToast } from "@/components/ui/toast";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Loader2, Paperclip, Send } from "lucide-react";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
const AudioRecorder = dynamic(() => import("./AudioRecorder").then((mod) => mod.AudioRecorder), { ssr: false });

export function ChatInput({ roomId, onSend }: { roomId: string, onSend: (content: string, url?: string, type?: string) => Promise<void> }) {
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [uploading, setUploading] = useState(false);
    const { toast } = useToast();
    const supabase = createSupabaseBrowserClient();

    const handleSendText = async (e?: React.MouseEvent | React.KeyboardEvent) => {
        if (e) e.preventDefault();
        const text = newMessage.trim();
        if (!text || isSending) return;

        setIsSending(true);
        setNewMessage("");
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        try {
            await onSend(text);
        } catch (err: any) {
            setNewMessage(text);
            toast(err.message || "Erreur d'envoi", "error");
        } finally {
            setIsSending(false);
            // Remettre le focus SANS forcer le scroll du navigateur
            textareaRef.current?.focus({ preventScroll: true });
        }
    };

    const uploadFile = async (file: File | Blob, originalName: string, isAudio = false) => {
        setUploading(true);
        try {
            let ext = isAudio ? 'webm' : originalName.split('.').pop() || 'file';
            if (isAudio && file.type) {
                if (file.type.includes('mp4')) ext = 'm4a'; // M4A passe mieux sur le player web d'Apple
                else if (file.type.includes('ogg')) ext = 'ogg';
                else if (file.type.includes('webm')) ext = 'webm';
            }

            const filePath = `${roomId}/${Date.now()}.${ext}`;

            const { error: uploadError } = await supabase.storage.from('chat-media').upload(filePath, file);
            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('chat-media').getPublicUrl(filePath);
            const mediaType = isAudio ? 'audio' : (file.type.startsWith('image/') ? 'image' : 'file');
            await onSend("", data.publicUrl, mediaType);
        } catch (error: any) {
            toast(error.message || "Erreur lors de l'upload.", "error");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toast("Fichier trop volumineux (max 5MB).", "error");
            return;
        }
        uploadFile(file, file.name);
    };

    return (
        <div className="p-4 border-t border-white/60 bg-white/50 shrink-0">
            <div className="flex items-end gap-2">
                <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} accept="image/*,.pdf,.doc,.docx" />
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading || isSending} className="p-3 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-xl transition-colors" title="Joindre un fichier">
                    {uploading ? <Loader2 size={20} className="animate-spin" /> : <Paperclip size={20} />}
                </button>

                <AudioRecorder onRecordingComplete={(blob) => uploadFile(blob, "audio", true)} />

                <textarea
                    ref={textareaRef}
                    value={newMessage}
                    onChange={(e) => {
                        setNewMessage(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSendText(e);
                        }
                    }}
                    placeholder="Écrivez un message..."
                    className="flex-1 glass-input resize-none rounded-xl py-3 px-4 outline-none border border-slate-200 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 bg-white/70"
                    rows={1}
                />

                <button
                    type="button"
                    onClick={(e) => handleSendText(e)}
                    onMouseDown={(e) => e.preventDefault()}
                    disabled={isSending || (!newMessage.trim() && !uploading)}
                    className="p-3 bg-primary text-white rounded-xl hover:bg-primary-hover disabled:opacity-50 transition-colors shadow-sm"
                >
                    {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                </button>
            </div>
        </div>
    );
}