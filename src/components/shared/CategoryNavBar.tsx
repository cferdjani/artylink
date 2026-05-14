"use client";

import { CategoryIcon } from "@/components/ui/category-icon";
import type { MarketplaceCategory } from "@/lib/marketplace-data";
import { buildRechercheHref, normalizeText } from "@/lib/search-utils";
import { cn } from "@/lib/utils";
import { ChevronDown, MapPin, Menu, Search, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MegaMenu } from "./MegaMenu";

type CategoryNavBarProps = {
    categories: MarketplaceCategory[];
};

const QUICK_CATEGORY_SLUGS = [
    "plomberie-gaz",
    "electricite",
    "climatisation",
    "construction",
    "menuiserie",
    "formation",
];

const QUICK_CATEGORY_ALIASES: Record<string, string[]> = {
    "plomberie-gaz": ["plomberie-gaz", "plomberie"],
    electricite: ["electricite", "electricite-batiment"],
    climatisation: ["climatisation", "climatisation-froid"],
    construction: ["construction", "construction-renovation", "maconnerie-renovation"],
    menuiserie: ["menuiserie", "menuiserie-amenagement"],
    formation: ["formation", "cours-formations", "cours-particuliers"],
};

const QUICK_CATEGORY_LABELS: Record<string, string> = {
    "plomberie-gaz": "Plomberie",
    electricite: "Électricité",
    climatisation: "Climatisation",
    construction: "Construction",
    menuiserie: "Menuiserie",
    formation: "Cours/Formations",
};

function matchesCategoryAlias(category: MarketplaceCategory, aliases: string[]) {
    return aliases.some((alias) => category.slug === alias || category.slug.includes(alias));
}

function getQuickCategoryLabel(category: MarketplaceCategory) {
    const quickSlug = QUICK_CATEGORY_SLUGS.find((slug) => {
        const aliases = QUICK_CATEGORY_ALIASES[slug] ?? [slug];
        return matchesCategoryAlias(category, aliases);
    });

    return quickSlug ? QUICK_CATEGORY_LABELS[quickSlug] : category.name;
}

function getQuickCategories(categories: MarketplaceCategory[]) {
    const usedSlugs = new Set<string>();

    return QUICK_CATEGORY_SLUGS.flatMap((slug) => {
        const aliases = QUICK_CATEGORY_ALIASES[slug] ?? [slug];
        const category = categories.find((entry) => !usedSlugs.has(entry.slug) && matchesCategoryAlias(entry, aliases));

        if (!category) {
            return [];
        }

        usedSlugs.add(category.slug);
        return [category];
    });
}

function getMoreCategories(categories: MarketplaceCategory[], quickCategories: MarketplaceCategory[]) {
    const quickSlugs = new Set(quickCategories.map((category) => category.slug));
    return categories.filter((category) => !quickSlugs.has(category.slug));
}

function filterMobileCategories(categories: MarketplaceCategory[], query: string) {
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) {
        return categories;
    }

    return categories.flatMap((category) => {
        const categoryMatches =
            normalizeText(category.name).includes(normalizedQuery) ||
            normalizeText(category.slug).includes(normalizedQuery);

        const subcategories = categoryMatches
            ? category.subcategories
            : category.subcategories.filter(
                (subcategory) =>
                    normalizeText(subcategory.name).includes(normalizedQuery) ||
                    normalizeText(subcategory.slug).includes(normalizedQuery),
            );

        if (!categoryMatches && subcategories.length === 0) {
            return [];
        }

        return [{ ...category, subcategories }];
    });
}

