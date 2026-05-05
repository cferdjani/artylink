import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { isArtisanAccount } from "@/lib/auth-role";
import { normalizePlanType } from "@/lib/plans";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ReactNode } from "react";

export default async function DashboardLayout({
    children,
}: {
    children: ReactNode;
}) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = user
        ? await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle()
        : { data: null };

    const { data: artisan } = user
        ? await supabase
            .from("artisans")
            .select("id, subscription_tier, availability_status")
            .eq("id", user.id)
            .maybeSingle()
        : { data: null };

    const isArtisan = isArtisanAccount({
        user,
        profileRole: profile?.role,
        hasArtisanRecord: !!artisan,
    });

    const currentPlan = isArtisan && artisan?.subscription_tier ? normalizePlanType(artisan.subscription_tier) : undefined;

    return (
        <div className="mx-auto w-full max-w-[1320px] px-4 md:px-8 flex flex-col md:flex-row gap-6 lg:gap-8 mt-6 mb-12">
            <SidebarNav isArtisan={isArtisan} currentPlan={currentPlan} availabilityStatus={artisan?.availability_status} />

            {/* Contenu Principal du Dashboard */}
            <main className="flex-1 w-full min-w-0">
                {children}
            </main>
        </div>
    );
}
