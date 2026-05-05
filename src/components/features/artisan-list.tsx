"use client";

import type { MarketplaceArtisan } from "@/lib/marketplace-data";
import { ChevronLeft, ChevronRight, MapPin, Phone, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
type ArtisanListProps = {
    artisans: MarketplaceArtisan[];
    variant?: "carousel" | "grid";
    pagination?: {
        currentPage: number;
        totalPages: number;
        previousHref?: string;
        nextHref?: string;
    };
};

function ArtisanCard({ artisan }: { artisan: MarketplaceArtisan }) {
    const primarySpecialty = artisan.specialties?.[0];
    const ageLabel = typeof artisan.age === "number" && artisan.age >= 18 ? `${artisan.age} ans` : null;
    const activityLabel = artisan.profession || artisan.serviceTitle;

    return (
        <Link
            href={`/artisan/${artisan.id}`}
            className="glass-card block p-2.5 hover:border-primary/35"
        >
            <div className="flex items-center gap-3">
                <Image
                    src={artisan.avatarUrl}
                    alt={artisan.name}
                    width={74}
                    height={66}
                    className="h-[66px] w-[74px] shrink-0 rounded-xl object-cover"
                />

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-1">
                        <h3 className="truncate text-[0.98rem] leading-5 font-black tracking-tight text-slate-900">
                            {artisan.name}
                        </h3>
                        {artisan.planType === 'pro' && (
                            <span className="shrink-0 rounded-md bg-slate-900 px-1.5 py-0.5 text-[9px] font-black text-white leading-tight mt-0.5 shadow-sm">
                                PRO
                            </span>
                        )}
                        {artisan.planType === 'starter' && (
                            <span className="shrink-0 rounded-md bg-primary/10 px-1.5 py-0.5 text-[9px] font-black text-primary leading-tight mt-0.5 hidden sm:inline-block">
                                A LA UNE
                            </span>
                        )}
                    </div>
                    <p className="mt-0.5 truncate text-[14px] font-semibold text-slate-800">
                        {activityLabel}
                    </p>
                    {(primarySpecialty && primarySpecialty !== activityLabel) || ageLabel ? (
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            {primarySpecialty && primarySpecialty !== activityLabel ? (
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                                    {primarySpecialty}
                                </span>
                            ) : null}
                            {ageLabel ? (
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                                    {ageLabel}
                                </span>
                            ) : null}
                        </div>
                    ) : null}

                    <div className="mt-1 flex items-center gap-1 text-[12px] font-semibold text-slate-700">
                        <Star size={14} className="fill-amber-400 text-amber-400" />
                        {artisan.ratingAvg.toFixed(1)}
                        <span className="text-slate-500">({artisan.reviewsCount} avis)</span>
                    </div>

                    <div className="mt-0.5 flex items-center gap-1 text-[12px] font-medium text-slate-600">
                        <MapPin size={13} />
                        {artisan.commune}, {artisan.wilaya}
                    </div>
                </div>
            </div>
        </Link>
    );
}

export function ArtisanList({ artisans, variant = "carousel", pagination }: ArtisanListProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollByCards = (direction: "left" | "right") => {
        const viewport = scrollRef.current;
        if (!viewport) {
            return;
        }
        const delta = direction === "left" ? -360 : 360;
        viewport.scrollBy({ left: delta, behavior: "smooth" });
    };

    if (variant === "grid") {
        return (
            <div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {artisans.map((artisan) => (
                        <div key={artisan.id} className="stagger-in">
                            <ArtisanCard artisan={artisan} />
                        </div>
                    ))}
                </div>

                {pagination && pagination.totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-4">
                        {pagination.currentPage > 1 ? (
                            <Link
                                href={pagination.previousHref ?? "#"}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white/80 px-4 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary"
                            >
                                <ChevronLeft size={16} /> Précédent
                            </Link>
                        ) : (
                            <button
                                disabled
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-400"
                            >
                                <ChevronLeft size={16} /> Précédent
                            </button>
                        )}

                        <span className="text-sm font-medium text-slate-600">
                            Page {pagination.currentPage} sur {pagination.totalPages}
                        </span>

                        {pagination.currentPage < pagination.totalPages ? (
                            <Link
                                href={pagination.nextHref ?? "#"}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white/80 px-4 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary"
                            >
                                Suivant <ChevronRight size={16} />
                            </Link>
                        ) : (
                            <button
                                disabled
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-400"
                            >
                                Suivant <ChevronRight size={16} />
                            </button>
                        )}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="absolute -top-11 right-0 hidden items-center gap-2 md:flex">
                <button
                    type="button"
                    onClick={() => scrollByCards("left")}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-white/80 text-slate-700 transition hover:border-primary hover:text-primary"
                    aria-label="Defiler a gauche"
                >
                    <ChevronLeft size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => scrollByCards("right")}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-white/80 text-slate-700 transition hover:border-primary hover:text-primary"
                    aria-label="Defiler a droite"
                >
                    <ChevronRight size={16} />
                </button>
            </div>

            <div
                ref={scrollRef}
                className="hide-scrollbar flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-1"
            >
                {artisans.map((artisan) => (
                    <div
                        key={artisan.id}
                        className="stagger-in min-w-[265px] snap-start md:min-w-[295px]"
                    >
                        <ArtisanCard artisan={artisan} />
                    </div>
                ))}
                <div className="min-w-1" />
            </div>

            <div className="mt-3 flex items-center justify-end gap-2 text-xs text-slate-500 md:hidden">
                <Phone size={12} />
                Glissez horizontalement pour voir plus d artisans
            </div>
        </div>
    );
}
