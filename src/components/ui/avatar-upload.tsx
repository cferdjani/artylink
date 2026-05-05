"use client";

import { useToast } from "@/components/ui/toast";
import { createBrowserClient } from "@supabase/ssr";
import Image from "next/image";
import { useState } from "react";

interface AvatarUploadProps {
    uid: string;
    url: string | null;
    onUpload: (url: string) => void | Promise<any>;
}

export default function AvatarUpload({ uid, url, onUpload }: AvatarUploadProps) {
    // Initialisation du client Supabase côté navigateur
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [uploading, setUploading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(url);
    const { toast } = useToast();

    const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error("Vous devez sélectionner une image à uploader.");
            }

            const file = event.target.files[0];
            const fileExt = file.name.split(".").pop();
            // Chemin unique pour éviter les conflits de cache: uid/timestamp.extension
            const filePath = `${uid}/avatar_${Date.now()}.${fileExt}`;

            // 1. Upload du fichier dans le bucket 'avatars'
            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            // 2. Récupération de l'URL publique
            const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

            // 3. Mise à jour de l'état local et appel du callback parent
            setAvatarUrl(data.publicUrl);
            await onUpload(data.publicUrl);

        } catch (error: any) {
            toast(error.message || "Erreur lors de l'upload de l'avatar !", "error");
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Conteneur de l'image avec effet Glassmorphism */}
            <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-orange-500/50 glass-panel backdrop-blur-[10px] flex items-center justify-center bg-white/10">
                {avatarUrl ? (
                    <Image src={avatarUrl} alt="Avatar de profil" fill className="object-cover" />
                ) : (
                    <span className="text-gray-400 text-3xl font-light">?</span>
                )}
            </div>

            <div className="relative">
                <input
                    type="file"
                    accept="image/*"
                    onChange={uploadAvatar}
                    disabled={uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <button
                    disabled={uploading}
                    className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full text-sm font-medium transition-colors shadow-lg disabled:opacity-50"
                >
                    {uploading ? "Upload en cours..." : "Modifier la photo"}
                </button>
            </div>
        </div>
    );
}