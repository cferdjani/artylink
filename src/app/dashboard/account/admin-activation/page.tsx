import { AdminActivationClient } from "@/app/admin/delegates/AdminActivationClient";
import { GlassCard } from "@/components/ui/glass-card";
import { getDelegateInvitationState } from "@/lib/actions/admin-delegates";
import { getAdminContext } from "@/lib/auth/require-admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ShieldAlert, ShieldCheck, ShieldOff, ShieldX } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export const metadata = {
    title: "Invitation Admin | ArtyLink",
    description: "Acceptez ou refusez votre invitation en tant qu'administrateur délégué.",
};

export const dynamic = "force-dynamic";

function InvitationStateCard(props: {
    title: string;
    description: string;
    ctaHref: string;
    ctaLabel: string;
    icon: ReactNode;
}) {
    return (
        <GlassCard className="p-8 animate-fade-in-up">
            <div className="mb-6">{props.icon}</div>
            <h1 className="mb-2 text-2xl font-black text-slate-900">{props.title}</h1>
            <p className="mb-6 font-medium text-slate-600">{props.description}</p>
            <Link
                href={props.ctaHref}
                className="inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
                {props.ctaLabel}
            </Link>
        </GlassCard>
    );
}

export default async function AdminActivationPage() {
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    const adminContext = await getAdminContext().catch(() => null);

    if (adminContext?.isOwner) {
        redirect("/admin/delegates");
    }

    if (adminContext?.adminType === "delegate" && adminContext.isActiveAdmin) {
        redirect("/admin");
    }

    const invitation = await getDelegateInvitationState();

    return (
        <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
            <div className="mb-8">
                <p className="mb-1 text-xs font-black uppercase tracking-widest text-slate-400">Administration</p>
                <h1 className="text-3xl font-black tracking-tight text-slate-900">Invitation délégué admin</h1>
                <p className="mt-2 text-sm font-medium text-slate-500">
                    Retrouvez ici votre invitation, les conditions d&apos;acceptation et le champ pour saisir votre code secret.
                </p>
            </div>

            {invitation.activationStatus === "pending" ? (
                <AdminActivationClient />
            ) : null}

            {invitation.activationStatus === "active" ? (
                <InvitationStateCard
                    title="Accès admin déjà activé"
                    description="Votre statut de délégué admin est déjà actif. Vous pouvez accéder immédiatement à vos modules autorisés."
                    ctaHref="/admin"
                    ctaLabel="Ouvrir l'espace admin"
                    icon={<ShieldCheck size={48} className="text-emerald-500" />}
                />
            ) : null}

            {invitation.activationStatus === "declined" ? (
                <InvitationStateCard
                    title="Invitation déjà refusée"
                    description="Vous avez déjà refusé cette invitation admin. Si le propriétaire souhaite vous réinviter, il devra régénérer une nouvelle invitation."
                    ctaHref="/dashboard/account"
                    ctaLabel="Retour à Mon Compte"
                    icon={<ShieldX size={48} className="text-rose-500" />}
                />
            ) : null}

            {invitation.activationStatus === "disabled" ? (
                <InvitationStateCard
                    title="Accès admin désactivé"
                    description="Votre délégation admin existe mais elle est actuellement désactivée par le propriétaire. Vos fonctionnalités admin restent bloquées tant que cette délégation n'est pas réactivée."
                    ctaHref="/dashboard/account"
                    ctaLabel="Retour à Mon Compte"
                    icon={<ShieldOff size={48} className="text-amber-500" />}
                />
            ) : null}

            {invitation.activationStatus === "none" ? (
                <InvitationStateCard
                    title="Aucune invitation en attente"
                    description="Aucune invitation admin n'est actuellement disponible pour ce compte. Si vous attendiez un accès, contactez le propriétaire de la plateforme."
                    ctaHref="/dashboard/account"
                    ctaLabel="Retour à Mon Compte"
                    icon={<ShieldAlert size={48} className="text-cyan-500" />}
                />
            ) : null}
        </div>
    );
}
