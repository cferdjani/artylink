"use server";

import { createSupabaseServerClient, requireUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getRecentNotifications() {
    const user = await requireUser();
    const supabase = await createSupabaseServerClient();

    const { data: notifications, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

    if (error) {
        console.error("Erreur gertRecentNotifications:", error);
        return [];
    }

    return notifications || [];
}

export async function getUnreadCount() {
    const user = await requireUser();
    const supabase = await createSupabaseServerClient();

    const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

    if (error) {
        console.error("Erreur getUnreadCount:", error);
        return 0;
    }

    return count || 0;
}

export async function markNotificationAsRead(id: string) {
    const user = await requireUser();
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) {
        console.error("Erreur markNotificationAsRead:", error);
        return false;
    }

    revalidatePath("/", "layout");
    return true;
}

export async function markAllNotificationsAsRead() {
    const user = await requireUser();
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

    if (error) {
        console.error("Erreur markAllNotificationsAsRead:", error);
        return false;
    }

    revalidatePath("/", "layout");
    return true;
}

export async function deleteNotificationsByIds(ids: string[]) {
    const user = await requireUser();
    const supabase = await createSupabaseServerClient();

    const normalizedIds = Array.from(new Set(ids.map((id) => id.trim()).filter(Boolean)));

    if (normalizedIds.length === 0) {
        return { success: true, deletedCount: 0 };
    }

    const { error, count } = await supabase
        .from("notifications")
        .delete({ count: "exact" })
        .eq("user_id", user.id)
        .in("id", normalizedIds);

    if (error) {
        console.error("Erreur deleteNotificationsByIds:", error);
        return { success: false, deletedCount: 0, error: error.message };
    }

    revalidatePath("/", "layout");
    revalidatePath("/dashboard/notifications");

    return { success: true, deletedCount: count || normalizedIds.length };
}
export async function getNotifications() {
    const user = await requireUser();
    const supabase = await createSupabaseServerClient();

    const { data: notifications, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

    if (error) {
        console.error("Erreur getNotifications:", error);
        return [];
    }

    return notifications || [];
}
