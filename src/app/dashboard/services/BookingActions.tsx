"use client";

import { useTransition } from "react";
import { updateBookingStatus } from "./actions";

export function BookingActions({ bookingId }: { bookingId: string }) {
    const [isPending, startTransition] = useTransition();

    const handleStatusChange = (status: "accepted" | "rejected") => {
        startTransition(async () => {
            try {
                await updateBookingStatus(bookingId, status);
            } catch (err) {
                console.error("Erreur :", err);
            }
        });
    };

    return (
        <div className="flex items-center gap-2">
            <button onClick={() => handleStatusChange("accepted")} disabled={isPending} className="glass-btn-primary !py-1.5 !px-4 text-xs">
                Accepter
            </button>
            <button onClick={() => handleStatusChange("rejected")} disabled={isPending} className="glass-btn-secondary !py-1.5 !px-4 text-xs !text-rose-600 !border-rose-200 hover:!bg-rose-50">
                Refuser
            </button>
        </div>
    );
}