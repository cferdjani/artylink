import { GlassCard } from "@/components/ui/glass-card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AlertTriangle, Building2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PortfolioManager } from "../components/portfolio-manager";

export const metadata = {
    title: "Portfolio Artisan | ArtyLink",
    description: "Gérez les photos de vos réalisations professionnelles.",
};

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login?redirectedFrom=/dashboard/account/portfolio");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", user.id)
        .single();

    const { data: artisanCheck } = await supabase
        .from("artisans")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

    // Tolérance : Si le profil est explicitement artisan OU s'il existe dans la table artisans
    if (profile?.role !== "artisan" && !artisanCheck) {
        return (
            <div className="w-full animate-fade-in-up pb-8">
                <GlassCard className="p-8 text-center border-dashed border-2">
                    <AlertTriangle size={48} className="mx-auto text-amber-500 mb-4" />
                    <h1 className="text-xl font-bold text-slate-800 mb-2">Accès restreint aux artisans</h1>
                    <p className="text-sm font-medium text-slate-500 mb-6 max-w-md mx-auto">
                        La fonctionnalité de portfolio est réservée aux professionnels pour présenter leurs réalisations.
                    </p>
                    <Link href="/dashboard/account" className="glass-btn-secondary px-6 py-2">
                        Retour aux paramètres
                    </Link>
                </GlassCard>
            </div>
        );
    }

    const { data: images } = await supabase
        .from("artisan_portfolios")
        .select("*")
        .eq("artisan_id", user.id)
        .order("created_at", { ascending: false });

    return (
        <div className="w-full animate-fade-in-up pb-8">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="glass-section-title flex items-center gap-2">
                        <Building2 className="text-primary" size={28} /> Portfolio
                    </h1>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                        Montrez votre expertise en ajoutant des photos de vos précédents chantiers selon votre forfait.
                    </p>
                </div>
                <Link href="/dashboard/account" className="glass-btn-secondary py-2 px-4 text-sm shadow-none">
                    Retour aux paramètres
                </Link>
            </div>

            <GlassCard className="p-6 md:p-8">
                <PortfolioManager userId={user.id} initialImages={images || []} />
            </GlassCard>

            <div className="mt-6 p-4 rounded-xl bg-orange-50 border border-orange-100 flex gap-3 text-sm font-medium text-orange-800">
                <div className="text-orange-500 mt-0.5"><AlertTriangle size={18} /></div>
                <p>
                    <strong className="block mb-1">Pour rappel :</strong>
                    Ne publiez que des photos dont vous êtes l&apos;auteur ou le propriétaire. Les images contenant des filigranes d&apos;autres entreprises ou des informations personnelles sensibles peuvent être supprimées par notre équipe de modération.
                </p>
            </div>
        </div>
    );
}
