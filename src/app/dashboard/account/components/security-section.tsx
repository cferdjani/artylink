"use client";

import { createBrowserClient } from "@supabase/ssr";
import { KeyRound, Loader2, Lock, Shield } from "lucide-react";
import { useState } from "react";

export function SecuritySection() {
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (newPassword.length < 8) {
            setMessage({ type: "error", text: "Le mot de passe doit contenir au moins 8 caracteres." });
            return;
        }
        if (newPassword !== confirmPassword) {
            setMessage({ type: "error", text: "Les mots de passe ne correspondent pas." });
            return;
        }

        setIsSubmitting(true);
        try {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            const { error } = await supabase.auth.updateUser({ password: newPassword });

            if (error) {
                setMessage({ type: "error", text: error.message });
            } else {
                setMessage({ type: "success", text: "Mot de passe modifie avec succes." });
                setNewPassword("");
                setConfirmPassword("");
                setShowPasswordForm(false);
            }
        } catch {
            setMessage({ type: "error", text: "Erreur inattendue. Veuillez reessayer." });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/60 bg-white/40">
            <div className="p-4 border-b border-white/60 bg-white/50 font-bold text-slate-700 flex items-center gap-2">
                <Shield size={18} className="text-primary" />
                Securite
            </div>
            <div className="p-4 space-y-3">
                {/* Password Change */}
                <button
                    type="button"
                    onClick={() => {
                        setShowPasswordForm(!showPasswordForm);
                        setMessage(null);
                    }}
                    className="w-full text-left text-sm font-bold text-slate-600 hover:text-primary transition-colors flex items-center gap-2"
                >
                    <KeyRound size={14} /> Changer le mot de passe
                </button>

                {showPasswordForm && (
                    <form onSubmit={handlePasswordChange} className="space-y-3 pl-6 pt-2 animate-fade-in-up">
                        <input
                            type="password"
                            placeholder="Nouveau mot de passe"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            minLength={8}
                            required
                            className="w-full bg-white/50 border border-slate-200/60 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <input
                            type="password"
                            placeholder="Confirmer le mot de passe"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            minLength={8}
                            required
                            className="w-full bg-white/50 border border-slate-200/60 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="glass-btn-primary text-xs py-2 px-4 flex items-center gap-2"
                        >
                            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                            {isSubmitting ? "Modification..." : "Modifier"}
                        </button>
                    </form>
                )}

                {/* Message feedback */}
                {message && (
                    <div className={`pl-6 text-sm font-medium p-3 rounded-xl border ${message.type === "success"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}>
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
}
