import { getAdminDelegates } from "@/lib/actions/admin-delegates";
import { requireAdminAccess } from "@/lib/auth/require-admin";
import { redirect } from "next/navigation";
import { AdminDelegatesClient } from "./AdminDelegatesClient";

export const metadata = {
    title: "Délégués Admin | ArtyLink",
};

export const dynamic = "force-dynamic";

export default async function AdminDelegatesPage() {
    const adminContext = await requireAdminAccess().catch(() => null);
    if (!adminContext || !adminContext.isOwner) {
        redirect("/admin");
    }

    const delegates = await getAdminDelegates();

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <div className="mb-8">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Administration</p>
                <h1 className="text-3xl font-black tracking-tight text-slate-900">Admins délégués</h1>
                <p className="mt-2 text-sm font-medium text-slate-500">
                    Gérez l&apos;accès et les permissions de votre équipe d&apos;administration.
                </p>
            </div>
            <AdminDelegatesClient initialDelegates={delegates} />
        </div>
    );
}