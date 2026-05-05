import { getDelegateInvitationState } from "@/lib/actions/admin-delegates";
import { getWalletBalanceAndHistory } from "@/lib/actions/payments";
import { getReferralStats } from "@/lib/actions/referral";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountTabsClient } from "./AccountTabsClient";
import { loadAccountViewData } from "./account-data";

export const metadata = {
    title: "Mon Compte | ArtyLink",
    description: "Gérez votre profil, sécurité, préférences et programme de parrainage.",
};

export const dynamic = "force-dynamic";

export default async function AccountPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/auth/login");
    const { profile: profileRecord, artisan } = await loadAccountViewData(supabase, user);

    const referralStats = await getReferralStats().catch(() => null);
    const wallet = await getWalletBalanceAndHistory().catch(() => ({ balance: 0, transactions: [] }));
    const adminInvitation = await getDelegateInvitationState().catch(() => ({
        hasInvitation: false,
        activationStatus: "none" as const,
        isActiveAccount: false,
    }));

    return (
        <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
            {adminInvitation.hasInvitation ? (
                <div className="mb-6 rounded-2xl border border-cyan-200 bg-cyan-50 p-5 shadow-[0_8px_30px_rgba(6,182,212,0.12)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <ShieldAlert className="text-cyan-600 shrink-0" size={32} />
                        <div>
                            <h3 className="text-base font-black text-cyan-900">Invitation d&apos;administration</h3>
                            <p className="text-sm font-medium text-cyan-700 mt-1">Le propriétaire de la plateforme vous a invité à rejoindre l&apos;équipe d&apos;administration.</p>
                        </div>
                    </div>
                    <Link href="/dashboard/account/admin-activation" className="shrink-0 rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-cyan-700 transition">
                        Voir l&apos;invitation
                    </Link>
                </div>
            ) : null}
            <div className="mb-8">
                <p className="text-xs font-black tracking-widest text-slate-400 uppercase mb-1">Compte</p>
                <h1 className="text-3xl font-black tracking-tight text-slate-900">Paramètres</h1>
                <p className="mt-2 text-sm text-slate-500 font-medium">
                    Gérez vos informations personnelles, sécurité et préférences.
                </p>
            </div>

            <AccountTabsClient
                profile={profileRecord}
                artisan={artisan}
                userEmail={user.email ?? null}
                referralStats={referralStats}
                walletBalance={wallet.balance}
            />
        </div>
    );
}
