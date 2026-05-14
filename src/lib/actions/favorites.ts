"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getFavoriteStatus(artisanId: string) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { data } = await supabase
        .from("favorites")
        .select("artisan_id")
        .eq("user_id", user.id)
        .eq("artisan_id", artisanId)
        .maybeSingle();

    return !!data;
}

export async function toggleFavoriteArtisan(artisanId: string, isCurrentlyFavorited: boolean) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Vous devez être connecté pour gérer vos favoris.");

    if (isCurrentlyFavorited) {
        await supabase.from("favorites").delete().match({ user_id: user.id, artisan_id: artisanId });
    } else {
        await supabase.from("favorites").insert({ user_id: user.id, artisan_id: artisanId });
    }

    // Rafraîchir les pages concernées
    revalidatePath("/dashboard/favorites");
    revalidatePath(`/artisan/${artisanId}`);
}