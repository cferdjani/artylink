export const SPONSORED_MODERATION_STATUSES = ["active", "paused", "terminated"] as const;
export type SponsoredModerationStatus = (typeof SPONSORED_MODERATION_STATUSES)[number];

export const SPONSORED_WINDOW_STATUSES = ["active", "scheduled", "expired"] as const;
export type SponsoredWindowStatus = (typeof SPONSORED_WINDOW_STATUSES)[number];

export type SponsoredDisplayStatus = SponsoredModerationStatus | SponsoredWindowStatus;

export function normalizeSponsoredModerationStatus(value: unknown): SponsoredModerationStatus {
    if (value === "paused" || value === "terminated") {
        return value;
    }

    return "active";
}

export function getSponsoredWindowStatus(nowMs: number, startAt: string, endAt: string): SponsoredWindowStatus {
    const start = new Date(startAt).valueOf();
    const end = new Date(endAt).valueOf();

    if (nowMs < start) {
        return "scheduled";
    }

    if (nowMs > end) {
        return "expired";
    }

    return "active";
}

export function getSponsoredDisplayStatus(
    nowMs: number,
    startAt: string,
    endAt: string,
    adminStatus?: unknown,
): SponsoredDisplayStatus {
    const moderationStatus = normalizeSponsoredModerationStatus(adminStatus);

    if (moderationStatus !== "active") {
        return moderationStatus;
    }

    return getSponsoredWindowStatus(nowMs, startAt, endAt);
}

export function isSponsoredCampaignVisible(
    nowMs: number,
    startAt: string,
    endAt: string,
    adminStatus?: unknown,
) {
    return normalizeSponsoredModerationStatus(adminStatus) === "active"
        && getSponsoredWindowStatus(nowMs, startAt, endAt) === "active";
}

export function getSponsoredStatusLabel(status: SponsoredDisplayStatus) {
    switch (status) {
        case "active":
            return "Actif";
        case "scheduled":
            return "Programmé";
        case "expired":
            return "Expiré";
        case "paused":
            return "Suspendu";
        case "terminated":
            return "Terminé";
        default:
            return status;
    }
}

export function getSponsoredStatusBadgeClass(status: SponsoredDisplayStatus) {
    switch (status) {
        case "active":
            return "bg-emerald-100 text-emerald-700";
        case "scheduled":
            return "bg-amber-100 text-amber-700";
        case "expired":
            return "bg-slate-200 text-slate-600";
        case "paused":
            return "bg-orange-100 text-orange-700";
        case "terminated":
            return "bg-rose-100 text-rose-700";
        default:
            return "bg-slate-100 text-slate-600";
    }
}
