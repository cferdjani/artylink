import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AccountArtisanRecord, AccountProfileRecord } from "./types";

type AuthUserLike = {
    id: string;
    email?: string | null;
    user_metadata?: Record<string, unknown> | null;
};

type CategoryRef = { name?: string | null } | null;

function extractCategoryName(value: CategoryRef | CategoryRef[] | undefined) {
    if (!value) {
        return null;
    }

    if (Array.isArray(value)) {
        return value[0]?.name ?? null;
    }

    return value.name ?? null;
}

function splitDisplayName(fullName: string | null | undefined) {
    const normalized = fullName?.trim() ?? "";

    if (!normalized) {
        return { firstName: null, lastName: null };
    }

    const [firstName, ...rest] = normalized.split(/\s+/);
    return {
        firstName: firstName || null,
        lastName: rest.length > 0 ? rest.join(" ") : null,
    };
}

async function loadArtisanTaxonomy(
    supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
    artisanId: string,
) {
    const [{ data: categoryLinks }, { data: subcategoryLinks }] = await Promise.all([
        supabase
            .from("artisan_categories")
            .select("is_primary, categories(name)")
            .eq("artisan_id", artisanId),
        supabase
            .from("artisan_subcategories")
            .select("subcategory_id")
            .eq("artisan_id", artisanId),
    ]);

    const primaryCategory =
        (categoryLinks ?? []).find((entry) => entry.is_primary)?.categories ??
        categoryLinks?.[0]?.categories ??
        null;

    const subcategoryIds = (subcategoryLinks ?? []).map((entry) => entry.subcategory_id);
    let specialties: string[] | null = null;

    if (subcategoryIds.length > 0) {
        const { data: subcategories } = await supabase
            .from("subcategories")
            .select("id, name")
            .in("id", subcategoryIds);

        specialties = subcategoryIds
            .map((id) => subcategories?.find((entry) => entry.id === id)?.name ?? null)
            .filter((value): value is string => Boolean(value));
    }

    const categoryName = extractCategoryName(primaryCategory as CategoryRef | CategoryRef[] | undefined);

    return {
        profession: categoryName,
        specialties,
    };
}

export async function loadAccountViewData(
    supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
    user: AuthUserLike,
): Promise<{ profile: AccountProfileRecord; artisan: AccountArtisanRecord | null }> {
    const { data: profile } = await supabase
        .from("profiles")
        .select("id, email, full_name, first_name, last_name, age, phone, role, avatar_url, wilaya, commune, city")
        .eq("id", user.id)
        .maybeSingle();

    const metadata = user.user_metadata ?? {};
    const roleFromMetadata = typeof metadata.role === "string" ? metadata.role : null;
    const inferredNames = splitDisplayName(
        profile?.full_name ??
        (typeof metadata.full_name === "string" ? metadata.full_name : null),
    );

    let artisan: AccountArtisanRecord | null = null;
    const resolvedRole = profile?.role ?? roleFromMetadata ?? "client";

    if (resolvedRole === "artisan") {
        const [{ data }, taxonomy] = await Promise.all([
            supabase
                .from("artisans")
                .select("id, bio, company_name, profession, specialties, wilaya, city, address, hourly_rate, currency, availability_status, years_of_experience")
                .eq("id", user.id)
                .maybeSingle(),
            loadArtisanTaxonomy(supabase, user.id),
        ]);

        artisan = data
            ? {
                ...data,
                profession:
                    taxonomy.profession ??
                    data.profession ??
                    (typeof metadata.profession === "string" ? metadata.profession : null),
                specialties:
                    taxonomy.specialties ??
                    data.specialties ??
                    (Array.isArray(metadata.specialties)
                        ? metadata.specialties.filter((value): value is string => typeof value === "string")
                        : null),
            }
            : null;
    }

    const resolvedWilaya =
        profile?.wilaya ??
        (typeof metadata.wilaya === "string" ? metadata.wilaya : null) ??
        artisan?.wilaya ??
        null;
    const resolvedCommune =
        profile?.commune ??
        profile?.city ??
        (typeof metadata.commune === "string" ? metadata.commune : null) ??
        (typeof metadata.city === "string" ? metadata.city : null) ??
        artisan?.city ??
        null;

    const profileRecord: AccountProfileRecord = {
        id: profile?.id ?? user.id,
        email: profile?.email ?? user.email ?? null,
        full_name:
            profile?.full_name ??
            (typeof metadata.full_name === "string" ? metadata.full_name : null) ??
            user.email?.split("@")[0] ??
            "Utilisateur",
        first_name:
            profile?.first_name ??
            (typeof metadata.first_name === "string" ? metadata.first_name : null) ??
            inferredNames.firstName,
        last_name:
            profile?.last_name ??
            (typeof metadata.last_name === "string" ? metadata.last_name : null) ??
            inferredNames.lastName,
        age:
            profile?.age ??
            (typeof metadata.age === "number" ? metadata.age : null),
        phone: profile?.phone ?? (typeof metadata.phone === "string" ? metadata.phone : null),
        role: resolvedRole,
        avatar_url: profile?.avatar_url ?? (typeof metadata.avatar_url === "string" ? metadata.avatar_url : null),
        wilaya: resolvedWilaya,
        commune: resolvedCommune,
        city:
            profile?.city ??
            artisan?.city ??
            (typeof metadata.city === "string" ? metadata.city : null) ??
            (typeof metadata.commune === "string" ? metadata.commune : null),
    };

    return {
        profile: profileRecord,
        artisan,
    };
}
