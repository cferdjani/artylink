import {
    buildAdminPermissions,
    EMPTY_ADMIN_PERMISSIONS,
    FULL_ADMIN_PERMISSIONS,
    hasAdminPermission,
    isOwnerAdminEmail,
    normalizeEmail,
    type AdminPermissionKey,
    type AdminPermissions,
    type AdminType,
} from "@/lib/auth/admin-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

type AdminProfile = {
    role: string | null;
    email: string | null;
    full_name: string | null;
    avatar_url?: string | null;
};

type AdminAccountRow = {
    admin_type: AdminType;
    is_active: boolean;
    activation_status: string;
};

type AdminPermissionsRow = Partial<AdminPermissions>;

export type AdminContext = {
    user: User;
    profile: AdminProfile & {
        email: string;
    };
    adminType: AdminType | null;
    permissions: AdminPermissions;
    isOwner: boolean;
    isActiveAdmin: boolean;
};

export async function getAdminContext(): Promise<AdminContext> {
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error("unauthorized");
    }

    const { data: profile, error } = await supabase
        .from("profiles")
        .select("role, email, full_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

    if (error || !profile) {
        throw new Error("forbidden");
    }

    const email = normalizeEmail(profile.email ?? user.email);

    if (isOwnerAdminEmail(email)) {
        return {
            user,
            profile: {
                ...(profile as AdminProfile),
                email,
            },
            adminType: "owner",
            permissions: FULL_ADMIN_PERMISSIONS,
            isOwner: true,
            isActiveAdmin: true,
        };
    }

    const { data: adminAccount, error: adminAccountError } = await supabase
        .from("admin_accounts")
        .select("admin_type, is_active, activation_status")
        .eq("user_id", user.id)
        .maybeSingle<AdminAccountRow>();

    if (adminAccountError) {
        throw new Error("forbidden");
    }

    if (!adminAccount?.is_active) {
        throw new Error("forbidden");
    }

    if (adminAccount.admin_type === "delegate" && adminAccount.activation_status !== "active") {
        throw new Error("forbidden");
    }

    const { data: adminPermissions, error: adminPermissionsError } = await supabase
        .from("admin_permissions")
        .select("can_view_dashboard, can_manage_users, can_manage_payments, can_manage_sponsoring, can_manage_support_logs")
        .eq("user_id", user.id)
        .maybeSingle<AdminPermissionsRow>();

    if (adminPermissionsError) {
        throw new Error("forbidden");
    }

    const isOwner = adminAccount.admin_type === "owner";

    return {
        user,
        profile: {
            ...(profile as AdminProfile),
            email,
        },
        adminType: adminAccount.admin_type,
        permissions: isOwner ? FULL_ADMIN_PERMISSIONS : buildAdminPermissions(adminPermissions ?? EMPTY_ADMIN_PERMISSIONS),
        isOwner,
        isActiveAdmin: true,
    };
}

export async function requireAdminAccess(permission?: AdminPermissionKey) {
    const context = await getAdminContext();

    if (!context.isActiveAdmin || !context.adminType) {
        throw new Error("forbidden");
    }

    if (permission && !hasAdminPermission(context.permissions, permission, context.isOwner)) {
        throw new Error("forbidden");
    }

    return context;
}

export async function requireAdmin() {
    return requireAdminAccess();
}
