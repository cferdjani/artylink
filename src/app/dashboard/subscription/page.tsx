import { getUserSubscription } from "@/lib/actions/subscription";
import { isSubscriptionPlanType, type SubscriptionPlanType } from "@/lib/plans";
import { SubscriptionForm } from "./components/SubscriptionForm";
import Link from "next/link";
import { ArrowLeft, Sparkles, CheckCircle2 } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

export const metadata = {
    title: "Gérer mon abonnement | ArtyLink"
};

export const dynamic = 'force-dynamic';

export default async function SubscriptionPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
    const { plan } = await searchParams;
    const currentPlan = await getUserSubscription();
    
    // Si l'utilisateur clique sur "Choisir Pro" depuis la page /pricing,
    // On peut pré-sélectionner le plan dans l'UI ou afficher un rappel
    const intendedPlan = plan && isSubscriptionPlanType(plan) ? plan : undefined;

    return (
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
            <Link 
                href="/dashboard" 
                className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Retour au tableau de bord
            </Link>

            <div className="mb-10">
                <h1 className="text-4xl font-black tracking-tight text-slate-900 group flex items-center gap-3">
                    Abonnement & Visibilité <Sparkles className="text-secondary opacity-0 group-hover:opacity-100 transition-opacity" size={28} />
                </h1>
                <p className="mt-3 text-base text-slate-600 max-w-2xl font-medium leading-relaxed">
                    Gérez ici votre offre de visibilité sur ArtyLink. Plus votre abonnement est élevé, plus vous êtes visible des clients de votre Wilaya.
                </p>
            </div>

            <GlassCard className="p-8 mb-10 border-white/60 relative overflow-hidden group">
                <div className="absolute -right-20 -top-20 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-colors"></div>
                
                <div className="mb-4 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Votre Plan Actuel</h2>
                        {currentPlan.valid_until && (
                            <p className="text-sm font-medium text-slate-500">
                                Valide jusqu&apos;au : <span className="font-bold text-slate-700">{new Date(currentPlan.valid_until).toLocaleDateString('fr-DZ')}</span>
                            </p>
                        )}
                    </div>
                    
                    <div>
                        {currentPlan.plan_type === 'free' && (
                            <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-2.5 font-bold text-slate-700 shadow-sm border border-slate-200 uppercase tracking-wider text-sm">
                                Basique
                            </div>
                        )}
                        {currentPlan.plan_type === 'starter' && (
                            <div className="inline-flex items-center gap-2 rounded-xl bg-orange-50 px-5 py-2.5 font-black text-primary shadow-sm border border-orange-200 uppercase tracking-wider text-sm">
                                <CheckCircle2 size={18} /> Starter
                            </div>
                        )}
                        {currentPlan.plan_type === 'pro' && (
                            <div className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 font-black text-white shadow-md border border-slate-700 uppercase tracking-wider text-sm">
                                <Sparkles size={18} className="text-blue-400" /> PRO Premium
                            </div>
                        )}
                    </div>
                </div>
            </GlassCard>

            <GlassCard className="p-8 md:p-10 border-white/60">
                <SubscriptionForm 
                    currentPlanType={currentPlan.plan_type as SubscriptionPlanType} 
                    intendedPlan={intendedPlan as SubscriptionPlanType | undefined} 
                />
            </GlassCard>

            {(plan && isSubscriptionPlanType(plan)) && plan !== "free" && (
                <GlassCard className="mt-6 p-5 border-amber-100 bg-amber-50/60">
                    <p className="text-sm font-medium text-amber-900">
                        Votre choix est prepare. L'activation payante se fait hors plateforme, puis l'admin met a jour votre niveau de visibilite.
                    </p>
                </GlassCard>
            )}

        </div>
    );
}
