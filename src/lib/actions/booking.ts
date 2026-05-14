"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function createBookingWithAddress(formData: FormData) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Vous devez être connecté pour effectuer une réservation.");
    }

    const artisanId = formData.get("artisanId")?.toString().trim() || "";
    const description = formData.get("description")?.toString().trim() || "";
    const date = formData.get("date")?.toString().trim() || "";
    const time = formData.get("time")?.toString().trim() || "";

    // Validation inputs
    if (!artisanId || !UUID_REGEX.test(artisanId)) {
        throw new Error("Identifiant artisan invalide.");
    }

    if (!description || description.length > 2000) {
        throw new Error("La description est obligatoire (max 2000 caractères).");
    }

    if (artisanId === user.id) {
        throw new Error("Vous ne pouvez pas vous réserver vous-même.");
    }

    // Fusionner la date et l'heure pour le format timestamp de la base de données
    const scheduled_date = date && time ? new Date(`${date}T${time}`).toISOString() : null;

    const { error } = await supabase.from("bookings").insert({
        client_id: user.id,
        artisan_id: artisanId,
        description: description,
        scheduled_date,
        status: "pending", // En attente de validation par l'artisan
    });

    if (error) {
        console.error("[createBooking] Erreur:", error);
        throw new Error("Erreur lors de la réservation, veuillez réessayer.");
    }

    // Redirige vers le tableau de bord client une fois la réservation envoyée
    redirect("/dashboard/services?tab=reservations");
}