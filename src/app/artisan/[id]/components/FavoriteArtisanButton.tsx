"use client";

import { toggleFavoriteArtisan } from "@/lib/actions/favorites";
import { cn } from "@/lib/utils";
import { Heart, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";

type FavoriteArtisanButtonProps = {
    artisanId: string;
    initialIsFavorite: boolean;
    tone?: "light" | "dark";
};

export function FavoriteArtisanButton({
    artisanId,
    initialIsFavorite,
    tone = "light",
}: FavoriteArtisanButtonProps) {
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const isDark = tone === "dark";

    const handleToggle = () => {
        const nextState = !isFavorite;
        setError(null);
        setIsFavorite(nextState);

        startTransition(async () => {
            try {
                await toggleFavoriteArtisan(artisanId, nextState);
            } catch (err: any) {
                setIsFavorite(!nextState);
                setError(err.message || "Une erreur est survenue");
            }
        });
    };

    return (
        <div className="space-y-2">
            <button
                type="button"
                onClick={handleToggle}
                disabled={isPending}
                className={cn(
                    "inline-flex h-11 items-center gap-2 rounded-lg border px-4 text-sm font-semibold transition",
                    isDark
                        ? isFavorite
                            ? "border-rose-400/25 bg-rose-500/10 text-rose-50 hover:bg-rose-500/14"
                            : "border-white/12 bg-white/[0.05] text-white hover:bg-white/[0.08]"
                        : `glass-btn-secondary ${isFavorite ? "border-rose-200 bg-rose-50 text-rose-600" : ""}`
                )}
            >
                {isPending ? (
                    <Loader2 size={18} className="animate-spin" />
                ) : (
                    <Heart size={18} className={isFavorite ? "fill-current" : ""} />
                )}
                {isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            </button>
            {error ? (
                <p className={cn("text-xs font-semibold", isDark ? "text-rose-200" : "text-rose-600")}>{error}</p>
            ) : null}
        </div>
    );
}
