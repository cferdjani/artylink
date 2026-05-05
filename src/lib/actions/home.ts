"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Récupère les catégories principales pour le CategoryGrid
 */
export async function getFeaturedCategories() {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug') // Ajoute l'icône si tu as une colonne 'icon'
        .limit(8);

    if (error) {
        console.error("Erreur chargement des catégories:", error);
        return [];
    }
    return data;
}

/**
 * Récupère les artisans "À la une" pour l'ArtisanList
 */
export async function getFeaturedArtisans() {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from('artisans')
        .select(`
            id,
            company_name,
            wilaya,
            is_verified,
            bio,
            rating,
            profiles!inner(full_name, avatar_url)
        `)
        .limit(6);

    if (error) {
        console.error("Erreur chargement des artisans:", error);
        return [];
    }
    return data;
}