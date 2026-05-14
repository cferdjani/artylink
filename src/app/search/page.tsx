import { ArtisanList } from "@/components/features/artisan-list";
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
        <div className="mx-auto w-full max-w-[1320px] px-4 md:px-8 xl:px-12 pb-24 pt-6">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start">

                {/* SIDEBAR FILTERS (Left Column) */}
                <aside className="w-full lg:w-[280px] xl:w-[320px] shrink-0 lg:sticky lg:top-[180px] z-10">
                    <div className="rounded-3xl border border-white/60 bg-white/40 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl flex flex-col gap-6">
                        <div>
                            <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                                <Funnel className="w-5 h-5 text-primary" />
                                Filtres
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {params.q && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                                        "{params.q}"
                                    </span>
                                )}
                                {params.wilaya && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                                        {params.wilaya}
                                    </span>
                                )}
                                {params.commune && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                                        {params.commune}
                                    </span>
                                )}
                                {params.category && params.category !== "tous-services" && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-3 py-1.5 text-xs font-bold text-secondary">
                                        {params.category}
                                    </span>
                                )}
                                {params.subcategory && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-3 py-1.5 text-xs font-bold text-secondary">
                                        {params.subcategory}
                                    </span>
                                )}
                                {!params.q && !params.wilaya && !params.category && (
                                    <span className="text-sm font-medium text-slate-500">Aucun filtre actif</span>
                                )}
                            </div>
                        </div>

                        <div className="h-px w-full bg-slate-200/50" />
                        <CalendarSearchFilter />

                        {categorySchema && categorySchema.length > 0 && (
                            <>
                                <div className="h-px w-full bg-slate-200/50" />
                                <QualificationFilter schema={categorySchema} />
                            </>
                        )}
                    </div>
                </aside>

                {/* RESULTS GRID (Right Column) */}
                <div className="flex-1 min-w-0">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                Artisans disponibles
                            </h1>
                            <p className="mt-1 text-sm font-medium text-slate-500">
                                {totalCount} {totalCount > 1 ? "résultats trouvés" : "résultat trouvé"}
                            </p>
                        </div>
                    </div>

                    {!user && filtered.length > 0 && (
                        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm font-medium text-slate-800">
                            <p>Inscrivez-vous gratuitement pour débloquer l'accès aux coordonnées et contacter directement ces professionnels.</p>
                            <Link href="/auth/register-type" className="whitespace-nowrap rounded-xl bg-primary px-4 py-2 font-bold text-white transition hover:bg-blue-600">
                                Créer un compte
                            </Link>
                        </div>
                    )}

                    {filtered.length === 0 ? (
                        <div className="rounded-3xl border border-white/60 bg-white/40 p-8 text-center shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl">
                            <h2 className="text-xl font-bold text-slate-900">Aucun résultat</h2>
                            <p className="mt-2 text-sm text-slate-500">
                                Essayez une autre combinaison métier + localisation.
                            </p>
                        </div>
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
            </div>
        </div>
    );
}
