import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CalendarClient } from "./CalendarClient";

export const metadata = {
    title: "Calendrier | ArtyLink",
    description: "Consultez vos rendez-vous à venir et votre historique de services.",
};

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/auth/login");

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const isArtisan = profile?.role === "artisan";

    // Build the query — chained conditionally to preserve query type
    const { data: bookings } = await (isArtisan
        ? supabase
            .from("bookings")
            .select(`
                id, status, scheduled_date, description,
                profiles:client_id(full_name),
                artisans:artisan_id(company_name)
            `)
            .eq("artisan_id", user.id)
            .order("scheduled_date", { ascending: true })
        : supabase
            .from("bookings")
            .select(`
                id, status, scheduled_date, description,
                profiles:client_id(full_name),
                artisans:artisan_id(company_name)
            `)
            .eq("client_id", user.id)
            .order("scheduled_date", { ascending: true })
    );

    return (
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
            <div className="mb-8">
                <p className="text-xs font-black tracking-widest text-slate-400 uppercase mb-1">Planning</p>
                <h1 className="text-3xl font-black tracking-tight text-slate-900">Calendrier & Historique</h1>
                <p className="mt-2 text-sm text-slate-500 font-medium">
                    Consultez vos rendez-vous à venir et retrouvez l&apos;historique de vos services passés.
                </p>
            </div>
            <CalendarClient initialBookings={(bookings || []) as any[]} isArtisan={isArtisan} />
        </div>
    );
}