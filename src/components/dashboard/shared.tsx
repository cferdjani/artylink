import { GlassCard } from "@/components/ui/glass-card";
import Link from "next/link";
import type { ComponentType } from "react";

export function SummaryCard({
    label,
    value,
    hint,
    icon: Icon,
    toneClass,
}: {
    label: string;
    value: number | string;
    hint: string;
    icon: ComponentType<{ size?: number; className?: string }>;
    toneClass: string;
}) {
    return (
        <GlassCard className="p-5 border-white/60">
            <div className="flex items-center gap-4">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${toneClass}`}>
                    <Icon size={22} />
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-500">{label}</p>
                    <h2 className="text-2xl font-black text-slate-900">{value}</h2>
                </div>
            </div>
            <p className="mt-3 text-xs font-medium text-slate-500">{hint}</p>
        </GlassCard>
    );
}

export function OverviewCard({
    label,
    value,
    hint,
    icon: Icon,
    toneClass,
    href,
}: {
    label: string;
    value: string | number;
    hint: string;
    icon: ComponentType<{ size?: number; className?: string }>;
    toneClass: string;
    href?: string;
}) {
    const card = (
        <GlassCard className="p-6 border-white/60">
            <div className="flex items-center gap-4">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${toneClass}`}>
                    <Icon size={22} />
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-500">{label}</p>
                    <h2 className="text-2xl font-black text-slate-900">{value}</h2>
                </div>
            </div>
            <p className="mt-3 text-xs font-medium text-slate-500">{hint}</p>
        </GlassCard>
    );

    if (href) {
        return (
            <Link href={href} className="block transition-transform hover:-translate-y-1 hover:shadow-lg rounded-2xl">
                {card}
            </Link>
        );
    }

    return card;
}

export function EmptyState({
    title,
    description,
    primaryHref,
    primaryLabel,
}: {
    title: string;
    description: string;
    primaryHref: string;
    primaryLabel: string;
}) {
    return (
        <div className="rounded-2xl border-2 border-dashed border-slate-200/60 bg-slate-50/50 px-6 py-10 text-center">
            <h3 className="text-lg font-black text-slate-900">{title}</h3>
            <p className="mx-auto mt-2 max-w-md text-sm font-medium text-slate-500">{description}</p>
            <div className="mt-6">
                <Link href={primaryHref} className="glass-btn-primary">
                    {primaryLabel}
                </Link>
            </div>
        </div>
    );
}

export function TabLink({
    href,
    label,
    count,
    isActive,
}: {
    href: string;
    label: string;
    count: number;
    isActive: boolean;
}) {
    return (
        <Link
            href={href}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition-colors ${
                isActive
                    ? "border-primary bg-primary text-white shadow-sm"
                    : "border-slate-200 bg-white/70 text-slate-600 hover:border-primary/25 hover:text-primary"
            }`}
        >
            <span>{label}</span>
            <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-black ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}
            >
                {count}
            </span>
        </Link>
    );
}
