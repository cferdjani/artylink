"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { useEffect } from "react";

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Admin error:", error);
    }, [error]);

    return (
        <div className="mx-auto max-w-xl px-4 py-16 text-center animate-fade-in-up">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 mb-6 border border-rose-500/30">
                <AlertTriangle size={32} />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Erreur Admin</h2>
            <p className="text-slate-400 font-medium mb-8">
                {error.message || "Un problème technique est survenu dans le panneau d'administration."}
            </p>
            <button
                onClick={() => reset()}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-white/20 border border-white/20"
            >
                <RotateCcw size={18} />
                Tenter une reconnexion
            </button>
        </div>
    );
}
