import { OverviewCard } from "@/components/dashboard/shared";
import { GlassCard } from "@/components/ui/glass-card";
import { getArtisanDashboardData } from "@/lib/actions/dashboard";
import { getMyBookings, getMyConfirmedBookings, getMyDemands, type BookingItem, type DemandItem } from "@/lib/actions/dashboard-services";
import { isArtisanAccount } from "@/lib/auth-role";
import { normalizePlanType } from "@/lib/plans";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CalendarDays, CheckCircle2, FileText, MapPin, Search, Sparkles, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const DEFAULT_AVATAR = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232563eb'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

type RecentLead = {
    id: string;
    status: string;
    price: number | string | null;
    rfq_posts: {
        title: string;
        wilaya: string | null;
    };
};

function formatDate(value: string | null) {
    if (!value) return "Date non definie";
    return new Date(value).toLocaleDateString("fr-DZ", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}


function BookingPreviewRow({ booking }: { booking: BookingItem }) {
    return (
        <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                    <h3 className="text-sm font-black text-slate-900">{booking.description}</h3>
                    <p className="mt-2 text-xs font-medium text-slate-500">Date: {formatDate(booking.scheduled_date)}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                    {booking.status}
                </span>
            </div>
        </div>
    );
}

function DemandPreviewRow({ demand }: { demand: DemandItem }) {
    return (
        <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                    <h3 className="text-sm font-black text-slate-900">{demand.title}</h3>
                    <p className="mt-2 text-xs font-medium text-slate-500">
                        {demand.wilaya}
                        {demand.budget_range ? ` • ${demand.budget_range}` : ""}
                    </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                    {demand.status}
                </span>
            </div>
        </div>
    );
}

import { ADMIN_EMAIL } from "@/lib/constants";

export default async function DashboardPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login?redirectedFrom=/dashboard");
    }

    const isOwnerAdmin = (user.email ?? "").trim().toLowerCase() === ADMIN_EMAIL;
    if (isOwnerAdmin) {
        redirect("/admin");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

    const { data: artisanRecord } = await supabase
        .from("artisans")
        .select("availability_status")
        .eq("id", user.id)
        .maybeSingle();
    const availabilityStatus = artisanRecord?.availability_status;

    const isArtisan = isArtisanAccount({
        user,
        profileRole: profile?.role,
    });

    if (isArtisan) {
        const { error, artisan, recentLeads } = await getArtisanDashboardData();

        if (error === "Non autorisé") {
            redirect("/auth/login?redirectedFrom=/dashboard");
        }

        if (error === "Profil artisan introuvable" || !artisan) {
            redirect("/dashboard/account");
        }

        const currentPlan = normalizePlanType(artisan.subscription_tier);
        const visibilityLabel = currentPlan === "pro" ? "Pro Premium" : currentPlan === "starter" || currentPlan === "basic" ? "Starter" : "Basique";
        const primaryCta =
            recentLeads.length > 0
                ? {
                    href: "/dashboard/services?tab=inbox",
                    label: `Traiter ${recentLeads.length} demande${recentLeads.length > 1 ? "s" : ""}`,
                }
                : currentPlan === "basic"
                    ? {
                        href: "/dashboard/subscription",
                        label: "Booster ma visibilite",
                    }
                    : {
                        href: "/dashboard/account/portfolio",
                        label: "Actualiser mon portfolio",
                    };

        return (
            <div className="w-full animate-fade-in-up pb-8 space-y-8">
                <GlassCard className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between border-white/60">
                    <div className="flex items-center gap-6">
                        <div className="relative shrink-0">
                            <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-primary/5 shadow-md">
                                <Image src={artisan.profiles.avatar_url || DEFAULT_AVATAR} alt="Avatar" fill className="object-cover" />
                            </div>
                            {availabilityStatus && (
                                <span className={`absolute bottom-1 right-1 block h-4 w-4 rounded-full border-2 border-white shadow-sm ${availabilityStatus === 'unavailable' ? 'bg-rose-500' : 'bg-emerald-500'}`} title={availabilityStatus === 'unavailable' ? 'Hors ligne' : 'En ligne'} />
                            )}
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Vue d'ensemble pro</p>
                            <h1 className="mt-2 text-2xl tracking-tight text-slate-800">
                                <span className="font-bold text-slate-900 capitalize">{artisan.profiles.full_name?.split(' ')[0] || "Pro"}</span>
                            </h1>
                            <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-500">
                                <MapPin size={16} />
                                {artisan.wilaya} {artisan.company_name ? `• ${artisan.company_name}` : ""}
                            </p>
                        </div>
                    </div>

                    <Link href={primaryCta.href} className="glass-btn-primary inline-flex items-center gap-2 px-5 py-3">
                        <Sparkles size={16} />
                        {primaryCta.label}
                    </Link>
                </GlassCard>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <OverviewCard
                        label="Visibilite"
                        value={visibilityLabel}
                        hint="Votre niveau de presence actuel sur ArtyLink."
                        icon={Sparkles}
                        toneClass="bg-primary/10 text-primary"
                    />
                    <OverviewCard
                        label="Avis"
                        value={artisan.rating ? `${artisan.rating} / 5` : "Nouveau"}
                        hint={`${artisan.review_count || 0} avis visibles sur votre fiche.`}
                        icon={Star}
                        toneClass="bg-blue-100 text-blue-600"
                    />
                    <OverviewCard
                        label="Demandes recentes"
                        value={recentLeads.length}
                        hint="Acces direct a votre zone de traitement."
                        icon={FileText}
                        toneClass="bg-fuchsia-100 text-fuchsia-600"
                        href="/dashboard/services?tab=inbox"
                    />
                </div>

                <GlassCard className="p-6 border-white/60">
                    <div className="flex flex-col gap-2">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Action du moment</p>
                        <h2 className="text-xl font-black text-slate-900">Demandes recentes</h2>
                        <p className="text-sm font-medium text-slate-500">
                            Une vue rapide pour savoir si vous devez repondre, enrichir votre profil ou renforcer votre visibilite.
                        </p>
                    </div>

                    <div className="mt-6">
                        {recentLeads.length === 0 ? (
                            <div className="rounded-2xl border-2 border-dashed border-slate-200/60 bg-slate-50/50 px-6 py-10 text-center">
                                <h3 className="text-lg font-black text-slate-900">Aucune demande recente</h3>
                                <p className="mx-auto mt-2 max-w-md text-sm font-medium text-slate-500">
                                    Travaillez votre portfolio ou votre niveau de visibilite pour capter plus de contacts.
                                </p>
                                <div className="mt-6">
                                    <Link
                                        href={currentPlan === "basic" ? "/dashboard/subscription" : "/dashboard/account/portfolio"}
                                        className="glass-btn-primary"
                                    >
                                        {currentPlan === "basic" ? "Voir les forfaits" : "Mettre a jour mon portfolio"}
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {(recentLeads as unknown as RecentLead[]).map((lead) => (
                                    <GlassCard key={lead.id} className="p-5 flex flex-col justify-between border-white/60">
                                        <div className="mb-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <h3 className="text-base font-black text-slate-900 line-clamp-2" title={lead.rfq_posts.title}>
                                                    {lead.rfq_posts.title}
                                                </h3>
                                                <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                                                    {lead.status === "pending" ? "En attente" : lead.status === "accepted" ? "Accepte" : "Refuse"}
                                                </span>
                                            </div>
                                            <p className="mt-3 flex items-center gap-1.5 text-sm text-slate-500">
                                                <MapPin size={14} className="text-primary/70" />
                                                {lead.rfq_posts.wilaya}
                                            </p>
                                        </div>
                                        <div className="mt-auto flex items-center justify-between border-t border-slate-200/60 pt-4">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Votre devis</p>
                                                <p className="text-sm font-black text-slate-900">{lead.price} DZD</p>
                                            </div>
                                            <Link href="/dashboard/services?tab=inbox" className="text-sm font-bold text-primary transition-colors hover:text-primary-hover">
                                                Ouvrir la zone de travail
                                            </Link>
                                        </div>
                                    </GlassCard>
                                ))}
                            </div>
                        )}
                    </div>
                </GlassCard>
            </div>
        );
    }

    const [bookings, demands, confirmed] = await Promise.all([
        getMyBookings(),
        getMyDemands(),
        getMyConfirmedBookings(),
    ]);

    const clientFirstName = profile?.full_name?.trim().split(" ")[0] || "Client";
    const primaryCta =
        demands.length > 0
            ? { href: "/dashboard/services?tab=demandes", label: "Suivre mes demandes", icon: FileText }
            : bookings.length > 0
                ? { href: "/dashboard/services?tab=reservations", label: "Voir mes reservations", icon: CalendarDays }
                : { href: "/search", label: "Chercher un artisan", icon: Search };
    const ClientPrimaryIcon = primaryCta.icon;

    return (
        <div className="w-full animate-fade-in-up pb-8 space-y-8">
            <GlassCard className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between border-white/60">
                <div className="flex items-center gap-6">
                    <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-primary/5 shadow-md shrink-0">
                        <Image src={profile?.avatar_url || DEFAULT_AVATAR} alt="Avatar" fill className="object-cover" />
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Accueil client</p>
                        <h1 className="mt-2 text-2xl tracking-tight text-slate-800">
                            <span className="font-bold text-slate-900 capitalize">{clientFirstName}</span>
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500">
                            Un accueil simple pour savoir quoi faire ensuite: chercher, publier, ou suivre vos services en cours.
                        </p>
                    </div>
                </div>

                <Link href={primaryCta.href} className="glass-btn-primary inline-flex items-center gap-2 px-5 py-3">
                    <ClientPrimaryIcon size={16} />
                    {primaryCta.label}
                </Link>
            </GlassCard>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <OverviewCard
                    label="Réservations"
                    value={bookings.length}
                    hint="Demandes déjà envoyées à des artisans."
                    icon={CalendarDays}
                    toneClass="bg-primary/10 text-primary"
                    href="/dashboard/services?tab=reservations"
                />
                <OverviewCard
                    label="Demandes"
                    value={demands.length}
                    hint="Besoins publiés et encore à suivre."
                    icon={FileText}
                    toneClass="bg-fuchsia-100 text-fuchsia-600"
                    href="/dashboard/services?tab=demandes"
                />
                <OverviewCard
                    label="Confirmés"
                    value={confirmed.length}
                    hint="Prestations déjà validées."
                    icon={CheckCircle2}
                    toneClass="bg-emerald-100 text-emerald-600"
                    href="/dashboard/services?tab=confirmes"
                />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <GlassCard className="p-6 border-white/60">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Suivi rapide</p>
                            <h2 className="mt-1 text-xl font-black text-slate-900">Réservations recentes</h2>
                        </div>
                        <Link href="/dashboard/services?tab=reservations" className="text-sm font-bold text-primary hover:underline">
                            Tout voir
                        </Link>
                    </div>

                    <div className="mt-6">
                        {bookings.length === 0 ? (
                            <div className="rounded-2xl border-2 border-dashed border-slate-200/60 bg-slate-50/50 px-6 py-10 text-center">
                                <h3 className="text-lg font-black text-slate-900">Aucune reservation</h3>
                                <p className="mx-auto mt-2 max-w-md text-sm font-medium text-slate-500">
                                    Commencez par chercher un artisan ou publiez votre besoin quand vous etes pret.
                                </p>
                                <div className="mt-6">
                                    <Link href="/search" className="glass-btn-primary">Chercher un artisan</Link>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {bookings.slice(0, 3).map((booking) => (
                                    <BookingPreviewRow key={booking.id} booking={booking} />
                                ))}
                            </div>
                        )}
                    </div>
                </GlassCard>

                <GlassCard className="p-6 border-white/60">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Prochaine action</p>
                            <h2 className="mt-1 text-xl font-black text-slate-900">Demandes recentes</h2>
                        </div>
                        <Link href="/dashboard/services?tab=demandes" className="text-sm font-bold text-primary hover:underline">
                            Ouvrir
                        </Link>
                    </div>

                    <div className="mt-6">
                        {demands.length === 0 ? (
                            <div className="rounded-2xl border-2 border-dashed border-slate-200/60 bg-slate-50/50 px-6 py-10 text-center">
                                <h3 className="text-lg font-black text-slate-900">Aucune demande publiee</h3>
                                <p className="mx-auto mt-2 max-w-md text-sm font-medium text-slate-500">
                                    Si vous voulez recevoir des reponses ciblees, decrivez votre besoin en quelques lignes.
                                </p>
                                <div className="mt-6">
                                    <Link href="/search" className="glass-btn-primary">Chercher un artisan</Link>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {demands.slice(0, 3).map((demand) => (
                                    <DemandPreviewRow key={demand.id} demand={demand} />
                                ))}
                            </div>
                        )}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
