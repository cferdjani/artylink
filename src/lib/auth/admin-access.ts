import { ADMIN_EMAIL } from "@/lib/constants";

const OWNER_ADMIN_EMAILS = [ADMIN_EMAIL] as const;
export const ADMIN_PERMISSION_KEYS = [
    "can_view_dashboard",
    "can_manage_users",
    "can_manage_payments",
    "can_manage_sponsoring",
    "can_manage_support_logs",
] as const;

export type AdminType = "owner" | "delegate";
export type AdminPermissionKey = (typeof ADMIN_PERMISSION_KEYS)[number];
export type AdminPermissions = Record<AdminPermissionKey, boolean>;

export const EMPTY_ADMIN_PERMISSIONS: AdminPermissions = {
    can_view_dashboard: false,
    can_manage_users: false,
    can_manage_payments: false,
    can_manage_sponsoring: false,
    can_manage_support_logs: false,
};

export const FULL_ADMIN_PERMISSIONS: AdminPermissions = {
    can_view_dashboard: true,
    can_manage_users: true,
    can_manage_payments: true,
    can_manage_sponsoring: true,
    can_manage_support_logs: true,
};

export const ADMIN_PERMISSION_LABELS: Record<AdminPermissionKey, string> = {
    can_view_dashboard: "Accès dashboard admin",
    can_manage_users: "Gestion utilisateurs",
    can_manage_payments: "Gestion paiements",
    can_manage_sponsoring: "Gestion sponsoring",
    can_manage_support_logs: "Support / logs",
};

export function normalizeEmail(email: string | null | undefined) {
  return (email ?? "").trim().toLowerCase();
}

export function isOwnerAdminEmail(email: string | null | undefined) {
  const normalized = normalizeEmail(email);
  return OWNER_ADMIN_EMAILS.includes(normalized as (typeof OWNER_ADMIN_EMAILS)[number]);
}

export function buildAdminPermissions(
    partial?: Partial<Record<AdminPermissionKey, boolean | null | undefined>> | null,
): AdminPermissions {
    return {
        can_view_dashboard: Boolean(partial?.can_view_dashboard),
        can_manage_users: Boolean(partial?.can_manage_users),
        can_manage_payments: Boolean(partial?.can_manage_payments),
        can_manage_sponsoring: Boolean(partial?.can_manage_sponsoring),
        can_manage_support_logs: Boolean(partial?.can_manage_support_logs),
    };
}

export function hasAdminPermission(
    permissions: AdminPermissions,
    permission: AdminPermissionKey,
    isOwner = false,
) {
    return isOwner || Boolean(permissions[permission]);
}

export function getPermissionSummary(permissions: AdminPermissions) {
    return ADMIN_PERMISSION_KEYS.filter((key) => permissions[key]).map((key) => ADMIN_PERMISSION_LABELS[key]);
}

export function getAdminLandingPath(params: {
    isOwner: boolean;
    permissions: AdminPermissions;
}) {
    if (params.isOwner || params.permissions.can_view_dashboard) {
        return "/admin";
    }

    if (params.permissions.can_manage_users) {
        return "/admin/users";
    }

    if (params.permissions.can_manage_payments) {
        return "/admin/payments";
    }

    if (params.permissions.can_manage_sponsoring) {
        return "/admin/sponsoring";
    }

    return "/dashboard";
}

export function hasAdminAccess(params: {
  role?: string | null;
  profileEmail?: string | null;
  authEmail?: string | null;
}) {
  if (params.role === "admin") {
    return true;
  }

  return isOwnerAdminEmail(params.profileEmail ?? params.authEmail);
}
