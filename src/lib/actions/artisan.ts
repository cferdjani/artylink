"use server";

import { createClient } from "@supabase/supabase-js";

export async function getArtisanById(id: string) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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
