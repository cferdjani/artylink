"use client";

import { useToast } from "@/components/ui/toast";
import { createBrowserClient } from "@supabase/ssr";
import { KeyRound, Loader2, Lock, Shield } from "lucide-react";
import { useState } from "react";
import { GlassPanel, SectionHeader } from "../AccountTabsClient";

export function AccountSecurityTab({ userEmail }: { userEmail: string | null }) {
    const [showForm, setShowForm] = useState(false);
    const [newPwd, setNewPwd] = useState("");
    const [confirmPwd, setConfirmPwd] = useState("");
    const [isPending, setIsPending] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPwd.length < 8) return toast("Minimum 8 caractères requis.", "error");
        if (newPwd !== confirmPwd) return toast("Les mots de passe ne correspondent pas.", "error");

        setIsPending(true);
        try {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );
            const { error } = await supabase.auth.updateUser({ password: newPwd });
            if (error) throw error;

            toast("Mot de passe modifié avec succès.", "success");
            setNewPwd(""); setConfirmPwd(""); setShowForm(false);
        } catch (error: any) {
            toast(error.message || "Erreur inattendue.", "error");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <GlassPanel>
            <SectionHeader icon={Shield} title="Sécurité du compte" />
            {userEmail && (
                <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email du compte</p>
                    <p className="text-sm font-bold text-slate-700">{userEmail}</p>
                </div>
            )}
            <button type="button" onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-primary transition-colors">
                <KeyRound size={16} /> {showForm ? "Annuler" : "Changer le mot de passe"}
            </button>

            {showForm && (
                <form onSubmit={handleSubmit} className="mt-5 space-y-4 animate-fade-in-up">
                    <div><label className="mb-1.5 block text-sm font-bold text-slate-700">Nouveau mot de passe</label><input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} minLength={8} required className="glass-input" /></div>
                    <div><label className="mb-1.5 block text-sm font-bold text-slate-700">Confirmer le mot de passe</label><input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} minLength={8} required className="glass-input" /></div>
                    <button type="submit" disabled={isPending} className="glass-btn-primary flex items-center gap-2">
                        {isPending ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                        {isPending ? "Modification..." : "Confirmer le changement"}
                    </button>
                </form>
            )}
        </GlassPanel>
    );
}