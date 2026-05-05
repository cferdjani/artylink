import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Bell, CheckCircle, Info, MessageCircle } from "lucide-react";
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

function getCtaLabel(linkUrl?: string | null) {
    if (linkUrl === "/dashboard/account/admin-activation") {
        return "Voir l'invitation";
    }

    return "Voir les détails";
}

function getIconForType(type: string) {
    switch (type) {
        case "rfq_new": return <Bell className="h-5 w-5 text-indigo-500" />;
        case "bid_received": return <CheckCircle className="h-5 w-5 text-emerald-500" />;
        case "message": return <MessageCircle className="h-5 w-5 text-blue-500" />;
        default: return <Info className="h-5 w-5 text-slate-500" />;
    }
}

export default async function NotificationsPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: notifications } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    // Marquer toutes les notifications non-lues comme "lues"
    if ((notifications as NotificationRow[] | null)?.some((n) => !n.is_read)) {
        await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    }

    return (
        <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-3xl font-black tracking-tight text-slate-900">Notifications</h1>
                <Link href="/dashboard" className="text-sm font-semibold text-slate-500 hover:text-slate-900">
                    Retour dashboard
                </Link>
            </div>

            <div className="space-y-4">
                {notifications?.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm font-medium text-slate-500 shadow-sm">
                        Vous n&apos;avez aucune notification pour le moment.
                    </div>
                ) : (
                    (notifications as NotificationRow[] | null)?.map((n) => {
                        const content = (
                            <>
                                <div className="mt-1 rounded-full bg-white p-2 shadow-sm ring-1 ring-slate-100">{getIconForType(n.type)}</div>
                                <div>
                                    <h3 className={`text-base font-semibold ${n.is_read ? 'text-slate-700' : 'text-slate-900'}`}>{n.title}</h3>
                                    <p className={`mt-1 text-sm ${n.is_read ? 'text-slate-500' : 'text-slate-700'}`}>{n.content}</p>
                                    <p className="mt-2 text-xs font-medium text-slate-400">{new Date(n.created_at).toLocaleString('fr-DZ', { dateStyle: 'short', timeStyle: 'short' })}</p>
                                    {n.link_url ? (
                                        <span className="mt-3 inline-flex rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white">
                                            {getCtaLabel(n.link_url)}
                                        </span>
                                    ) : null}
                                </div>
                            </>
                        );
                        const className = `flex items-start gap-4 rounded-2xl border p-5 transition-colors ${n.is_read ? 'border-slate-200 bg-white hover:border-slate-300' : 'border-indigo-100 bg-indigo-50/50 hover:border-indigo-200'}`;

                        return n.link_url ? (
                            <Link key={n.id} href={n.link_url} className={className}>
                                {content}
                            </Link>
                        ) : (
                            <div key={n.id} className={className}>
                                {content}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
