"use client";

import { useToast } from "@/components/ui/toast";
import { applyPromoCode } from "@/lib/actions/promo";
import {
    Copy,
    Gift,
    Globe,
    Loader2,
    Shield,
    Tag,
    User,
    Users
} from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { AccountProfileTab } from "./components/account-profile-tab";
import { AccountSecurityTab } from "./components/account-security-tab";
import type { AccountArtisanRecord, AccountProfileRecord } from "./types";

// ─── Sub-components ────────────────────────────────────────────────────────────

export function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
    return (
        <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-200/70">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Icon size={18} />
            </div>
            <h2 className="text-base font-black text-slate-900">{title}</h2>
        </div>
    );
}

export function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl p-6 shadow-sm ${className}`}>
            {children}
        </div>
    );
}

// ─── Language tab ─────────────────────────────────────────────────────────────

const LANGUAGES = [
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "ar", label: "العربية", flag: "🇩🇿" },
    { code: "en", label: "English", flag: "🇬🇧" },
];

function LanguageTab() {
    const [selected, setSelected] = useState("fr");
    const { toast } = useToast();

    return (
        <GlassPanel>
            <SectionHeader icon={Globe} title="Langue de l'interface" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {LANGUAGES.map(lang => (
                    <button
                        key={lang.code}
                        onClick={() => setSelected(lang.code)}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${selected === lang.code
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-slate-200 bg-white/50 hover:border-slate-300"
                            }`}
                    >
                        <span className="text-2xl">{lang.flag}</span>
                        <span className={`text-sm font-black ${selected === lang.code ? "text-primary" : "text-slate-700"}`}>
                            {lang.label}
                        </span>
                    </button>
                ))}
            </div>
            <div className="mt-6 flex justify-end">
                <button
                    onClick={() => toast("Langue enregistrée. (Déploiement i18n à venir)", "success")}
                    className="glass-btn-primary"
                >
                    Sauvegarder la langue
                </button>
            </div>
        </GlassPanel>
    );
}

// ─── Promo tab ────────────────────────────────────────────────────────────────

const initialPromoActionState = {
    message: "",
    status: "idle" as const,
    submittedAt: null,
};

