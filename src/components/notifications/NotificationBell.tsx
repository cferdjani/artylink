"use client";

import { deleteNotificationsByIds, markAllNotificationsAsRead, markNotificationAsRead } from "@/lib/actions/notifications";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale/fr";
import {
    Bell,
    CheckCheck,
    FileText,
    Info,
    MessageCircle,
    PackageSearch,
    Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useNotifications } from "./NotificationProvider";

interface NotificationItem {
    id: string;
    type: string;
    title: string;
    content: string;
    link_url?: string;
    is_read: boolean;
    created_at: string;
}

export function NotificationBell() {
    const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotifications } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleMarkAsRead = async (id: string) => {
        markAsRead(id);
        await markNotificationAsRead(id);
    };

    const handleMarkAllAsRead = async () => {
        markAllAsRead();
        await markAllNotificationsAsRead();
    };

    const handleDeleteNotification = (id: string) => {
        startTransition(async () => {
            const result = await deleteNotificationsByIds([id]);

            if (!result.success) {
                return;
            }

            removeNotifications([id]);
        });
    };

    const toggleDropdown = () => setIsOpen((prev) => !prev);

    const getIconForType = (type: string) => {
        switch (type) {
            case 'rfq_new':
                return <PackageSearch className="h-4 w-4 text-primary" />;
            case 'bid_received':
                return <FileText className="h-4 w-4 text-secondary" />;
            case 'message':
                return <MessageCircle className="h-4 w-4 text-blue-500" />;
            default:
                return <Info className="h-4 w-4 text-slate-500" />;
        }
    };

    const getLinkHref = (notif: NotificationItem) => {
        if (notif.link_url) return notif.link_url;
        switch (notif.type) {
            case 'rfq_new': return '/search';
            case 'bid_received': return '/dashboard/services?tab=inbox';
            case 'message': return '/dashboard';
            default: return '#';
        }
    };

    const getCtaLabel = (notif: NotificationItem) => {
        if (notif.link_url === "/dashboard/account/admin-activation") {
            return "Voir l'invitation";
        }

        return "Voir les détails";
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="relative rounded-full p-2 text-slate-600 transition hover:bg-slate-100"
                aria-label="Notifications"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute right-[1px] top-[1px] flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl md:w-96">
                    <div className="mb-2 flex items-center justify-between px-2 pb-2 pt-1 border-b border-slate-100">
                        <h3 className="font-semibold text-slate-800">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-primary"
                                title="Tout marquer comme lu"
                            >
                                <CheckCheck className="h-3 w-3" />
                                Tout lu
                            </button>
                        )}
                    </div>

                    <div className="flex max-h-[22rem] flex-col overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                        {notifications.length === 0 ? (
                            <div className="py-8 text-center text-sm text-slate-500">
                                Aucune notification pour le moment.
                            </div>
                        ) : (
                            notifications.map((notif: NotificationItem) => {
                                const href = getLinkHref(notif);
                                const content = (
                                    <>
                                        <div className={`mt-0.5 rounded-full p-2 shrink-0 ${!notif.is_read ? 'bg-white' : 'bg-slate-100'}`}>
                                            {getIconForType(notif.type)}
                                        </div>
                                        <div className="flex-1 overflow-hidden flex flex-col items-start min-w-0">
                                            <div className="flex w-full items-start justify-between gap-2">
                                                <p className={`text-sm ${!notif.is_read ? "font-semibold text-slate-800" : "font-medium text-slate-700"} truncate`}>
                                                    {notif.title}
                                                </p>
                                                {!notif.is_read && (
                                                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"></span>
                                                )}
                                            </div>
                                            <p className={`line-clamp-2 text-xs mt-0.5 ${!notif.is_read ? "text-slate-600" : "text-slate-500"}`}>
                                                {notif.content}
                                            </p>
                                            {href !== "#" ? (
                                                <span className="mt-2 inline-flex text-[11px] font-bold text-primary">
                                                    {getCtaLabel(notif)}
                                                </span>
                                            ) : null}
                                            <span className="mt-1 text-[10px] text-slate-400 block w-full text-right font-medium">
                                                {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: fr })}
                                            </span>
                                        </div>
                                    </>
                                );

                                const className = `mb-1 flex cursor-pointer items-start gap-3 rounded-xl p-3 transition hover:bg-slate-50 ${!notif.is_read ? "bg-primary/5" : ""}`;

                                if (href !== "#") {
                                    return (
                                        <div key={notif.id} className="relative">
                                            <Link
                                                href={href}
                                                className={`${className} pr-12`}
                                                onClick={() => {
                                                    if (!notif.is_read) {
                                                        handleMarkAsRead(notif.id);
                                                    }
                                                }}
                                            >
                                                {content}
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    event.stopPropagation();
                                                    handleDeleteNotification(notif.id);
                                                }}
                                                disabled={isPending}
                                                className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                aria-label={`Supprimer ${notif.title}`}
                                                title="Supprimer"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    );
                                }

                                return (
                                    <div
                                        key={notif.id}
                                        className={`${className} pr-12 relative`}
                                        onClick={() => {
                                            if (!notif.is_read) {
                                                handleMarkAsRead(notif.id);
                                            }
                                            setIsOpen(false);
                                        }}
                                    >
                                        {content}
                                        <button
                                            type="button"
                                            onClick={(event) => {
                                                event.preventDefault();
                                                event.stopPropagation();
                                                handleDeleteNotification(notif.id);
                                            }}
                                            disabled={isPending}
                                            className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                                            aria-label={`Supprimer ${notif.title}`}
                                            title="Supprimer"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    <div className="pt-2 mt-2 border-t border-slate-100 px-2 pb-1">
                        <Link
                            href="/dashboard/notifications"
                            className="block text-center text-xs font-semibold text-primary hover:underline"
                            onClick={() => setIsOpen(false)}
                        >
                            Voir toutes mes notifications
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
