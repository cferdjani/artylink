"use client";

import { AccountInfoForm } from "@/components/forms/account-info-form";
import { sanitizeRedirectPath } from "@/lib/auth/redirect";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function RegisterPageContent() {
    const searchParams = useSearchParams();
    const redirectedFrom = sanitizeRedirectPath(searchParams?.get("redirectedFrom"));
    const initialType = searchParams?.get("type") === "artisan" ? "artisan" : "client";

    return (
        <AccountInfoForm
            mode="register"
            title="Creer un compte"
            description="Choisissez votre profil et renseignez vos informations des le depart pour que votre espace soit utile tout de suite."
            initialAccountType={initialType}
            redirectedFrom={redirectedFrom}
        />
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-8 md:px-6 text-center text-slate-500">
                Chargement...
            </div>
        }>
            <RegisterPageContent />
        </Suspense>
    );
}
