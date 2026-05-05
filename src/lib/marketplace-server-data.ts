import {
    featuredArtisans,
    featuredCategories,
    type MarketplaceArtisan,
    type MarketplaceCategory,
} from "@/lib/marketplace-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { unstable_cache } from "next/cache";

type DbCategory = {
    id: string;
    slug: string;
    name: string;
    icon: string | null;
};

type DbSubcategory = {
    category_id: string;
    slug: string;
    name: string;
};

type SearchArtisanRpcRow = {
    artisan_id: string;
    full_name: string | null;
    wilaya: string;
    city: string | null;
    wilaya_code: string | null;
    city_id: number | null;
    is_verified: boolean;
    rating: number | null;
    review_count: number | null;
    category_slug: string | null;
    category_name: string | null;
    rank_score: number | null;
    total_count: number | null;
    phone: string | null;
    email: string | null;
    avatar_url: string | null;
};

type DbArtisanRow = {
    id: string;
    profession: string | null;
    specialties: string[] | null;
    wilaya: string;
    city: string | null;
    is_verified: boolean;
    rating: number | null;
    review_count: number | null;
    badges: string[] | null;
    profiles:
    | {
        full_name: string | null;
        phone: string | null;
        email: string | null;
        avatar_url: string | null;
        age: number | null;
        wilaya: string | null;
        commune: string | null;
    }
    | {
        full_name: string | null;
        phone: string | null;
        email: string | null;
        avatar_url: string | null;
        age: number | null;
        wilaya: string | null;
        commune: string | null;
    }[]
    | null;
    artisan_categories:
    | {
        is_primary: boolean | null;
        categories:
        | {
            slug: string;
            name: string;
        }
        | {
            slug: string;
            name: string;
        }[]
        | null;
    }[]
    | null;
};

type SearchArtisanDetailRow = {
    id: string;
    profession: string | null;
    specialties: string[] | null;
    profiles:
    | {
        age: number | null;
        wilaya: string | null;
        commune: string | null;
    }
    | {
        age: number | null;
        wilaya: string | null;
        commune: string | null;
    }[]
    | null;
};

function normalizeTextValue(value: string | null | undefined) {
    const normalized = value?.trim();
    return normalized ? normalized : null;
}

function getPublicProfession(params: {
    profession?: string | null;
    categoryLabel?: string | null;
}) {
    return normalizeTextValue(params.profession) ?? normalizeTextValue(params.categoryLabel);
}

function getPublicSpecialties(value: string[] | null | undefined) {
    return (value ?? []).map((entry) => entry.trim()).filter(Boolean);
}

function getPublicServiceTitle(params: {
    specialties?: string[] | null;
    profession?: string | null;
    categoryLabel?: string | null;
    fallback?: string | null;
}) {
    return (
        getPublicSpecialties(params.specialties)[0] ??
        getPublicProfession({ profession: params.profession, categoryLabel: params.categoryLabel }) ??
        normalizeTextValue(params.fallback) ??
        "Prestataire de services"
    );
}

function mapDbArtisan(row: DbArtisanRow, index: number): MarketplaceArtisan {
    const profile = pickFirst(row.profiles);
    const categories = row.artisan_categories ?? [];
    const primary = categories.find((item) => item.is_primary) ?? categories[0] ?? null;
    const primaryCategory = pickFirst(primary?.categories ?? null);
    const profession = getPublicProfession({
        profession: row.profession,
        categoryLabel: primaryCategory?.name,
    });
    const specialties = getPublicSpecialties(row.specialties);
    const wilaya = normalizeTextValue(row.wilaya) ?? normalizeTextValue(profile?.wilaya) ?? "Wilaya non precisee";
    const commune =
        normalizeTextValue(row.city) ??
        normalizeTextValue(profile?.commune) ??
        "Commune non precisee";

    return {
        id: row.id,
        name: profile?.full_name || "Artisan",
        categorySlug: primaryCategory?.slug || "services",
        categoryLabel: primaryCategory?.name || "Services",
        serviceTitle: getPublicServiceTitle({
            specialties,
            profession,
            categoryLabel: primaryCategory?.name,
            fallback: primaryCategory?.name,
        }),
        profession: profession ?? undefined,
        specialties,
        age: profile?.age ?? null,
        wilaya,
        commune,
        isVerified: Boolean(row.is_verified),
        ratingAvg: Number(row.rating ?? 0),
        reviewsCount: Number(row.review_count ?? 0),
        phone: profile?.phone || "",
        email: profile?.email || undefined,
        avatarUrl: profile?.avatar_url || `https://i.pravatar.cc/180?img=${(index % 70) + 1}`,
        badges: row.badges || [],
    };
}

