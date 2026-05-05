"use client";

import { Calendar, CheckCircle2, Clock, XCircle, AlertCircle, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Booking = {
    id: string;
    status: string;
    scheduled_date: string | null;
    description?: string | null;
    profiles?: { full_name: string | null } | null;
    artisans?: { company_name: string | null } | null;
};

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    pending:   { label: "En attente",  cls: "bg-amber-100 text-amber-700 ring-amber-200",   icon: <Clock size={12} /> },
    accepted:  { label: "Accepté",     cls: "bg-emerald-100 text-emerald-700 ring-emerald-200", icon: <CheckCircle2 size={12} /> },
    completed: { label: "Terminé",     cls: "bg-blue-100 text-blue-700 ring-blue-200",     icon: <CheckCircle2 size={12} /> },
    rejected:  { label: "Refusé",      cls: "bg-rose-100 text-rose-700 ring-rose-200",     icon: <XCircle size={12} /> },
    cancelled: { label: "Annulé",      cls: "bg-slate-100 text-slate-600 ring-slate-200",  icon: <XCircle size={12} /> },
};

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] ?? { label: status.toUpperCase(), cls: "bg-slate-100 text-slate-600 ring-slate-200", icon: <AlertCircle size={12} /> };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ring-1 ${cfg.cls}`}>
            {cfg.icon}
            {cfg.label}
        </span>
    );
}

function EmptyState({ tab }: { tab: "upcoming" | "history" }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl border border-dashed border-slate-200 bg-white/60 backdrop-blur-xl shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
                <Calendar size={24} className="text-slate-400" />
            </div>
            {tab === "upcoming" ? (
                <>
                    <h3 className="text-base font-black text-slate-800 mb-1">Aucun rendez-vous à venir</h3>
                    <p className="text-sm text-slate-500 font-medium max-w-xs leading-relaxed mb-6">
                        Votre agenda est vide. Trouvez un artisan et réservez votre premier service.
                    </p>
                    <Link
                        href="/search"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-indigo-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md hover:brightness-110 transition-all"
                    >
                        <Search size={16} />
                        Trouver un artisan
                    </Link>
                </>
            ) : (
                <>
                    <h3 className="text-base font-black text-slate-800 mb-1">Aucun historique</h3>
                    <p className="text-sm text-slate-500 font-medium max-w-xs leading-relaxed">
                        Vos rendez-vous terminés, annulés ou refusés apparaîtront ici.
                    </p>
                </>
            )}
        </div>
    );
}

export function CalendarClient({ initialBookings, isArtisan }: { initialBookings: Booking[]; isArtisan: boolean }) {
    const [activeTab, setActiveTab] = useState<"upcoming" | "history">("upcoming");
    const [filter, setFilter] = useState<"all" | "completed" | "cancelled" | "rejected">("all");

    const now = new Date();

    const upcomingBookings = initialBookings.filter(b =>
        b.scheduled_date &&
        new Date(b.scheduled_date) >= now &&
        !["rejected", "cancelled", "completed"].includes(b.status)
    );

    const historyBookings = initialBookings.filter(b =>
        !b.scheduled_date ||
        new Date(b.scheduled_date) < now ||
        ["rejected", "cancelled", "completed"].includes(b.status)
    );

    const displayBookings = activeTab === "upcoming"
        ? upcomingBookings
        : historyBookings.filter(b => filter === "all" ? true : b.status === filter);

    const tabs: { id: "upcoming" | "history"; label: string; count: number }[] = [
        { id: "upcoming", label: "À venir", count: upcomingBookings.length },
        { id: "history", label: "Historique", count: historyBookings.length },
    ];

    return (
        <div className="space-y-6">
            {/* Tab bar */}
            <div className="flex gap-1 p-1 bg-slate-100/80 backdrop-blur-sm rounded-2xl border border-slate-200/60">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${
                            activeTab === tab.id
                                ? "bg-white text-slate-900 shadow-md"
                                : "text-slate-500 hover:text-slate-700"
                        }`}
                    >
                        {tab.label}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-black ${
                            activeTab === tab.id ? "bg-primary/10 text-primary" : "bg-slate-200 text-slate-500"
                        }`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* History status filters */}
            {activeTab === "history" && historyBookings.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {(["all", "completed", "cancelled", "rejected"] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-all ${
                                filter === f
                                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                                    : "bg-white/70 text-slate-600 border-slate-200 hover:bg-slate-100"
                            }`}
                        >
                            {f === "all" ? "Tout" : f === "completed" ? "Terminés" : f === "cancelled" ? "Annulés" : "Refusés"}
                        </button>
                    ))}
                </div>
            )}

            {/* Content */}
            {displayBookings.length === 0 ? (
                <EmptyState tab={activeTab} />
            ) : (
                <div className="grid gap-3">
                    {displayBookings.map(booking => (
                        <div
                            key={booking.id}
                            className="group flex flex-col gap-3 rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl p-5 shadow-sm hover:shadow-md hover:bg-white/80 transition-all"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                    <h3 className="font-black text-slate-900 text-sm leading-tight">
                                        {isArtisan
                                            ? booking.profiles?.full_name || "Client inconnu"
                                            : booking.artisans?.company_name || "Artisan inconnu"}
                                    </h3>
                                    {booking.description && (
                                        <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                                            {booking.description}
                                        </p>
                                    )}
                                </div>
                                <StatusBadge status={booking.status} />
                            </div>

                            {booking.scheduled_date && (
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                    <Calendar size={13} className="text-slate-400" />
                                    {new Date(booking.scheduled_date).toLocaleDateString("fr-DZ", {
                                        weekday: "long",
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}