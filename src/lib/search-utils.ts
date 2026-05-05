import type { MarketplaceArtisan } from "@/lib/marketplace-data";

export type ArtisanSearchFilters = {
    q?: string;
    wilaya?: string;
    commune?: string;
    category?: string;
    subcategory?: string;
    date?: string;
    slots?: string;
    qualifiers?: string;
    availableArtisanIds?: string[];
    qualifiedArtisanIds?: string[];
};

export function normalizeText(value: string) {
    return value
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .replace(/[-_']/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

export function toSlug(value: string) {
    return normalizeText(value).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function humanizeSlug(slug: string) {
    if (!slug) {
        return "";
    }

    return slug
        .split("-")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

export function buildRechercheHref(input: {
    category?: string;
    wilaya?: string;
    commune?: string;
    q?: string;
    subcategory?: string;
    page?: number;
}) {
    // Si la catégorie n'est pas spécifiée, on passe en mode "tous-services"
    const category = input.category ? toSlug(input.category) : "tous-services";

    // Suppression des fallbacks durs: si non fourni, on omet dans l'URL pour garder le scope national
    const wilaya = input.wilaya ? toSlug(input.wilaya) : "toute-l-algerie";
    const commune = input.commune ? toSlug(input.commune) : "toutes-communes";

    const params = new URLSearchParams();

    if (input.q && input.q.trim()) {
        params.set("q", input.q.trim());
    }

    if (input.subcategory && input.subcategory.trim()) {
        params.set("subcategory", input.subcategory.trim());
    }

    if (input.page && input.page > 1) {
        params.set("page", input.page.toString());
    }

    const qs = params.toString();
    const path = `/recherche/${category}/${wilaya}/${commune}`;

    return qs ? `${path}?${qs}` : path;
}

export function filterArtisans(
    artisans: MarketplaceArtisan[],
    filters: ArtisanSearchFilters,
) {
    const q = normalizeText(filters.q ?? "");
    const wilaya = normalizeText(filters.wilaya ?? "");
    const commune = normalizeText(filters.commune ?? "");
    const category = normalizeText(filters.category ?? "");
    const subcategory = normalizeText(filters.subcategory ?? "");

    return artisans.filter((artisan) => {
        const artisanName = normalizeText(artisan.name);
        const artisanService = normalizeText(artisan.serviceTitle);
        const artisanCategory = normalizeText(artisan.categoryLabel);
        const artisanCategorySlug = normalizeText(artisan.categorySlug);
        const artisanProfession = normalizeText(artisan.profession ?? "");
        const artisanSpecialties = normalizeText((artisan.specialties ?? []).join(" "));
        const artisanWilaya = normalizeText(artisan.wilaya);
        const artisanCommune = normalizeText(artisan.commune);

        const matchQuery =
            q.length === 0 ||
            artisanName.includes(q) ||
            artisanService.includes(q) ||
            artisanCategory.includes(q) ||
            artisanProfession.includes(q) ||
            artisanSpecialties.includes(q);

        const matchWilaya =
            wilaya.length === 0 ||
            wilaya === "toute-l-algerie" ||
            artisanWilaya.includes(wilaya);

        const matchCommune =
            commune.length === 0 ||
            commune === "toutes-communes" ||
            artisanCommune.includes(commune);

        const matchCategory =
            category.length === 0 ||
            category === "tous-services" ||
            artisanCategorySlug.includes(category) ||
            artisanCategory.includes(category);

        const matchSubcategory =
            subcategory.length === 0 ||
            artisanService.includes(subcategory) ||
            artisanCategory.includes(subcategory) ||
            artisanProfession.includes(subcategory) ||
            artisanSpecialties.includes(subcategory);

        const matchAvailable =
            !filters.availableArtisanIds ||
            filters.availableArtisanIds.includes(artisan.id);

        const matchQualified =
            !filters.qualifiedArtisanIds ||
            filters.qualifiedArtisanIds.includes(artisan.id);

        return (
            matchQuery &&
            matchWilaya &&
            matchCommune &&
            matchCategory &&
            matchSubcategory &&
            matchAvailable &&
            matchQualified
        );
    });
}

export function sortArtisansByTrustAndRating(artisans: MarketplaceArtisan[]) {
    return [...artisans].sort((a, b) => {
        return b.ratingAvg - a.ratingAvg;
    });
}
