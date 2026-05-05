"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Camera, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, useRef, useState } from "react";

interface AvatarSectionProps {
    userId: string;
    avatarUrl: string | null;
    fullName: string;
    role: string;
    email: string | null;
}

function getInitials(fullName: string, email: string | null) {
    const source = fullName.trim() || email?.trim() || "U";
    const parts = source.split(/\s+/).filter(Boolean);

    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function AvatarSection({ userId, avatarUrl, fullName, role, email }: AvatarSectionProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [currentAvatarUrl, setCurrentAvatarUrl] = useState(avatarUrl);
    const [feedback, setFeedback] = useState<string | null>(null);

    async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setFeedback(null);
        setIsUploading(true);

        try {
            const supabase = createSupabaseBrowserClient();
            const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
            const safeExtension = /^[a-z0-9]+$/.test(extension) ? extension : "jpg";
            const filePath = `${userId}/avatar-${Date.now()}.${safeExtension}`;

            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(filePath, file, { upsert: true });

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
            const publicUrl = data.publicUrl;

            const { error: profileError } = await supabase
                .from("profiles")
                .update({
                    avatar_url: publicUrl,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", userId);

            if (profileError) {
                throw profileError;
            }

            const { error: authError } = await supabase.auth.updateUser({
                data: { avatar_url: publicUrl },
            });

            if (authError) {
                throw authError;
            }

            setCurrentAvatarUrl(publicUrl);
            setFeedback("Photo de profil mise a jour.");
            router.refresh();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Impossible de mettre la photo a jour.";
            setFeedback(message);
        } finally {
            setIsUploading(false);
            event.target.value = "";
        }
    }

    return (
        <div className="flex flex-col items-center gap-4 text-center sm:items-start sm:text-left">
            <div className="flex items-center justify-center gap-4 sm:justify-start">
                <div className="relative h-28 w-28 overflow-hidden rounded-full border border-white/70 bg-slate-100 shadow-[0_18px_40px_rgba(15,23,42,0.10)]">
                    {currentAvatarUrl ? (
                        <Image
                            src={currentAvatarUrl}
                            alt={fullName}
                            fill
                            unoptimized
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-2xl font-black text-slate-500">
                            {getInitials(fullName, email)}
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-center gap-2 sm:items-start">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/70 bg-white/90 text-slate-600 shadow-[0_10px_25px_rgba(15,23,42,0.10)] transition hover:text-primary disabled:cursor-not-allowed disabled:opacity-70"
                        aria-label="Modifier la photo de profil"
                    >
                        {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                    </button>
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        {isUploading ? "Upload..." : "Photo"}
                    </span>
                </div>
            </div>

            <div className="flex w-full flex-col gap-2">
                <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                    <span className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-primary">
                        {role}
                    </span>
                    <h2 className="text-2xl font-black text-slate-900">{fullName}</h2>
                </div>
                <p className="text-sm font-medium text-slate-500">{email || "Email non renseigne"}</p>
                {feedback ? (
                    <p className={`text-sm font-medium ${feedback.includes("mise a jour") ? "text-emerald-600" : "text-red-500"}`}>
                        {feedback}
                    </p>
                ) : null}
            </div>
        </div>
    );
}
