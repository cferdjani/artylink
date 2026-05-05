"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitReview(artisanId: string, rating: number, comment: string) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Vous devez être connecté pour laisser un avis." };
    }

    const { error } = await supabase.from('reviews').insert({
        artisan_id: artisanId,
        client_id: user.id,
        rating,
        comment,
    });

    if (error) {
        console.error("Erreur ajout avis:", error);
        return { error: "Une erreur est survenue lors de l'ajout de votre avis." };
    }

    revalidatePath(`/artisan/${artisanId}`);
    return { success: true };
}

export async function getArtisanReviews(artisanId: string) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('reviews')
        .select(`id, rating, comment, created_at, profiles(full_name, avatar_url)`)
        .eq('artisan_id', artisanId)
        .order('created_at', { ascending: false });
    return data || [];
}