"use client";

import { useToast } from "@/components/ui/toast";
import { addPortfolioImage, deletePortfolioImage } from "@/lib/actions/portfolio";
import { createBrowserClient } from "@supabase/ssr";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

interface PortfolioImage {
    id: string;
    image_url: string;
    caption: string | null;
}

export function PortfolioManager({
    userId,
    initialImages
}: {
    userId: string;
    initialImages: PortfolioImage[];
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [images, setImages] = useState<PortfolioImage[]>(initialImages);
    const [uploading, setUploading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const { toast } = useToast();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split(".").pop();
            const filePath = `${userId}/portfolio_${Date.now()}.${fileExt}`;

            // Try 'portfolios' bucket first; fallback to 'public' if not configured. 
            // Depending on Supabase configuration, the bucket "portfolios" must exist and be public.
            let bucket = "portfolios";
            let { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file, { upsert: false });

            // Fallback bucket logic if portfolios is not created
            if (uploadError && uploadError.message.includes("Bucket not found")) {
                bucket = "avatars"; // use avatars since we know it exists
                const fallbackUpload = await supabase.storage
                    .from(bucket)
                    .upload(filePath, file, { upsert: false });
                uploadError = fallbackUpload.error;
            }

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

            // Call server action to securely insert into the database
            await addPortfolioImage(data.publicUrl);

            // To update UI instantly, fetch latest images
            const { data: latestImages } = await supabase
                .from("artisan_portfolios")
                .select("*")
                .eq("artisan_id", userId)
                .order("created_at", { ascending: false });

            if (latestImages) setImages(latestImages);

        } catch (error: any) {
            toast("Erreur lors de l'upload : " + error.message, "error");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Voulez-vous vraiment supprimer cette image du portfolio ?")) return;

        setDeletingId(id);
        try {
            await deletePortfolioImage(id);
            setImages(images.filter((img) => img.id !== id));
        } catch (error: any) {
            toast("Erreur de suppression : " + error.message, "error");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Votre travail en images</h2>
                <div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="glass-btn-primary py-2 px-4 flex items-center justify-center min-w-[200px]"
                    >
                        {uploading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Upload en cours...</>
                        ) : (
                            <><ImagePlus className="mr-2 h-4 w-4" /> Ajouter une photo</>
                        )}
                    </button>
                </div>
            </div>

            {images.length === 0 ? (
                <div className="py-12 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                        <ImagePlus size={32} />
                    </div>
                    <p className="text-sm font-bold text-slate-700">Aucune image dans votre portfolio</p>
                    <p className="text-sm text-slate-500 mt-1 max-w-sm">Ajoutez des photos de vos réalisations pour montrer votre savoir-faire aux clients potentiels.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((img) => (
                        <div key={img.id} className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
                            <img src={img.image_url} alt={img.caption || "Portfolio upload"} className="w-full h-full object-cover transition-transform group-hover:scale-105" />

                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                                <div className="self-end">
                                    <button
                                        onClick={() => handleDelete(img.id)}
                                        disabled={deletingId === img.id}
                                        className="p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg shadow-sm transition-colors disabled:opacity-50"
                                        title="Supprimer"
                                    >
                                        {deletingId === img.id ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <Trash2 size={16} />
                                        )}
                                    </button>
                                </div>
                                {img.caption && (
                                    <div className="bg-slate-900/80 text-white text-xs px-2 py-1.5 rounded-lg line-clamp-2">
                                        {img.caption}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
