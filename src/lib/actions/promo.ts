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

        const { error: insertError } = await supabase
            .from("wallet_transactions")
            .insert({
                user_id: user.id,
                amount_dzd: promo.discount_amount || 0,
                transaction_type: "credit",
                description: `Code promo appliqué : ${promo.code}`
            });

        if (insertError) throw insertError;

        revalidatePath("/dashboard/account");

        return {
            status: "success",
            message: "Code promo appliqué avec succès.",
            submittedAt: Date.now(),
        };
    } catch (error: unknown) {
        return {
            status: "error",
            message: error instanceof Error
                ? error.message
                : "Erreur inattendue lors de l'application du code.",
            submittedAt: Date.now(),
        };
    }
}
