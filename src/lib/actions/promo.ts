"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type PromoActionState = {
    status: "idle" | "success" | "error";
    message: string | null;
    submittedAt: number | null;
};

export async function applyPromoCode(
    _prevState: PromoActionState,
    formData: FormData
): Promise<PromoActionState> {
    try {
        const rawCode = formData.get("promoCode");
        const code = typeof rawCode === "string" ? rawCode.trim().toUpperCase() : "";

        if (!code) {
            return {
                status: "error",
                message: "Veuillez saisir un code promo.",
                submittedAt: Date.now(),
            };
        }

        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return {
                status: "error",
                message: "Non autorisé.",
                submittedAt: Date.now(),
            };
        }

        // 1. Récupérer le code promo
        const { data: promo, error: fetchError } = await supabase
            .from("promo_codes")
            .select("*")
            .eq("code", code)
            .single();

        if (fetchError || !promo) {
            return {
                status: "error",
                message: "Code promo invalide ou introuvable.",
                submittedAt: Date.now(),
            };
        }

        // 2. Vérifier que le code n'a pas expiré
        if (promo.valid_until && new Date(promo.valid_until) < new Date()) {
            return {
                status: "error",
                message: "Ce code promo a expiré.",
                submittedAt: Date.now(),
            };
        }

        // 3. Vérifier que le nombre max d'utilisations n'est pas atteint
        if (promo.current_usages >= promo.max_usages) {
            return {
                status: "error",
                message: "Ce code promo a atteint son nombre maximum d'utilisations.",
                submittedAt: Date.now(),
            };
        }

        // 4. Vérifier que cet utilisateur n'a pas déjà utilisé ce code
        const { data: existingUsage } = await supabase
            .from("wallet_transactions")
            .select("id")
            .eq("user_id", user.id)
            .eq("reference_type", "promo_code")
            .eq("reference_id", promo.id)
            .maybeSingle();

        if (existingUsage) {
            return {
                status: "error",
                message: "Vous avez déjà utilisé ce code promo.",
                submittedAt: Date.now(),
            };
        }

        // 5. Créditer le wallet avec le bon nom de colonne et reference_type
        const { error: insertError } = await supabase
            .from("wallet_transactions")
            .insert({
                user_id: user.id,
                amount_dzd: promo.discount_amount_dzd || 0,
                transaction_type: "credit",
                reference_type: "promo_code",
                reference_id: promo.id,
                description: `Code promo appliqué : ${promo.code}`,
            });

        if (insertError) {
            console.error("[applyPromoCode] Erreur insertion wallet:", insertError);
            return {
                status: "error",
                message: "Erreur lors de l'application du code promo.",
                submittedAt: Date.now(),
            };
        }

        // 6. Incrémenter le compteur d'utilisations
        await supabase
            .from("promo_codes")
            .update({ current_usages: (promo.current_usages || 0) + 1 })
            .eq("id", promo.id);

        revalidatePath("/dashboard/account");

        return {
            status: "success",
            message: "Code promo appliqué avec succès.",
            submittedAt: Date.now(),
        };
    } catch (error: unknown) {
        console.error("[applyPromoCode] Erreur inattendue:", error);
        return {
            status: "error",
            message: "Erreur inattendue, veuillez réessayer.",
            submittedAt: Date.now(),
        };
    }
}
