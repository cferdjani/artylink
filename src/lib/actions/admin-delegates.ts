"use server";

import { appendAdminAuditLog } from "@/lib/actions/admin-audit";
import {
    buildAdminPermissions,
    EMPTY_ADMIN_PERMISSIONS,
    getAdminLandingPath,
    isOwnerAdminEmail,
    normalizeEmail,
    type AdminPermissionKey,
    type AdminPermissions,
} from "@/lib/auth/admin-access";
import { requireAdminAccess } from "@/lib/auth/require-admin";
import { createSupabaseAdminClientOrNull } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createHash, randomBytes } from "crypto";
import { revalidatePath } from "next/cache";

type DelegateListItem = {
    userId: string;
    fullName: string | null;
    email: string | null;
    role: string | null;
    adminType: "delegate";
    activationStatus: string;
    isActive: boolean;
    permissions: AdminPermissions;
    createdAt: string | null;
};

type DelegateSearchResult = {
    userId: string;
    fullName: string | null;
    email: string | null;
    role: string | null;
};

type DelegateMutationInput = {
    userId: string;
    permissions: Partial<Record<AdminPermissionKey, boolean>>;
};

export type DelegateInvitationState = {
    hasInvitation: boolean;
    activationStatus: "none" | "pending" | "active" | "declined" | "disabled";
    isActiveAccount: boolean;
};

function generateDelegateSecret() {
    return randomBytes(6).toString("hex").toUpperCase();
}

function hashDelegateSecret(secret: string) {
    return createHash("sha256").update(secret).digest("hex");
}

function requireAdminServiceRole() {
    const supabaseAdmin = createSupabaseAdminClientOrNull();

    if (!supabaseAdmin) {
        throw new Error("La configuration admin nécessite SUPABASE_SERVICE_ROLE_KEY.");
    }

    return supabaseAdmin;
}

async function requireOwnerAccess() {
    const admin = await requireAdminAccess();

    if (!admin.isOwner) {
        throw new Error("forbidden");
    }

    return admin;
}

function normalizePermissionsInput(
    permissions: Partial<Record<AdminPermissionKey, boolean>> | null | undefined,
) {
    return buildAdminPermissions({
        can_view_dashboard: permissions?.can_view_dashboard,
        can_manage_users: permissions?.can_manage_users,
        can_manage_payments: permissions?.can_manage_payments,
        can_manage_sponsoring: permissions?.can_manage_sponsoring,
        can_manage_support_logs: permissions?.can_manage_support_logs,
    });
}

async function loadDelegateProfiles(userIds: string[]) {
    const supabaseAdmin = requireAdminServiceRole();

    const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("id, full_name, email, role")
        .in("id", userIds);

    if (error) {
        throw new Error(`Impossible de charger les profils admin: ${error.message}`);
    }

    return new Map(
        (data ?? []).map((profile) => [
            profile.id as string,
            {
                fullName: profile.full_name ?? null,
                email: profile.email ?? null,
                role: profile.role ?? null,
            },
        ]),
    );
}

async function createDelegateInvitationNotification(params: {
    userId: string;
    supabaseAdmin: ReturnType<typeof requireAdminServiceRole>;
    regenerated?: boolean;
}) {
    const { error } = await params.supabaseAdmin.from("notifications").insert({
        user_id: params.userId,
        type: "sys",
        title: params.regenerated
            ? "Nouveau code d'invitation admin"
            : "Invitation d'administration",
        content: params.regenerated
            ? "Le propriétaire a régénéré votre code secret d'activation. Ouvrez l'invitation pour activer ou réactiver votre accès."
            : "Le propriétaire vous a invité à rejoindre l'équipe d'administration. Consultez l'invitation pour accepter, refuser et saisir votre code secret.",
        link_url: "/dashboard/account/admin-activation",
        is_read: false,
    });

    if (error) {
        console.error("Impossible de créer la notification d'invitation admin:", error.message);
    }
}

