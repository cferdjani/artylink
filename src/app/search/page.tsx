import { ArtisanList } from "@/components/features/artisan-list";
import { GlassCard } from "@/components/ui/glass-card";
import { getQualificationTemplate } from "@/lib/actions/qualifications";
import { searchArtisans } from "@/lib/marketplace-server-data";
import {
    filterArtisans,
    sortArtisansByTrustAndRating,
} from "@/lib/search-utils";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Funnel } from "lucide-react";
import Link from "next/link";
import CalendarSearchFilter from "./components/CalendarSearchFilter";
import QualificationFilter from "./components/QualificationFilter";

type SearchParams = {
    q?: string;
    wilaya?: string;
    commune?: string;
    category?: string;
    subcategory?: string;
    page?: string;
    date?: string;
    slots?: string;
    qualifiers?: string;
};

type SearchPageProps = {
    searchParams: Promise<SearchParams>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const params = await searchParams;
    const page = Math.max(1, parseInt(params.page || "1", 10));
    const limit = 36;
    const offset = (page - 1) * limit;

    const { artisans, totalCount, availableArtisanIds, qualifiedArtisanIds } = await searchArtisans({
        ...params,
        limit,
        offset
    });

    // Fallback: we still run filterArtisans for safety on subcategories etc which aren't in DB query yet
    const filtered = filterArtisans(artisans, { ...params, availableArtisanIds, qualifiedArtisanIds });
    const sortedArtisans = sortArtisansByTrustAndRating(filtered);
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));
    const buildSearchPageHref = (targetPage: number) => {
        const newParams = new URLSearchParams();
        if (params.q) newParams.set("q", params.q);
        if (params.wilaya) newParams.set("wilaya", params.wilaya);
        if (params.commune) newParams.set("commune", params.commune);
        if (params.category) newParams.set("category", params.category);
        if (params.subcategory) newParams.set("subcategory", params.subcategory);
        if (targetPage > 1) newParams.set("page", targetPage.toString());
        const query = newParams.toString();
        return query ? `/search?${query}` : "/search";
    };

    // Fetch category specific schema if category is selected
    const categorySchema = (params.category && params.category !== "tous-services") ? await getQualificationTemplate(params.category) : [];
    return (
        <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 md:px-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-text-primary flex items-center flex-wrap gap-3">
                        Resultats de recherche
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-base font-medium text-primary">
                            {totalCount} {totalCount > 1 ? "résultats" : "résultat"}
                        </span>
                    </h1>
                    <p className="mt-2 text-sm text-text-secondary">
                        Tri initial: pertinence locale, visibilité active puis activité du profil.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Link
                        href="/"
                        className="rounded-lg border border-white/60 bg-white/70 px-3 py-2 text-sm font-semibold text-text-primary"
                    >
                        Retour accueil
                    </Link>
                </div>
            </div>

            <GlassCard className="mb-6 p-4">
                <div className="flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Funnel size={16} />
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                        {params.q && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                                Recherche : {params.q}
                            </span>
                        )}
                        {params.wilaya && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                                Wilaya : {params.wilaya}
                            </span>
                        )}
                        {params.commune && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                                Commune : {params.commune}
                            </span>
                        )}
                        {params.category && params.category !== "tous-services" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-3 py-1 text-xs font-bold text-secondary">
                                {params.category}
                            </span>
                        )}
                        {params.subcategory && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-3 py-1 text-xs font-bold text-secondary">
                                {params.subcategory}
                            </span>
                        )}
                        {!params.q && !params.wilaya && !params.category && (
                            <span className="text-sm text-text-secondary font-medium">Aucun filtre actif</span>
                        )}
                    </div>
                </div>
                <CalendarSearchFilter />
                <QualificationFilter schema={categorySchema} />
            </GlassCard>

            {!user && filtered.length > 0 && (
                <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm font-medium text-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p>Inscrivez-vous gratuitement pour débloquer l'accès aux coordonnées et contacter directement ces professionnels.</p>
                    <Link href="/auth/register-type" className="whitespace-nowrap font-bold text-primary hover:underline">Créer un compte</Link>
                </div>
            )}

            {filtered.length === 0 ? (
                <GlassCard className="p-8 text-center">
                    <h2 className="text-xl font-bold text-text-primary">Aucun resultat</h2>
                    <p className="mt-2 text-sm text-text-secondary">
                        Essaie une autre combinaison metier + localisation.
                    </p>
                </GlassCard>
            ) : (
                <ArtisanList
                    variant="grid"
                    artisans={sortedArtisans}
                    pagination={{
                        currentPage: page,
                        totalPages,
                        previousHref: page > 1 ? buildSearchPageHref(page - 1) : undefined,
                        nextHref: page < totalPages ? buildSearchPageHref(page + 1) : undefined,
                    }}
                />
            )}
        </div>
    );
}
