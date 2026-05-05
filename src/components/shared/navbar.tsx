"use client";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { getUnreadCount } from "@/lib/actions/chat";
import { ADMIN_EMAIL } from "@/lib/constants";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type NavbarUser = {
    email?: string | null;
    user_metadata?: {
        avatar_url?: string | null;
    } | null;
};

interface NavbarProps {
    user?: NavbarUser | null;
    availabilityStatus?: string | null;
}

function mapAuthUser(nextUser: {
    email?: string | null;
    user_metadata?: {
        avatar_url?: string | null;
    } | null;
} | null | undefined): NavbarUser | null {
    if (!nextUser) {
        return null;
    }

    return {
        email: nextUser.email ?? null,
        user_metadata: {
            avatar_url: nextUser.user_metadata?.avatar_url ?? null,
        },
    };
}

const DEFAULT_AVATAR = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232563eb'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

export function Navbar({ user, availabilityStatus }: NavbarProps) {
    const router = useRouter();
    const [authUser, setAuthUser] = useState<NavbarUser | null>(mapAuthUser(user));
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const handleLogout = useCallback(async () => {
        const supabase = createSupabaseBrowserClient();
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                throw error;
            }

            setAuthUser(null);
            setUnreadCount(0);
            setIsMobileMenuOpen(false);
            try {
                router.refresh();
            } catch { }
            try {
                router.push("/auth/login");
            } catch {
                if (typeof window !== "undefined") window.location.href = "/auth/login";
            }
        } catch {
            // Keep current UI state if logout fails.
        }
    }, [router]);

    useEffect(() => {
        setAuthUser(mapAuthUser(user));
    }, [user]);

    useEffect(() => {
        const supabase = createSupabaseBrowserClient();
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            const nextUser = mapAuthUser(session?.user);
            setAuthUser(nextUser);

            if (!nextUser) {
                setUnreadCount(0);
                setIsMobileMenuOpen(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const normalizedEmail = (authUser?.email ?? "").trim().toLowerCase();
    const isOwnerAdmin = normalizedEmail === ADMIN_EMAIL;
    const isAuthenticated = !!authUser;

    useEffect(() => {
        if (isAuthenticated) {
            getUnreadCount().then((res) => {
                if (res.data) setUnreadCount(res.data);
            });
            return;
        }

        setUnreadCount(0);
    }, [isAuthenticated]);

    return (
        // CORRECTION CSS : On remplace <header> par <div> et on enlève le 'fixed' car layout.tsx gère la fixation.
        <div className="relative z-50 mx-auto w-full max-w-[1320px] px-4 py-4 md:px-8 transition-transform duration-300">
            <div className="relative rounded-[2rem] bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.06)] shadow-[inset_0_2px_4px_rgba(255,255,255,0.8)] px-4 py-3 md:px-6 flex items-center justify-between gap-4">
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-100" />

                {/* Logo & Accueil */}
                <div className="relative z-10 flex items-center gap-4">
                    <Link href="/" className="inline-flex items-center gap-3 group">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-primary/80 text-lg font-bold text-white shadow-glow-primary transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_40px_rgba(37,99,235,0.4)]">
                            A
                        </span>
                        <span className="text-2xl font-bold tracking-tight text-slate-900 group-hover:text-primary transition-colors">
                            ArtyLink
                        </span>
                    </Link>
                    <div className="hidden md:block w-px h-6 bg-border-prominent mx-2" />
                    <Link href="/" className="rounded-xl px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors hidden md:inline-block">
                        Accueil
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="relative z-10 hidden items-center gap-6 text-sm font-bold text-slate-700 md:flex">
                    {isAuthenticated ? (
                        <>
                            <Link
                                href={isOwnerAdmin ? "/admin" : "/dashboard"}
                                className="rounded-xl bg-primary/10 px-4 py-2 text-sm font-bold text-primary transition hover:bg-primary/20"
                            >
                                {isOwnerAdmin ? "Espace Admin" : "Dashboard"}
                            </Link>
                            <Link
                                href="/messages"
                                className="relative transition hover:text-primary"
                            >
                                Messages
                                {unreadCount > 0 && (
                                    <span className="absolute -top-2 -right-3 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </Link>
                            <NotificationBell />
                            <Link
                                href="/dashboard/account"
                                className="flex items-center gap-2 transition hover:text-primary"
                            >
                                <div className="relative shrink-0">
                                    <div className="relative h-8 w-8 overflow-hidden rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center">
                                        <Image src={authUser?.user_metadata?.avatar_url || DEFAULT_AVATAR} alt="Avatar utilisateur" fill className="object-cover" />
                                    </div>
                                    {availabilityStatus && (
                                        <span className={`absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full border-2 border-white ${availabilityStatus === 'unavailable' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                                    )}
                                </div>
                                <span>Mon Compte</span>
                            </Link>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="text-sm font-medium text-slate-500 hover:text-primary"
                            >
                                Déconnexion
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/onboarding/freelance"
                                className="rounded-xl border border-white/20 bg-gradient-to-b from-orange-400 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_16px_rgba(241,138,60,0.4)] shadow-[inset_0_2px_4px_rgba(255,255,255,0.5)] transition-all hover:scale-105 hover:shadow-[0_12px_24px_rgba(241,138,60,0.5)]"
                            >
                                Devenir Freelance
                            </Link>
                            <Link
                                href="/auth/login"
                                className="transition hover:text-primary"
                            >
                                Se connecter
                            </Link>
                            <Link
                                href="/auth/register-type"
                                className="transition hover:text-primary"
                            >
                                S&apos;inscrire
                            </Link>
                        </>
                    )}
                </nav>

                {/* Mobile Navigation Toggle */}
                <div className="relative z-10 flex items-center gap-3 md:hidden">
                    {isAuthenticated && <NotificationBell />}
                    <button
                        type="button"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 text-slate-600 hover:text-primary transition-colors rounded-lg bg-slate-50 border border-slate-100"
                        aria-label="Menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Dropdown Menu */}
                {isMobileMenuOpen && (
                    <div className="absolute left-0 top-[calc(100%+1rem)] z-50 w-full rounded-[2rem] border border-white/70 bg-white/60 p-4 shadow-[0_20px_40px_rgba(0,0,0,0.1)] shadow-[inset_0_2px_4px_rgba(255,255,255,0.8)] backdrop-blur-3xl md:hidden animate-fade-in-up origin-top flex flex-col gap-3">
                        <Link
                            href="/"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-2 rounded-xl p-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary"
                        >
                            Accueil
                        </Link>
                        {!isAuthenticated && (
                            <Link
                                href="/onboarding/freelance"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-2 rounded-xl bg-secondary/10 p-3 text-sm font-bold text-secondary hover:bg-secondary/20 transition-colors"
                            >
                                Devenir Freelance
                            </Link>
                        )}

                        <div className="my-1 h-px w-full bg-slate-100" />

                        {isAuthenticated ? (
                            <>
                                <Link
                                    href={isOwnerAdmin ? "/admin" : "/dashboard"}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-2 rounded-xl bg-primary/10 p-3 text-sm font-bold text-primary hover:bg-primary/20 transition-colors"
                                >
                                    {isOwnerAdmin ? "Espace Admin" : "Dashboard"}
                                </Link>
                                <Link
                                    href="/messages"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center justify-between rounded-xl bg-primary/5 p-3 text-sm font-bold text-slate-700 hover:bg-primary/10 transition-colors"
                                >
                                    <div className="flex items-center gap-2">Messages</div>
                                    {unreadCount > 0 && (
                                        <span className="flex h-5 items-center justify-center rounded-full bg-rose-500 px-2 text-[10px] font-bold text-white shadow-sm">
                                            {unreadCount} nouveau{unreadCount > 1 ? 'x' : ''}
                                        </span>
                                    )}
                                </Link>
                                <Link
                                    href="/dashboard/account"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 rounded-xl p-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary"
                                >
                                    <div className="relative shrink-0">
                                        <div className="relative h-8 w-8 overflow-hidden rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center">
                                            <Image src={authUser?.user_metadata?.avatar_url || DEFAULT_AVATAR} alt="Avatar utilisateur" fill className="object-cover" />
                                        </div>
                                        {availabilityStatus && (
                                            <span className={`absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full border-2 border-white ${availabilityStatus === 'unavailable' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                                        )}
                                    </div>
                                    <span>Mon Compte</span>
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        handleLogout();
                                    }}
                                    className="flex w-full items-center gap-2 rounded-xl p-3 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50"
                                >
                                    Déconnexion
                                </button>
                            </>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 mt-2">
                                <Link
                                    href="/auth/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                    Se connecter
                                </Link>
                                <Link
                                    href="/auth/register-type"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                    S&apos;inscrire
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
