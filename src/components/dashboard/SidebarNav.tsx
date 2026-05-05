"use client";

import { getUnreadCount } from "@/lib/actions/chat";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Briefcase, FileText, Image as ImageIcon, LayoutDashboard, MessageSquare, Sparkles, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const DEFAULT_AVATAR = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232563eb'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

export function SidebarNav({
    isArtisan,
    currentPlan,
    availabilityStatus,
}: {
    isArtisan: boolean;
    currentPlan?: string;
    availabilityStatus?: string;
}) {
    const pathname = usePathname();
    const [unreadCount, setUnreadCount] = useState(0);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        getUnreadCount().then((res) => {
            if (res.data) setUnreadCount(res.data);
        });

        const supabase = createSupabaseBrowserClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            setAvatarUrl(user?.user_metadata?.avatar_url || null);
        });
    }, []);

    const navItems = isArtisan
        ? [
            { href: "/dashboard", label: "Vue d'ensemble", icon: LayoutDashboard },
            { href: "/dashboard/services", label: "Demandes clients", icon: Briefcase },
            { href: "/messages", label: "Messages", icon: MessageSquare },
            { href: "/dashboard/account/portfolio", label: "Portfolio", icon: ImageIcon },
            { href: "/dashboard/account", label: "Compte", icon: User },
        ]
        : [
            { href: "/dashboard", label: "Accueil", icon: LayoutDashboard },
            { href: "/dashboard/services", label: "Mes services", icon: FileText },
            { href: "/messages", label: "Messages", icon: MessageSquare },
            { href: "/dashboard/account", label: "Compte", icon: User },
        ];

    return (
        <aside className="w-full md:w-64 shrink-0 z-10">
            {/* Scrollable horizontal nav on mobile, sticky sidebar on desktop */}
            <nav className="glass-panel p-3 md:p-4 rounded-2xl flex flex-row md:flex-col gap-2 relative md:sticky top-[88px] md:top-24 shadow-[0_8px_30px_rgba(15,23,42,0.04)] border border-slate-200/60 bg-white/70 backdrop-blur-xl overflow-x-auto overflow-y-hidden md:overflow-visible">
                <div className="hidden md:block px-4 py-2 mb-1">
                    <p className="text-[11px] font-black tracking-widest text-slate-400 uppercase">
                        {isArtisan ? "Espace Pro" : "Espace Client"}
                    </p>
                </div>

                {navItems.map((item) => {
                    const Icon = item.icon;
                    // Exact match for dashboard root, startsWith for others
                    const isActive = item.href === "/dashboard"
                        ? pathname === "/dashboard"
                        : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm whitespace-nowrap md:whitespace-normal shrink-0 ${isActive
                                ? "bg-primary text-white shadow-md scale-[1.02]"
                                : "text-slate-600 hover:bg-slate-100/80 hover:text-primary"
                                }`}
                        >
                            {item.href === "/dashboard/account" ? (
                                <div className="relative shrink-0">
                                    <div className={`relative h-5 w-5 overflow-hidden rounded-full border ${isActive ? "border-white/50 bg-white/20" : "border-primary/20 bg-primary/5"}`}>
                                        <Image src={avatarUrl || DEFAULT_AVATAR} alt="Avatar" fill className="object-cover" />
                                    </div>
                                    {isArtisan && availabilityStatus && (
                                        <span className={`absolute -bottom-0.5 -right-0.5 block h-2 w-2 rounded-full border border-white ${availabilityStatus === 'unavailable' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                                    )}
                                </div>
                            ) : (
                                <Icon size={20} className={isActive ? "text-white" : "text-slate-500"} />
                            )}
                            {item.label}
                            {item.href === "/messages" && unreadCount > 0 && (
                                <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white shadow-sm">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </Link>
                    );
                })}

                <div className="hidden md:block h-px w-full bg-slate-200/60 my-2" />

                {isArtisan ? (
                    <div className="hidden md:block rounded-2xl border border-slate-200/70 bg-white/60 p-4 shadow-sm transition-all hover:bg-white">
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Visibilité</p>
                        {currentPlan && (
                            <span className="mt-1 inline-block rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                                Plan actuel: {currentPlan}
                            </span>
                        )}
                        <h4 className="mt-2 text-sm font-black text-slate-900">Gardez un espace pro lisible.</h4>
                        <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                            Le forfait et la mise en avant restent groupés au même endroit.
                        </p>
                        <Link href="/dashboard/subscription" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-400 px-4 py-3 text-sm font-black text-white shadow-[0_8px_20px_rgba(244,63,94,0.25)] transition-all hover:brightness-110 hover:shadow-[0_12px_25px_rgba(244,63,94,0.35)] hover:-translate-y-0.5">
                            <Sparkles size={16} />
                            Forfait & visibilité
                        </Link>
                    </div>
                ) : (
                    <div className="hidden md:block mt-2 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 text-white shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/30 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/40 transition-colors"></div>
                        <h4 className="text-base font-black mb-1 relative z-10 flex items-center gap-2">Vous êtes un pro ?</h4>
                        <p className="text-xs font-medium text-slate-300 mb-4 relative z-10 leading-relaxed">
                            Rejoignez ArtyLink en tant qu'artisan, proposez vos services et trouvez de nouveaux chantiers.
                        </p>
                        <Link href="/onboarding/freelance" className="relative z-10 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white text-slate-900 font-bold text-sm hover:scale-105 transition-transform shadow-md">
                            <Sparkles size={16} className="text-primary" /> Devenir Artisan
                        </Link>
                    </div>
                )}
            </nav>
        </aside>
    );
}
