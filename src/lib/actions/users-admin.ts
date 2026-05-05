"use server";

import { requireAdminAccess } from "@/lib/auth/require-admin";
import { createSupabaseAdminClientOrNull } from "@/lib/supabase/admin";

export async function adminGetArtisans() {
    await requireAdminAccess("can_manage_users");
    const adminClient = createSupabaseAdminClientOrNull();
    if (!adminClient) {
        console.warn("[admin] SUPABASE_SERVICE_ROLE_KEY manquante: adminGetArtisans retourne []");
        return [];
    }
    const query = adminClient
        .from("artisans")
        .select(`
            id,
            company_name,
            wilaya,
            created_at,
            profiles!inner (
                email,
                full_name,
                phone,
                role
            )
        `)
        .eq("profiles.role", "artisan")
        .order("created_at", { ascending: false });

    const { data: artisans, error } = await query;
    if (error) {
        console.error("Erreur de récupération des artisans:", error.message);
        return [];
    }

    return (artisans ?? []).map((artisan) => {
        const profile = Array.isArray(artisan.profiles) ? artisan.profiles[0] : artisan.profiles;
        return {
            id: artisan.id,
            company_name: artisan.company_name,
            wilaya: artisan.wilaya,
            created_at: artisan.created_at,
            email: profile?.email ?? null,
            full_name: profile?.full_name ?? null,
            phone_number: profile?.phone ?? null,
        };
    });
}