export async function getAdminDelegates(): Promise<DelegateListItem[]> {
    await requireOwnerAccess();

    const supabaseAdmin = createSupabaseAdminClientOrNull();
    if (!supabaseAdmin) {
        return [];
    }

    const { data: accounts, error } = await supabaseAdmin
        .from("admin_accounts")
        .select("user_id, admin_type, is_active, activation_status, created_at")
        .eq("admin_type", "delegate")
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error(`Impossible de charger les délégués admin: ${error.message}`);
    }

    const userIds = (accounts ?? []).map((row) => row.user_id as string);
    if (userIds.length === 0) {
        return [];
    }

    const [{ data: permissions, error: permissionsError }, profilesById] = await Promise.all([
        supabaseAdmin
            .from("admin_permissions")
            .select("user_id, can_view_dashboard, can_manage_users, can_manage_payments, can_manage_sponsoring, can_manage_support_logs")
            .in("user_id", userIds),
        loadDelegateProfiles(userIds),
    ]);

    if (permissionsError) {
        throw new Error(`Impossible de charger les permissions admin: ${permissionsError.message}`);
    }

    const permissionsById = new Map(
        (permissions ?? []).map((row) => [
            row.user_id as string,
            normalizePermissionsInput(row as Partial<Record<AdminPermissionKey, boolean>>),
        ]),
    );

    return (accounts ?? []).map((row) => {
        const profile = profilesById.get(row.user_id as string);

        return {
            userId: row.user_id as string,
            fullName: profile?.fullName ?? null,
            email: profile?.email ?? null,
            role: profile?.role ?? null,
            adminType: "delegate",
            activationStatus: typeof row.activation_status === "string" ? row.activation_status : "pending",
            isActive: Boolean(row.is_active),
            permissions: permissionsById.get(row.user_id as string) ?? EMPTY_ADMIN_PERMISSIONS,
            createdAt: typeof row.created_at === "string" ? row.created_at : null,
        };
    });
}

export async function searchUsersForDelegate(query: string): Promise<DelegateSearchResult[]> {
    await requireOwnerAccess();

    const supabaseAdmin = createSupabaseAdminClientOrNull();
    if (!supabaseAdmin) {
        return [];
    }

    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 2) {
        return [];
    }

    const escapedQuery = normalizedQuery.replaceAll("%", "").replaceAll(",", " ");
    const ilikePattern = `%${escapedQuery}%`;

    const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("id, full_name, email, role")
        .or(`email.ilike.${ilikePattern},full_name.ilike.${ilikePattern}`)
        .limit(10);

    if (error) {
        throw new Error(`Impossible de rechercher des utilisateurs: ${error.message}`);
    }

    return (data ?? [])
        .filter((profile) => !isOwnerAdminEmail(profile.email ?? null))
        .map((profile) => ({
            userId: profile.id as string,
            fullName: profile.full_name ?? null,
            email: profile.email ?? null,
            role: profile.role ?? null,
        }));
}

