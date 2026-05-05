import { getMyBookings, getMyConfirmedBookings, getMyDemands } from "@/lib/actions/dashboard-services";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ServicesTabs } from "./services-tabs";

export const metadata = {
    title: "Mes Services | ArtyLink",
    description: "Gérez vos réservations, demandes et services confirmés sur ArtyLink.",
};

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/auth/login");

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const isArtisan = profile?.role === "artisan";

    const [bookings, demands, confirmed] = await Promise.all([
        getMyBookings(),
        getMyDemands(),
        getMyConfirmedBookings(),
    ]);

    return (
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
            <div className="mb-8">
                <p className="text-xs font-black tracking-widest text-slate-400 uppercase mb-1">
                    {isArtisan ? "Espace Pro" : "Espace Client"}
                </p>
                <h1 className="text-3xl font-black tracking-tight text-slate-900">
                    {isArtisan ? "Demandes clients" : "Mes Services"}
                </h1>
                <p className="mt-2 text-sm text-slate-500 font-medium">
                    {isArtisan
                        ? "Suivez et gérez toutes les demandes envoyées par vos clients."
                        : "Retrouvez vos réservations, demandes de devis et services confirmés."}
                </p>
            </div>

            <ServicesTabs
                bookings={bookings}
                demands={demands}
                confirmed={confirmed}
                isArtisan={isArtisan}
            />
        </div>
    );
}