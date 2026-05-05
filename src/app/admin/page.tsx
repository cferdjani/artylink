import { GlassCard } from "@/components/ui/glass-card";
import { CreditCard, Users, Activity, Megaphone } from "lucide-react";
import Link from "next/link";
import { getAdminLandingPath } from "@/lib/auth/admin-access";
import { getAdminContext } from "@/lib/auth/require-admin";
import { getPendingPayments } from "@/lib/actions/payments-admin";
import { adminGetArtisans } from "@/lib/actions/users-admin";
import { getSponsoredItemsAdmin } from "@/lib/actions/sponsoring-admin";
import { isSponsoredCampaignVisible } from "@/lib/sponsored-campaigns";
import { hasSupabaseServiceRoleConfiguration } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Tableau de Bord Admin | ArtyLink"
};

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
    const admin = await getAdminContext();
    if (!admin.isOwner && !admin.permissions.can_view_dashboard) {
        redirect(getAdminLandingPath({
            isOwner: admin.isOwner,
            permissions: admin.permissions,
        }));
    }

    const hasServiceRoleConfig = hasSupabaseServiceRoleConfiguration();
    const canManagePayments = admin.isOwner || admin.permissions.can_manage_payments;
    const canManageUsers = admin.isOwner || admin.permissions.can_manage_users;
    const canManageSponsoring = admin.isOwner || admin.permissions.can_manage_sponsoring;
    const [pendingPayments, artisans, sponsoredItems] = await Promise.all([
        canManagePayments ? getPendingPayments() : Promise.resolve([]),
        canManageUsers ? adminGetArtisans() : Promise.resolve([]),
        canManageSponsoring ? getSponsoredItemsAdmin() : Promise.resolve([]),
    ]);
    const nowMs = new Date().valueOf();
    const activeSponsored = sponsoredItems.filter((item) => isSponsoredCampaignVisible(nowMs, item.start_at, item.end_at, item.payload?.admin_status));

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="apple-panel p-6 md:p-8">
                <p className="apple-chip inline-flex px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-primary">Control Center</p>
                <h1 className="mt-3 text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Vue d&apos;ensemble Admin</h1>
                <p className="text-slate-600 font-medium mt-2 max-w-3xl">
                    Supervisez l&apos;activité, les paiements et la monétisation premium de la plateforme.
                </p>
            </div>

            {!hasServiceRoleConfig ? (
                <GlassCard className="p-5 border-amber-200 bg-amber-50/85 shadow-[0_16px_30px_rgba(245,158,11,0.12)]">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Configuration requise</p>
                    <p className="mt-2 text-sm font-medium text-amber-800">
                        La clé <code>SUPABASE_SERVICE_ROLE_KEY</code> est absente. Le tableau admin reste accessible,
                        mais certaines données admin sont en mode dégradé.
                    </p>
                </GlassCard>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {canManagePayments ? (
                    <GlassCard className="p-6 border-white/70 bg-white/85 shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-amber-50 border border-orange-200/80 flex items-center justify-center text-orange-600">
                                <CreditCard size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-500">Recharges</p>
                                <h2 className="text-2xl font-black text-slate-900">{pendingPayments.length}</h2>
                            </div>
                        </div>
                        <Link href="/admin/payments" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                            Traiter les demandes &rarr;
                        </Link>
                    </GlassCard>
                ) : null}

                {canManageUsers ? (
                    <GlassCard className="p-6 border-white/70 bg-white/85 shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-50 border border-amber-200/80 flex items-center justify-center text-amber-600">
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-500">Cartes artisans</p>
                                <h2 className="text-2xl font-black text-slate-900">{artisans.length}</h2>
                            </div>
                        </div>
                        <Link href="/admin/users" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                            Consulter les profils &rarr;
                        </Link>
                    </GlassCard>
                ) : null}

                {canManageSponsoring ? (
                    <GlassCard className="p-6 border-white/70 bg-white/85 shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-100 to-violet-50 border border-fuchsia-200/80 flex items-center justify-center text-fuchsia-600">
                                <Megaphone size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-500">Sponsoring visibles</p>
                                <h2 className="text-2xl font-black text-slate-900">{activeSponsored.length}</h2>
                            </div>
                        </div>
                        <Link href="/admin/sponsoring" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                            Gérer le carousel &rarr;
                        </Link>
                    </GlassCard>
                ) : null}

                <GlassCard className="p-6 border-white/70 bg-white/70 opacity-70 cursor-not-allowed">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                            <Activity size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500">Analytics</p>
                            <h2 className="text-2xl font-black text-slate-900">Bêta</h2>
                        </div>
                    </div>
                    <span className="text-xs font-bold text-slate-400">Arrive bientôt</span>
                </GlassCard>
            </div>

            {!canManagePayments && !canManageUsers && !canManageSponsoring ? (
                <GlassCard className="p-6 border-amber-200 bg-amber-50/85 shadow-[0_16px_30px_rgba(245,158,11,0.12)]">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Permissions limitées</p>
                    <p className="mt-2 text-sm font-medium text-amber-800">
                        Ce compte admin peut accéder au shell admin, mais aucun module opérationnel n&apos;est encore activé.
                    </p>
                </GlassCard>
            ) : null}
            
            <GlassCard className="p-8 border-white/70 bg-gradient-to-br from-blue-50/90 via-white to-cyan-50/85 shadow-[0_20px_50px_rgba(59,130,246,0.12)]">
                <h3 className="text-xl font-black text-slate-900 mb-2">Bienvenue sur le centre de contrôle</h3>
                <p className="text-slate-600 leading-relaxed font-medium max-w-2xl">
                    Utilisez le menu latéral pour suivre les paiements, consulter les profils publics et gérer le sponsoring/carousel premium.
                    Le rôle admin sert à maintenir la plateforme et la visibilité payante, pas à arbitrer les conflits entre utilisateurs.
                </p>
            </GlassCard>
        </div>
    );
}
