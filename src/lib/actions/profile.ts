"use server";

import { featuredCategories } from "@/lib/marketplace-data";
import { createSupabaseAdminClientOrNull } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const OPTIONAL_PROFILE_COLUMNS = new Set([
    "first_name",
    "last_name",
    "age",
    "wilaya",
    "commune",
    "city",
]);

function readMissingColumn(errorMessage: string) {
    const match = errorMessage.match(/Could not find the '([^']+)' column/);
    return match?.[1] ?? null;
}

function parseSpecialties(value: FormDataEntryValue | null) {
    const input = value?.toString().trim() || "";
    return input
        ? input.split(",").map((entry) => entry.trim()).filter(Boolean)
        : [];
}

function normalizeTaxonomyValue(value: string | null | undefined) {
    return (value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, " ")
        .trim()
        .toLowerCase();
}

function includesNormalizedValue(a: string | null | undefined, b: string | null | undefined) {
    const left = normalizeTaxonomyValue(a);
    const right = normalizeTaxonomyValue(b);

    if (!left || !right) {
        return false;
    }

    return left.includes(right) || right.includes(left);
}

function resolveLocalCategory(profession: string | null) {
    if (!profession) {
        return null;
    }

    const normalizedProfession = normalizeTaxonomyValue(profession);
    return featuredCategories.find((category) => {
        return (
            normalizeTaxonomyValue(category.name) === normalizedProfession ||
            normalizeTaxonomyValue(category.slug) === normalizedProfession
        );
    }) ?? null;
}

