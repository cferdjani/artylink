"use client";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import Link from "next/link";

interface GlassGateOverlayProps {
    artisanId: string;
    artisanName: string;
    isAuthenticated: boolean;
}

export default function GlassGateOverlay({ artisanId, artisanName, isAuthenticated }: GlassGateOverlayProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
            <div className={cn("glass-card max-w-md w-full p-8 text-center flex flex-col items-center gap-6 shadow-2xl border-2 border-orange-200")}>
                <div className="bg-orange-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-2 text-orange-600">
                    <Lock size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Accès réservé aux abonnés PRO</h3>
                <p className="text-gray-700 text-base">
                    Connectez-vous ou abonnez-vous pour accéder aux coordonnées et détails de {artisanName}.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                    {!isAuthenticated ? (
                        <Link
                            href={`/auth/login?redirectedFrom=/artisan/${artisanId}`}
                            className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-6 rounded-lg transition-colors w-full sm:w-auto"
                        >
                            Se connecter
                        </Link>
                    ) : null}
                    <Link
                        href="/pricing"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors w-full sm:w-auto"
                    >
                        Voir les abonnements PRO
                    </Link>
                </div>
            </div>
        </div>
    );
}