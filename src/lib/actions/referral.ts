"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getReferralStats() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Non autorisé");

    // 1. Récupérer le code parrain actuel
    const { data: profile } = await supabase
        .from("profiles")
        .select("referral_code")
        .eq("id", user.id)
        .single();

    let code = profile?.referral_code;

    // 2. Générer un code unique (Ex: ART-4X9B) s'il n'en a pas
    if (!code) {
        code = "ART-" + Math.random().toString(36).substring(2, 6).toUpperCase();
        await supabase.from("profiles").update({ referral_code: code }).eq("id", user.id);
    }

    // 3. Compter le nombre de filleuls
    const { count: referredCount } = await supabase.from("profiles").select("*", { count: "exact" }).eq("referred_by", user.id);

    // Règle métier : 500 DZD par artisan parrainé
    return { code, referredCount: referredCount || 0, earnedAmount: (referredCount || 0) * 500 };
}