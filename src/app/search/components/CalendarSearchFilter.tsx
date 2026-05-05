"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function CalendarSearchFilter() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [date, setDate] = useState(searchParams.get("date") || "");

    const applyFilters = (e: React.FormEvent) => {
        e.preventDefault();
        const current = new URLSearchParams(Array.from(searchParams.entries()));

        if (date) {
            current.set("date", date);
        } else {
            current.delete("date");
        }

        // Reset page when we change filters
        current.delete("page");

        const search = current.toString();
        const query = search ? `?${search}` : "";
        router.push(`${pathname}${query}`);
    };

    const clearFilters = () => {
        setDate("");
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        current.delete("date");
        current.delete("page");

        const search = current.toString();
        const query = search ? `?${search}` : "";
        router.push(`${pathname}${query}`);
    };

    const hasActiveDateFilter = !!searchParams.get("date");

    return (
        <form onSubmit={applyFilters} className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="filter_date">Date de disponibilité</label>
                <input
                    id="filter_date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-lg border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
            </div>

            <div className="flex gap-2">
                <button
                    type="submit"
                    className="inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700"
                >
                    Filtrer par date
                </button>

                {hasActiveDateFilter && (
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
                    >
                        Effacer
                    </button>
                )}
            </div>
        </form>
    );
}