"use server";

import { createSupabasePublicClient } from "@/lib/supabase/public";

export async function getArtisanById(id: string) {
    // Validation UUID pour éviter les injections
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id || !uuidRegex.test(id)) {
        return null;
    }

    const supabase = createSupabasePublicClient();

    const { data, error } = await supabase
        .from("artisans")
        .select(`
            id,
            bio,
            company_name,
            profession,
            specialties,
            wilaya,
            city,
            rating,
            review_count,
            years_of_experience,
            profiles!inner(full_name, avatar_url, phone, email, age, wilaya, commune)
        `)
        .eq("id", id)
        .maybeSingle();

    if (error) {
        console.error("Erreur chargement artisan (public):", error);
        return null;
    }
    return data;
}