function pickFirst<T>(value: T | T[] | null | undefined): T | null {
    if (Array.isArray(value)) {
        return value[0] ?? null;
    }
    return value ?? null;
}

function toIconSlug(rawIcon: string | null | undefined) {
    if (!rawIcon || !rawIcon.trim()) {
        return "Wrench";
    }

    const icon = rawIcon.trim();
    return icon.charAt(0).toUpperCase() + icon.slice(1);
}

export const getHomepageCategories = unstable_cache(
    async (): Promise<MarketplaceCategory[]> => {
        try {
            const supabase = createSupabasePublicClient();

            const [{ data: categories, error: categoriesError }, { data: subcategories, error: subcategoriesError }] =
                await Promise.all([
                    supabase.from("categories").select("id, slug, name, icon").order("is_popular", { ascending: false }).order("name"),
                    supabase.from("subcategories").select("category_id, slug, name").order("name"),
                ]);

            if (categoriesError || subcategoriesError || !categories?.length) {
                return featuredCategories;
            }

            const byCategoryId = new Map<string, DbSubcategory[]>();
            (subcategories as DbSubcategory[]).forEach((sub) => {
                const list = byCategoryId.get(sub.category_id) ?? [];
                list.push(sub);
                byCategoryId.set(sub.category_id, list);
            });

            return (categories as DbCategory[]).map((category) => ({
                slug: category.slug,
                name: category.name,
                iconSlug: toIconSlug(category.icon),
                subcategories: (byCategoryId.get(category.id) ?? []).map((sub) => ({
                    slug: sub.slug,
                    name: sub.name,
                })),
            }));
        } catch {
            return featuredCategories;
        }
    },
    ["categories"],
    { revalidate: 3600 }
);

export const getFeaturedArtisans = unstable_cache(
    async (limit = 8): Promise<MarketplaceArtisan[]> => {
        try {
            const supabase = createSupabasePublicClient();

            const { data, error } = await supabase
                .from("artisans")
                .select(
                    "id, profession, specialties, wilaya, city, is_verified, rating, review_count, badges, profiles(full_name,email,phone,avatar_url,age,wilaya,commune), artisan_categories(is_primary,categories(slug,name))",
                )
                .order("rating", { ascending: false })
                .limit(limit);

            if (error || !data?.length) {
                return featuredArtisans.slice(0, limit);
            }

            return (data as DbArtisanRow[]).map((row, index) => mapDbArtisan(row, index));
        } catch {
            return featuredArtisans.slice(0, limit);
        }
    },
    ["featured-artisans"],
    { revalidate: 3600 }
);


