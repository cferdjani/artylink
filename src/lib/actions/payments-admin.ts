"use server";

import { appendAdminAuditLog } from "@/lib/actions/admin-audit";
import { requireAdminAccess } from "@/lib/auth/require-admin";
import { normalizePlanType, toSubscriptionPlanType, type LegacyPlanType } from "@/lib/plans";
import { createSupabaseAdminClient, createSupabaseAdminClientOrNull } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function getPendingPayments() {
    await requireAdminAccess("can_manage_payments");
    const supabase = createSupabaseAdminClientOrNull();
    if (!supabase) {
        console.warn("[admin] SUPABASE_SERVICE_ROLE_KEY manquante: getPendingPayments retourne []");
        return [];
    }

    const { data: orders, error } = await supabase
        .from("payment_orders")
        .select(`
            *,
            payment_proofs (
                id, proof_url, status, payment_method, transaction_reference, admin_notes
            )
        `)
        .eq("status", "under_review")
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    const userIds = Array.from(
        new Set(
            (orders ?? [])
                .map((order) => order.user_id as string | null | undefined)
                .filter((id): id is string => Boolean(id)),
        ),
    );

    if (userIds.length === 0) {
        return orders ?? [];
    }

    const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone, phone_number")
        .in("id", userIds);

    if (profilesError) {
        console.error("Erreur chargement profils paiement admin:", profilesError.message);
        return orders ?? [];
    }

    const profileById = new Map(
        (profiles ?? []).map((profile) => [
            profile.id as string,
            {
                full_name: profile.full_name ?? null,
                email: profile.email ?? null,
                phone: profile.phone ?? profile.phone_number ?? null,
            },
        ]),
    );

    return (orders ?? []).map((order) => ({
        ...order,
        profiles: profileById.get(order.user_id as string) ?? null,
    }));
}

export async function processPayment(orderId: string, action: 'approve' | 'reject', notes?: string) {
    const admin = await requireAdminAccess("can_manage_payments");
    const supabaseAdmin = createSupabaseAdminClient();

    // 1. Récupérer les infos de la commande
    const { data: order, error: orderError } = await supabaseAdmin
        .from("payment_orders")
        .select("*")
        .eq("id", orderId)
        .single();

    if (orderError || !order) throw new Error("Commande introuvable");
    if (order.status !== "under_review") throw new Error("Cette commande n'est plus en attente");

    if (action === 'approve') {
        await supabaseAdmin.from("payment_orders").update({ status: "completed" }).eq("id", orderId);
        await supabaseAdmin
            .from("payment_proofs")
            .update({
                status: "approved",
                admin_notes: notes,
                reviewed_at: new Date().toISOString(),
                reviewed_by: admin.user.id
            })
            .eq("order_id", orderId);

        const metadata = (order.metadata || {}) as { kind?: string; plan_type?: string };

        if (metadata.kind === "subscription_upgrade" && metadata.plan_type) {
            const normalizedPlan = normalizePlanType(metadata.plan_type as LegacyPlanType);
            const subscriptionPlanType = toSubscriptionPlanType(normalizedPlan);
            const validUntilDate = new Date();
            validUntilDate.setMonth(validUntilDate.getMonth() + 1);
            const validUntil = subscriptionPlanType === "free" ? null : validUntilDate.toISOString();

            await supabaseAdmin.from("subscriptions").upsert({
                user_id: order.user_id,
                plan_type: subscriptionPlanType,
                status: "active",
                valid_until: validUntil,
                updated_at: new Date().toISOString(),
            });

            await supabaseAdmin
                .from("artisans")
                .update({
                    subscription_tier: normalizedPlan,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", order.user_id);
        } else {
            // 2. Historiser la recharge classique du portefeuille
            await supabaseAdmin.from("wallet_transactions").insert({
                user_id: order.user_id,
                amount_dzd: order.amount_dzd,
                transaction_type: "credit",
                reference_type: "payment_proof",
                reference_id: orderId,
                description: `Recharge validée (Commande #${order.id.split('-')[0]})`
            });

            // Recharge wallet classique
            const { data: artisan } = await supabaseAdmin.from("artisans").select("wallet_balance").eq("id", order.user_id).single();
            if (artisan) {
                await supabaseAdmin.from("artisans").update({ wallet_balance: Number(artisan.wallet_balance || 0) + Number(order.amount_dzd) }).eq("id", order.user_id);
            }
        }
    } else {
        await supabaseAdmin.from("payment_orders").update({ status: "rejected" }).eq("id", orderId);
        await supabaseAdmin
            .from("payment_proofs")
            .update({
                status: "rejected",
                admin_notes: notes,
                reviewed_at: new Date().toISOString(),
                reviewed_by: admin.user.id
            })
            .eq("order_id", orderId);
    }

    await appendAdminAuditLog({
        admin,
        targetUserId: order.user_id as string | null | undefined,
        action: action === "approve" ? "payment_order_approved" : "payment_order_rejected",
        payload: {
            order_id: orderId,
            amount_dzd: order.amount_dzd ?? null,
            status_after: action === "approve" ? "completed" : "rejected",
            notes: notes?.trim() || null,
            metadata_kind: typeof order.metadata?.kind === "string" ? order.metadata.kind : null,
            metadata_plan_type: typeof order.metadata?.plan_type === "string" ? order.metadata.plan_type : null,
        },
    });

    revalidatePath("/admin/payments");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/subscription");

    return { success: true };
}
