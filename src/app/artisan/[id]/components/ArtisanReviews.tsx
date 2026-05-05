import { Star } from "lucide-react";
import Image from "next/image";
import { ReviewItem } from "@/lib/marketplace-server-data";

export default function ArtisanReviews({ reviews }: { reviews: ReviewItem[] }) {
    if (!reviews || reviews.length === 0) {
        return (
            <div className="rounded-lg bg-slate-50 p-6 text-center">
                <p className="text-sm text-slate-500">Aucun avis pour le moment.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {reviews.map((r) => (
                <div key={r.id} className="rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            {r.client_avatar ? (
                                <Image
                                    src={r.client_avatar}
                                    alt={r.client_name}
                                    width={36}
                                    height={36}
                                    className="rounded-full h-9 w-9 object-cover"
                                />
                            ) : (
                                <div className="h-9 w-9 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 font-bold text-sm">
                                    {r.client_name.charAt(0)}
                                </div>
                            )}
                            <div>
                                <h4 className="text-sm font-semibold text-slate-800">{r.client_name}</h4>
                                <p className="text-xs text-slate-500">
                                    {new Date(r.created_at).toLocaleDateString('fr-DZ', {
                                        year: 'numeric', month: 'long', day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-400">
                            <Star size={14} className="fill-amber-400" />
                            <span className="text-xs font-bold text-slate-700 ml-1">{r.rating}</span>
                        </div>
                    </div>
                    {r.comment && (
                        <p className="mt-3 text-sm text-slate-700">{r.comment}</p>
                    )}
                </div>
            ))}
        </div>
    );
}
