"use client";

import { useToast } from "@/components/ui/toast";
import { createBrowserClient } from "@supabase/ssr";
import { Loader2, UploadCloud } from "lucide-react";
import { useState } from "react";

interface PortfolioUploadProps {
    uid: string;
    onUploadComplete: (url: string) => void | Promise<any>;
}

export function PortfolioUpload({ uid, onUploadComplete }: PortfolioUploadProps) {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [uploading, setUploading] = useState(false);
    const { toast } = useToast();

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) return;

            const file = event.target.files[0];
            const fileExt = file.name.split(".").pop();
            const filePath = `${uid}/portfolio_${Date.now()}.${fileExt}`;

            // 1. Upload dans le bucket 'portfolios' (déjà configuré par vos scripts SQL)
            const { error: uploadError } = await supabase.storage
                .from("portfolios")
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            // 2. Récupérer l'URL
            const { data } = supabase.storage.from("portfolios").getPublicUrl(filePath);

            // 3. Callback (Ex: Server Action pour lier à l'artisan en BDD)
            await onUploadComplete(data.publicUrl);

        } catch (error: any) {
            toast("Erreur d'upload : " + error.message, "error");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="relative flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-orange-300 bg-orange-50/50 hover:bg-orange-50 transition-colors">
            <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
            />
            {uploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            ) : (
                <UploadCloud className="h-8 w-8 text-orange-500" />
            )}
            <p className="mt-2 text-sm font-semibold text-orange-700">{uploading ? "Upload en cours..." : "Ajouter une photo de chantier"}</p>
        </div>
    );
}