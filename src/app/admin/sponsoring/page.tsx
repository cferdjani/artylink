import { GlassCard } from "@/components/ui/glass-card";
import { getAdminLandingPath } from "@/lib/auth/admin-access";
import { getAdminContext } from "@/lib/auth/require-admin";
import { getSponsoredItemsAdmin, type SponsoredItemAdminRow } from "@/lib/actions/sponsoring-admin";
import { CalendarClock, ExternalLink, Image as ImageIcon, Megaphone, Sparkles, Timer } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SponsoredCampaignForm } from "./components/SponsoredCampaignForm";
import { SponsoredItemActions } from "./components/SponsoredItemActions";
import {
    getSponsoredDisplayStatus,
    getSponsoredStatusBadgeClass,
    getSponsoredStatusLabel,
    type SponsoredDisplayStatus,
} from "@/lib/sponsored-campaigns";

export const metadata = {
    title: "Sponsoring & Carousel | Super Admin",
};

export const dynamic = "force-dynamic";

type SponsoredItemView = SponsoredItemAdminRow & {
    title: string;
    subtitle: string;
    imageUrl: string | null;
    status: SponsoredDisplayStatus;
};

function buildImageUrl(imagePath: string | null) {
    if (!imagePath) {
        return null;
    }

    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") ?? "";
    return `${baseUrl}/storage/v1/object/public/demos/${imagePath}`;
}

