import {
    buildAdminPermissions,
    getAdminLandingPath,
    type AdminPermissionKey,
    type AdminType,
} from "@/lib/auth/admin-access";
import { ADMIN_EMAIL } from "@/lib/constants";

type RedirectAdminAccount = {
    admin_type: AdminType;
    is_active: boolean;
    activation_status?: string | null;
} | null | undefined;

type RedirectAdminPermissions = Partial<Record<AdminPermissionKey, boolean | null | undefined>> | null | undefined;

export function sanitizeRedirectPath(raw: string | null | undefined, fallback = "/dashboard"): string {
    if (!raw) {
        return fallback;
    }

    const trimmed = raw.trim();

    if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/auth/")) {
        return fallback;
    }

    return trimmed;
}

export function resolvePostLoginPath(email: string | null | undefined, requestedPath: string) {
    const normalizedEmail = (email ?? "").trim().toLowerCase();
    if (normalizedEmail && normalizedEmail === ADMIN_EMAIL) {
        return "/admin";
    }

    return requestedPath;
}

export function resolvePostLoginPathWithAdminState(params: {
    email: string | null | undefined;
    requestedPath: string;
    adminAccount?: RedirectAdminAccount;
    adminPermissions?: RedirectAdminPermissions;
}) {
    const normalizedEmail = (params.email ?? "").trim().toLowerCase();

    if (normalizedEmail && normalizedEmail === ADMIN_EMAIL) {
        return "/admin";
    }

    const adminAccount = params.adminAccount;

    if (!adminAccount?.is_active) {
        return params.requestedPath;
    }

    if (adminAccount.admin_type === "owner") {
        return "/admin";
    }

    if (adminAccount.admin_type === "delegate" && adminAccount.activation_status === "active") {
        return getAdminLandingPath({
            isOwner: false,
            permissions: buildAdminPermissions(params.adminPermissions),
        });
    }

    return params.requestedPath;
}