export async function updateProfileDetails(formData: FormData) {
    const supabase = await createSupabaseServerClient();
    const writeClient = createSupabaseAdminClientOrNull() ?? supabase;
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Vous devez être connecté pour modifier votre profil.");
    }

    const firstName = formData.get("first_name")?.toString().trim() || "";
    const lastName = formData.get("last_name")?.toString().trim() || "";
    const fullName = `${firstName} ${lastName}`.trim();
    const phone = formData.get("phone")?.toString().trim() || null;
    const ageRaw = formData.get("age")?.toString().trim() || "";
    const age = ageRaw ? Number.parseInt(ageRaw, 10) : null;
    const wilaya = formData.get("wilaya")?.toString().trim() || null;
    const commune = formData.get("commune")?.toString().trim() || null;
    const city = commune || formData.get("city")?.toString().trim() || null;
    const profession = formData.get("profession")?.toString().trim() || null;
    const specialties = parseSpecialties(formData.get("specialties"));

    if (!firstName || !lastName) {
        throw new Error("Nom et prenom sont obligatoires.");
    }
    if (age !== null && (!Number.isInteger(age) || age < 18 || age > 100)) {
        throw new Error("L'age doit etre un nombre valide entre 18 et 100.");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const resolvedRole = profile?.role || "client";

    const profilePayload: Record<string, string | number | null> = {
        id: user.id,
        email: user.email || null,
        full_name: fullName,
        first_name: firstName,
        last_name: lastName,
        age,
        phone,
        wilaya,
        commune,
        city,
        role: resolvedRole,
    };

    let profileUpdateError: { message: string } | null = null;

    while (true) {
        const { error } = await writeClient
            .from("profiles")
            .upsert(profilePayload, { onConflict: "id" });

        if (!error) {
            profileUpdateError = null;
            break;
        }

        const missingColumn = readMissingColumn(error.message);
        if (!missingColumn || !OPTIONAL_PROFILE_COLUMNS.has(missingColumn) || !(missingColumn in profilePayload)) {
            profileUpdateError = error;
            break;
        }

        delete profilePayload[missingColumn];
    }

    if (profileUpdateError) {
        throw new Error("Erreur lors de la mise à jour du profil : " + profileUpdateError.message);
    }

    if (resolvedRole === "artisan") {
        const companyName = formData.get("company_name")?.toString().trim() || null;
        const artisanWilaya =
            formData.get("artisan_wilaya")?.toString().trim() ||
            formData.get("artisanWilaya")?.toString().trim() ||
            wilaya;
        const artisanCity =
            formData.get("artisan_city")?.toString().trim() ||
            formData.get("artisanCity")?.toString().trim() ||
            commune;
        const address = formData.get("address")?.toString().trim() || null;
        const bio = formData.get("bio")?.toString().trim() || null;

        const hourlyRateRaw = formData.get("hourly_rate")?.toString().trim();
        const hourlyRate = hourlyRateRaw ? parseFloat(hourlyRateRaw) : null;

        const availabilityValue = formData.get("availability_status")?.toString().trim();
        const availability_status = availabilityValue === "unavailable" ? "unavailable" : "available";

        const { error: artisanError } = await writeClient
            .from("artisans")
            .upsert({
                id: user.id,
                company_name: companyName,
                profession,
                specialties,
                wilaya: artisanWilaya,
                city: artisanCity,
                address,
                bio,
                hourly_rate: hourlyRate,
                availability_status,
            }, { onConflict: "id" });

        if (artisanError) {
            throw new Error("Erreur lors de la mise à jour pro : " + artisanError.message);
        }

        if (profession) {
            const localCategory = resolveLocalCategory(profession);
            const { data: categories, error: categoryError } = await writeClient
                .from("categories")
                .select("id, slug, name");

            if (categoryError) {
                throw new Error("Erreur lors du chargement de la categorie metier : " + categoryError.message);
            }

            const category =
                (categories ?? []).find((entry) => localCategory?.slug && entry.slug === localCategory.slug) ??
                (categories ?? []).find((entry) => normalizeTaxonomyValue(entry.name) === normalizeTaxonomyValue(profession)) ??
                (categories ?? []).find((entry) => includesNormalizedValue(entry.name, profession));

            if (!category) {
                throw new Error(`Categorie metier introuvable en base : ${profession}`);
            }

            const { error: deleteCategoriesError } = await writeClient
                .from("artisan_categories")
                .delete()
                .eq("artisan_id", user.id);

            if (deleteCategoriesError) {
                throw new Error("Erreur lors de la mise a jour des categories artisan : " + deleteCategoriesError.message);
            }

            const { error: insertCategoryError } = await writeClient
                .from("artisan_categories")
                .insert({
                    artisan_id: user.id,
                    category_id: category.id,
                    is_primary: true,
                });

            if (insertCategoryError) {
                throw new Error("Erreur lors de l'enregistrement de la categorie artisan : " + insertCategoryError.message);
            }

            const { error: deleteSubcategoriesError } = await writeClient
                .from("artisan_subcategories")
                .delete()
                .eq("artisan_id", user.id);

            if (deleteSubcategoriesError) {
                throw new Error("Erreur lors de la mise a jour des specialites : " + deleteSubcategoriesError.message);
            }

            if (specialties.length > 0) {
                const localSpecialties = localCategory?.subcategories ?? [];
                const { data: subcategories, error: subcategoriesError } = await writeClient
                    .from("subcategories")
                    .select("id, slug, name")
                    .eq("category_id", category.id)
                    .order("name", { ascending: true });

                if (subcategoriesError) {
                    throw new Error("Erreur lors du chargement des specialites : " + subcategoriesError.message);
                }

                const matchedSubcategories = specialties.map((specialty) => {
                    const localSpecialty = localSpecialties.find((entry) => {
                        const normalizedSpecialty = normalizeTaxonomyValue(specialty);
                        return (
                            normalizeTaxonomyValue(entry.name) === normalizedSpecialty ||
                            normalizeTaxonomyValue(entry.slug) === normalizedSpecialty
                        );
                    });

                    return (
                        (subcategories ?? []).find((entry) => localSpecialty?.slug && entry.slug === localSpecialty.slug) ??
                        (subcategories ?? []).find((entry) => normalizeTaxonomyValue(entry.name) === normalizeTaxonomyValue(specialty)) ??
                        (subcategories ?? []).find((entry) => includesNormalizedValue(entry.name, specialty)) ??
                        (subcategories ?? []).find((entry) => localSpecialty?.slug && includesNormalizedValue(entry.slug, localSpecialty.slug)) ??
                        null
                    );
                });

                const matchedIds = matchedSubcategories
                    .map((entry) => entry?.id ?? null)
                    .filter((value): value is string => Boolean(value));
                const missingSpecialties = specialties.filter((_, index) => !matchedSubcategories[index]);

                if (missingSpecialties.length > 0) {
                    throw new Error(`Specialite introuvable en base : ${missingSpecialties.join(", ")}`);
                }

                if (matchedIds.length > 0) {
                    const { error: insertSubcategoriesError } = await writeClient
                        .from("artisan_subcategories")
                        .insert(
                            matchedIds.map((subcategoryId) => ({
                                artisan_id: user.id,
                                subcategory_id: subcategoryId,
                            })),
                        );

                    if (insertSubcategoriesError) {
                        throw new Error("Erreur lors de l'enregistrement des specialites : " + insertSubcategoriesError.message);
                    }
                }
            }
        }
    }

    try {
        await supabase.auth.updateUser({
            data: {
                first_name: firstName,
                last_name: lastName,
                full_name: fullName,
                age,
                phone,
                wilaya,
                commune,
                city,
                ...(resolvedRole === "artisan"
                    ? {
                        profession,
                        specialties,
                    }
                    : {}),
            },
        });
    } catch (metadataError) {
        console.error("Impossible de synchroniser le user_metadata:", metadataError);
    }

    revalidatePath("/dashboard/account");
    revalidatePath(`/artisan/${user.id}`); // Forcer Next.js à vider le cache de la vitrine publique
    revalidatePath("/", "layout"); // Forcer le rafraîchissement global (Navbar)
}
