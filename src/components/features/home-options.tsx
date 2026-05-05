"use client";
import { GlassCard } from "@/components/ui/glass-card";
import { setGuestMode } from "@/lib/guest-mode";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function HomeOptions() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Vérifie si un user est connecté côté client via Supabase SDK (plus fiable après redirect)
        let mounted = true;
        (async () => {
            try {
                const supabase = createSupabaseBrowserClient();
                const { data } = await supabase.auth.getUser();
                if (!mounted) return;
                if (data?.user) {
                    setIsAuthenticated(true);
                    return;
                }
            } catch (e) {
                // fallback to localStorage check
            }

            if (typeof window !== "undefined") {
                const supa = Object.keys(localStorage).find(k => k.startsWith("sb-") && k.endsWith("-auth-token"));
                setIsAuthenticated(!!supa);
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    const handleGuest = useCallback(async () => {
        try {
            await setGuestMode();
        } catch (e) {
            // ignore
        }
        router.push("/search");
    }, [router]);

    if (isAuthenticated) return null;

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-4 text-center drop-shadow">Bienvenue sur ArtyLink</h1>
            <div className="flex flex-col md:flex-row gap-6 w-full max-w-xl">
                <GlassCard className="flex-1 p-6 flex flex-col items-center cursor-pointer hover:scale-105 transition" onClick={() => router.push("/auth/register-type")}>
                    <span className="text-xl font-semibold mb-2">S’inscrire</span>
                    <span className="text-slate-500 text-center">Créer un compte client ou artisan</span>
                </GlassCard>
                <GlassCard className="flex-1 p-6 flex flex-col items-center cursor-pointer hover:scale-105 transition" onClick={() => router.push("/auth/login")}>
                    <span className="text-xl font-semibold mb-2">Se connecter</span>
                    <span className="text-slate-500 text-center">Accéder à votre espace</span>
                </GlassCard>
                <GlassCard className="flex-1 p-6 flex flex-col items-center cursor-pointer hover:scale-105 transition" onClick={handleGuest}>
                    <span className="text-xl font-semibold mb-2">Accès invité</span>
                    <span className="text-slate-500 text-center">Explorer sans compte (accès limité)</span>
                </GlassCard>
            </div>

        </div>
    );
}
