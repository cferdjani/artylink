import { ArtisanList } from "@/components/features/artisan-list";
import { GlassCard } from "@/components/ui/glass-card";
import { searchArtisans } from "@/lib/marketplace-server-data";
import {
    buildRechercheHref,
    filterArtisans,
    humanizeSlug,
    sortArtisansByTrustAndRating,
} from "@/lib/search-utils";
import type { Metadata } from "next";
import Link from "next/link";

type RechercheRouteParams = {
    category: string;
    wilaya: string;
    commune: string;
};

type RecherchePageSearchParams = {
    q?: string;
    subcategory?: string;
    page?: string;
};

type RecherchePageProps = {
    params: Promise<RechercheRouteParams>;
    searchParams: Promise<RecherchePageSearchParams>;
};

export async function generateMetadata({
    params,
    searchParams,
}: RecherchePageProps): Promise<Metadata> {
    const route = await params;
    const qs = await searchParams;

    const categoryLabel =
        route.category === "tous-services"
            ? "Services locaux"
            : humanizeSlug(route.category);
    const wilayaLabel = humanizeSlug(route.wilaya);
    const communeLabel = humanizeSlug(route.commune);
    const canonical = buildRechercheHref({
        category: route.category,
        wilaya: route.wilaya,
        commune: route.commune,
        q: qs.q,
        subcategory: qs.subcategory,
    });

    return {
        title: `${categoryLabel} a ${communeLabel}, ${wilayaLabel}`,
        description: `Trouvez des annonces et cartes de visite en ${categoryLabel.toLowerCase()} a ${communeLabel}, ${wilayaLabel}.`,
        alternates: {
            canonical,
        },
    };
}

export default async function RechercheLocalePage({
    params,
    searchParams,
}: RecherchePageProps) {
    const route = await params;
    const qs = await searchParams;

    const categorySlug = route.category || "tous-services";
    const wilayaLabel = humanizeSlug(route.wilaya || "alger");
    const communeLabel = humanizeSlug(route.commune || "baba-hassen");
    const categoryLabel =
        categorySlug === "tous-services"
            ? "Tous les services"
            : humanizeSlug(categorySlug);

    const page = Math.max(1, parseInt(qs.page || "1", 10));
    const limit = 36;
    const offset = (page - 1) * limit;

    const { artisans } = await searchArtisans({
        q: qs.q,
        category: categorySlug,
        wilaya: route.wilaya,
        commune: route.commune,
        subcategory: qs.subcategory,
        limit,
        offset,
    });

    // Le filtrage memoire passe en deuxieme fil pour sous-categories mock etc
    const filtered = filterArtisans(artisans, {
        q: qs.q,
        category: categorySlug,
        wilaya: wilayaLabel,
        commune: communeLabel,
        subcategory: qs.subcategory,
    });
    const sortedArtisans = sortArtisansByTrustAndRating(filtered);

    const displayCount = sortedArtisans.length;
    const totalPages = Math.max(1, Math.ceil(displayCount / limit));
    const buildLocalPageHref = (targetPage: number) =>
        buildRechercheHref({
            category: route.category,
            wilaya: route.wilaya,
            commune: route.commune,
            q: qs.q,
            subcategory: qs.subcategory,
            page: targetPage,
        });

    return (
        <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 md:px-8">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-text-primary flex items-center flex-wrap gap-3">
                        {categoryLabel} a {communeLabel}, {wilayaLabel}
                        <a href="#results" className="rounded-full bg-primary/20 ring-1 ring-primary/30 px-3 py-1 text-base font-semibold text-primary cursor-pointer hover:bg-primary/25">
                            {displayCount} {displayCount > 1 ? "résultats" : "résultat"}
                        </a>
                    </h1>
                    <p className="mt-2 text-sm font-medium text-text-primary">
                        Tri: pertinence locale, visibilité active puis activité du profil.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Link
                        href="/"
                        className="rounded-lg border border-white/60 bg-white/70 px-3 py-2 text-sm font-semibold text-text-primary"
                    >
                        Retour accueil
                    </Link>
                    <Link
                        href={`/search?q=${encodeURIComponent(qs.q ?? "")}&wilaya=${encodeURIComponent(wilayaLabel)}&commune=${encodeURIComponent(communeLabel)}&category=${encodeURIComponent(categorySlug)}${qs.subcategory ? `&subcategory=${encodeURIComponent(qs.subcategory)}` : ""}`}
                        className="rounded-lg bg-primary/80 px-3 py-2 text-sm font-semibold text-white"
                    >
                        Vue filtres classique
                    </Link>
                </div>
            </div>

            {sortedArtisans.length === 0 ? (
                <GlassCard className="p-8 text-center">
                    <h2 className="text-xl font-bold text-text-primary">Aucun resultat local</h2>
                    <p className="mt-2 text-sm text-text-secondary">
                        Essayez un autre metier, wilaya ou commune.
                    </p>
                </GlassCard>
            ) : (
                <div id="results">
                    <ArtisanList
                        variant="grid"
                        artisans={sortedArtisans}
                        pagination={{
                            currentPage: page,
                            totalPages,
                            previousHref: page > 1 ? buildLocalPageHref(page - 1) : undefined,
                            nextHref: page < totalPages ? buildLocalPageHref(page + 1) : undefined,
                        }}
                    />
                </div>
            )}
        </div>
    );
}