export async function searchArtisans(params: {
    q?: string;
    wilaya?: string;
    commune?: string;
    category?: string;
    subcategory?: string;
    date?: string;
    slots?: string;
    qualifiers?: string;
    limit?: number;
    offset?: number;
}): Promise<{ artisans: MarketplaceArtisan[]; totalCount: number; availableArtisanIds?: string[]; qualifiedArtisanIds?: string[] }> {
    try {
        const supabase = await createSupabaseServerClient();

        let p_wilaya_code: string | null = null;
        let p_city_id: number | null = null;

        // 1. Resolve wilaya code
        if (params.wilaya && params.wilaya !== 'toute-l-algerie') {
            const wilayaStr = params.wilaya.replace(/-/g, '%');
            const { data: wData } = await supabase
                .from('algeria_cities')
                .select('wilaya_code')
                .ilike('wilaya_name_ascii', `%${wilayaStr}%`)
                .limit(1)
                .maybeSingle();

            if (wData) {
                p_wilaya_code = wData.wilaya_code;
            }
        }

        // 2. Resolve city ID
        if (params.commune && params.commune !== 'toutes-communes') {
            const communeStr = params.commune.replace(/-/g, '%');
            let q = supabase
                .from('algeria_cities')
                .select('id')
                .ilike('commune_name_ascii', `%${communeStr}%`);

            if (p_wilaya_code) {
                q = q.eq('wilaya_code', p_wilaya_code);
            }

            const { data: cData } = await q.limit(1).maybeSingle();

            if (cData) {
                p_city_id = cData.id;
            }
        }

        const p_category_slug = (params.category && params.category !== 'tous-services') ? params.category : null;
        const p_q = params.q || null;
        const p_limit = params.limit ?? 36;
        const p_offset = params.offset ?? 0;

        // 3. Call the advanced search RPC
        const { data, error } = await supabase.rpc('search_artisans_advanced', {
            p_q,
            p_category_slug,
            p_wilaya_code,
            p_city_id,
            p_min_rating: null,
            p_verified_only: false,
            p_limit,
            p_offset
        });

        if (error || !data?.length) {
            console.log('Search DB error or empty:', error);
            const fallback = featuredArtisans.slice(0, p_limit);
            return { artisans: fallback, totalCount: fallback.length };
        }

        let publicDetailsById = new Map<string, SearchArtisanDetailRow>();
        const artisanIds = (data as SearchArtisanRpcRow[]).map((row) => row.artisan_id);

        if (artisanIds.length > 0) {
            const { data: detailRows } = await supabase
                .from("artisans")
                .select("id, profession, specialties, profiles(age,wilaya,commune)")
                .in("id", artisanIds);

            publicDetailsById = new Map(
                ((detailRows ?? []) as SearchArtisanDetailRow[]).map((row) => [row.id, row]),
            );
        }

        let availableArtisanIds: string[] | undefined = undefined;

        if (params.date) {
            const slotsQuery = supabase
                .from('availability_slots')
                .select('artisan_id')
                .eq('slot_date', params.date)
                .eq('is_booked', false);

            const { data: slotsData, error: slotsError } = await slotsQuery;
            if (!slotsError && slotsData) {
                availableArtisanIds = Array.from(new Set(slotsData.map((slot: { artisan_id: string }) => slot.artisan_id)));
            } else {
                availableArtisanIds = undefined;
            }
        }

        let qualifiedArtisanIds: string[] | undefined = undefined;

        if (params.qualifiers) {
            try {
                const parsed = JSON.parse(decodeURIComponent(params.qualifiers));
                const { data: qualData, error: qualError } = await supabase
                    .from('qualification_answers')
                    .select('artisan_id')
                    .contains('answers_json', parsed);

                if (!qualError && qualData) {
                    qualifiedArtisanIds = Array.from(new Set(qualData.map((entry: { artisan_id: string }) => entry.artisan_id)));
                } else {
                    qualifiedArtisanIds = undefined;
                }
            } catch {
                qualifiedArtisanIds = undefined;
            }
        }

        // 4. Map RPC results to frontend model
        const rpcRows = data as SearchArtisanRpcRow[];
        const mapped = rpcRows.map((row, index: number) => ({
            ...(() => {
                const detail = publicDetailsById.get(row.artisan_id);
                const profile = pickFirst(detail?.profiles);
                const profession = getPublicProfession({
                    profession: detail?.profession,
                    categoryLabel: row.category_name,
                });
                const specialties = getPublicSpecialties(detail?.specialties);

                return {
                    profession: profession ?? undefined,
                    specialties,
                    age: profile?.age ?? null,
                    wilaya: normalizeTextValue(row.wilaya) ?? normalizeTextValue(profile?.wilaya) ?? "Wilaya non precisee",
                    commune:
                        normalizeTextValue(row.city) ??
                        normalizeTextValue(profile?.commune) ??
                        "Commune non precisee",
                    serviceTitle: getPublicServiceTitle({
                        specialties,
                        profession,
                        categoryLabel: row.category_name,
                        fallback: row.category_name,
                    }),
                };
            })(),
            id: row.artisan_id,
            name: row.full_name || "Artisan",
            categorySlug: row.category_slug || "services",
            categoryLabel: row.category_name || "Services",
            isVerified: Boolean(row.is_verified),
            ratingAvg: Number(row.rating ?? 0),
            reviewsCount: Number(row.review_count ?? 0),
            phone: row.phone || "",
            email: row.email || undefined,
            avatarUrl: row.avatar_url || `https://i.pravatar.cc/180?img=${(index % 70) + 1}`,
        }));

        const totalCount = Number(rpcRows[0]?.total_count ?? mapped.length);
        return { artisans: mapped, totalCount, availableArtisanIds, qualifiedArtisanIds };
    } catch (e) {
        console.error('searchArtisans exception', e);
        const fb = featuredArtisans.slice(0, params.limit ?? 36);
        return { artisans: fb, totalCount: fb.length };
    }
}

