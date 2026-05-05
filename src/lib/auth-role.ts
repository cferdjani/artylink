type AuthRoleUser = {
    user_metadata?: {
        role?: unknown;
    } | null;
};

export function getMetadataRole(user: AuthRoleUser | null | undefined) {
    const rawRole = user?.user_metadata?.role;

    if (typeof rawRole !== "string") {
        return null;
    }

    const normalizedRole = rawRole.trim().toLowerCase();
    return normalizedRole.length > 0 ? normalizedRole : null;
}

export function resolveAccountRole({
    user,
    profileRole,
    hasArtisanRecord = false,
}: {
    user?: AuthRoleUser | null;
    profileRole?: string | null;
    hasArtisanRecord?: boolean;
}) {
    const normalizedProfileRole =
        typeof profileRole === "string" && profileRole.trim().length > 0
            ? profileRole.trim().toLowerCase()
            : null;

    if (normalizedProfileRole === "artisan" || hasArtisanRecord) {
        return "artisan";
    }

    return getMetadataRole(user) ?? normalizedProfileRole;
}

export function isArtisanAccount(params: {
    user?: AuthRoleUser | null;
    profileRole?: string | null;
    hasArtisanRecord?: boolean;
}) {
    return resolveAccountRole(params) === "artisan";
}
