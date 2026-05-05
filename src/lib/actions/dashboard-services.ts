"use server";

import { createSupabaseServerClient, requireUser } from "@/lib/supabase/server";

export type BookingItem = {
    id: string;
    description: string;
    status: "pending" | "accepted" | "rejected" | "completed" | "cancelled";
    scheduled_date: string | null;
    price_agreed: number | null;
    created_at: string;
};

export type DemandItem = {
    id: string;
    title: string;
    status: string;
    wilaya: string;
    budget_range: string | null;
    created_at: string;
};

export async function getMyBookings(): Promise<BookingItem[]> {
    const user = await requireUser();
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("bookings")
        .select("id, description, status, scheduled_date, price_agreed, created_at")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

    if (error || !data) {
        return [];
    }

    return data as BookingItem[];
}

export async function getMyConfirmedBookings(): Promise<BookingItem[]> {
    const user = await requireUser();
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("bookings")
        .select("id, description, status, scheduled_date, price_agreed, created_at")
        .eq("client_id", user.id)
        .in("status", ["accepted", "completed"])
        .order("scheduled_date", { ascending: true })
        .limit(50);

    if (error || !data) {
        return [];
    }

    return data as BookingItem[];
}

export async function getMyDemands(): Promise<DemandItem[]> {
    const user = await requireUser();
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("rfq_posts")
        .select("id, title, status, wilaya, budget_range, created_at")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

    if (error || !data) {
        return [];
    }

    return data as DemandItem[];
}

export async function getMyCalendarEvents() {
    const user = await requireUser();
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("bookings")
        .select("id, description, status, scheduled_date, created_at")
        .or(`client_id.eq.${user.id},artisan_id.eq.${user.id}`)
        .order("scheduled_date", { ascending: true })
        .limit(100);

    if (error || !data) {
        return [];
    }

    return data as Array<{
        id: string;
        description: string;
        status: "pending" | "accepted" | "rejected" | "completed" | "cancelled";
        scheduled_date: string | null;
        created_at: string;
    }>;
}
