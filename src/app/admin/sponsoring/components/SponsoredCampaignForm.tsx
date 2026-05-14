"use client";

import {
    saveSponsoredItem,
    searchArtisansForAdmin,
    type AdminArtisanSearchResult,
    type SponsoredCampaignFormItem,
} from "@/lib/actions/sponsoring-admin";
import { ArrowUpDown, CalendarClock, FileText, Image as ImageIcon, Link as LinkIcon, Sparkles, Timer, UploadCloud } from "lucide-react";
import Image from "next/image";
import { useDeferredValue, useEffect, useState, useTransition } from "react";

type SponsoredCampaignFormProps = {
    item?: SponsoredCampaignFormItem | null;
    submitLabel: string;
    helperText?: string;
};

function formatDateTimeLocal(value?: string | null) {
    const date = value ? new Date(value) : new Date();
    const pad = (input: number) => String(input).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function getDurationDays(item?: SponsoredCampaignFormItem | null) {
    if (!item) {
        return 7;
    }

    const start = new Date(item.start_at).valueOf();
    const end = new Date(item.end_at).valueOf();
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return Number.isFinite(diffDays) && diffDays > 0 ? diffDays : 7;
}

function readAdminNote(item?: SponsoredCampaignFormItem | null) {
    const value = item?.payload?.admin_note;
    return typeof value === "string" ? value : "";
}

function readPriority(item?: SponsoredCampaignFormItem | null) {
    const value = item?.payload?.priority;
    return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

const PRIORITY_OPTIONS = [
    { value: 0, label: "0 — Gratuit (basse)" },
    { value: 1, label: "1 — Starter" },
    { value: 2, label: "2 — Pro (haute)" },
    { value: 3, label: "3 — Elite (max)" },
] as const;

function buildDemoImageUrl(imagePath?: string | null) {
    if (!imagePath) {
        return null;
    }

    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
    return baseUrl ? `${baseUrl}/storage/v1/object/public/demos/${imagePath}` : null;
}

export function SponsoredCampaignForm({ item, submitLabel, helperText }: SponsoredCampaignFormProps) {
    const isEdit = !!item;
    const imageUrl = buildDemoImageUrl(item?.image_path ?? null);
    const [campaignType, setCampaignType] = useState<"artisan" | "sponsor">(item?.type ?? "sponsor");
    const [linkValue, setLinkValue] = useState(item?.link ?? "");
    const [artisanQuery, setArtisanQuery] = useState("");
    const [artisanResults, setArtisanResults] = useState<AdminArtisanSearchResult[]>([]);
    const [isSearching, startSearchTransition] = useTransition();
    const deferredArtisanQuery = useDeferredValue(artisanQuery);

    useEffect(() => {
        if (campaignType !== "artisan") {
            return;
        }

        const normalizedQuery = deferredArtisanQuery.trim();
        if (normalizedQuery.length < 2) {
            return;
        }

        startSearchTransition(async () => {
            const results = await searchArtisansForAdmin(normalizedQuery);
            setArtisanResults(results);
        });
    }, [campaignType, deferredArtisanQuery]);

    const visibleArtisanResults =
        campaignType === "artisan" && deferredArtisanQuery.trim().length >= 2
            ? artisanResults
            : [];

    function handleSelectArtisan(result: AdminArtisanSearchResult) {
        setLinkValue(`/artisan/${result.id}`);
        setArtisanQuery(result.fullName);
        setArtisanResults([]);
    }

    return (
        <form action={saveSponsoredItem} className="space-y-6">
            <input type="hidden" name="item_id" defaultValue={item?.id ?? ""} />

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Sparkles size={16} className="text-fuchsia-500" />
                        Type de campagne
                    </label>
                    <select
                        name="type"
                        value={campaignType}
                        onChange={(event) => setCampaignType(event.target.value === "artisan" ? "artisan" : "sponsor")}
                        className="glass-input cursor-pointer appearance-none"
                    >
                        <option value="sponsor">Sponsor marque</option>
                        <option value="artisan">Artisan mis en avant</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <FileText size={16} className="text-slate-400" />
                        Titre
                    </label>
                    <input
                        type="text"
                        name="title"
                        required
                        defaultValue={item?.title ?? ""}
                        placeholder={campaignType === "artisan" ? "Nom de l'artisan" : "Nom de la marque"}
                        className="glass-input"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <FileText size={16} className="text-slate-400" />
                    Sous-titre
                </label>
                <input
                    type="text"
                    name="subtitle"
                    required
                    defaultValue={item?.subtitle ?? ""}
                    placeholder={campaignType === "artisan" ? "Métier ou spécialité" : "Message promotionnel"}
                    className="glass-input"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <ImageIcon size={16} className="text-slate-400" />
                        Visuel
                    </label>
                    <input type="hidden" name="image_path" defaultValue={item?.image_path ?? ""} />
                    <div className="rounded-2xl border border-white/70 bg-white/50 p-3 shadow-inner">
                        <div className="flex gap-3">
                            <div className="relative flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-slate-400">
                                {imageUrl ? (
                                    <Image src={imageUrl} alt={item?.title ?? "Visuel sponsoring"} fill className="object-cover" />
                                ) : (
                                    <ImageIcon size={28} />
                                )}
                            </div>

                            <div className="min-w-0 flex-1 space-y-2">
                                <div className="rounded-xl border border-dashed border-fuchsia-200 bg-fuchsia-50/70 px-3 py-3">
                                    <div className="mb-2 flex items-center gap-2 text-sm font-black text-fuchsia-700">
                                        <UploadCloud size={16} />
                                        Uploader une image
                                    </div>
                                    <input
                                        type="file"
                                        name="image_file"
                                        accept="image/jpeg,image/png,image/webp,image/gif"
                                        className="block w-full cursor-pointer text-xs font-bold text-slate-500 file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-fuchsia-600 file:px-3 file:py-2 file:text-xs file:font-black file:text-white hover:file:bg-fuchsia-700"
                                    />
                                </div>
                                <p className="truncate text-xs font-medium text-slate-400">
                                    {item?.image_path ? `Actuel: ${item.image_path}` : "JPG, PNG, WebP ou GIF. Maximum 5 Mo."}
                                </p>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs font-medium text-slate-400">Le fichier est uploadé dans le bucket public <span className="font-bold">demos</span> à l&apos;enregistrement.</p>
                </div>

                <div className="space-y-2">
                    {campaignType === "artisan" && (
                        <div className="rounded-2xl border border-fuchsia-100 bg-fuchsia-50/70 p-4">
                            <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                                <Sparkles size={16} className="text-fuchsia-500" />
                                Rechercher un artisan
                            </label>
                            <input
                                type="text"
                                value={artisanQuery}
                                onChange={(event) => setArtisanQuery(event.target.value)}
                                placeholder="Nom, entreprise ou métier"
                                className="glass-input"
                            />
                            <p className="mt-2 text-xs font-medium text-slate-400">
                                Sélectionnez un artisan pour remplir automatiquement le lien cible au format `/artisan/uuid`.
                            </p>

                            {(isSearching || visibleArtisanResults.length > 0 || deferredArtisanQuery.trim().length >= 2) && (
                                <div className="mt-3 space-y-2">
                                    {visibleArtisanResults.map((result) => (
                                        <button
                                            key={result.id}
                                            type="button"
                                            onClick={() => handleSelectArtisan(result)}
                                            className="flex w-full items-center justify-between rounded-xl border border-white/70 bg-white/80 px-4 py-3 text-left shadow-sm transition hover:border-fuchsia-200 hover:bg-white"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-black text-slate-900">{result.fullName}</p>
                                                <p className="truncate text-xs font-medium text-slate-500">
                                                    {result.profession ?? result.companyName ?? "Artisan ArtyLink"}
                                                </p>
                                            </div>
                                            <span className="ml-4 rounded-full bg-fuchsia-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-fuchsia-700">
                                                UUID
                                            </span>
                                        </button>
                                    ))}

                                    {!isSearching && visibleArtisanResults.length === 0 && (
                                        <div className="rounded-xl border border-dashed border-slate-200 bg-white/70 px-4 py-3 text-sm font-medium text-slate-500">
                                            Aucun artisan trouvé pour cette recherche.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <LinkIcon size={16} className="text-slate-400" />
                        Lien cible
                    </label>
                    <input
                        type="text"
                        name="link"
                        value={linkValue}
                        onChange={(event) => setLinkValue(event.target.value)}
                        placeholder="/artisan/mon-profil ou https://site.com"
                        className="glass-input"
                    />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <CalendarClock size={16} className="text-slate-400" />
                        Début
                    </label>
                    <input
                        type="datetime-local"
                        name="start_at"
                        defaultValue={formatDateTimeLocal(item?.start_at ?? null)}
                        className="glass-input"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <CalendarClock size={16} className="text-slate-400" />
                        Durée campagne
                    </label>
                    <input
                        type="number"
                        min={1}
                        name="duration_days"
                        defaultValue={getDurationDays(item)}
                        className="glass-input"
                    />
                    <p className="text-xs font-medium text-slate-400">En jours. Sert à calculer la date de fin.</p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Timer size={16} className="text-slate-400" />
                        Durée carousel
                    </label>
                    <input
                        type="number"
                        min={1}
                        name="duration_seconds"
                        defaultValue={item?.duration_seconds ?? 20}
                        className="glass-input"
                    />
                    <p className="text-xs font-medium text-slate-400">Temps d&apos;affichage du slide en secondes.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <ArrowUpDown size={16} className="text-fuchsia-500" />
                        Priorité carousel
                    </label>
                    <select
                        name="priority"
                        defaultValue={readPriority(item)}
                        className="glass-input cursor-pointer appearance-none"
                    >
                        {PRIORITY_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <p className="text-xs font-medium text-slate-400">Dépend du forfait de l&apos;utilisateur. Plus la priorité est haute, plus l&apos;item apparaît en premier dans le carousel.</p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Note interne</label>
                    <textarea
                        name="admin_note"
                        rows={3}
                        defaultValue={readAdminNote(item)}
                        placeholder="Note interne optionnelle pour le suivi administratif"
                        className="glass-input resize-none"
                    />
                </div>
            </div>

            {helperText && (
                <p className="text-xs font-medium text-slate-400">{helperText}</p>
            )}

            <div className="flex justify-end">
                <button type="submit" className="glass-btn-primary">
                    {isEdit ? submitLabel : submitLabel}
                </button>
            </div>
        </form>
    );
}
