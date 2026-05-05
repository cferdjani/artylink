import { ADMIN_EMAIL } from "@/lib/constants";

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
