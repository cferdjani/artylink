"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { useEffect } from "react";

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Dashboard error:", error);
    }, [error]);

    return (
        <div className="mx-auto max-w-xl px-4 py-16 text-center animate-fade-in-up">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-6">
                <AlertTriangle size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Une erreur est survenue</h2>
            <p className="text-slate-500 font-medium mb-8">
                Nous n&apos;avons pas pu charger votre espace de travail. Veuillez réessayer.
            </p>
            <button
                onClick={() => reset()}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
            >
                <RotateCcw size={18} />
                Réessayer
            </button>
        </div>
    );
}
