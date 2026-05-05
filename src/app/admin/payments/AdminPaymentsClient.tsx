"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { useToast } from "@/components/ui/toast";
import { processPayment } from "@/lib/actions/payments-admin";
import { ArrowUpRight, Check, Clock, FileText, History as HistoryIcon, Landmark, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useState, useTransition } from "react";

export default function AdminPaymentsClient({ pending, history }: { pending: any[]; history: any[] }) {
    const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
    const [isPending, startTransition] = useTransition();

    const [processingId, setProcessingId] = useState<string | null>(null);
    const { toast } = useToast();

    const handleAction = (orderId: string, approved: boolean) => {
        if (!confirm(`Êtes-vous sûr de vouloir ${approved ? "APPROUVER" : "REFUSER"} ce paiement ?`)) return;

        setProcessingId(orderId);
        let note = "";
        if (!approved) {
            note = window.prompt("Raison du refus (optionnel) :") || "";
        }

        startTransition(async () => {
            try {
                await processPayment(orderId, approved ? 'approve' : 'reject', note);
            } catch (error) {
                toast("Erreur lors de l'opération.", "error");
                console.error(error);
            } finally {
                setProcessingId(null);
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <Landmark className="text-primary" /> Modération Financière
                </h1>

                <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner">
                    <button
                        onClick={() => setActiveTab("pending")}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === "pending" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                    >
                        <Clock size={16} /> En attente <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full ml-1">{pending.length}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("history")}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === "history" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                    >
                        <HistoryIcon size={16} /> Historique
                    </button>
                </div>
            </div>

            {activeTab === "pending" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                    {pending.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-slate-500 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            Aucune recharge en attente de validation. Bravo !
                        </div>
                    ) : pending.map((order) => (
                        <GlassCard key={order.id} className="p-0 overflow-hidden flex flex-col group hover:border-primary/30 transition-colors">
                            <div className="bg-slate-50 p-4 border-b border-white border-opacity-60">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-amber-200">En Revue</span>
                                    <span className="text-xs font-bold text-slate-400">{new Date(order.created_at).toLocaleDateString()}</span>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900">{order.amount_dzd} <span className="text-sm text-slate-500 font-bold">DZD</span></h3>
                                <p className="text-sm font-medium text-slate-600 truncate mt-1">Utilisateur: {order.profiles?.full_name}</p>
                                <p className="text-xs text-slate-400 truncate mt-0.5">{order.profiles?.email}</p>
                            </div>

                            <div className="p-4 flex-1 flex flex-col">
                                {order.payment_proofs?.[0] && (
                                    <div className="mb-4 space-y-3">
                                        <div className="flex justify-between text-xs font-bold bg-slate-50 p-2 rounded-lg text-slate-600">
                                            <span>Méthode</span>
                                            <span className="uppercase text-slate-900">{order.payment_proofs[0].payment_method}</span>
                                        </div>
                                        {order.payment_proofs[0].transaction_reference && (
                                            <div className="flex justify-between text-xs font-bold bg-slate-50 p-2 rounded-lg text-slate-600">
                                                <span>Réf.</span>
                                                <span className="text-slate-900 font-mono">{order.payment_proofs[0].transaction_reference}</span>
                                            </div>
                                        )}

                                        <a href={order.payment_proofs[0].proof_url} target="_blank" rel="noopener noreferrer" className="block relative h-32 w-full rounded-xl overflow-hidden border border-slate-200 group/img">
                                            {order.payment_proofs[0].proof_url.match(/\.(pdf)$/i) ? (
                                                <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-500 group-hover/img:bg-slate-200 transition-colors">
                                                    <FileText size={32} className="mb-2" />
                                                    <span className="text-xs font-bold">Voir PDF</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <Image src={order.payment_proofs[0].proof_url} alt="Preuve" fill className="object-cover group-hover/img:scale-105 transition-transform" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                        <ArrowUpRight className="text-white drop-shadow-md" size={32} />
                                                    </div>
                                                </>
                                            )}
                                        </a>
                                    </div>
                                )}

                                <div className="mt-auto flex items-center gap-2 pt-2 border-t border-slate-100">
                                    <button
                                        onClick={() => handleAction(order.id, true)}
                                        disabled={isPending && processingId === order.id}
                                        className="flex-1 bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white border border-emerald-200 py-2.5 rounded-xl font-bold flex justify-center items-center gap-2 transition-all disabled:opacity-50"
                                    >
                                        {isPending && processingId === order.id ? <Loader2 size={18} className="animate-spin" /> : <><Check size={18} /> Valider</>}
                                    </button>
                                    <button
                                        onClick={() => handleAction(order.id, false)}
                                        disabled={isPending && processingId === order.id}
                                        className="flex-1 bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-200 py-2.5 rounded-xl font-bold flex justify-center items-center gap-2 transition-all disabled:opacity-50"
                                    >
                                        {isPending && processingId === order.id ? <Loader2 size={18} className="animate-spin" /> : <><X size={18} /> Refuser</>}
                                    </button>
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}

            {activeTab === "history" && (
                <div className="animate-fade-in-up">
                    <GlassCard className="p-0 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4">Utilisateur</th>
                                        <th className="px-6 py-4">Montant</th>
                                        <th className="px-6 py-4">Statut</th>
                                        <th className="px-6 py-4">Détails (Réf / Admin Note)</th>
                                        <th className="px-6 py-4">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {history.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center font-medium">Aucun historique disponible.</td>
                                        </tr>
                                    ) : history.map((order) => (
                                        <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-slate-900 block">{order.profiles?.full_name}</span>
                                                <span className="text-xs text-slate-400">{order.profiles?.email}</span>
                                            </td>
                                            <td className="px-6 py-4 font-black text-slate-900">{order.amount_dzd} DZD</td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${order.status === "completed" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-rose-50 text-rose-600 border-rose-200"
                                                    }`}>
                                                    {order.status === "completed" ? "Approuvé" : "Refusé"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 max-w-[200px]">
                                                {order.payment_proofs?.[0] && (
                                                    <div className="text-xs">
                                                        <span className="block font-medium"><span className="uppercase font-bold text-slate-800">{order.payment_proofs[0].payment_method}</span> {order.payment_proofs[0].transaction_reference ? `- Réf: ${order.payment_proofs[0].transaction_reference}` : ''}</span>
                                                        {order.payment_proofs[0].admin_notes && (
                                                            <span className="block mt-1 text-rose-500 italic">"{order.payment_proofs[0].admin_notes}"</span>
                                                        )}
                                                        <a href={order.payment_proofs[0].proof_url} target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline mt-1 inline-block">Voir Preuve</a>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-semibold whitespace-nowrap">
                                                {new Date(order.created_at).toLocaleString('fr-FR')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
}
