"use client";

import { CategoryIcon } from "@/components/ui/category-icon";
import type { MarketplaceCategory } from "@/lib/marketplace-data";
import { buildRechercheHref } from "@/lib/search-utils";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type CategoryGridProps = {
    categories: MarketplaceCategory[];
};

export function CategoryGrid({ categories }: CategoryGridProps) {
    const [openDropdownSlug, setOpenDropdownSlug] = useState<string | null>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onPointerDown = (event: PointerEvent) => {
            const target = event.target as Node;
            if (gridRef.current && !gridRef.current.contains(target)) {
                setOpenDropdownSlug(null);
            }
        };

        document.addEventListener("pointerdown", onPointerDown);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
        };
    }, []);

    return (
        <div ref={gridRef} id="categories-section" className="relative z-20 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-6 scroll-mt-24">
            {categories.map((category, index) => {
                const isOpen = openDropdownSlug === category.slug;
                const isActive = isOpen;
                const hasSubmenu = Boolean(category.enableDropdown && category.subcategories.length);
                const alignRightOnSm = index % 2 === 1;
                const alignRightOnLg = index % 6 >= 4;

                return (
                    <div
                        key={category.slug}
                        className={cn("stagger-in relative", isOpen && "z-[70]")}
                    >
                        {hasSubmenu ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setOpenDropdownSlug((prev) =>
                                        prev === category.slug ? null : category.slug,
                                    );
                                }}
                                className={cn(
                                    "glass-card group flex min-h-[60px] w-full items-center gap-2.5 px-3.5 py-2.5 text-left",
                                    isActive && "border-primary/35 ring-2 ring-primary/15",
                                )}
                            >
                                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition group-hover:bg-primary/15">
                                    <CategoryIcon iconSlug={category.iconSlug} className="h-6 w-6 text-blue-600" />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block text-[13px] font-extrabold uppercase leading-[1.1] tracking-tight text-slate-800">
                                        {category.name}
                                    </span>
                                </span>
                                <ChevronDown
                                    size={15}
                                    className={cn(
                                        "shrink-0 text-slate-500 transition",
                                        isOpen && "rotate-180 text-primary",
                                    )}
                                />
                            </button>
                        ) : (
                            <Link
                                href={buildRechercheHref({
                                    category: category.slug,
                                })}
                                className={cn(
                                    "glass-card group flex min-h-[60px] w-full items-center gap-2.5 px-3.5 py-2.5 text-left",
                                    isActive && "border-primary/35 ring-2 ring-primary/15",
                                )}
                                onClick={() => setOpenDropdownSlug(null)}
                                aria-label={`Voir ${category.name}`}
                            >
                                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition group-hover:bg-primary/15">
                                    <CategoryIcon iconSlug={category.iconSlug} className="h-6 w-6 text-blue-600" />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block text-[13px] font-extrabold uppercase leading-[1.1] tracking-tight text-slate-800">
                                        {category.name}
                                    </span>
                                </span>
                            </Link>
                        )}

                        {isOpen ? (
                            <div
                                className={cn(
                                    "absolute top-[calc(100%+8px)] z-[80] w-[min(260px,calc(100vw-1.75rem))] rounded-2xl border border-white/80 bg-white/90 p-2 shadow-[0_20px_45px_rgba(15,23,42,0.22)] backdrop-blur-xl",
                                    "max-sm:left-1/2 max-sm:-translate-x-1/2",
                                    alignRightOnSm ? "sm:right-0 sm:left-auto" : "sm:left-0 sm:right-auto",
                                    alignRightOnLg ? "lg:right-0 lg:left-auto" : "lg:left-0 lg:right-auto",
                                )}
                            >
                                {category.subcategories.map((subcategory) => (
                                    <Link
                                        key={subcategory.slug}
                                        href={buildRechercheHref({
                                            category: category.slug,
                                            q: subcategory.name,
                                            subcategory: subcategory.slug,
                                        })}
                                        onClick={() => setOpenDropdownSlug(null)}
                                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-primary"
                                    >
                                        <CategoryIcon
                                            iconSlug={subcategory.iconSlug ?? "Monitor"}
                                            className="h-4 w-4 text-blue-600"
                                            strokeWidth={1.8}
                                        />
                                        {subcategory.name}
                                    </Link>
                                ))}
                            </div>
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
}