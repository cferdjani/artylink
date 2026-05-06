import { NotificationsPageClient } from "@/app/dashboard/notifications/components/NotificationsPageClient";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

type NotificationRow = {
    id: string;
    type: string;
    title: string;
    content: string;
    link_url?: string | null;
    is_read: boolean;
    created_at: string;
};

export default async function NotificationsPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: notifications } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    return (
        <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-3xl font-black tracking-tight text-slate-900">Notifications</h1>
                <Link href="/dashboard" className="text-sm font-semibold text-slate-500 hover:text-slate-900">
                    Retour dashboard
                </Link>
            </div>

            <NotificationsPageClient initialNotifications={(notifications as NotificationRow[] | null) || []} />
        </div>
    );
}
