import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminNavigation } from "@/components/admin/AdminNavigation";
import { getAdminLandingPath } from "@/lib/auth/admin-access";
import { getAdminContext } from "@/lib/auth/require-admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, LogOut } from "lucide-react";

export const metadata = {
    title: "Super Admin | ArtyLink"
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login?redirectedFrom=/admin");
    }

    let admin;
    try {
        admin = await getAdminContext();
    } catch {
        redirect("/dashboard");
    }

    if (!admin.isActiveAdmin || !admin.adminType) {
        redirect("/dashboard");
    }

    const landingPath = getAdminLandingPath({
        isOwner: admin.isOwner,
        permissions: admin.permissions,
    });
    const profile = admin.profile;

    return (
        <div className="apple-shell min-h-screen flex flex-col md:flex-row">
            {/* Sidebar Admin */}
            <aside className="w-full md:w-72 flex flex-col shrink-0 text-white z-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950" />
                <div className="absolute top-[-20%] left-[-12%] h-52 w-52 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
                <div className="absolute bottom-[-20%] right-[-15%] h-56 w-56 rounded-full bg-indigo-400/20 blur-3xl pointer-events-none" />
                
                <div className="p-6 border-b border-white/10 relative z-10 flex items-center gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
                        <ShieldCheck size={22} className="text-cyan-200" />
                    </span>
                    <div>
                        <h1 className="font-black text-xl tracking-tight leading-none">Super-Admin</h1>
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">ArtyLink Control</span>
                    </div>
                </div>

                <AdminNavigation
                    isOwner={admin.isOwner}
                    canViewDashboard={admin.isOwner || admin.permissions.can_view_dashboard}
                    canManageUsers={admin.isOwner || admin.permissions.can_manage_users}
                    canManagePayments={admin.isOwner || admin.permissions.can_manage_payments}
                    canManageSponsoring={admin.isOwner || admin.permissions.can_manage_sponsoring}
                />

                <div className="p-4 border-t border-white/10 mt-auto relative z-10">
                    <div className="flex items-center gap-3 mb-4 px-2 rounded-2xl border border-white/10 bg-white/[0.05] p-3">
                        <div className="relative w-10 h-10 rounded-full bg-slate-800 overflow-hidden border border-white/20">
                            {profile?.avatar_url ? (
                                <Image src={profile.avatar_url} alt="Admin" fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold bg-slate-800">
                                    {profile?.full_name?.charAt(0) || 'A'}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate text-white">{profile?.full_name || user.email}</p>
                            <p className="text-xs text-slate-300 truncate">{admin.isOwner ? "Owner principal" : "Admin délégué"}</p>
                        </div>
                    </div>
                    
                    <Link href={landingPath === "/dashboard" ? "/dashboard" : landingPath} className="mb-2 flex justify-center items-center gap-2 w-full px-4 py-2 bg-white/[0.08] hover:bg-white/[0.16] text-sm font-semibold rounded-xl transition border border-white/20">
                        <ShieldCheck size={16} /> Module autorisé
                    </Link>

                    <Link href="/dashboard" className="flex justify-center items-center gap-2 w-full px-4 py-2 bg-white/[0.08] hover:bg-white/[0.16] text-sm font-semibold rounded-xl transition border border-white/20">
                        <LogOut size={16} /> Quitter Admin
                    </Link>
                </div>
            </aside>

            {/* Main Admin Area */}
            <main className="flex-1 w-full max-h-screen overflow-y-auto">
                <div className="max-w-7xl mx-auto p-4 md:p-8 animate-fade-in-up">
                    {children}
                </div>
            </main>
        </div>
    );
}
