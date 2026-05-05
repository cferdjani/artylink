"use client";

import { CreditCard, LayoutDashboard, Megaphone, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type AdminNavigationProps = {
    isOwner: boolean;
    canViewDashboard: boolean;
    canManageUsers: boolean;
    canManagePayments: boolean;
    canManageSponsoring: boolean;
};

export function AdminNavigation(props: AdminNavigationProps) {
    const pathname = usePathname();

    const links = [
        props.canViewDashboard ? { href: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard } : null,
        props.canManagePayments ? { href: "/admin/payments", label: "Paiements & Forfaits", icon: CreditCard } : null,
        props.canManageUsers ? { href: "/admin/users", label: "Cartes Artisans", icon: Users } : null,
        props.canManageSponsoring ? { href: "/admin/sponsoring", label: "Sponsoring & Carousel", icon: Megaphone } : null,
        props.isOwner ? { href: "/admin/delegates", label: "Admins délégués", icon: ShieldCheck } : null,
    ].filter(Boolean) as Array<{ href: string; label: string; icon: typeof LayoutDashboard }>;

    return (
        <nav className="p-4 flex-1 space-y-2 relative z-10">
            {links.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-xs font-semibold text-slate-300">
                    Aucun module n&apos;est encore activé sur ce compte admin.
                </div>
            ) : null}

            {links.map(({ href, label, icon: Icon }) => {
                const isActive = href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

                return (
                    <Link 
                        key={href} 
                        href={href} 
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl border transition-all ${
                            isActive 
                                ? "bg-cyan-500/20 border-cyan-500/30 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]" 
                                : "text-slate-300 hover:text-white border-transparent bg-white/[0.04] hover:bg-white/[0.1] hover:border-white/10"
                        }`}
                    >
                        <Icon size={18} className={isActive ? "text-cyan-400" : "text-slate-400"} /> 
                        {label}
                    </Link>
                );
            })}
        </nav>
    );
}
