"use client";

import Image from "next/image";
import Link from "next/link";

type BaseProps = {
    id: string;
    variant: "artisan" | "sponsor" | "produit_pub";
    externalUrl?: string | null;
    // shared display fields
    title?: string;
    subtitle?: string;
    location?: string;
    image?: string;
    isVerified?: boolean;
    rating?: number;
};

export default function ItemCard(props: BaseProps) {
    const { id, variant, externalUrl, title, subtitle, location, image, rating, isVerified } = props;

    const focusClasses = "focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:outline-none";
    const isSponsor = variant === "sponsor";
    const isArtisan = variant === "artisan";
    const isProduct = variant === "produit_pub";

    const badgeLabel = isSponsor ? "Sponsor" : isArtisan ? "Premium" : isProduct ? "Offre" : "Premium";
    const ctaLabel = isSponsor ? "Visiter" : isProduct ? "Acheter" : "Voir profil";

    const baseClasses =
        "group w-[360px] h-[200px] rounded-[26px] p-4 flex-shrink-0 relative overflow-hidden transition-all duration-300 hover:scale-[1.03] shadow-apple-sm hover:shadow-apple-lg border border-border-default hover:border-border-prominent";

    const content = (
        <div className={`${baseClasses} ${focusClasses}`}>
            <div
                aria-hidden
                className={`absolute inset-0 transition-opacity duration-300 ${isSponsor
                        ? "bg-gradient-to-br from-[#fdfcf9] via-white to-[#f0efe6]"
                        : "bg-gradient-to-br from-surface-elevated via-white to-surface-raised"
                    }`}
            />
            {/* Added shine effect */}
            <div
                aria-hidden
                className="absolute inset-0 translate-x-[-150%] skew-x-[-25deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[150%] z-20 pointer-events-none"
            />
            <div
                aria-hidden
                className="absolute inset-0 opacity-40 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.65)_0px,rgba(255,255,255,0.65)_1px,rgba(0,0,0,0.015)_2px,rgba(255,255,255,0.25)_3px)] group-hover:opacity-60 transition-opacity duration-300"
            />
            <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(800px_circle_at_40%_0%,rgba(255,255,255,0.85),transparent_55%),radial-gradient(700px_circle_at_120%_110%,rgba(60,70,90,0.10),transparent_60%)]"
            />

            {/* Top row: badge + (optional) verification */}
            <div className="relative z-10 flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/5 px-2.5 py-1 text-[11px] font-bold tracking-wide text-slate-700 backdrop-blur-sm">
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-slate-700/70 shadow-sm" />
                    {badgeLabel}
                </div>
                {isArtisan && isVerified ? (
                    <div className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)] backdrop-blur-sm">
                        Verifie
                    </div>
                ) : null}
            </div>

            {/* Middle: identity + micro landing content */}
            <div className="relative mt-3 flex gap-4">
                <div className="relative h-[76px] w-[76px] flex-shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-black/5">
                    <Image
                        src={
                            image ??
                            (isSponsor
                                ? "/images/brand-placeholder.png"
                                : isProduct
                                    ? "/images/product-placeholder.png"
                                    : "/images/avatar-placeholder.png")
                        }
                        alt={title ?? (isSponsor ? "Sponsor" : isProduct ? "Produit" : "Artisan")}
                        width={96}
                        height={96}
                        className={isSponsor ? "object-contain h-full w-full p-2" : "object-cover h-full w-full"}
                    />
                    <span aria-hidden className="absolute inset-0 rounded-2xl ring-1 ring-white/60" />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px] font-semibold text-slate-900">{title ?? (isSponsor ? "Sponsor" : "Artisan")}</div>
                    <div className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-slate-600">
                        {subtitle ?? (isSponsor ? "Mise en avant premium" : "Prestataire")}
                    </div>

                    {isArtisan ? (
                        <div className="mt-2 flex items-center gap-2 text-[12px] text-slate-700">
                            <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-0.5 ring-1 ring-black/5">
                                <span className="text-amber-600" aria-hidden>
                                    ★
                                </span>
                                {typeof rating === "number" ? rating.toFixed(1) : "N/A"}
                            </span>
                            <span className="truncate text-slate-500">{subtitle ? "Disponible" : "Disponible"}</span>
                        </div>
                    ) : isSponsor ? (
                        <div className="mt-2 text-[12px] text-slate-500">Partenaire officiel</div>
                    ) : null}
                </div>
            </div>

            {/* Bottom: CTA + subtle hint */}
            <div className="relative mt-3 flex items-center justify-between">
                <div className="text-[11px] text-slate-500">{isSponsor ? "Offre limitee" : isArtisan ? "Interventions rapides" : ""}</div>
                <span className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm shadow-black/10 ring-1 ring-white/10">
                    {ctaLabel}
                    <span aria-hidden className="ml-1.5 opacity-80">
                        →
                    </span>
                </span>
            </div>

            <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.75),transparent_60%)] opacity-70 blur-2xl transition-opacity duration-300 group-hover:opacity-90" />
            <div aria-hidden className="pointer-events-none absolute -left-24 -bottom-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(90,110,160,0.18),transparent_60%)] opacity-60 blur-2xl" />
        </div>
    );

    // Helper: check if id looks like a real Supabase UUID
    const isValidUUID = id ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) : false;

    // Routing wrapper per variant
    switch (variant) {
        case "artisan":
            // Si l'admin a imposé un URL manuel
            if (externalUrl) {
                return (
                    <Link href={externalUrl} className="block" aria-label={title}>
                        {content}
                    </Link>
                );
            }
            if (isValidUUID) {
                return (
                    <Link href={`/artisan/${id}`} className="block" aria-label={title}>
                        {content}
                    </Link>
                );
            }
            return <div className="block cursor-default">{content}</div>;


        case "sponsor":
            if (externalUrl && externalUrl.includes('.') && !externalUrl.includes('example')) {
                const safeUrl = externalUrl.startsWith('http') ? externalUrl : `https://${externalUrl}`;
                return (
                    <a href={safeUrl} target="_blank" rel="noopener noreferrer" className="block" aria-label={title ? `Visiter ${title}` : undefined}>
                        {content}
                    </a>
                );
            }
            // Pas de lien externe valide → carte non-cliquable
            return <div className="block cursor-default">{content}</div>;

        case "produit_pub":
            if (externalUrl && externalUrl.includes('.') && !externalUrl.includes('example')) {
                const safeUrl = externalUrl.startsWith('http') ? externalUrl : `https://${externalUrl}`;
                return (
                    <a href={safeUrl} target="_blank" rel="noopener noreferrer" className="block" aria-label={title ? `Acheter ${title}` : undefined}>
                        {content}
                    </a>
                );
            }
            return <div className="block cursor-default">{content}</div>;

        default:
            return <div className="block cursor-default">{content}</div>;
    }
}

