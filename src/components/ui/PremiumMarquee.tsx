"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";

type ArtisanItem = {
    id: string;
    type: "artisan";
    name: string;
    profession?: string;
    rating?: number;
    is_verified?: boolean;
    avatar_url?: string;
    link?: string;
};

type SponsorItem = {
    id: string;
    type: "sponsor";
    brand_name: string;
    product_desc?: string;
    logo_url?: string;
    link?: string;
};

export type PremiumItem = ArtisanItem | SponsorItem;

type Props = {
    items: PremiumItem[];
    durationSeconds?: number;
};

function MarqueeItem({ item, onEnter, onLeave }: { item: PremiumItem; onEnter: () => void; onLeave: () => void }) {
    const { id, type } = item;

    const avatarFallback = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
    const brandFallback = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath d='M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z'/%3E%3C/svg%3E";

    const baseClasses = "w-[260px] h-[60px] rounded-2xl p-2 pr-4 flex-shrink-0 relative overflow-hidden transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] bg-slate-900/95 border border-white/20 shadow-[0_4px_15px_rgba(0,0,0,0.1)] text-white cursor-pointer flex items-center gap-3 pointer-events-auto";

    const cardContent = (
        <div
            className={baseClasses}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
        >
            {type === "artisan" && (
                <>
                    <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 border border-white/10 shadow-sm">
                        <Image src={item.avatar_url || avatarFallback} alt={item.name || "Artisan"} width={44} height={44} className="object-cover h-full w-full" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-bold text-white">{item.name}</h3>
                        <div className="mt-0.5 flex items-center gap-1 text-[10px] font-bold text-slate-300">
                            <span className="text-amber-400">★</span> {item.rating?.toFixed(1) ?? "Nouveau"}
                        </div>
                    </div>
                </>
            )}
            {type === "sponsor" && (
                <>
                    <div className="w-11 h-11 rounded-full overflow-hidden bg-white flex-shrink-0 border border-white/10 shadow-sm p-1">
                        <Image src={item.logo_url || brandFallback} alt={item.brand_name || "Sponsor"} width={44} height={44} className="object-contain h-full w-full" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-bold text-white">{item.brand_name}</h3>
                        <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-widest text-amber-400">Sponsor</span>
                    </div>
                </>
            )}
        </div>
    );

    if (type === "artisan") {
        if (item.link) {
            return <Link href={item.link} prefetch={false} className="block" aria-label={item.name} onMouseEnter={onEnter} onMouseLeave={onLeave}>{cardContent}</Link>;
        }
        if (id) {
            return <Link href={`/artisan/${id}`} prefetch={false} className="block" aria-label={item.name} onMouseEnter={onEnter} onMouseLeave={onLeave}>{cardContent}</Link>;
        }
    }

    if (type === "sponsor") {
        if (item.link && item.link.includes('.') && !item.link.includes('example')) {
            const safeUrl = item.link.startsWith('http') ? item.link : `https://${item.link}`;
            return <a href={safeUrl} target="_blank" rel="noopener noreferrer" className="block" aria-label={item.brand_name ? `Visiter ${item.brand_name}` : undefined} onMouseEnter={onEnter} onMouseLeave={onLeave}>{cardContent}</a>;
        }
    }

    return <div className="block cursor-default" onMouseEnter={onEnter} onMouseLeave={onLeave}>{cardContent}</div>;
}

export default function PremiumMarquee({ items, durationSeconds = 80 }: Props) {
    if (!items || items.length === 0) return null;

    const [paused, setPaused] = useState(false);
    const hoverCount = useRef(0);

    // Track enter/leave with a counter to handle overlapping hover zones (duplicate items)
    const handleEnter = useCallback(() => {
        hoverCount.current += 1;
        setPaused(true);
    }, []);

    const handleLeave = useCallback(() => {
        hoverCount.current = Math.max(0, hoverCount.current - 1);
        // Small delay to avoid flicker when moving between adjacent cards
        setTimeout(() => {
            if (hoverCount.current === 0) {
                setPaused(false);
            }
        }, 80);
    }, []);

    const renderItem = (it: PremiumItem, index: number) => {
        return (
            <div key={`${it.id}-${index}`} className="flex-shrink-0" >
                <MarqueeItem item={it} onEnter={handleEnter} onLeave={handleLeave} />
            </div>
        );
    };

    return (
        <section
            role="region"
            aria-roledescription="carousel"
            aria-label="Artisans et sponsors premium"
            className="relative flex overflow-hidden w-full py-2 bg-transparent border-none"
        >
            <div
                className="relative w-full overflow-hidden"
                style={{
                    WebkitMaskImage: 'linear-gradient(to right, transparent 0%, #000 10%, #000 90%, transparent 100%)',
                    maskImage: 'linear-gradient(to right, transparent 0%, #000 10%, #000 90%, transparent 100%)',
                }}
            >
                <div
                    className="flex w-max items-center gap-4 animate-marquee"
                    style={{
                        animationDuration: `${durationSeconds}s`,
                        animationPlayState: paused ? "paused" : "running",
                    }}
                >
                    {/* Render list twice for seamless loop */}
                    {items.map((item, index) => renderItem(item, index))}
                    {items.map((item, index) => renderItem(item, index + items.length))}
                </div>
            </div>
        </section>
    );
}