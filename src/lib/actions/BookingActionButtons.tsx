"use client";

import { updateBookingStatus } from "@/lib/actions/dashboard-services-actions";
import { Loader2 } from "lucide-react";
import { useTransition } from "react";

export function BookingActionButtons({ bookingId, currentStatus }: { bookingId: string; currentStatus: string }) {
    const [isPending, startTransition] = useTransition();

    // On n'affiche les boutons que si le service est en attente d'une réponse
    if (currentStatus !== "pending") return null;

    return (
        <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
            <button
                disabled={isPending}
                onClick={() => startTransition(async () => { await updateBookingStatus(bookingId, "accepted"); })}
                className="inline-flex items-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
            >
                {isPending && <Loader2 size={16} className="mr-2 animate-spin" />}
                Accepter la demande
            </button>

            <button
                disabled={isPending}
                onClick={() => startTransition(async () => { await updateBookingStatus(bookingId, "rejected"); })}
                className="inline-flex items-center rounded-lg bg-rose-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-rose-600 disabled:opacity-50"
            >
                Refuser
            </button>
        </div>
    );
}