function readPayloadField(payload: Record<string, unknown> | null, key: string) {
    const value = payload?.[key];
    return typeof value === "string" ? value : "";
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat("fr-DZ", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

export default async function AdminSponsoringPage() {
    const admin = await getAdminContext();
    if (!admin.isOwner && !admin.permissions.can_manage_sponsoring) {
        redirect(getAdminLandingPath({
            isOwner: admin.isOwner,
            permissions: admin.permissions,
        }));
    }

    const rows = await getSponsoredItemsAdmin();
    const nowMs = new Date().valueOf();

    const items: SponsoredItemView[] = rows.map((row) => {
        const title = row.type === "artisan"
            ? readPayloadField(row.payload, "name") || "Artisan sponsorisé"
            : readPayloadField(row.payload, "brand_name") || "Sponsor";

        const subtitle = row.type === "artisan"
            ? readPayloadField(row.payload, "profession") || "Prestataire"
            : readPayloadField(row.payload, "product_desc") || "Promotion";

        return {
            ...row,
            title,
            subtitle,
            imageUrl: buildImageUrl(row.image_path),
            status: getSponsoredDisplayStatus(nowMs, row.start_at, row.end_at, row.payload?.admin_status),
        };
    });

    const activeItems = items.filter((item) => item.status === "active");
    const scheduledItems = items.filter((item) => item.status === "scheduled");
    const pausedItems = items.filter((item) => item.status === "paused");
    const terminatedItems = items.filter((item) => item.status === "terminated");
    const expiredItems = items.filter((item) => item.status === "expired");

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex flex-col gap-3">
                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-fuchsia-100 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-fuchsia-700">
                    <Megaphone size={14} /> Sponsoring & Carousel
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestion des campagnes premium</h1>
                <p className="max-w-3xl text-slate-500 font-medium">
                    Suivez les sponsors actifs, les campagnes programmées et les anciens emplacements publicitaires affichés dans le carousel premium.
                </p>
            </div>

            <GlassCard className="p-6 md:p-8 border-white/60 bg-gradient-to-br from-fuchsia-50 to-white">
                <div className="mb-6 flex flex-col gap-2">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-fuchsia-600">Nouvelle campagne</p>
                    <h2 className="text-2xl font-black text-slate-900">Créer ou ajuster un sponsoring</h2>
                    <p className="max-w-3xl text-sm font-medium text-slate-500">
                        Renseignez le titre, le visuel, le lien et la durée. Vous pourrez ensuite suspendre, reprendre ou terminer la campagne depuis les actions rapides.
                    </p>
                </div>

                <SponsoredCampaignForm
                    submitLabel="Créer la campagne"
                    helperText="Le type de campagne choisit le vocabulaire public: artisan mis en avant ou sponsor marque."
                />
            </GlassCard>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <GlassCard className="p-6 border-white/60">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-fuchsia-100 text-fuchsia-600">
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500">Actifs</p>
                            <h2 className="text-2xl font-black text-slate-900">{activeItems.length}</h2>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-6 border-white/60">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                            <CalendarClock size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500">Programmés</p>
                            <h2 className="text-2xl font-black text-slate-900">{scheduledItems.length}</h2>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-6 border-white/60">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                            <Timer size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500">Suspendus</p>
                            <h2 className="text-2xl font-black text-slate-900">{pausedItems.length}</h2>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-6 border-white/60">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                            <Timer size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500">Terminés</p>
                            <h2 className="text-2xl font-black text-slate-900">{terminatedItems.length + expiredItems.length}</h2>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {items.length === 0 ? (
                <GlassCard className="p-12 text-center border-dashed border-2 border-slate-200 text-slate-500 font-medium">
                    Aucune campagne sponsorisée n&apos;a encore été trouvée.
                </GlassCard>
            ) : (
                <div className="grid gap-4">
                    {items.map((item) => {
                        const externalHref = item.link?.startsWith("/") ? item.link : item.link ? (item.link.startsWith("http") ? item.link : `https://${item.link}`) : null;
                        const statusClass = getSponsoredStatusBadgeClass(item.status);

                        return (
                            <GlassCard key={item.id} className="overflow-hidden border-white/60">
                                <div className="grid gap-0 md:grid-cols-[220px_1fr]">
                                    <div className="relative min-h-[220px] bg-slate-100">
                                        {item.imageUrl ? (
                                            <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                                        ) : (
                                            <div className="flex h-full min-h-[220px] items-center justify-center text-slate-400">
                                                <ImageIcon size={44} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6">
                                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                            <div className="space-y-3">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-700">
                                                        {item.type}
                                                    </span>
                                                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${statusClass}`}>
                                                        {getSponsoredStatusLabel(item.status)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h2 className="break-words text-2xl font-black leading-tight text-slate-900">{item.title}</h2>
                                                    <p className="mt-1 text-sm font-medium text-slate-500">{item.subtitle}</p>
                                                </div>

                                                <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-600">
                                                    <span className="rounded-full bg-slate-100 px-3 py-1">Début: {formatDate(item.start_at)}</span>
                                                    <span className="rounded-full bg-slate-100 px-3 py-1">Fin: {formatDate(item.end_at)}</span>
                                                    <span className="rounded-full bg-slate-100 px-3 py-1">Durée: {item.duration_seconds ?? 0}s</span>
                                                    <span className={`rounded-full px-3 py-1 ${statusClass}`}>Statut: {getSponsoredStatusLabel(item.status)}</span>
                                                    <span className="rounded-full bg-fuchsia-100 px-3 py-1 text-fuchsia-700">Priorité: {(() => { const p = typeof item.payload?.priority === "number" ? item.payload.priority : 0; return p === 3 ? "Elite" : p === 2 ? "Pro" : p === 1 ? "Starter" : "Gratuit"; })()}</span>
                                                </div>

                                                {readPayloadField(item.payload, "admin_note") && (
                                                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                                                        <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 mb-1">Note admin</span>
                                                        {readPayloadField(item.payload, "admin_note")}
                                                    </div>
                                                )}

                                                <div className="text-sm text-slate-600">
                                                    <span className="font-semibold text-slate-900">Lien: </span>
                                                    {externalHref ? (
                                                        item.link?.startsWith("/") ? (
                                                            <Link href={externalHref} className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
                                                                {externalHref}
                                                                <ExternalLink size={14} />
                                                            </Link>
                                                        ) : (
                                                            <a href={externalHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
                                                                {externalHref}
                                                                <ExternalLink size={14} />
                                                            </a>
                                                        )
                                                    ) : (
                                                        <span className="text-slate-500">Aucun lien renseigné</span>
                                                    )}
                                                </div>

                                                <SponsoredItemActions
                                                    itemId={item.id}
                                                    currentStatus={item.status}
                                                />

                                                <details className="mt-6 rounded-2xl border border-dashed border-slate-200/80 bg-slate-50/80 p-4">
                                                    <summary className="cursor-pointer list-none text-sm font-black text-slate-700">
                                                        Modifier la campagne
                                                    </summary>
                                                    <div className="mt-4">
                                                        <SponsoredCampaignForm
                                                            item={item}
                                                            submitLabel="Mettre à jour"
                                                            helperText="Les états de publication sont conservés, seules les données éditoriales et de planification sont mises à jour."
                                                        />
                                                    </div>
                                                </details>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
