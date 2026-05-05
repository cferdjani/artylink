"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateBookingStatus(bookingId: string, status: "accepted" | "rejected") {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
        .from("bookings")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", bookingId);

    if (error) throw new Error("Erreur de mise à jour du statut.");
    revalidatePath("/dashboard/services");
}