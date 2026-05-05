"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface PortfolioItem {
    id: string;
    image_url: string;
    caption?: string;
}

type PortfolioGalleryProps = {
    portfolios: PortfolioItem[];
    tone?: "light" | "dark";
};

export function PortfolioGallery({ portfolios, tone = "light" }: PortfolioGalleryProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const isDark = tone === "dark";

    if (!portfolios || portfolios.length === 0) return null;

    return (
        <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {portfolios.map((portfolio) => (
                    <button
                        key={portfolio.id}
                        type="button"
                        onClick={() => setSelectedImage(portfolio.image_url)}
                        className={cn(
                            "group relative overflow-hidden rounded-lg border text-left transition",
                            isDark
                                ? "border-white/10 bg-white/[0.04] hover:border-white/20"
                                : "border-slate-200 bg-white shadow-sm hover:border-primary/30 hover:shadow-md"
                        )}
                    >
                        <div className="relative aspect-[4/3] overflow-hidden">
                            <Image
                                src={portfolio.image_url}
                                alt={portfolio.caption || "Realisation"}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            />
                            <div
                                aria-hidden
                                className={cn(
                                    "absolute inset-0",
                                    isDark
                                        ? "bg-[linear-gradient(180deg,transparent_36%,rgba(0,0,0,0.8)_100%)]"
                                        : "bg-[linear-gradient(180deg,transparent_46%,rgba(15,23,42,0.72)_100%)]"
                                )}
                            />
                        </div>

                        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-4 py-3">
                            <div className="min-w-0">
                                <p
                                    className={cn(
                                        "text-[11px] uppercase tracking-[0.22em]",
                                        isDark ? "text-white/42" : "text-white/70"
                                    )}
                                >
                                    Realisation
                                </p>
                                <p
                                    className={cn(
                                        "mt-1 line-clamp-2 text-sm font-medium",
                                        isDark ? "text-white" : "text-white"
                                    )}
                                >
                                    {portfolio.caption || "Voir la photo"}
                                </p>
                            </div>
                            <span
                                className={cn(
                                    "shrink-0 text-xs font-semibold",
                                    isDark ? "text-white/70" : "text-white/80"
                                )}
                            >
                                Agrandir
                            </span>
                        </div>
                    </button>
                ))}
            </div>

            {selectedImage ? (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/88 p-4 backdrop-blur-md"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        type="button"
                        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-lg border border-white/12 bg-white/[0.08] text-white transition hover:bg-white/[0.12]"
                        onClick={(event) => {
                            event.stopPropagation();
                            setSelectedImage(null);
                        }}
                    >
                        <X size={20} />
                    </button>

                    <div
                        className="relative aspect-[4/3] w-full max-w-6xl overflow-hidden rounded-lg border border-white/12 bg-black"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <Image src={selectedImage} alt="Image agrandie" fill className="object-contain" />
                    </div>
                </div>
            ) : null}
        </>
    );
}
