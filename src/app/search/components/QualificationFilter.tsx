"use client";

import type { QualificationFieldTemplate } from "@/lib/actions/qualifications";
import { ChevronDown, ChevronUp } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function QualificationFilter({ schema }: { schema: QualificationFieldTemplate[] }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [isOpen, setIsOpen] = useState(false);

    // Load initial answers from URL param 'qualifiers'
    const initialQualifiersStr = searchParams.get("qualifiers");
    let initialValues: Record<string, any> = {};
    try {
        if (initialQualifiersStr) {
            initialValues = JSON.parse(decodeURIComponent(initialQualifiersStr));
        }
    } catch (e) {
        initialValues = {};
    }

    const [answers, setAnswers] = useState<Record<string, any>>(initialValues);

    if (!schema || schema.length === 0) {
        return null; // Return nothing if there is no specific template for this category
    }

    const handleChange = (id: string, value: any) => {
        setAnswers((prev) => {
            const updated = { ...prev };

            // For checkboxes (arrays)
            if (Array.isArray(updated[id])) {
                if (updated[id].includes(value)) {
                    updated[id] = updated[id].filter((v: string) => v !== value);
                    if (updated[id].length === 0) delete updated[id];
                } else {
                    updated[id].push(value);
                }
            } else if (typeof value === "boolean") { // Initialize a missing array
                updated[id] = [value];
            } else {
                updated[id] = value;
            }

            // Cleanup empty strings
            if (updated[id] === "" || updated[id] === null) {
                delete updated[id];
            }

            return updated;
        });
    };

    const handleCheckboxChange = (id: string, value: string, checked: boolean) => {
        setAnswers((prev) => {
            const updated = { ...prev };
            let arr = updated[id] || [];
            if (!Array.isArray(arr)) arr = [arr];

            if (checked && !arr.includes(value)) {
                arr.push(value);
            } else if (!checked) {
                arr = arr.filter((v: string) => v !== value);
            }

            if (arr.length > 0) {
                updated[id] = arr;
            } else {
                delete updated[id];
            }
            return updated;
        });
    };

    const applyFilters = () => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));

        if (Object.keys(answers).length > 0) {
            current.set("qualifiers", encodeURIComponent(JSON.stringify(answers)));
        } else {
            current.delete("qualifiers");
        }

        current.delete("page");

        const search = current.toString();
        const query = search ? `?${search}` : "";
        router.push(`${pathname}${query}`);
        setIsOpen(false);
    };

    const clearFilters = () => {
        setAnswers({});
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        current.delete("qualifiers");
        current.delete("page");

        const search = current.toString();
        const query = search ? `?${search}` : "";
        router.push(`${pathname}${query}`);
    };

    const hasActiveFilters = Object.keys(initialValues).length > 0;

    return (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between p-4 font-bold text-slate-900 transition-colors hover:bg-slate-50"
            >
                <div className="flex items-center gap-2">
                    Filtres métier spécifiques
                    {hasActiveFilters && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
                            !
                        </span>
                    )}
                </div>
                {isOpen ? <ChevronUp size={20} className="text-slate-500" /> : <ChevronDown size={20} className="text-slate-500" />}
            </button>

            {isOpen && (
                <div className="border-t border-slate-100 p-4">
                    <div className="grid gap-6 sm:grid-cols-2">
                        {schema.map((field) => (
                            <div key={field.id}>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    {field.label}
                                </label>

                                {field.type === "select" && (
                                    <select
                                        value={answers[field.id] || ""}
                                        onChange={(e) => handleChange(field.id, e.target.value)}
                                        className="w-full rounded-lg border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    >
                                        <option value="">Indifférent</option>
                                        {field.options.map((opt) => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                )}

                                {field.type === "checkbox" && (
                                    <div className="space-y-2">
                                        {field.options.map((opt) => {
                                            const isChecked = (answers[field.id] || []).includes(opt);
                                            return (
                                                <label key={opt} className="flex items-center gap-2 text-sm text-slate-700">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={(e) => handleCheckboxChange(field.id, opt, e.target.checked)}
                                                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    {opt}
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}

                                {field.type === "radio" && (
                                    <div className="space-y-2">
                                        {field.options.map((opt) => (
                                            <label key={opt} className="flex items-center gap-2 text-sm text-slate-700">
                                                <input
                                                    type="radio"
                                                    name={field.id}
                                                    checked={answers[field.id] === opt}
                                                    onChange={() => handleChange(field.id, opt)}
                                                    className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                {opt}
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={applyFilters}
                            className="flex-1 sm:flex-none rounded-lg bg-indigo-600 px-6 py-2 text-sm font-bold text-white hover:bg-indigo-700"
                        >
                            Appliquer les filtres
                        </button>

                        {Object.keys(answers).length > 0 && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="flex-1 sm:flex-none rounded-lg border border-slate-300 bg-white px-6 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                            >
                                Réinitialiser
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}