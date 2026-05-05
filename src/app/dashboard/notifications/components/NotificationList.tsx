"use client";

import { useNotifications } from "@/components/notifications/NotificationProvider";
import type { AppNotification } from "@/components/notifications/NotificationProvider";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale/fr";
import Link from "next/link";
import {
  PackageSearch,
  MessageCircle,
  FileText,
  Info,
  CheckCheck
} from "lucide-react";
import { markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/actions/notifications";
import { useMemo, useState } from "react";

export function NotificationList({ initialNotifications }: { initialNotifications: AppNotification[] }) {
    const { notifications, markAsRead, markAllAsRead } = useNotifications();
    const [locallyReadIds, setLocallyReadIds] = useState<Set<string>>(() => new Set());

    const displayList = useMemo(() => {
        const byId = new Map<string, AppNotification>();

        initialNotifications.forEach((notification) => {
            byId.set(notification.id, notification);
        });

        notifications.forEach((notification) => {
            byId.set(notification.id, notification);
        });

        return Array.from(byId.values())
            .map((notification) => locallyReadIds.has(notification.id)
                ? { ...notification, is_read: true }
                : notification)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [notifications, initialNotifications, locallyReadIds]);

    const handleMarkAsRead = async (id: string) => {
        markAsRead(id);
        setLocallyReadIds((current) => new Set(current).add(id));
        await markNotificationAsRead(id);
    };

    const handleMarkAllAsRead = async () => {
        markAllAsRead();
        setLocallyReadIds(new Set(displayList.map((notification) => notification.id)));
        await markAllNotificationsAsRead();
    };

    const getIconForType = (type: string) => {
        switch (type) {
            case 'rfq_new':
                return <PackageSearch className="h-5 w-5 text-primary" />;
            case 'bid_received':
                return <FileText className="h-5 w-5 text-secondary" />;
            case 'message':
                return <MessageCircle className="h-5 w-5 text-blue-500" />;
            default:
                return <Info className="h-5 w-5 text-slate-500" />;
        }
    };

    const unreadAny = displayList.some(n => !n.is_read);

    const getCtaLabel = (linkUrl?: string | null) => {
        if (linkUrl === "/dashboard/account/admin-activation") {
            return "Voir l'invitation";
        }

        return "Voir les détails";
    };

    if (displayList.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 rounded-full bg-slate-100 p-4">
                    <Info className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="mb-1 text-lg font-bold text-slate-800">Aucune notification</h3>
                <p className="text-slate-500">Vous serez averti ici lors de nouveaux événements.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {unreadAny && (
                <div className="flex justify-end pb-2">
                    <button
                        onClick={handleMarkAllAsRead}
                        className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition"
                    >
                        <CheckCheck className="h-4 w-4" />
                        Tout marquer comme lu
                    </button>
                </div>
            )}

            <div className="flex flex-col gap-3">
                {displayList.map((notif) => {
                    const content = (
                        <>
                            <div className={`mt-0.5 rounded-full p-3 shrink-0 ${!notif.is_read ? 'bg-white shadow-sm' : 'bg-slate-50'}`}>
                                {getIconForType(notif.type)}
                            </div>
                            
                            <div className="flex-1 w-full relative">
                                {!notif.is_read && (
                                    <span className="absolute right-0 top-1 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-white" />
                                )}
                                
                                <div className="mb-1 pr-6 flex items-start justify-between">
                                    <h3 className={`text-base ${!notif.is_read ? "font-bold text-slate-900" : "font-semibold text-slate-800"}`}>
                                        {notif.title}
                                    </h3>
                                    <span className="shrink-0 text-xs font-semibold text-slate-400 sm:hidden">
                                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: fr })}
                                    </span>
                                </div>
                                
                                <p className={`text-sm ${!notif.is_read ? "text-slate-700 font-medium" : "text-slate-600"}`}>
                                    {notif.content}
                                </p>
                                
                                {notif.link_url && (
                                    <div className="mt-3 text-sm font-bold text-primary group-hover:underline inline-flex items-center gap-1">
                                        {getCtaLabel(notif.link_url)} →
                                    </div>
                                )}
                            </div>
                            
                            <div className="hidden shrink-0 text-sm font-semibold text-slate-400 sm:block text-right min-w-[20%]">
                                <span className="block">{formatDistanceToNow(new Date(notif.created_at), { locale: fr })}</span>
                            </div>
                        </>
                    );

                    const className = `flex flex-col gap-3 sm:flex-row sm:items-start rounded-2xl border p-4 transition-all duration-200 ${
                        !notif.is_read 
                            ? "bg-slate-50/80 border-primary/20 shadow-sm" 
                            : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm"
                    } ${notif.link_url ? "cursor-pointer" : ""}`;

                    if (notif.link_url) {
                        return (
                            <Link
                                key={notif.id}
                                href={notif.link_url}
                                className={className}
                                onClick={() => {
                                    if (!notif.is_read) {
                                        markAsRead(notif.id);
                                        markNotificationAsRead(notif.id);
                                    }
                                }}
                            >
                                {content}
                            </Link>
                        );
                    }

                    return (
                        <div
                            key={notif.id}
                            className={className}
                            onClick={() => {
                                if (!notif.is_read) {
                                    handleMarkAsRead(notif.id);
                                }
                            }}
                        >
                            {content}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
