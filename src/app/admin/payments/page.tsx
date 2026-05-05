import { GlassCard } from "@/components/ui/glass-card";
import { getAdminLandingPath } from "@/lib/auth/admin-access";
import { getAdminContext } from "@/lib/auth/require-admin";
import { getPendingPayments } from "@/lib/actions/payments-admin";
import { redirect } from "next/navigation";
import { AdminPaymentRow } from "./AdminPaymentRow";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
    const admin = await getAdminContext();
    if (!admin.isOwner && !admin.permissions.can_manage_payments) {
        redirect(getAdminLandingPath({
            isOwner: admin.isOwner,
            permissions: admin.permissions,
        }));
    }

    const pendingOrders = await getPendingPayments() as Awaited<ReturnType<typeof getPendingPayments>>;

    return (
        <div className="max-w-5xl mx-auto p-6 animate-fade-in-up min-h-[70vh]">
            <div className="apple-panel mb-8 p-6 md:p-7">
                <p className="apple-chip inline-flex px-4 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-primary">Finance Desk</p>
                <h1 className="mt-3 text-3xl font-black text-slate-900">Modération des Paiements</h1>
                <p className="text-slate-600 mt-2 font-medium">Vérifiez les reçus CCP et captures BaridiMob envoyés par les artisans.</p>
            </div>

            {pendingOrders.length === 0 ? (
                <GlassCard className="p-12 text-center border-dashed border-2 border-slate-200 bg-white/80 text-slate-500 font-medium">
                    Aucun paiement en attente de vérification. Vous êtes à jour !
                </GlassCard>
            ) : (
                <div className="space-y-4">
                    {pendingOrders.map((order) => (
                        <AdminPaymentRow key={order.id} order={order} />
                    ))}
                </div>
            )}
        </div>
    );
}