function PromoTab({ walletBalance }: { walletBalance: number }) {
    const formRef = useRef<HTMLFormElement>(null);
    const [state, formAction, isPending] = useActionState(applyPromoCode, initialPromoActionState);
    const { toast } = useToast();

    useEffect(() => {
        if (!state.message || state.status === "idle") {
            return;
        }

        toast(state.message, state.status === "success" ? "success" : "error");

        if (state.status === "success") {
            formRef.current?.reset();
        }
    }, [state, toast]);

    return (
        <GlassPanel>
            <SectionHeader icon={Tag} title="Codes promotionnels" />
            <div className="mb-6 rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 to-white/80 p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700/80">Crédits disponibles</p>
                <p className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                    {walletBalance.toLocaleString("fr-FR")} <span className="text-base text-slate-500">DZD</span>
                </p>
                <p className="mt-2 text-sm font-medium text-slate-600">
                    Votre solde est mis à jour après chaque recharge, validation admin ou application de code promo.
                </p>
            </div>
            <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">
                Entrez un code promo reçu par email ou partagé par un parrain pour bénéficier d&apos;une réduction sur votre abonnement.
            </p>
            <form ref={formRef} action={formAction} className="flex flex-col gap-3 sm:flex-row">
                <input
                    name="promoCode"
                    type="text"
                    placeholder="Ex: ARTYLINK2026"
                    autoComplete="off"
                    required
                    className="glass-input flex-1 font-mono tracking-widest uppercase"
                />
                <button type="submit" disabled={isPending} className="glass-btn-primary shrink-0 flex items-center gap-2">
                    {isPending ? <Loader2 size={16} className="animate-spin" /> : null}
                    Appliquer
                </button>
            </form>
            {state.message && state.status !== "idle" && (
                <div className={`mt-4 p-4 rounded-xl border text-sm font-medium ${state.status === "success"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}>
                    {state.message}
                </div>
            )}
        </GlassPanel>
    );
}

// ─── Referral tab ─────────────────────────────────────────────────────────────

function ReferralTab({ stats }: { stats: { code: string; referredCount: number; earnedAmount: number } | null }) {
    const { toast } = useToast();
    const link = stats ? `https://artylink.com/auth/register?ref=${stats.code}` : "";

    const copyLink = () => {
        navigator.clipboard.writeText(link);
        toast("Lien copié dans le presse-papiers !", "success");
    };

    if (!stats) {
        return (
            <GlassPanel>
                <SectionHeader icon={Gift} title="Inviter des amis" />
                <p className="text-sm text-slate-500 font-medium">Impossible de charger les stats de parrainage.</p>
            </GlassPanel>
        );
    }

    return (
        <GlassPanel>
            <SectionHeader icon={Gift} title="Inviter des amis" />
            <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">
                Partagez votre lien personnel. Pour chaque artisan inscrit via votre code, vous gagnez <strong>500 DZD</strong> de crédit.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-indigo-50 border border-primary/20 p-5">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Votre code parrain</p>
                    <p className="text-2xl font-black tracking-[0.2em] text-primary">{stats.code}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 flex flex-col items-center justify-center text-center">
                        <Users size={20} className="text-emerald-500 mb-1" />
                        <p className="text-2xl font-black text-slate-900">{stats.referredCount}</p>
                        <p className="text-xs font-bold text-slate-500">Inscrits</p>
                    </div>
                    <div className="rounded-xl bg-amber-50 border border-amber-100 p-4 flex flex-col items-center justify-center text-center">
                        <Gift size={20} className="text-amber-500 mb-1" />
                        <p className="text-xl font-black text-slate-900">{stats.earnedAmount}</p>
                        <p className="text-xs font-bold text-slate-500">DZD gagnés</p>
                    </div>
                </div>
            </div>

            <div className="flex gap-2">
                <input
                    type="text" readOnly value={link}
                    className="glass-input flex-1 text-sm text-slate-500 font-mono"
                />
                <button
                    type="button" onClick={copyLink}
                    className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white/70 hover:bg-white text-sm font-bold text-slate-700 transition-all"
                >
                    <Copy size={16} />
                    Copier
                </button>
            </div>
        </GlassPanel>
    );
}

// ─── Main client component ────────────────────────────────────────────────────

type TabId = "profile" | "security" | "language" | "promo" | "referral";

interface AccountTabsClientProps {
    profile: AccountProfileRecord;
    artisan: AccountArtisanRecord | null;
    userEmail: string | null;
    referralStats: { code: string; referredCount: number; earnedAmount: number } | null;
    walletBalance: number;
}

export function AccountTabsClient({ profile, artisan, userEmail, referralStats, walletBalance }: AccountTabsClientProps) {
    const [activeTab, setActiveTab] = useState<TabId>("profile");

    const tabs: { id: TabId; label: string; Icon: React.ElementType }[] = [
        { id: "profile", label: "Profil", Icon: User },
        { id: "security", label: "Sécurité", Icon: Shield },
        { id: "language", label: "Langue", Icon: Globe },
        { id: "promo", label: "Promo", Icon: Tag },
        { id: "referral", label: "Parrainer", Icon: Gift },
    ];

    return (
        <div className="space-y-6">
            {/* Pill tab bar */}
            <div className="flex flex-wrap gap-2">
                {tabs.map(tab => {
                    const { Icon } = tab;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${activeTab === tab.id
                                ? "bg-primary text-white border-primary shadow-md"
                                : "bg-white/60 text-slate-600 border-slate-200 hover:bg-white hover:text-slate-900"
                                }`}
                        >
                            <Icon size={15} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab content */}
            {activeTab === "profile" && <AccountProfileTab profile={profile} artisan={artisan} />}
            {activeTab === "security" && <AccountSecurityTab userEmail={userEmail} />}
            {activeTab === "language" && <LanguageTab />}
            {activeTab === "promo" && <PromoTab walletBalance={walletBalance} />}
            {activeTab === "referral" && <ReferralTab stats={referralStats} />}
        </div>
    );
}
