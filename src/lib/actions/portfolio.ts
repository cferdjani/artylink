"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addPortfolioImage(imageUrl: string) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Non autorisé : Vous devez être connecté.");

    const { error } = await supabase.from("artisan_portfolios").insert({
        artisan_id: user.id,
        image_url: imageUrl,
        caption: "Nouvelle réalisation" // Peut être personnalisé plus tard
    });

    if (error) throw new Error("Erreur de sauvegarde : " + error.message);

    revalidatePath("/dashboard/account/portfolio");
    revalidatePath(`/artisan/${user.id}`);
}

export async function deletePortfolioImage(imageId: string) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Non autorisé");

    const { error } = await supabase.from("artisan_portfolios").delete().eq("id", imageId).eq("artisan_id", user.id);
    if (error) throw new Error("Erreur lors de la suppression : " + error.message);

    revalidatePath("/dashboard/account/portfolio");
    revalidatePath(`/artisan/${user.id}`);
}
