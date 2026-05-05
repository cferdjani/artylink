"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { BriefcaseBusiness, Mail, MapPin, Phone, Search, Users } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type AdminArtisan = {
    id: string;
    company_name: string | null;
    wilaya: string | null;
    created_at: string | null;
    email: string | null;
    full_name: string | null;
    phone_number: string | null;
};

export default function AdminUsersClient({ initialArtisans }: { initialArtisans: AdminArtisan[] }) {
    const [search, setSearch] = useState("");

    const filteredArtisans = useMemo(() => {
        const term = search.trim().toLowerCase();

        if (!term) {
            return initialArtisans;
        }

        return initialArtisans.filter((artisan) => {
            const haystack = [
                artisan.full_name,
                artisan.company_name,
                artisan.email,
                artisan.phone_number,
                artisan.wilaya,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return haystack.includes(term);
        });
    }, [initialArtisans, search]);

    return (
        <div className="space-y-6">
            <div className="apple-panel sticky top-0 z-10 p-4 md:p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="apple-chip inline-flex px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                            Carnet public
                        </p>
                        <h1 className="mt-2 flex items-center gap-3 text-2xl font-black tracking-tight text-slate-900">
                            <Users className="text-primary" /> Cartes artisans
                        </h1>
                        <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500">
                            Consultation des profils inscrits. ArtyLink gere la visibilité et la maintenance, pas la certification ni les conflits entre utilisateurs.
                        </p>
                    </div>

                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Nom, email, wilaya..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            className="glass-input h-11 w-full pl-9 text-sm"
                        />
                    </div>
                </div>
            </div>

            <GlassCard className="p-5 border-blue-100 bg-blue-50/70">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Position produit</p>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-blue-900">
                    Aucun badge “vérifié” n&apos;est attribué ici. Les abonnements et campagnes payantes servent à augmenter la visibilité,
                    pas à garantir une prestation, une identité commerciale ou une absence de risque.
                </p>
            </GlassCard>

            <div className="grid grid-cols-1 gap-6 animate-fade-in-up md:grid-cols-2 xl:grid-cols-3">
                {filteredArtisans.length === 0 ? (
                    <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center font-medium text-slate-500">
                        Aucun artisan trouvé pour cette recherche.
                    </div>
                ) : (
                    filteredArtisans.map((artisan) => (
                        <GlassCard key={artisan.id} className="flex flex-col overflow-hidden p-0 transition-colors hover:border-slate-300">
                            <div className="p-5">
                                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 ring-1 ring-slate-200">
                                    <BriefcaseBusiness size={12} /> Carte de visite
                                </div>
                                <h3 className="truncate text-lg font-black text-slate-900">{artisan.full_name || "Artisan"}</h3>
                                <p className="mt-1 truncate text-sm font-bold text-slate-600">{artisan.company_name || "Indépendant"}</p>

                                <div className="mt-5 space-y-3 text-sm font-semibold text-slate-600">
                                    <p className="flex items-center gap-2">
                                        <Mail size={15} className="text-slate-400" />
                                        <span className="truncate">{artisan.email || "Email non renseigné"}</span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <Phone size={15} className="text-slate-400" />
                                        <span>{artisan.phone_number || "Téléphone non renseigné"}</span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <MapPin size={15} className="text-slate-400" />
                                        <span>{artisan.wilaya || "Wilaya non renseignée"}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="mt-auto flex items-center gap-3 border-t border-white/70 bg-white/55 p-4">
                                <Link
                                    href={`/artisan/${artisan.id}`}
                                    target="_blank"
                                    className="glass-btn-secondary flex-1 justify-center text-xs"
                                >
                                    Voir la carte
                                </Link>
                            </div>
                        </GlassCard>
                    ))
                )}
            </div>
        </div>
    );
}