export async function createDelegate(input: DelegateMutationInput) {
    const admin = await requireOwnerAccess();
    const supabaseAdmin = requireAdminServiceRole();

    const userId = input.userId.trim();
    if (!userId) {
        throw new Error("Sélectionnez un utilisateur existant.");
    }

    const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("id, email, full_name, role")
        .eq("id", userId)
        .maybeSingle();

    if (profileError || !profile) {
        throw new Error("Utilisateur introuvable.");
    }

    if (isOwnerAdminEmail(profile.email ?? null)) {
        throw new Error("Le owner principal ne se gère pas depuis cette page.");
    }

    const { data: existingAccount, error: existingAccountError } = await supabaseAdmin
        .from("admin_accounts")
        .select("user_id, admin_type, created_by")
        .eq("user_id", userId)
        .maybeSingle();

    if (existingAccountError) {
        throw new Error(`Impossible de vérifier le compte admin: ${existingAccountError.message}`);
    }

    if (existingAccount?.admin_type === "owner") {
        throw new Error("Ce compte owner ne peut pas être converti en délégué.");
    }

    const permissions = normalizePermissionsInput(input.permissions);
    const now = new Date().toISOString();

    const rawSecret = generateDelegateSecret();
    const secretHash = hashDelegateSecret(rawSecret);

    const { error: accountUpsertError } = await supabaseAdmin.from("admin_accounts").upsert({
        user_id: userId,
        admin_type: "delegate",
        is_active: true,
        activation_status: "pending",
        created_by: existingAccount?.created_by ?? admin.user.id,
        updated_by: admin.user.id,
        created_at: now,
        updated_at: now,
    });

    if (accountUpsertError) {
        throw new Error(`Impossible de créer le compte admin: ${accountUpsertError.message}`);
    }

    const { error: permissionsUpsertError } = await supabaseAdmin.from("admin_permissions").upsert({
        user_id: userId,
        ...permissions,
        updated_by: admin.user.id,
        updated_at: now,
    });

    if (permissionsUpsertError) {
        throw new Error(`Impossible d'enregistrer les permissions: ${permissionsUpsertError.message}`);
    }

    await supabaseAdmin.from("admin_delegate_secrets").upsert({
        user_id: userId,
        secret_hash: secretHash,
        created_by: admin.user.id,
        created_at: now,
    });

    await appendAdminAuditLog({
        admin,
        targetUserId: userId,
        action: "delegate_invited",
        payload: {
            email: normalizeEmail(profile.email ?? null),
            full_name: profile.full_name ?? null,
            role: profile.role ?? null,
            permissions,
            secret_generated: true
        },
    });

    await createDelegateInvitationNotification({
        userId,
        supabaseAdmin,
    });

    revalidatePath("/admin");
    revalidatePath("/admin/delegates");

    return { success: true, rawSecret };
}