export function CategoryNavBar({ categories }: CategoryNavBarProps) {
    const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
    const [isMegaMenuPinned, setIsMegaMenuPinned] = useState(false);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
    const [mobileQuery, setMobileQuery] = useState("");

    const safeCategories = categories ?? [];
    const quickCategories = getQuickCategories(safeCategories);
    const moreCategories = getMoreCategories(safeCategories, quickCategories);
    const mobileCategories = filterMobileCategories(safeCategories, mobileQuery);
    const megaCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const startMegaCloseTimer = () => {
        megaCloseTimerRef.current = setTimeout(() => {
            if (!isMegaMenuPinned) {
                setIsMegaMenuOpen(false);
            }
        }, 200);
    };

    const cancelMegaCloseTimer = () => {
        if (megaCloseTimerRef.current) {
            clearTimeout(megaCloseTimerRef.current);
            megaCloseTimerRef.current = null;
        }
    };

    useEffect(() => {
        if (!isMoreMenuOpen && !isMobilePanelOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsMoreMenuOpen(false);
                setIsMobilePanelOpen(false);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isMoreMenuOpen, isMobilePanelOpen]);

    useEffect(() => {
        if (!isMobilePanelOpen) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [isMobilePanelOpen]);

    if (safeCategories.length === 0) return null;

    const closeMegaMenu = () => {
        setIsMegaMenuOpen(false);
        setIsMegaMenuPinned(false);
    };

    const closeAllPanels = () => {
        closeMegaMenu();
        setIsMoreMenuOpen(false);
        setIsMobilePanelOpen(false);
    };

    return (
        <div className="relative z-[60] w-full bg-white/60 backdrop-blur-xl border-b border-white/40 shadow-sm">
            <div className="max-w-7xl mx-auto px-4">

                {/* Desktop Layout */}
                <div className="hidden lg:flex items-center h-[42px] gap-3">
                    <div
                        className="group/category relative z-[70] h-full flex items-center"
                        onMouseEnter={() => {
                            cancelMegaCloseTimer();
                            if (!isMegaMenuPinned) {
                                setIsMegaMenuOpen(true);
                            }
                            setIsMoreMenuOpen(false);
                        }}
                        onMouseLeave={() => {
                            startMegaCloseTimer();
                        }}
                    >
                        <button
                            type="button"
                            onFocus={() => {
                                setIsMegaMenuOpen(true);
                                setIsMoreMenuOpen(false);
                            }}
                            onClick={() => {
                                setIsMegaMenuOpen(true);
                                setIsMegaMenuPinned(true);
                                setIsMoreMenuOpen(false);
                            }}
                            aria-haspopup="dialog"
                            aria-expanded={isMegaMenuOpen}
                            className="flex items-center gap-1.5 h-full rounded-t-xl px-2.5 text-[13px] font-bold text-slate-800 hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary data-[state=open]:border-primary data-[state=open]:text-primary"
                            data-state={isMegaMenuOpen ? "open" : "closed"}
                        >
                            <Menu className="w-4 h-4" />
                            Toutes les catégories
                            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isMegaMenuOpen && "rotate-180")} />
                        </button>
                        <MegaMenu categories={safeCategories} isOpen={isMegaMenuOpen} onClose={closeMegaMenu} />
                    </div>

                    <nav aria-label="Catégories rapides" className="flex min-w-0 flex-1 items-center gap-1.5 overflow-visible">
                        {quickCategories.map((cat, index) => (
                            <Link
                                key={cat.slug}
                                href={buildRechercheHref({ category: cat.slug })}
                                title={cat.name}
                                className={cn(
                                    "inline-flex h-8 items-center rounded-full px-3 text-[13px] font-semibold text-slate-700 whitespace-nowrap transition-colors hover:bg-white/80 hover:text-primary",
                                    index >= 4 && "hidden xl:inline-flex",
                                )}
                            >
                                {getQuickCategoryLabel(cat)}
                            </Link>
                        ))}
                        {moreCategories.length > 0 && (
                            <div
                                className="group/more relative z-[80] h-full flex items-center"
                                onMouseEnter={() => {
                                    setIsMoreMenuOpen(true);
                                    closeMegaMenu();
                                }}
                                onMouseLeave={() => setIsMoreMenuOpen(false)}
                            >
                                <button
                                    type="button"
                                    onFocus={() => {
                                        setIsMoreMenuOpen(true);
                                        closeMegaMenu();
                                    }}
                                    onClick={() => {
                                        setIsMoreMenuOpen(true);
                                        closeMegaMenu();
                                    }}
                                    aria-haspopup="menu"
                                    aria-expanded={isMoreMenuOpen}
                                    aria-label="Plus de catégories"
                                    className="inline-flex h-8 items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/55 px-3 text-[13px] font-bold text-slate-800 shadow-sm transition hover:border-primary/30 hover:text-primary data-[state=open]:border-primary/40 data-[state=open]:text-primary"
                                    data-state={isMoreMenuOpen ? "open" : "closed"}
                                >
                                    Plus
                                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isMoreMenuOpen && "rotate-180")} />
                                </button>

                                {isMoreMenuOpen && <div className="fixed inset-0 z-[60]" onClick={() => setIsMoreMenuOpen(false)} />}
                                <div
                                    role="menu"
                                    aria-label="Plus de catégories"
                                    className={cn(
                                        "pointer-events-none invisible absolute left-0 top-[calc(100%+8px)] z-[70] w-[380px] translate-y-2 rounded-2xl border border-white/80 bg-white/95 p-3 opacity-0 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-xl transition duration-150",
                                        isMoreMenuOpen && "pointer-events-auto visible translate-y-0 opacity-100",
                                    )}
                                >
                                    <div className="mb-2 flex items-center justify-between border-b border-slate-100 px-2 pb-2">
                                        <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                                            Autres métiers
                                        </span>
                                        <Link
                                            href="/search"
                                            onClick={() => setIsMoreMenuOpen(false)}
                                            className="text-xs font-bold text-primary hover:underline"
                                        >
                                            Tout explorer
                                        </Link>
                                    </div>
                                    <div className="grid max-h-[420px] grid-cols-2 gap-1.5 overflow-y-auto pr-1">
                                        {moreCategories.map((cat) => (
                                            <Link
                                                key={cat.slug}
                                                href={buildRechercheHref({ category: cat.slug })}
                                                onClick={() => setIsMoreMenuOpen(false)}
                                                role="menuitem"
                                                className="group flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-primary"
                                            >
                                                <CategoryIcon iconSlug={cat.iconSlug} className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-primary" />
                                                <span className="leading-tight">{cat.name}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </nav>

                    <div className="flex items-center gap-4 border-l border-slate-200 pl-3 shrink-0">
                        <Link href="/search" className="flex items-center gap-1.5 text-[13px] font-bold text-primary hover:text-blue-700 transition-colors">
                            <Sparkles className="w-3.5 h-3.5" /> Artisans Pro
                        </Link>
                        <Link href="/search" className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-700 hover:text-primary transition-colors">
                            <MapPin className="w-3.5 h-3.5" /> Près de chez vous
                        </Link>
                    </div>
                </div>

                <div className="flex lg:hidden items-center h-[44px] gap-2">
                    <Link href="/" className="inline-flex h-8 items-center rounded-full px-3 text-xs font-bold text-slate-800 hover:bg-white/75 hover:text-primary">
                        Accueil
                    </Link>
                    <button
                        type="button"
                        onClick={() => {
                            setIsMobilePanelOpen(true);
                            setIsMoreMenuOpen(false);
                            closeMegaMenu();
                        }}
                        aria-haspopup="dialog"
                        aria-expanded={isMobilePanelOpen}
                        className="inline-flex h-8 flex-1 items-center justify-center gap-2 rounded-full bg-slate-900 px-3 text-xs font-black text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)] transition hover:bg-slate-800"
                    >
                        <Menu className="h-4 w-4" />
                        Catégories
                    </button>
                    <Link href="/search" className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-bold text-primary hover:bg-white/75">
                        <Sparkles className="h-3.5 w-3.5" />
                        Pro
                    </Link>
                </div>

                {isMobilePanelOpen && (
                    <>
                        <div className="fixed inset-0 z-[80] bg-slate-950/30 backdrop-blur-[2px]" onClick={closeAllPanels} />
                        <section
                            role="dialog"
                            aria-modal="true"
                            aria-label="Explorer les catégories"
                            className="fixed inset-x-0 bottom-0 z-[90] flex max-h-[84dvh] flex-col rounded-t-[2rem] border border-white/70 bg-white/95 shadow-[0_-24px_70px_rgba(15,23,42,0.24)] backdrop-blur-2xl lg:hidden"
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">ArtyLink</p>
                                    <h2 className="text-lg font-black text-slate-950">Explorer les catégories</h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={closeAllPanels}
                                    aria-label="Fermer les catégories"
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="px-5 py-3">
                                <label htmlFor="mobile-category-search" className="sr-only">
                                    Rechercher une catégorie
                                </label>
                                <div className="flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 shadow-sm">
                                    <Search className="h-4 w-4 text-slate-400" />
                                    <input
                                        id="mobile-category-search"
                                        value={mobileQuery}
                                        onChange={(event) => setMobileQuery(event.target.value)}
                                        placeholder="Métier, service, spécialité..."
                                        className="min-w-0 flex-1 border-0 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                                    />
                                    {mobileQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setMobileQuery("")}
                                            className="rounded-full px-2 py-1 text-xs font-bold text-slate-500 hover:bg-slate-100"
                                        >
                                            Effacer
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 pb-6">
                                {mobileCategories.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm font-semibold text-slate-500">
                                        Aucune catégorie trouvée.
                                    </div>
                                ) : (
                                    mobileCategories.map((cat) => (
                                        <article key={cat.slug} className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                                            <Link
                                                href={buildRechercheHref({ category: cat.slug })}
                                                onClick={closeAllPanels}
                                                className="flex items-center justify-between gap-3 rounded-xl px-1 py-1 text-slate-950"
                                            >
                                                <span className="flex min-w-0 items-center gap-3">
                                                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                                        <CategoryIcon iconSlug={cat.iconSlug} className="h-5 w-5" />
                                                    </span>
                                                    <span className="text-sm font-black leading-tight">{cat.name}</span>
                                                </span>
                                                <span className="shrink-0 text-xs font-bold text-primary">Voir</span>
                                            </Link>

                                            {cat.subcategories.length > 0 && (
                                                <div className="mt-3 grid grid-cols-2 gap-2">
                                                    {cat.subcategories.map((sub) => (
                                                        <Link
                                                            key={sub.slug}
                                                            href={buildRechercheHref({
                                                                category: cat.slug,
                                                                q: sub.name,
                                                                subcategory: sub.slug,
                                                            })}
                                                            onClick={closeAllPanels}
                                                            className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-bold leading-tight text-slate-600 transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                                                        >
                                                            {sub.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </article>
                                    ))
                                )}
                            </div>
                        </section>
                    </>
                )}
            </div>
        </div>
    );
}
