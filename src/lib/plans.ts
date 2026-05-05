export const CANONICAL_PLAN_TYPES = ["basic", "starter", "pro"] as const;
export const SUBSCRIPTION_PLAN_TYPES = ["free", "starter", "pro"] as const;

export type PlanType = (typeof CANONICAL_PLAN_TYPES)[number];
export type SubscriptionPlanType = (typeof SUBSCRIPTION_PLAN_TYPES)[number];
export type LegacyPlanType = PlanType | SubscriptionPlanType | "premium" | "vip" | null | undefined;

export type PlanEntitlements = {
    id: PlanType;
    subscriptionValue: SubscriptionPlanType;
    label: string;
    monthlyPriceDzd: number;
    monthlyQuoteLimit: number | null;
    portfolioImageLimit: number;
    searchBoostLevel: 0 | 1 | 2;
    badgeLabel: string | null;
    hasBasicAnalytics: boolean;
    hasAdvancedAnalytics: boolean;
    hasPremiumShowcase: boolean;
    canBuySponsoredCarousel: boolean;
};

export const ARTISAN_PLANS: Record<PlanType, PlanEntitlements> = {
    basic: {
        id: "basic",
        subscriptionValue: "free",
        label: "Basique",
        monthlyPriceDzd: 0,
        monthlyQuoteLimit: 2,
        portfolioImageLimit: 3,
        searchBoostLevel: 0,
        badgeLabel: null,
        hasBasicAnalytics: false,
        hasAdvancedAnalytics: false,
        hasPremiumShowcase: false,
        canBuySponsoredCarousel: false,
    },
    starter: {
        id: "starter",
        subscriptionValue: "starter",
        label: "Starter",
        monthlyPriceDzd: 2000,
        monthlyQuoteLimit: 20,
        portfolioImageLimit: 10,
        searchBoostLevel: 1,
        badgeLabel: null,
        hasBasicAnalytics: true,
        hasAdvancedAnalytics: false,
        hasPremiumShowcase: false,
        canBuySponsoredCarousel: true,
    },
    pro: {
        id: "pro",
        subscriptionValue: "pro",
        label: "Pro",
        monthlyPriceDzd: 5000,
        monthlyQuoteLimit: null,
        portfolioImageLimit: 30,
        searchBoostLevel: 2,
        badgeLabel: null,
        hasBasicAnalytics: true,
        hasAdvancedAnalytics: true,
        hasPremiumShowcase: true,
        canBuySponsoredCarousel: true,
    },
};

export function normalizePlanType(plan: LegacyPlanType): PlanType {
    if (plan === "starter") {
        return "starter";
    }

    if (plan === "pro" || plan === "premium" || plan === "vip") {
        return "pro";
    }

    return "basic";
}

export function toSubscriptionPlanType(plan: LegacyPlanType): SubscriptionPlanType {
    return ARTISAN_PLANS[normalizePlanType(plan)].subscriptionValue;
}

export function getPlanEntitlements(plan: LegacyPlanType): PlanEntitlements {
    return ARTISAN_PLANS[normalizePlanType(plan)];
}

export function isSubscriptionPlanType(value: string): value is SubscriptionPlanType {
    return (SUBSCRIPTION_PLAN_TYPES as readonly string[]).includes(value);
}

export function hasReachedMonthlyQuoteLimit(plan: LegacyPlanType, quoteCount: number): boolean {
    const limit = getPlanEntitlements(plan).monthlyQuoteLimit;
    return limit !== null && quoteCount >= limit;
}