export async function updateDelegatePermissions(input: DelegateMutationInput) {
    const admin = await requireOwnerAccess();
    const supabaseAdmin = requireAdminServiceRole();
    const userId = input.userId.trim();

    if (!userId) {
        throw new Error("Délégué introuvable.");
    }

    const { data: account, error: accountError } = await supabaseAdmin
        .from("admin_accounts")
        .select("admin_type")
        .eq("user_id", userId)
        .maybeSingle();

    if (accountError || !account || account.admin_type !== "delegate") {
        throw new Error("Délégué introuvable.");
    }

    const permissions = normalizePermissionsInput(input.permissions);
    const now = new Date().toISOString();

    const { error } = await supabaseAdmin
        .from("admin_permissions")
        .upsert({
            user_id: userId,
            ...permissions,
            updated_by: admin.user.id,
            updated_at: now,
        });

    if (error) {
        throw new Error(`Impossible de mettre à jour les permissions: ${error.message}`);
    }

    await appendAdminAuditLog({
        admin,
        targetUserId: userId,
        action: "delegate_permissions_updated",
        payload: { permissions },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/delegates");

    return { success: true };
}

export async function toggleDelegateActive(userId: string, shouldBeActive: boolean) {
    const admin = await requireOwnerAccess();
    const supabaseAdmin = requireAdminServiceRole();
    const targetUserId = userId.trim();

    if (!targetUserId) {
        throw new Error("Délégué introuvable.");
    }

    const { data: account, error: accountError } = await supabaseAdmin
        .from("admin_accounts")
        .select("admin_type")
        .eq("user_id", targetUserId)
        .maybeSingle();

    if (accountError || !account || account.admin_type !== "delegate") {
        throw new Error("Délégué introuvable.");
    }

    const { error } = await supabaseAdmin
        .from("admin_accounts")
        .update({
            is_active: shouldBeActive,
            updated_by: admin.user.id,
            updated_at: new Date().toISOString(),
        })
        .eq("user_id", targetUserId);

    if (error) {
        throw new Error(`Impossible de mettre à jour le statut du délégué: ${error.message}`);
    }

    if (!shouldBeActive) {
        await supabaseAdmin.from("admin_delegate_secrets")
            .update({ invalidated_at: new Date().toISOString() })
            .eq("user_id", targetUserId)
            .is("consumed_at", null);
    }

    await appendAdminAuditLog({
        admin,
        targetUserId,
        action: shouldBeActive ? "delegate_reenabled" : "delegate_disabled",
        payload: {
            is_active: shouldBeActive,
        },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/delegates");

    return { success: true };
}

export async function regenerateDelegateSecret(userId: string) {
    const admin = await requireOwnerAccess();
    const supabaseAdmin = requireAdminServiceRole();
    const targetUserId = userId.trim();

    const rawSecret = generateDelegateSecret();
    const secretHash = hashDelegateSecret(rawSecret);
    const now = new Date().toISOString();

    await supabaseAdmin.from("admin_accounts").update({
        activation_status: "pending",
        updated_at: now
    }).eq("user_id", targetUserId);

    await supabaseAdmin.from("admin_delegate_secrets").upsert({
        user_id: targetUserId,
        secret_hash: secretHash,
        created_by: admin.user.id,
        created_at: now,
        consumed_at: null,
        invalidated_at: null,
        last_rotated_at: now
    });

    await appendAdminAuditLog({
        admin,
        targetUserId,
        action: "delegate_secret_rotated"
    });

    await createDelegateInvitationNotification({
        userId: targetUserId,
        supabaseAdmin,
        regenerated: true,
    });

    revalidatePath("/admin");
    revalidatePath("/admin/delegates");

    return { success: true, rawSecret };
}

export async function revokeDelegate(userId: string) {
    const admin = await requireOwnerAccess();
    const supabaseAdmin = requireAdminServiceRole();
    const targetUserId = userId.trim();

    if (!targetUserId) {
        throw new Error("Délégué introuvable.");
    }

    const actorSignature = {
        user_id: admin.user.id,
        email: admin.profile.email,
        full_name: admin.profile.full_name ?? null,
        admin_type: admin.adminType,
        is_owner: admin.isOwner,
        profile_role: admin.profile.role ?? null,
    };

    const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc("revoke_admin_delegate_access", {
        p_actor_user_id: admin.user.id,
        p_target_user_id: targetUserId,
        p_actor_signature: actorSignature,
    });

    if (!rpcError && rpcResult?.success) {
        revalidatePath("/admin");
        revalidatePath("/admin/delegates");
        return { success: true };
    }

    const { data: account, error: accountError } = await supabaseAdmin
        .from("admin_accounts")
        .select("admin_type")
        .eq("user_id", targetUserId)
        .maybeSingle();

    if (accountError || !account || account.admin_type !== "delegate") {
        throw new Error("Délégué introuvable.");
    }

    const { error: permissionsDeleteError } = await supabaseAdmin
        .from("admin_permissions")
        .delete()
        .eq("user_id", targetUserId);

    if (permissionsDeleteError) {
        throw new Error(`Impossible de supprimer les permissions du délégué: ${permissionsDeleteError.message}`);
    }

    await supabaseAdmin
        .from("admin_delegate_secrets")
        .delete()
        .eq("user_id", targetUserId);

    const { error: accountDeleteError } = await supabaseAdmin
        .from("admin_accounts")
        .delete()
        .eq("user_id", targetUserId);

    if (accountDeleteError) {
        throw new Error(`Impossible de supprimer l'accès admin du délégué: ${accountDeleteError.message}`);
    }

    await appendAdminAuditLog({
        admin,
        targetUserId,
        action: "delegate_revoked",
        payload: {
            revoked_admin_access_only: true,
            via_rpc: false,
        },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/delegates");

    return { success: true };
}

export async function getPendingDelegateInvitation() {
    const invitation = await getDelegateInvitationState();
    return invitation.hasInvitation;
}

export async function getDelegateInvitationState(): Promise<DelegateInvitationState> {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return {
            hasInvitation: false,
            activationStatus: "none",
            isActiveAccount: false,
        };
    }

    const { data } = await supabase.from("admin_accounts")
        .select("activation_status, is_active, admin_type")
        .eq("user_id", user.id)
        .maybeSingle();

    if (!data || data.admin_type !== "delegate") {
        return {
            hasInvitation: false,
            activationStatus: "none",
            isActiveAccount: false,
        };
    }

    if (!data.is_active) {
        return {
            hasInvitation: false,
            activationStatus: "disabled",
            isActiveAccount: false,
        };
    }

    const activationStatus = typeof data.activation_status === "string" ? data.activation_status : "pending";

    return {
        hasInvitation: activationStatus === "pending",
        activationStatus: activationStatus as DelegateInvitationState["activationStatus"],
        isActiveAccount: true,
    };
}

export async function respondToDelegateInvitation(action: "accept" | "decline", code?: string) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("unauthorized");

    const supabaseAdmin = requireAdminServiceRole();

    const { data: account } = await supabaseAdmin.from("admin_accounts")
        .select("activation_status, is_active, admin_type")
        .eq("user_id", user.id)
        .maybeSingle();

    if (!account || account.admin_type !== "delegate" || !account.is_active || account.activation_status !== "pending") {
        throw new Error("Aucune invitation en attente.");
    }

    const now = new Date().toISOString();
    const { data: profile } = await supabaseAdmin.from("profiles").select("email, full_name, role").eq("id", user.id).single();

    const actorSignature = {
        user_id: user.id,
        email: profile?.email || user.email,
        full_name: profile?.full_name || null,
        admin_type: "delegate",
        is_owner: false,
        profile_role: profile?.role || null
    };

    if (action === "decline") {
        await supabaseAdmin.from("admin_accounts").update({ activation_status: "declined", declined_at: now, updated_at: now }).eq("user_id", user.id);
        await supabaseAdmin.from("admin_audit_logs").insert({
            actor_user_id: user.id, target_user_id: user.id, action: "delegate_activation_declined", payload: { actor_signature: actorSignature }
        });
        return { success: true, redirectPath: "/dashboard/account" as const };
    }

    if (action === "accept") {
        if (!code) throw new Error("Code secret manquant.");

        const { data: secretData } = await supabaseAdmin.from("admin_delegate_secrets")
            .select("secret_hash, consumed_at, invalidated_at")
            .eq("user_id", user.id)
            .maybeSingle();

        if (!secretData) throw new Error("Aucun code généré pour ce compte.");
        if (secretData.consumed_at) throw new Error("Ce code a déjà été utilisé.");
        if (secretData.invalidated_at) throw new Error("Ce code a été invalidé.");

        const inputHash = hashDelegateSecret(code.trim());
        if (inputHash !== secretData.secret_hash) throw new Error("Code secret incorrect.");

        const { data: permissionsRow } = await supabaseAdmin.from("admin_permissions")
            .select("can_view_dashboard, can_manage_users, can_manage_payments, can_manage_sponsoring, can_manage_support_logs")
            .eq("user_id", user.id)
            .maybeSingle();

        const landingPath = getAdminLandingPath({
            isOwner: false,
            permissions: buildAdminPermissions(permissionsRow ?? EMPTY_ADMIN_PERMISSIONS),
        });

        await supabaseAdmin.from("admin_accounts").update({ activation_status: "active", activated_at: now, updated_at: now }).eq("user_id", user.id);
        await supabaseAdmin.from("admin_delegate_secrets").update({ consumed_at: now }).eq("user_id", user.id);
        await supabaseAdmin.from("admin_audit_logs").insert({
            actor_user_id: user.id, target_user_id: user.id, action: "delegate_activation_accepted", payload: { actor_signature: actorSignature }
        });

        return { success: true, redirectPath: landingPath };
    }

    throw new Error("Action d'invitation non prise en charge.");
}
