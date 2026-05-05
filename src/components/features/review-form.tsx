"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { submitReview } from "@/lib/actions/reviews";
import { cn } from "@/lib/utils";
import { Loader2, Star } from "lucide-react";
import { FaPaperPlane } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type ReviewFormProps = {
    artisanId: string;
    tone?: "light" | "dark";
};

export function ReviewForm({ artisanId, tone = "light" }: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const isDark = tone === "dark";

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setSuccess(false);

        if (rating === 0) {
            setError("Veuillez selectionner une note.");
            return;
        }

        if (comment.trim().length < 10) {
            setError("Votre commentaire doit contenir au moins 10 caracteres.");
            return;
        }

        startTransition(async () => {
            const result = await submitReview(artisanId, rating, comment);

            if (result.error) {
                setError(result.error);
            } else {
                setSuccess(true);
                setRating(0);
                setComment("");
                router.refresh();
            }
        });
    };

    const body = (
        <>
            <h3 className={cn("mb-4 text-xl font-bold", isDark ? "text-white" : "text-slate-900")}>Laisser un avis</h3>

            {success ? (
                <div
                    className={cn(
                        "rounded-lg border p-4 text-sm font-medium",
                        isDark
                            ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-100"
                            : "border-emerald-200 bg-emerald-50 text-emerald-700"
                    )}
                >
                    Merci pour votre retour. Votre avis a ete publie.
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <span
                            className={cn(
                                "mb-2 block text-sm font-bold",
                                isDark ? "text-white/78" : "text-slate-700"
                            )}
                        >
                            Note (sur 5)
                        </span>
                        <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className="p-1 transition-transform hover:scale-105"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                >
                                    <Star
                                        size={28}
                                        className={cn(
                                            "transition-colors",
                                            (hoverRating || rating) >= star
                                                ? "fill-amber-400 text-amber-400"
                                                : isDark
                                                  ? "fill-transparent text-white/20"
                                                  : "fill-transparent text-slate-300"
                                        )}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="comment"
                            className={cn(
                                "mb-2 block text-sm font-bold",
                                isDark ? "text-white/78" : "text-slate-700"
                            )}
                        >
                            Votre message
                        </label>
                        <textarea
                            id="comment"
                            value={comment}
                            onChange={(event) => setComment(event.target.value)}
                            placeholder="Partagez votre experience avec cet artisan..."
                            rows={5}
                            className={cn(
                                "w-full resize-none rounded-lg border px-3 py-3 text-sm outline-none transition",
                                isDark
                                    ? "border-white/12 bg-black/40 text-white placeholder:text-white/28 focus:border-white/22"
                                    : "glass-input"
                            )}
                            required
                        />
                    </div>

                    {error ? (
                        <div
                            className={cn(
                                "rounded-lg border px-3 py-2 text-sm font-medium",
                                isDark
                                    ? "border-rose-500/25 bg-rose-500/10 text-rose-100"
                                    : "border-rose-100 bg-rose-50 text-rose-600"
                            )}
                        >
                            {error}
                        </div>
                    ) : null}

                    <button
                        type="submit"
                        disabled={isPending}
                        className={cn(
                            "mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition",
                            isDark
                                ? "border-white/12 bg-white text-black hover:bg-white/90 disabled:bg-white/70"
                                : "glass-btn-primary"
                        )}
                    >
                        {isPending ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Publication...
                            </>
                        ) : (
                            <>
                                <FaPaperPlane size={16} />
                                Publier mon avis
                            </>
                        )}
                    </button>
                </form>
            )}
        </>
    );

    if (isDark) {
        return <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">{body}</div>;
    }

    return <GlassCard className="p-6">{body}</GlassCard>;
}
