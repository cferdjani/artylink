"use client";

import { deleteNotificationsByIds, markAllNotificationsAsRead, markNotificationAsRead } from "@/lib/actions/notifications";
import { useNotifications } from "@/components/notifications/NotificationProvider";
import { CheckCheck, Info, MessageCircle, PackageSearch, FileText, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

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
        case "rfq_new":
            return <PackageSearch className="h-5 w-5 text-indigo-500" />;
        case "bid_received":
            return <FileText className="h-5 w-5 text-emerald-500" />;
        case "message":
            return <MessageCircle className="h-5 w-5 text-blue-500" />;
        default:
            return <Info className="h-5 w-5 text-slate-500" />;
    }
}

export function NotificationsPageClient({ initialNotifications }: { initialNotifications: NotificationRow[] }) {
    const { markAsRead, markAllAsRead, removeNotifications } = useNotifications();
    const [notifications, setNotifications] = useState<NotificationRow[]>(initialNotifications);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
    const [hideRead, setHideRead] = useState(false);
    const [isPending, startTransition] = useTransition();

    const displayNotifications = useMemo(() => {
        return notifications.filter((notification) => {
            if (hideRead && notification.is_read) {
                return false;
            }

            return true;
        });
    }, [notifications, hideRead]);

    const selectedCount = selectedIds.size;
    const unreadCount = notifications.filter((notification) => !notification.is_read).length;
    const allVisibleSelected =
        displayNotifications.length > 0 &&
        displayNotifications.every((notification) => selectedIds.has(notification.id));

    const toggleSelected = (id: string) => {
        setSelectedIds((current) => {
            const next = new Set(current);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const toggleSelectAllVisible = () => {
        setSelectedIds((current) => {
            const next = new Set(current);
            if (allVisibleSelected) {
                displayNotifications.forEach((notification) => next.delete(notification.id));
            } else {
                displayNotifications.forEach((notification) => next.add(notification.id));
            }
            return next;
        });
    };

    const handleMarkAsRead = async (id: string) => {
        setNotifications((current) =>
            current.map((notification) =>
                notification.id === id ? { ...notification, is_read: true } : notification,
            ),
        );
        markAsRead(id);
        await markNotificationAsRead(id);
    };

    const handleMarkAllAsRead = () => {
        startTransition(async () => {
            setNotifications((current) => current.map((notification) => ({ ...notification, is_read: true })));
            markAllAsRead();
            await markAllNotificationsAsRead();
        });
    };

    const handleDeleteSelected = () => {
        if (selectedCount === 0) return;

        startTransition(async () => {
            const idsToDelete = Array.from(selectedIds);
            const previousNotifications = notifications;

            setNotifications((current) =>
                current.filter((notification) => !selectedIds.has(notification.id)),
            );
            setSelectedIds(new Set());

            const result = await deleteNotificationsByIds(idsToDelete);

            if (!result.success) {
                setNotifications(previousNotifications);
                setSelectedIds(new Set(idsToDelete));
                return;
            }

            removeNotifications(idsToDelete);
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                    <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <input
                            type="checkbox"
                            checked={hideRead}
                            onChange={(event) => setHideRead(event.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                        />
                        Masquer les lus
                    </label>

                    <button
                        type="button"
                        onClick={toggleSelectAllVisible}
                        className="text-sm font-semibold text-slate-500 transition hover:text-slate-900"
                    >
                        {allVisibleSelected ? "Tout désélectionner" : "Tout sélectionner"}
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={handleMarkAllAsRead}
                        disabled={unreadCount === 0 || isPending}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <CheckCheck className="h-4 w-4" />
                        Tout marquer comme lu
                    </button>
                    <button
                        type="button"
                        onClick={handleDeleteSelected}
                        disabled={selectedCount === 0 || isPending}
                        className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Trash2 className="h-4 w-4" />
                        Supprimer la sélection
                    </button>
                </div>
            </div>

            {displayNotifications.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm font-medium text-slate-500 shadow-sm">
                    {notifications.length === 0
                        ? "Vous n'avez aucune notification pour le moment."
                        : "Aucune notification ne correspond au filtre actuel."}
                </div>
            ) : (
                <div className="space-y-4">
                    {displayNotifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`flex gap-4 rounded-2xl border p-5 transition-colors ${
                                notification.is_read
                                    ? "border-slate-200 bg-white hover:border-slate-300"
                                    : "border-indigo-100 bg-indigo-50/50 hover:border-indigo-200"
                            }`}
                        >
                            <div className="pt-1">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.has(notification.id)}
                                    onChange={() => toggleSelected(notification.id)}
                                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                                    aria-label={`Sélectionner ${notification.title}`}
                                />
                            </div>

                            <div className="mt-1 rounded-full bg-white p-2 shadow-sm ring-1 ring-slate-100">
                                {getIconForType(notification.type)}
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <h3 className={`text-base font-semibold ${notification.is_read ? "text-slate-700" : "text-slate-900"}`}>
                                            {notification.title}
                                        </h3>
                                        <p className={`mt-1 text-sm ${notification.is_read ? "text-slate-500" : "text-slate-700"}`}>
                                            {notification.content}
                                        </p>
                                    </div>

                                    {!notification.is_read ? (
                                        <button
                                            type="button"
                                            onClick={() => handleMarkAsRead(notification.id)}
                                            className="text-xs font-bold text-slate-500 transition hover:text-slate-900"
                                        >
                                            Marquer comme lu
                                        </button>
                                    ) : null}
                                </div>

                                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                                    <p className="text-xs font-medium text-slate-400">
                                        {new Date(notification.created_at).toLocaleString("fr-DZ", {
                                            dateStyle: "short",
                                            timeStyle: "short",
                                        })}
                                    </p>

                                    {notification.link_url ? (
                                        <Link
                                            href={notification.link_url}
                                            className="inline-flex rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white"
                                            onClick={() => {
                                                if (!notification.is_read) {
                                                    void handleMarkAsRead(notification.id);
                                                }
                                            }}
                                        >
                                            {getCtaLabel(notification.link_url)}
                                        </Link>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
