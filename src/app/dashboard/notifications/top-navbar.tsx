import { NotificationBell } from "@/components/notifications/NotificationBell";
import { UserNavAvatar } from "@/components/ui/user-nav-avatar";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function TopNavbar() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    let profile = null;
    if (user) {
        const { data } = await supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).single();
        profile = data;
    }

    return (
        <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
                <Link href="/" className="text-2xl font-black tracking-tight text-orange-500">
                    ArtyLink
                </Link>

                <div className="flex items-center gap-4">
                    {user && profile ? (
                        <>
                            <NotificationBell />
                            <UserNavAvatar url={profile.avatar_url} name={profile.full_name} />
                        </>
                    ) : (
                        <Link href="/auth/login" className="rounded-full bg-slate-900 px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-slate-800">
                            Connexion
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}