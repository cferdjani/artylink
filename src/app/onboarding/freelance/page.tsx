import { GlassCard } from "@/components/ui/glass-card";
import { BadgeCheck, BriefcaseBusiness, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Onboarding Freelance",
    description:
        "Rejoignez ArtyLink en tant que freelance et activez votre profil local en quelques etapes.",
};

const steps = [
    {
        title: "Creez votre compte",
        description: "Inscription securisee avec verification email/OTP.",
        icon: BadgeCheck,
    },
    {
        title: "Renseignez vos services",
        description: "Choisissez categorie, sous-categorie et specialites.",
        icon: BriefcaseBusiness,
    },
    {
        title: "Activez votre zone locale",
        description: "Selectionnez votre wilaya et votre commune pour apparaitre en recherche.",
        icon: MapPin,
    },
];

export default function FreelanceOnboardingPage() {
    return (
        <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-8 md:px-8">
            <GlassCard className="relative overflow-hidden p-6 md:p-10">
                <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-secondary/20 blur-3xl" />
                <div className="pointer-events-none absolute -left-16 bottom-0 h-52 w-52 rounded-full bg-primary/20 blur-3xl" />

                <div className="relative">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
                        <Sparkles size={14} />
                        Parcours conversion freelance
                    </div>

                    <h1 className="mt-4 text-balance text-3xl font-black tracking-tight text-slate-900 md:text-5xl">
                        Devenez Freelance sur ArtyLink
                    </h1>
                    <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600 md:text-lg">
                        Lancez votre vitrine locale en quelques minutes. Cette page est la porte
                        d entree officielle du bouton Devenir Freelance.
                    </p>

                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                        {steps.map((step) => {
                            const Icon = step.icon;

                            return (
                                <div
                                    key={step.title}
                                    className="rounded-2xl border border-white/70 bg-white/75 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.08)] backdrop-blur-md"
                                >
                                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <Icon size={18} />
                                    </span>
                                    <h2 className="mt-3 text-lg font-extrabold text-slate-900">
                                        {step.title}
                                    </h2>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                        {step.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-8 flex flex-wrap items-center gap-3">
                        <Link
                            href="/auth/register-type?type=artisan"
                            className="inline-flex items-center justify-center rounded-xl bg-secondary px-5 py-3 text-sm font-extrabold text-white shadow-[0_10px_18px_rgba(249,115,22,0.35)] transition hover:brightness-95"
                        >
                            Commencer l inscription
                        </Link>
                        <Link
                            href="/auth/login"
                            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-primary/30 hover:text-primary"
                        >
                            J ai deja un compte
                        </Link>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}
