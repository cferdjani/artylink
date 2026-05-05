"use client";

import type { BookingItem, DemandItem } from "@/lib/actions/dashboard-services";
import {
    AlertCircle,
    Briefcase,
    Calendar,
    CheckCircle2,
    Clock,
    FileText,
    Plus,
    Search,
    XCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// ─── Status config ────────────────────────────────────────────────────────────

const BOOKING_STATUS: Record<string, { label: string; cls: string; Icon: React.ElementType }> = {
    pending:   { label: "En attente",  cls: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",   Icon: Clock },
    accepted:  { label: "Accepté",     cls: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200", Icon: CheckCircle2 },
    completed: { label: "Terminé",     cls: "bg-blue-100 text-blue-700 ring-1 ring-blue-200",     Icon: CheckCircle2 },
    rejected:  { label: "Refusé",      cls: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",     Icon: XCircle },
    cancelled: { label: "Annulé",      cls: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",  Icon: XCircle },
};

function BookingBadge({ status }: { status: string }) {
    const cfg = BOOKING_STATUS[status] ?? { label: status.toUpperCase(), cls: "bg-slate-100 text-slate-600 ring-1 ring-slate-200", Icon: AlertCircle };
    const { Icon } = cfg;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.cls}`}>
            <Icon size={11} />
            {cfg.label}
        </span>
    );
}

// ─── Empty States ─────────────────────────────────────────────────────────────

function EmptyBookings() {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl border border-dashed border-slate-200 bg-white/60 backdrop-blur-xl shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-100 flex items-center justify-center mb-4 shadow-sm">
                <Calendar size={24} className="text-indigo-400" />
            </div>
            <h3 className="text-base font-black text-slate-800 mb-1">Aucune réservation</h3>
            <p className="text-sm text-slate-500 font-medium max-w-xs leading-relaxed mb-6">
                Vous n&apos;avez pas encore réservé de service. Parcourez les artisans disponibles près de chez vous.
            </p>
            <Link
                href="/search"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-indigo-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md hover:brightness-110 transition-all"
            >
                <Search size={16} />
                Trouver un artisan
            </Link>
        </div>
    );
}

function EmptyDemands() {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl border border-dashed border-slate-200 bg-white/60 backdrop-blur-xl shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-50 to-slate-50 border border-orange-100 flex items-center justify-center mb-4 shadow-sm">
                <FileText size={24} className="text-orange-400" />
            </div>
            <h3 className="text-base font-black text-slate-800 mb-1">Aucune demande en cours</h3>
            <p className="text-sm text-slate-500 font-medium max-w-xs leading-relaxed mb-6">
                Publiez votre besoin et recevez des réponses d&apos;artisans qualifiés dans votre région.
            </p>
            <Link
                href="/rfq/new"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md hover:brightness-110 transition-all"
            >
                <Plus size={16} />
                Publier une demande
            </Link>
        </div>
    );
}

function EmptyConfirmed() {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl border border-dashed border-slate-200 bg-white/60 backdrop-blur-xl shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-slate-50 border border-emerald-100 flex items-center justify-center mb-4 shadow-sm">
                <CheckCircle2 size={24} className="text-emerald-400" />
            </div>
            <h3 className="text-base font-black text-slate-800 mb-1">Pas de services confirmés</h3>
            <p className="text-sm text-slate-500 font-medium max-w-xs leading-relaxed">
                Les services acceptés ou terminés s&apos;afficheront ici pour un suivi simplifié.
            </p>
        </div>
    );
}

// ─── Tab content ──────────────────────────────────────────────────────────────

function BookingsList({ items }: { items: BookingItem[] }) {
    if (items.length === 0) return <EmptyBookings />;
    return (
        <div className="grid gap-3">
            {items.map(b => (
                <div
                    key={b.id}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl p-5 shadow-sm hover:shadow-md hover:bg-white/80 transition-all"
                >
                    <div className="space-y-2 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <BookingBadge status={b.status} />
                            {b.scheduled_date && (
                                <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                                    <Calendar size={12} className="text-slate-400" />
                                    {new Date(b.scheduled_date).toLocaleDateString("fr-DZ", { day: "2-digit", month: "short", year: "numeric" })}
                                </span>
                            )}
                        </div>
                        {b.description && (
                            <p className="text-sm text-slate-700 font-medium line-clamp-2 leading-relaxed">{b.description}</p>
                        )}
                    </div>
                    {b.price_agreed && (
                        <div className="shrink-0 text-right">
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Prix convenu</p>
                            <p className="text-lg font-black text-slate-900">{b.price_agreed.toLocaleString("fr-DZ")} DZD</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

function DemandsList({ items }: { items: DemandItem[] }) {
    if (items.length === 0) return <EmptyDemands />;
    return (
        <div className="grid gap-3">
            {items.map(d => (
                <div
                    key={d.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl p-5 shadow-sm hover:shadow-md hover:bg-white/80 transition-all"
                >
                    <div className="space-y-1.5 min-w-0">
                        <h3 className="font-black text-slate-900 text-sm truncate">{d.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                            <span className="capitalize">{d.wilaya}</span>
                            {d.budget_range && <><span>·</span><span>{d.budget_range}</span></>}
                            <span>·</span>
                            <span>{new Date(d.created_at).toLocaleDateString("fr-DZ")}</span>
                        </div>
                    </div>
                    <span className={`shrink-0 px-3 py-1 text-xs font-bold rounded-full ring-1 ${
                        d.status === "active" ? "bg-emerald-100 text-emerald-700 ring-emerald-200" : "bg-slate-100 text-slate-600 ring-slate-200"
                    }`}>
                        {d.status === "active" ? "Active" : d.status}
                    </span>
                </div>
            ))}
        </div>
    );
}

function ConfirmedList({ items }: { items: BookingItem[] }) {
    if (items.length === 0) return <EmptyConfirmed />;
    return (
        <div className="grid gap-3">
            {items.map(b => (
                <div
                    key={b.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl p-5 shadow-sm hover:shadow-md hover:bg-white/80 transition-all"
                >
                    <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2">
                            <BookingBadge status={b.status} />
                        </div>
                        {b.description && (
                            <p className="text-sm text-slate-700 font-medium line-clamp-2">{b.description}</p>
                        )}
                        {b.scheduled_date && (
                            <p className="text-xs text-slate-500 font-bold flex items-center gap-1.5">
                                <Calendar size={12} className="text-slate-400" />
                                {new Date(b.scheduled_date).toLocaleDateString("fr-DZ", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}
                            </p>
                        )}
                    </div>
                    {b.price_agreed && (
                        <div className="shrink-0 text-right">
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Montant</p>
                            <p className="text-lg font-black text-slate-900">{b.price_agreed.toLocaleString("fr-DZ")} DZD</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

// ─── Main export ──────────────────────────────────────────────────────────────

type ServiceTabId = "bookings" | "demands" | "confirmed";

interface ServicesTabsProps {
    bookings: BookingItem[];
    demands: DemandItem[];
    confirmed: BookingItem[];
    isArtisan: boolean;
}

export function ServicesTabs({ bookings, demands, confirmed, isArtisan }: ServicesTabsProps) {
    const [activeTab, setActiveTab] = useState<ServiceTabId>("bookings");

    const tabs: { id: ServiceTabId; label: string; count: number; Icon: React.ElementType }[] = [
        { id: "bookings",  label: isArtisan ? "Réservations reçues" : "Mes réservations", count: bookings.length,  Icon: Calendar },
        { id: "demands",   label: isArtisan ? "Offres de service"    : "Mes demandes",     count: demands.length,   Icon: FileText },
        { id: "confirmed", label: "Services confirmés",                                    count: confirmed.length, Icon: Briefcase },
    ];

    return (
        <div className="space-y-6">
            {/* Tab bar */}
            <div className="flex flex-col sm:flex-row gap-2 p-1.5 bg-slate-100/80 backdrop-blur-sm rounded-2xl border border-slate-200/60">
                {tabs.map(tab => {
                    const { Icon } = tab;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-bold transition-all ${
                                activeTab === tab.id
                                    ? "bg-white text-slate-900 shadow-md"
                                    : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            <Icon size={15} className={activeTab === tab.id ? "text-primary" : "text-slate-400"} />
                            <span className="truncate">{tab.label}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-black shrink-0 ${
                                activeTab === tab.id ? "bg-primary/10 text-primary" : "bg-slate-200 text-slate-500"
                            }`}>
                                {tab.count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            {activeTab === "bookings"  && <BookingsList items={bookings} />}
            {activeTab === "demands"   && <DemandsList items={demands} />}
            {activeTab === "confirmed" && <ConfirmedList items={confirmed} />}
        </div>
    );
}
