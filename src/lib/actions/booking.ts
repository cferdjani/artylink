"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createBookingWithAddress(formData: FormData) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Vous devez être connecté pour effectuer une réservation.");
    }

    const artisanId = formData.get("artisanId") as string;
    const description = formData.get("description") as string;
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    const address = formData.get("address") as string;

    // Fusionner la date et l'heure pour le format timestamp de la base de données
    const scheduled_date = date && time ? new Date(`${date}T${time}`).toISOString() : null;

    const { error } = await supabase.from("bookings").insert({
        client_id: user.id,
        artisan_id: artisanId,
        description: description,
        address_snapshot: address,
        scheduled_date,
        status: "pending", // En attente de validation par l'artisan
    });

    if (error) throw new Error("Erreur lors de la réservation : " + error.message);

    // Redirige vers le tableau de bord client une fois la réservation envoyée
    redirect("/dashboard/services?tab=reservations");
}