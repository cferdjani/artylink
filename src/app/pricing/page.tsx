import { ARTISAN_PLANS } from '@/lib/plans';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Check } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
    title: 'Tarifs & Abonnements Pro | ArtyLink',
    description: 'Découvrez nos offres pour les artisans. Boostez votre visibilité et recevez plus de chantiers.',
};

export default async function PricingPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <div className="bg-slate-50 py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-base font-semibold leading-7 text-secondary">Abonnements Artisans</h2>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                        Des offres adaptées à votre croissance
                    </p>
                </div>
                <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-0">
                    {/* Free Plan */}
                    <div className="rounded-3xl p-8 ring-1 ring-slate-200 bg-white">
                        <h3 className="text-lg font-semibold leading-8 text-slate-900">Gratuit</h3>
                        <p className="mt-4 text-sm leading-6 text-slate-600">Pour démarrer sur la plateforme.</p>
                        <p className="mt-6 flex items-baseline gap-x-1">
                            <span className="text-4xl font-bold tracking-tight text-slate-900">{ARTISAN_PLANS.basic.monthlyPriceDzd} DZD</span>
                            <span className="text-sm font-semibold leading-6 text-slate-600">/mois</span>
                        </p>
                        <Link
                            href={user ? "/dashboard/subscription?plan=free" : "/auth/register-type"}
                            className="mt-6 block rounded-xl outline-primary outline outline-1 px-3 py-2 text-center text-sm font-semibold leading-6 text-primary hover:bg-primary/5 hover:ring-primary focus-visible:outline focus-visible:outline-2"
                        >
                            {user ? "Plan Actuel" : "Inscription gratuite"}
                        </Link>
                        <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-slate-600">
                            <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-primary" /> Profil basique</li>
                            <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-primary" /> Réception de demandes clients</li>
                            <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-primary" /> Carte de visite publique</li>
                        </ul>
                    </div>

                    {/* Starter Plan */}
                    <div className="rounded-3xl p-8 ring-2 ring-primary bg-white shadow-xl">
                        <h3 className="text-lg font-semibold leading-8 text-primary">Starter</h3>
                        <p className="mt-4 text-sm leading-6 text-slate-600">Idéal pour développer votre activité.</p>
                        <p className="mt-6 flex items-baseline gap-x-1">
                            <span className="text-4xl font-bold tracking-tight text-slate-900">{ARTISAN_PLANS.starter.monthlyPriceDzd} DZD</span>
                            <span className="text-sm font-semibold leading-6 text-slate-600">/mois</span>
                        </p>
                        <Link
                            href={user ? "/dashboard/subscription?plan=starter" : "/auth/register-type"}
                            className="mt-6 block rounded-xl bg-primary px-3 py-2 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary/90"
                        >
                            Choisir Starter
                        </Link>
                        <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-slate-600">
                            <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-primary" /> Profil mis en avant</li>
                            <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-primary" /> Visibilité locale renforcée</li>
                            <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-primary" /> Mise en avant locale</li>
                            <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-primary" /> Support prioritaire</li>
                        </ul>
                    </div>

                    {/* Pro Plan */}
                    <div className="rounded-3xl p-8 ring-1 ring-slate-200 bg-white">
                        <h3 className="text-lg font-semibold leading-8 text-slate-900">Pro</h3>
                        <p className="mt-4 text-sm leading-6 text-slate-600">Le maximum de visibilité.</p>
                        <p className="mt-6 flex items-baseline gap-x-1">
                            <span className="text-4xl font-bold tracking-tight text-slate-900">{ARTISAN_PLANS.pro.monthlyPriceDzd} DZD</span>
                            <span className="text-sm font-semibold leading-6 text-slate-600">/mois</span>
                        </p>
                        <Link
                            href={user ? "/dashboard/subscription?plan=pro" : "/auth/register-type"}
                            className="mt-6 block rounded-xl outline-primary outline outline-1 px-3 py-2 text-center text-sm font-semibold leading-6 text-primary hover:bg-primary/5 hover:ring-primary"
                        >
                            Choisir Pro
                        </Link>
                        <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-slate-600">
                            <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-primary" /> Tout inclus dans Starter</li>
                            <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-primary" /> Tête de liste absolue</li>
                            <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-primary" /> Accès restreint au support direct</li>
                            <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-primary" /> Vitrine premium et carousel sponsorisé</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
