"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Récupère les réservations (bookings) adressées à l'artisan connecté
 */
export async function getArtisanBookings() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from('bookings')
        .select(`
            id, status, scheduled_date, description, created_at,
            profiles!bookings_client_id_fkey(full_name, phone, avatar_url)
        `)
        .eq('artisan_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Erreur chargement réservations:", error);
        return [];
    }
    return data || [];
}

/**
 * Met à jour le statut d'une réservation (Accepter / Refuser)
 */
export async function updateBookingStatus(bookingId: string, newStatus: "accepted" | "rejected" | "completed") {
    const supabase = await createSupabaseServerClient();
    await supabase.from('bookings').update({ status: newStatus }).eq('id', bookingId);
    revalidatePath("/dashboard/services");
}