"use server";

import { isSubscriptionPlanType, toSubscriptionPlanType, type SubscriptionPlanType } from "@/lib/plans";
import { createSupabaseServerClient, requireUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type ChangeSubscriptionPlanResult = {
    success: true;
    visibilityRequest?: true;
};

export async function getUserSubscription() {
    const user = await requireUser();
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();

    // Si pas d'abonnement trouvé, on renvoie une structure basic 'free'
    if (error || !data) {
        return {
            plan_type: 'free',
            status: 'active'
        };
    }

    return data;
}

export async function changeSubscriptionPlan(plan_type: SubscriptionPlanType): Promise<ChangeSubscriptionPlanResult> {
    const user = await requireUser();
    const supabase = await createSupabaseServerClient();
    if (!isSubscriptionPlanType(plan_type)) {
        throw new Error("Forfait invalide");
    }

    const nextPlanType = toSubscriptionPlanType(plan_type);
    if (plan_type !== "free") {
        // ArtyLink ne stocke pas les transactions utilisateur.
        // Les forfaits payants sont actives apres paiement externe et mise a jour admin.
        return {
            success: true,
            visibilityRequest: true,
        };
    }

    // Vérifier si l'utilisateur a déjà un abonnement rattaché à son compte
    const { data: existing } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

    let result;

    // Déterminer la date de validité (+1 mois grossièrement)
    const validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + 1);

    if (existing) {
        result = await supabase
            .from("subscriptions")
            .update({
                plan_type: nextPlanType,
                status: 'active',
                valid_until: nextPlanType === 'free' ? null : validUntil.toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq("user_id", user.id);
    } else {
        result = await supabase
            .from("subscriptions")
            .insert({
                user_id: user.id,
                plan_type: nextPlanType,
                status: 'active',
                valid_until: nextPlanType === 'free' ? null : validUntil.toISOString()
            });
    }

    if (result.error) {
        console.error("Erreur changeSubscriptionPlan:", result.error);
        throw new Error("Impossible de changer d'abonnement");
    }

    await supabase
        .from("artisans")
        .update({
            subscription_tier: "basic",
            updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

    revalidatePath("/dashboard/subscription");
    return { success: true };
}
