"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type PaymentOrderMetadata = {
    kind?: "wallet_recharge" | "subscription_upgrade";
    plan_type?: "free" | "starter" | "pro";
};

/**
 * Crée une intention de paiement (Order)
 */
export async function createLocalPaymentOrder(
    amount_dzd: number,
    description: string,
    metadata: PaymentOrderMetadata = { kind: "wallet_recharge" }
) {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        throw new Error("Vous devez être connecté pour initier un paiement.");
    }

    const { data, error } = await supabase
        .from("payment_orders")
        .insert({
            user_id: user.id,
            amount_dzd,
            description,
            status: "pending_payment",
            metadata,
        })
        .select()
        .single();

    if (error) {
        throw new Error(`Erreur de création de commande: ${error.message}`);
    }

    return data;
}

/**
 * Soumet une preuve de virement (CCP ou BaridiMob)
 */
export async function uploadPaymentProofMeta(
    orderId: string,
    paymentMethod: "baridimob" | "ccp" | "cash",
    proofUrl: string,
    transactionReference?: string
) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Accès refusé");

    // 1. Insertion de la preuve
    const { error: proofError } = await supabase
        .from("payment_proofs")
        .insert({
            order_id: orderId,
            payment_method: paymentMethod,
            proof_url: proofUrl,
            transaction_reference: transactionReference,
            status: "under_review"
        });

    if (proofError) {
        throw new Error(`Erreur lors de la soumission de la preuve: ${proofError.message}`);
    }

    // 2. Mise à jour de la commande (L'admin recevra une notification de mise en revue)
    const { error: orderError } = await supabase
        .from("payment_orders")
        .update({
            status: "under_review",
            updated_at: new Date().toISOString()
        })
        .eq("id", orderId)
        .eq("user_id", user.id);

    if (orderError) {
        throw new Error(`Erreur lors de la mise à jour de la commande: ${orderError.message}`);
    }


    revalidatePath("/dashboard/subscription");

    return { success: true };
}

/**
 * Obtenir la liste des commandes de paiement pour l'utilisateur
 */
export async function getUserPaymentOrders() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from("payment_orders")
        .select(`
            *,
            payment_proofs (
                id, proof_url, status, payment_method, transaction_reference, admin_notes
            )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) return [];
    return data;
}

/**
 * Obtenir le solde et l'historique du portefeuille (Wallet)
 */
export async function getWalletBalanceAndHistory() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { balance: 0, transactions: [] };

    const { data: txs, error } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) return { balance: 0, transactions: [] };

    // Calcul du solde: Credit (+) et Debit (-)
    const balance = txs.reduce((acc: number, tx: { amount_dzd: number | string; transaction_type: string }) => {
        const amt = Number(tx.amount_dzd);
        return tx.transaction_type === "credit" ? acc + amt : acc - amt;
    }, 0);

    return { balance, transactions: txs };
}