export async function getArtisanById(id: string): Promise<MarketplaceArtisan | null> {
    try {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .from("artisans")
            .select(
                "id, profession, specialties, wilaya, city, is_verified, rating, review_count, badges, profiles(full_name,email,phone,avatar_url,age,wilaya,commune), artisan_categories(is_primary,categories(slug,name))",
            )
            .eq("id", id)
            .maybeSingle();

        if (error || !data) {
            return featuredArtisans.find((entry) => entry.id === id) ?? null;
        }

        return mapDbArtisan(data as DbArtisanRow, 0);
    } catch {
        return featuredArtisans.find((entry) => entry.id === id) ?? null;
    }
}

export async function getSimilarArtisans(
    currentId: string,
    wilaya: string,
    limit = 3,
): Promise<MarketplaceArtisan[]> {
    try {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .from("artisans")
            .select(
                "id, profession, specialties, wilaya, city, is_verified, rating, review_count, badges, profiles(full_name,email,phone,avatar_url,age,wilaya,commune), artisan_categories(is_primary,categories(slug,name))",
            )
            .eq("wilaya", wilaya)
            .neq("id", currentId)
            .order("rating", { ascending: false })
            .limit(limit);

        if (error || !data?.length) {
            return featuredArtisans
                .filter((a) => a.id !== currentId && a.wilaya === wilaya)
                .slice(0, limit);
        }

        return (data as DbArtisanRow[]).map((row, index) => mapDbArtisan(row, index));
    } catch {
        return featuredArtisans
            .filter((a) => a.id !== currentId && a.wilaya === wilaya)
            .slice(0, limit);
    }
}
export type DbPortfolioItem = {
    id: string;
    artisan_id: string;
    image_url: string;
    caption: string | null;
    display_order: number | null;
    created_at: string;
};

export async function getArtisanPortfolio(artisanId: string): Promise<DbPortfolioItem[]> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase
            .from("artisan_portfolios")
            .select("id, artisan_id, image_url, caption, display_order, created_at")
            .eq("artisan_id", artisanId)
            .order("display_order", { ascending: true })
            .order("created_at", { ascending: false });

        if (error || !data) {
            return [];
        }

        return data as DbPortfolioItem[];
    } catch {
        return [];
    }
}

export type ReviewItem = {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    client_name: string;
    client_avatar: string | null;
};

export async function getArtisanReviews(artisanId: string, limit = 5): Promise<ReviewItem[]> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase
            .from("reviews")
            .select(`
                id,
                rating,
                comment,
                created_at,
                profiles!client_id (
                    full_name,
                    avatar_url
                )
            `)
            .eq("artisan_id", artisanId)
            .eq("status", "approved")
            .order("created_at", { ascending: false })
            .limit(limit);

        if (error || !data) return [];

        return data.map((row: {
            id: string;
            rating: number;
            comment: string | null;
            created_at: string;
            profiles: { full_name: string | null; avatar_url: string | null } | { full_name: string | null; avatar_url: string | null }[] | null;
        }) => {
            const profile = pickFirst(row.profiles);
            return {
                id: row.id,
                rating: row.rating,
                comment: row.comment,
                created_at: row.created_at,
                client_name: profile?.full_name || "Client anonyme",
                client_avatar: profile?.avatar_url || null,
            };
        });
    } catch {
        return [];
    }
}
