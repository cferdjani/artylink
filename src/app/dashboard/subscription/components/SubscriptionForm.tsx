"use client";

import { useToast } from "@/components/ui/toast";
import { changeSubscriptionPlan } from "@/lib/actions/subscription";
import { ARTISAN_PLANS, type SubscriptionPlanType } from "@/lib/plans";
import { ArrowRight, CheckCircle2, Loader2, Shield, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SubscriptionFormProps {
    currentPlanType: SubscriptionPlanType;
    intendedPlan?: SubscriptionPlanType;
}

export function SubscriptionForm({ currentPlanType, intendedPlan }: SubscriptionFormProps) {
    const defaultSelection = intendedPlan && intendedPlan !== currentPlanType ? intendedPlan : currentPlanType;
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanType>(defaultSelection);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);
    const router = useRouter();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedPlan === currentPlanType) {
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await changeSubscriptionPlan(selectedPlan);

            if (selectedPlan === "free") {
                router.refresh();
                return;
            }

            if (result?.visibilityRequest) {
                const plan = ARTISAN_PLANS[selectedPlan];
                setNotice(
                    `Votre demande ${plan.label} est prête. ArtyLink ne stocke pas vos transactions: contactez l'équipe pour le paiement externe et l'activation de votre visibilité.`
                );
                return;
            }

            router.refresh();
        } catch (error) {
            console.error("Erreur lors du changement:", error);
            toast("Une erreur est survenue.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in-up delay-1">
            <h2 className="flex items-center gap-2 text-2xl font-black text-slate-900 border-b border-slate-200/50 pb-4">
                <Sparkles className="text-primary" size={24} /> Changer de forfait
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
                {/* Plan: Free */}
                <label
                    className={`relative cursor-pointer rounded-3xl p-6 transition-all duration-300 focus:outline-none overflow-hidden ${selectedPlan === 'free'
                            ? "bg-gradient-to-br from-slate-100 to-white shadow-md ring-2 ring-slate-300 transform scale-[1.02]"
                            : "bg-white/40 border border-white/60 hover:bg-white/60 hover:shadow-sm"
                        }`}
                >
                    <input
                        type="radio"
                        name="plan_type"
                        value="free"
                        className="sr-only"
                        onChange={() => setSelectedPlan('free')}
                        checked={selectedPlan === 'free'}
                    />
                    <div className="flex flex-col h-full z-10 relative">
                        <div className="flex items-center justify-between mb-4">
                            <span className="flex items-center gap-2 font-bold text-slate-600 text-lg">
                                <Shield size={20} /> Basique
                            </span>
                            {selectedPlan === 'free' && <CheckCircle2 className="h-6 w-6 text-slate-600 animate-in zoom-in" />}
                        </div>
                        <div className="mt-2 text-slate-800">
                            <span className="text-3xl font-black">0</span>
                            <span className="text-sm font-semibold ml-1">DZD / mois</span>
                        </div>
                        <ul className="mt-6 flex-1 space-y-3 text-sm font-medium text-slate-600">
                            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Carte de visite publique</li>
                            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Contact par email ou téléphone</li>
                        </ul>
                    </div>
                </label>

                {/* Plan: Starter */}
                <label
                    className={`relative cursor-pointer rounded-3xl p-6 transition-all duration-300 focus:outline-none overflow-hidden ${selectedPlan === 'starter'
                            ? "bg-gradient-to-br from-primary/10 to-primary/5 shadow-[0_8px_30px_rgb(249,115,22,0.12)] ring-2 ring-primary transform scale-[1.05] z-10"
                            : "bg-white/40 border border-white/60 hover:bg-white/60 hover:shadow-sm"
                        }`}
                >
                    {selectedPlan === 'starter' && (
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
                    )}
                    <input
                        type="radio"
                        name="plan_type"
                        value="starter"
                        className="sr-only"
                        onChange={() => setSelectedPlan('starter')}
                        checked={selectedPlan === 'starter'}
                    />
                    <div className="flex flex-col h-full z-10 relative">
                        <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl rounded-tr-lg">Populaire</div>
                        <div className="flex items-center justify-between mb-4 mt-2">
                            <span className="flex items-center gap-2 font-black text-primary text-xl">
                                <Zap size={22} /> Starter
                            </span>
                        </div>
                        <div className="mt-2 text-slate-900">
                            <span className="text-4xl font-black">2000</span>
                            <span className="text-sm font-bold ml-1 text-slate-500">DZD / mois</span>
                        </div>
                        <ul className="mt-6 flex-1 space-y-3 text-sm font-semibold text-slate-700">
                            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" /> Visibilité locale renforcée</li>
                            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" /> Mise en avant dans la recherche</li>
                            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" /> Portfolio plus complet</li>
                        </ul>
                    </div>
                </label>

                {/* Plan: Pro */}
                <label
                    className={`relative cursor-pointer rounded-3xl p-6 transition-all duration-300 focus:outline-none overflow-hidden ${selectedPlan === 'pro'
                            ? "bg-gradient-to-br from-slate-900 to-slate-800 shadow-xl ring-2 ring-slate-900 transform scale-[1.02] text-white"
                            : "bg-white/40 border border-white/60 hover:bg-white/60 hover:shadow-sm"
                        }`}
                >
                    {selectedPlan === 'pro' && (
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-20 pointer-events-none mix-blend-overlay"></div>
                    )}
                    <input
                        type="radio"
                        name="plan_type"
                        value="pro"
                        className="sr-only"
                        onChange={() => setSelectedPlan('pro')}
                        checked={selectedPlan === 'pro'}
                    />
                    <div className="flex flex-col h-full z-10 relative">
                        <div className="flex items-center justify-between mb-4">
                            <span className={`flex items-center gap-2 font-black text-xl ${selectedPlan === 'pro' ? 'text-white' : 'text-slate-900'}`}>
                                <ShieldCheck size={22} className={selectedPlan === 'pro' ? 'text-blue-400' : 'text-slate-900'} /> PRO
                            </span>
                            {selectedPlan === 'pro' && <CheckCircle2 className="h-6 w-6 text-white animate-in zoom-in" />}
                        </div>
                        <div className={`mt-2 ${selectedPlan === 'pro' ? 'text-white' : 'text-slate-900'}`}>
                            <span className="text-3xl font-black">5000</span>
                            <span className={`text-sm font-semibold ml-1 ${selectedPlan === 'pro' ? 'text-slate-300' : 'text-slate-500'}`}>DZD / mois</span>
                        </div>
                        <ul className={`mt-6 flex-1 space-y-3 text-sm font-medium ${selectedPlan === 'pro' ? 'text-slate-200' : 'text-slate-600'}`}>
                            <li className="flex items-center gap-2"><CheckCircle2 size={16} className={selectedPlan === 'pro' ? 'text-blue-400' : 'text-slate-400'} /> Tête de liste en recherche</li>
                            <li className="flex items-center gap-2"><CheckCircle2 size={16} className={selectedPlan === 'pro' ? 'text-blue-400' : 'text-slate-400'} /> Vitrine premium 100%</li>
                            <li className="flex items-center gap-2"><CheckCircle2 size={16} className={selectedPlan === 'pro' ? 'text-blue-400' : 'text-slate-400'} /> Priorité sponsorisée</li>
                        </ul>
                    </div>
                </label>
            </div>

            {notice && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm font-semibold leading-relaxed text-amber-900">
                    {notice}
                </div>
            )}

            <div className="flex items-center justify-end mt-8">
                <button
                    type="submit"
                    disabled={isSubmitting || selectedPlan === currentPlanType}
                    className="glass-btn-primary flex justify-center items-center gap-2 px-8 py-3 text-base shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" /> Enregistrement...
                        </>
                    ) : selectedPlan === currentPlanType ? (
                        'Plan Actuel'
                    ) : selectedPlan === 'free' ? (
                        'Appliquer le changement'
                    ) : (
                        <>
                            Demander l&apos;activation <ArrowRight className="h-5 w-5" />
                        </>
                    )}
                </button>
            </div>

            {selectedPlan !== 'free' && selectedPlan !== currentPlanType && (
                <p className="mt-4 text-center text-sm font-medium text-slate-500 bg-amber-50 p-3 rounded-xl border border-amber-100">
                    Paiement externe requis. ArtyLink ne conserve pas vos transactions ni vos reçus dans la base.
                </p>
            )}
        </form>
    );
}
