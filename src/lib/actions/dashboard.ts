"use server";

import { isArtisanAccount } from "@/lib/auth-role";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ARTISAN_DASHBOARD_SELECT = `
    id, company_name, bio, wilaya, is_verified, rating, review_count, subscription_tier
`;

function readDisplayName(user: { email?: string | null; user_metadata?: Record<string, unknown> | null }, fullName?: string | null) {
    const normalizedFullName = fullName?.trim();

    if (normalizedFullName) {
        return normalizedFullName;
    }

    const metadataFullName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name.trim() : "";
    if (metadataFullName) {
        return metadataFullName;
    }

    const firstName = typeof user.user_metadata?.first_name === "string" ? user.user_metadata.first_name.trim() : "";
    const lastName = typeof user.user_metadata?.last_name === "string" ? user.user_metadata.last_name.trim() : "";
    const joinedName = [firstName, lastName].filter(Boolean).join(" ").trim();

    if (joinedName) {
        return joinedName;
    }

    return user.email?.split("@")[0] || "Artisan";
}



async function getArtisanRecord(
    supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
    userId: string,
) {
    return supabase
        .from("artisans")
        .select(ARTISAN_DASHBOARD_SELECT)
        .eq("id", userId)
        .maybeSingle();
}

export async function getArtisanDashboardData() {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: "Non autorisé", artisan: null, recentLeads: [] };
    }

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, full_name, email, phone, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

    if (profileError && profileError.code !== "PGRST116") {
        console.error(`Erreur chargement profil utilisateur (${profileError.code}):`, profileError.message);
    }

    const shouldBeArtisan = isArtisanAccount({
        user,
        profileRole: profile?.role,
    });

    let { data: artisan, error: artisanError } = await getArtisanRecord(supabase, user.id);

    if (!artisan && shouldBeArtisan) {
        const displayName = readDisplayName(user, profile?.full_name);
        const wilaya = typeof user.user_metadata?.wilaya === "string" && user.user_metadata.wilaya ? user.user_metadata.wilaya.trim() : "Wilaya non renseignee";
        const city = typeof user.user_metadata?.commune === "string" && user.user_metadata.commune ? user.user_metadata.commune.trim() : (typeof user.user_metadata?.city === "string" && user.user_metadata.city ? user.user_metadata.city.trim() : null);
        const now = new Date().toISOString();

        const { error: profileSyncError } = await supabase.from("profiles").upsert({
            id: user.id,
            email: profile?.email || user.email || null,
            full_name: displayName,
            role: "artisan",
        }, { onConflict: "id" });

        if (profileSyncError) {
            console.error(`Erreur synchronisation role artisan (${profileSyncError.code}):`, profileSyncError.message);
        }

        const { error: artisanBootstrapError } = await supabase.from("artisans").upsert({
            id: user.id,
            company_name: displayName,
            wilaya,
            city,
            updated_at: now,
        }, { onConflict: "id" });

        if (artisanBootstrapError) {
            console.error(`Erreur creation fiche artisan (${artisanBootstrapError.code}):`, artisanBootstrapError.message);
        }

        const refetch = await getArtisanRecord(supabase, user.id);
        artisan = refetch.data;
        artisanError = refetch.error;
    }

    if (artisanError || !artisan) {
        if (artisanError?.code !== "PGRST116") {
            console.error(`Erreur chargement profil artisan (${artisanError?.code}):`, artisanError?.message);
        }

        return { error: "Profil artisan introuvable", artisan: null, recentLeads: [] };
    }

    // 3. Récupération des derniers leads / devis (RFQ Bids)
    const { data: recentLeads } = await supabase
        .from('rfq_bids')
        .select(`
            id, status, price, proposal, created_at,
            rfq_posts!inner(title, wilaya, budget_range, status)
        `)
        .eq('artisan_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

    return {
        error: null,
        artisan: {
            ...artisan,
            profiles: {
                full_name: profile?.full_name || readDisplayName(user, profile?.full_name),
                email: profile?.email || user.email || null,
                phone: profile?.phone || null,
                avatar_url: profile?.avatar_url || null,
            },
        },
        recentLeads: recentLeads || [],
    };
}
