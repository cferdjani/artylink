"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { useToast } from "@/components/ui/toast";
import { processPayment } from "@/lib/actions/payments-admin";
import { Check, ExternalLink, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useState, useTransition } from "react";

type PaymentProof = {
    proof_url: string;
    payment_method: string;
    transaction_reference?: string | null;
};

type PaymentOrderRow = {
    id: string;
    amount_dzd: number;
    created_at: string;
    metadata?: { kind?: string; plan_type?: string } | null;
    profiles?: { full_name?: string | null; phone?: string | null } | null;
    payment_proofs?: PaymentProof[];
};

export function AdminPaymentRow({ order }: { order: PaymentOrderRow }) {
    const [isPending, startTransition] = useTransition();
    const [notes, setNotes] = useState("");
    const { toast } = useToast();
    const isSubscriptionOrder = order.metadata?.kind === "subscription_upgrade";
    const confirmLabel = isSubscriptionOrder ? "Approuver & Activer" : "Approuver & Créditer";

    const handleProcess = (action: 'approve' | 'reject') => {
        if (action === 'reject' && !notes) {
            toast("Veuillez fournir une raison pour le rejet.", "error");
            return;
        }
        if (confirm(`Voulez-vous vraiment ${action === 'approve' ? 'approuver' : 'rejeter'} ce paiement de ${order.amount_dzd} DZD ?`)) {
            startTransition(async () => {
                try {
                    await processPayment(order.id, action, notes);
                    toast("Paiement traité avec succès.", "success");
                } catch (error: unknown) {
                    toast(error instanceof Error ? error.message : "Erreur inattendue", "error");
                }
            });
        }
    };

    const proof = order.payment_proofs?.[0];

    return (
        <GlassCard className="p-6 flex flex-col md:flex-row gap-6 items-start">
            <div className="shrink-0 w-full md:w-48 h-48 bg-slate-100 rounded-xl overflow-hidden relative border border-slate-200">
                {proof?.proof_url ? (
                    proof.proof_url.endsWith('.pdf') ? (
                        <div className="flex items-center justify-center h-full">
                            <a href={proof.proof_url} target="_blank" rel="noopener noreferrer" className="text-primary font-bold flex items-center gap-2">
                                Voir PDF <ExternalLink size={16} />
                            </a>
                        </div>
                    ) : (
                        <a href={proof.proof_url} target="_blank" rel="noopener noreferrer">
                            <Image src={proof.proof_url} alt="Reçu" fill className="object-cover hover:scale-105 transition-transform" />
                        </a>
                    )
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">Aucun fichier</div>
                )}
            </div>

            <div className="flex-1 space-y-4 w-full">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">{order.profiles?.full_name || 'Utilisateur inconnu'}</h3>
                        <p className="text-sm text-slate-500 font-medium">Tél: {order.profiles?.phone || 'N/A'}</p>
                        {isSubscriptionOrder && order.metadata?.plan_type && (
                            <p className="text-sm text-primary font-semibold mt-1">
                                Abonnement demandé: {order.metadata.plan_type}
                            </p>
                        )}
                        <p className="text-sm text-slate-500 font-medium mt-1">
                            Méthode : <span className="uppercase font-bold text-slate-700">{proof?.payment_method}</span>
                            {proof?.transaction_reference && ` • Réf: ${proof.transaction_reference}`}
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-black text-emerald-600">{order.amount_dzd} DZD</span>
                        <p className="text-xs text-slate-400 font-medium">{new Date(order.created_at).toLocaleString('fr-FR')}</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600">Note interne (optionnel pour validation, requis pour rejet)</label>
                    <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Raison du rejet ou note..." className="glass-input w-full" />
                </div>

                <div className="flex gap-3 pt-2">
                    <button onClick={() => handleProcess('approve')} disabled={isPending} className="flex-1 glass-btn-primary bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20 flex items-center justify-center gap-2">
                        {isPending ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />} {confirmLabel}
                    </button>
                    <button onClick={() => handleProcess('reject')} disabled={isPending} className="flex-1 glass-btn-secondary bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100 flex items-center justify-center gap-2 shadow-none">
                        {isPending ? <Loader2 size={18} className="animate-spin" /> : <X size={18} />} Rejeter
                    </button>
                </div>
            </div>
        </GlassCard>
    );
}
