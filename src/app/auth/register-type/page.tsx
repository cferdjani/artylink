"use client";
import { GlassCard } from "@/components/ui/glass-card";
import { sanitizeRedirectPath } from "@/lib/auth/redirect";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

import { Suspense } from "react";

function RegisterTypeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectedFrom = sanitizeRedirectPath(searchParams.get("redirectedFrom"));

    const registerHref = (type: "client" | "artisan") => {
        const params = new URLSearchParams({
            type,
            redirectedFrom,
        });
        return `/auth/register?${params.toString()}`;
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 text-center">Choisissez votre type de compte</h1>
            <div className="flex flex-col md:flex-row gap-6 w-full max-w-lg">
                <GlassCard className="flex-1 p-6 flex flex-col items-center cursor-pointer hover:scale-105 transition" onClick={() => router.push(registerHref("client"))}>
                    <span className="text-xl font-semibold mb-2">Client</span>
                    <span className="text-slate-500 text-center">Je cherche un artisan ou un service</span>
                </GlassCard>
                <GlassCard className="flex-1 p-6 flex flex-col items-center cursor-pointer hover:scale-105 transition" onClick={() => router.push(registerHref("artisan"))}>
                    <span className="text-xl font-semibold mb-2">Artisan</span>
                    <span className="text-slate-500 text-center">Je propose mes services</span>
                </GlassCard>
            </div>
        </div>
    );
}

export default function RegisterType() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-slate-500 font-medium">Chargement...</div>}>
            <RegisterTypeContent />
        </Suspense>
    );
}
