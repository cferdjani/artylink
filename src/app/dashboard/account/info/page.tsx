import { AccountInfoForm } from "@/components/forms/account-info-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { loadAccountViewData } from "../account-data";

export const metadata = {
    title: "Info | ArtyLink",
    description: "Modifiez les informations enregistrées lors de votre inscription.",
};

export const dynamic = "force-dynamic";

export default async function AccountInfoPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login?redirectedFrom=/dashboard/account/info");
    }
    const { profile, artisan } = await loadAccountViewData(supabase, user);
    const initialAccountType = profile.role === "artisan" ? "artisan" : "client";

    return (
        <AccountInfoForm
            mode="edit"
            title="Info"
            description="Retrouvez la fiche remplie lors de votre inscription, modifiez les informations souhaitées, puis reenregistrez-les dans la base."
            initialAccountType={initialAccountType}
            initialValues={{
                firstName: profile.first_name,
                lastName: profile.last_name,
                age: profile.age,
                wilaya: profile.wilaya,
                commune: profile.commune ?? profile.city,
                phone: profile.phone,
                profession: artisan?.profession ?? null,
                specialty: artisan?.specialties?.[0] ?? null,
                email: profile.email ?? user.email ?? null,
                companyName: artisan?.company_name ?? null,
                artisanWilaya: artisan?.wilaya ?? profile.wilaya,
                artisanCity: artisan?.city ?? profile.commune ?? profile.city,
                address: artisan?.address ?? null,
                hourlyRate: artisan?.hourly_rate ?? null,
                bio: artisan?.bio ?? null,
                availabilityStatus: artisan?.availability_status ?? null,
            }}
        />
    );
}
