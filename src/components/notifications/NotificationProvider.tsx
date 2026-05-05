"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { createContext, useContext, useEffect, useState } from "react";

export interface AppNotification {
    id: string;
    type: string;
    title: string;
    content: string;
    link_url?: string;
    is_read: boolean;
    created_at: string;
}

interface NotificationContextProps {
    notifications: AppNotification[];
    unreadCount: number;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextProps>({
    notifications: [],
    unreadCount: 0,
    markAsRead: () => {},
    markAllAsRead: () => {},
});

export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({
    userId,
    initialUnreadCount,
    initialNotifications,
    children,
}: {
    userId: string | null;
    initialUnreadCount: number;
    initialNotifications: AppNotification[];
    children: React.ReactNode;
}) {
    const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
    const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
    const supabase = createSupabaseBrowserClient();

    useEffect(() => {
        if (!userId) return;

        // Synchroniser avec Supabase Realtime si un message arrive
        const channel = supabase
            .channel(`notifications_${userId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notifications",
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    const newNotification = payload.new as AppNotification;
                    setNotifications((prev) => {
                        // Prevent duplicates
                        if (prev.find((n) => n.id === newNotification.id)) return prev;
                        return [newNotification, ...prev].slice(0, 10); // keep recent 10 natively
                    });
                    setUnreadCount((prev) => prev + 1);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, supabase]);

    const markAsRead = async (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));

        // Let Server Action do the DB update asynchronously behind the scenes, we optimistically update UI
        fetch(`/api/notifications/read`, {
            method: "POST",
            body: JSON.stringify({ id }),
            headers: { "Content-Type": "application/json" }
        }).catch(err => console.error(err));
    };

    const markAllAsRead = async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);

        fetch(`/api/notifications/read-all`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        }).catch(err => console.error(err));
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
}