"use client";

import { CategoryIcon } from "@/components/ui/category-icon";
import type { MarketplaceCategory } from "@/lib/marketplace-data";
import { buildRechercheHref } from "@/lib/search-utils";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";

type MegaMenuProps = {
    categories: MarketplaceCategory[];
    isOpen: boolean;
    onClose: () => void;
};

export function MegaMenu({ categories, isOpen, onClose }: MegaMenuProps) {
    const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(categories[0]?.slug ?? null);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            document.addEventListener("keydown", handleEsc);
        }
        return () => document.removeEventListener("keydown", handleEsc);
    }, [isOpen, onClose]);

    const activeCategory = categories.find((c) => c.slug === activeCategorySlug) ?? categories[0] ?? null;

    return (
        <>
            {/* Overlay invisible pour fermer au clic à l'extérieur */}
            {isOpen && <div className="fixed inset-0 z-[60]" onClick={onClose} />}

            <div
                role="dialog"
                aria-label="Toutes les catégories"
                className={cn(
                    "pointer-events-none invisible absolute left-0 top-[calc(100%+8px)] z-[70] flex min-h-[360px] max-h-[520px] w-[min(920px,calc(100vw-2rem))] origin-top translate-y-2 overflow-hidden rounded-3xl border border-white/80 bg-white/95 p-0 opacity-0 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur-xl transition duration-150",
                    "group-hover/category:pointer-events-auto group-hover/category:visible group-hover/category:translate-y-0 group-hover/category:opacity-100",
                    isOpen && "pointer-events-auto visible translate-y-0 opacity-100",
                )}
            >

                {/* Colonne Gauche : Catégories principales */}
                <div className="w-[270px] shrink-0 overflow-y-auto border-r border-slate-100 bg-gradient-to-b from-slate-50/90 to-white/70 py-3">
                    {categories.map((cat) => (
                        <button
                            key={cat.slug}
                            type="button"
                            onMouseEnter={() => setActiveCategorySlug(cat.slug)}
                            onClick={() => setActiveCategorySlug(cat.slug)}
                            onFocus={() => setActiveCategorySlug(cat.slug)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold transition-colors",
                                activeCategory?.slug === cat.slug
                                    ? "bg-white text-primary shadow-sm"
                                    : "text-slate-700 hover:bg-white/60 hover:text-primary"
                            )}
                            aria-pressed={activeCategory?.slug === cat.slug}
                        >
                            <CategoryIcon iconSlug={cat.iconSlug} className="w-5 h-5 text-blue-500" />
                            <span className="truncate">{cat.name}</span>
                        </button>
                    ))}
                </div>

                {/* Zone Droite : Sous-catégories */}
                <div className="flex-1 overflow-y-auto bg-white/40 p-6">
                    {activeCategory && (
                        <div>
                            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                <h3 className="text-lg font-black text-slate-950 flex items-center gap-2">
                                    <CategoryIcon iconSlug={activeCategory.iconSlug} className="w-6 h-6 text-primary" />
                                    {activeCategory.name}
                                </h3>
                                <Link
                                    href={buildRechercheHref({ category: activeCategory.slug })}
                                    onClick={onClose}
                                    className="text-sm font-semibold text-primary hover:underline"
                                >
                                    Voir tout &rarr;
                                </Link>
                            </div>

                            {activeCategory.subcategories.length > 0 ? (
                                <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                                    {activeCategory.subcategories.map((sub) => (
                                        <Link
                                            key={sub.slug}
                                            href={buildRechercheHref({
                                                category: activeCategory.slug,
                                                q: sub.name,
                                                subcategory: sub.slug,
                                            })}
                                            onClick={onClose}
                                            className="group flex items-center gap-2 rounded-xl border border-transparent px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-100 hover:bg-slate-50 hover:text-primary"
                                        >
                                            <CategoryIcon
                                                iconSlug={sub.iconSlug ?? "Monitor"}
                                                className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors shrink-0"
                                                strokeWidth={1.8}
                                            />
                                            <span className="truncate leading-tight">{sub.name}</span>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-500">
                                    Cette catégorie n'a pas encore de sous-catégories détaillées.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
