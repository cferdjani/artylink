"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { useToast } from "@/components/ui/toast";
import { respondToDelegateInvitation } from "@/lib/actions/admin-delegates";
import { Loader2, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function AdminActivationClient() {
    const router = useRouter();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [code, setCode] = useState("");

    const handleDecline = () => {
        startTransition(async () => {
            try {
                const result = await respondToDelegateInvitation("decline");
                toast("Invitation refusée.", "success");
                router.push(result?.redirectPath ?? "/dashboard/account");
                router.refresh();
            } catch (e) {
                toast(e instanceof Error ? e.message : "Erreur", "error");
            }
        });
    };

    const handleAccept = () => {
        if (!code.trim()) {
            toast("Veuillez saisir le code.", "error");
            return;
        }
        startTransition(async () => {
            try {
                const result = await respondToDelegateInvitation("accept", code);
                toast("Statut admin activé !", "success");
                router.push(result?.redirectPath ?? "/admin");
                router.refresh();
            } catch (e) {
                toast(e instanceof Error ? e.message : "Code invalide", "error");
            }
        });
    };

    return (
        <GlassCard className="p-8 animate-fade-in-up">
            <ShieldAlert size={48} className="mb-6 text-cyan-500" />
            <h1 className="mb-2 text-2xl font-black text-slate-900">Devenir Administrateur Délégué</h1>
            <div className="space-y-6">
                <p className="font-medium text-slate-600">Le propriétaire de la plateforme vous a invité à rejoindre l&apos;équipe d&apos;administration. En acceptant, vous aurez accès aux fonctionnalités qui vous ont été accordées.</p>
                <ul className="space-y-1 pl-5 text-sm text-slate-500 list-disc">
                    <li>Vos actions seront journalisées pour la traçabilité.</li>
                    <li>Votre compte existant client ou artisan ne sera pas modifié.</li>
                    <li>Le propriétaire peut désactiver ou retirer cette délégation à tout moment.</li>
                </ul>
                <div className="rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4">
                    <label htmlFor="delegate-secret-code" className="mb-2 block text-sm font-bold text-cyan-900">
                        Code secret d&apos;activation
                    </label>
                    <input
                        id="delegate-secret-code"
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Ex: A1B2C3D4E5F6"
                        className="glass-input h-14 w-full text-center font-mono text-lg uppercase tracking-widest"
                        maxLength={20}
                    />
                    <p className="mt-2 text-xs font-medium text-cyan-700">
                        Saisissez ici le code que le propriétaire vous a transmis pour activer ce statut.
                    </p>
                </div>
                <div className="flex flex-wrap gap-4 pt-2">
                    <button onClick={handleDecline} disabled={isPending} className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50">
                        {isPending ? <Loader2 size={16} className="animate-spin" /> : "Refuser"}
                    </button>
                    <button onClick={handleAccept} disabled={isPending} className="flex items-center rounded-xl bg-cyan-600 px-4 py-2 font-bold text-white hover:bg-cyan-700">
                        {isPending ? <Loader2 size={16} className="mr-2 animate-spin" /> : null} Activer mon accès
                    </button>
                </div>
            </div>
        </GlassCard>
    );
}
