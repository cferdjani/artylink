"use client";

import { createBookingWithAddress } from "@/lib/actions/booking";
import { Loader2 } from "lucide-react";

import { ALGERIA_WILAYAS, COMMUNES_BY_WILAYA } from "@/lib/algeria-data";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function BookingModal({
    artisanId,
    artisanName,
    defaultWilaya,
    defaultCommune,
    isAuthenticated,
}: {
    artisanId: string;
    artisanName: string;
    defaultWilaya: string | null;
    defaultCommune: string | null;
    isAuthenticated: boolean;
}) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [errorMsg, setErrorMsg] = useState("");


    // Initial wilaya/commune logic
    const initialWilaya = defaultWilaya && ALGERIA_WILAYAS.includes(defaultWilaya) ? defaultWilaya : "";
    const initialCommune = initialWilaya && defaultCommune && COMMUNES_BY_WILAYA[initialWilaya]?.includes(defaultCommune)
        ? defaultCommune
        : "";

    const [wilaya, setWilaya] = useState(initialWilaya);
    const [commune, setCommune] = useState(initialCommune);
    const [form, setForm] = useState({
        scheduled_date: "",
        scheduled_time: "",
        address_line: "",
        city: initialCommune || defaultCommune || "",
        description: "",
    });

    if (!isAuthenticated) {
        return (
            <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50 p-6 text-center">
                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                    Réserver {artisanName}
                </h3>
                <p className="mb-4 text-sm text-slate-600">
                    Créez un compte client pour réserver ce professionnel.
                </p>
                <button
                    onClick={() => router.push(`/auth/login?redirectedFrom=/artisan/${artisanId}`)}
                    className="inline-flex rounded-lg bg-orange-500 px-6 py-2 font-semibold text-white hover:bg-orange-600"
                >
                    Me connecter pour réserver
                </button>
            </div>
        );
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");

        startTransition(async () => {
            const formData = new FormData();
            formData.set("artisanId", artisanId);
            formData.set("date", form.scheduled_date);
            formData.set("time", form.scheduled_time || "");
            formData.set("address", `${form.address_line}, ${form.city}, ${wilaya}`);
            formData.set("description", form.description);

            try {
                await createBookingWithAddress(formData);
                setIsOpen(false);
                router.push("/dashboard/services?tab=reservations");
            } catch (err: any) {
                setErrorMsg("Erreur lors de la reservation : " + (err?.message || "Veuillez reessayer."));
            }
        });
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="mt-6 w-full rounded-xl bg-slate-900 px-6 py-3 font-bold text-white transition hover:bg-slate-800 shadow-sm"
            >
                Demander une réservation
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10">
                        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900">Nouvelle réservation</h3>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                                &times; Fermer
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            {errorMsg && (
                                <div className="mb-4 rounded-lg bg-rose-50 p-3 text-sm font-medium text-rose-600">
                                    {errorMsg}
                                </div>
                            )}
                            <div className="space-y-4 text-left">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor="scheduled_date">Date souhaitée</label>
                                        <input
                                            id="scheduled_date"
                                            type="date"
                                            required
                                            value={form.scheduled_date}
                                            onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })}
                                            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor="scheduled_time">Heure (optionnel)</label>
                                        <input
                                            id="scheduled_time"
                                            type="time"
                                            value={form.scheduled_time}
                                            onChange={(e) => setForm({ ...form, scheduled_time: e.target.value })}
                                            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor="address_line">Adresse de l&apos;intervention</label>
                                    <input
                                        id="address_line"
                                        type="text"
                                        required
                                        value={form.address_line}
                                        placeholder="Ex: Cité 100 logts, BT 4"
                                        onChange={(e) => setForm({ ...form, address_line: e.target.value })}
                                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Wilaya</label>
                                    <select
                                        id="wilaya-select"
                                        aria-label="Wilaya"
                                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                        value={wilaya}
                                        required
                                        onChange={e => {
                                            setWilaya(e.target.value);
                                            setCommune("");
                                            setForm(f => ({ ...f, city: "" }));
                                        }}
                                    >
                                        <option value="">Sélectionner une wilaya</option>
                                        {ALGERIA_WILAYAS.map(w => (
                                            <option key={w} value={w}>{w}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Commune</label>
                                    {wilaya && COMMUNES_BY_WILAYA[wilaya] ? (
                                        <select
                                            id="commune-select"
                                            aria-label="Commune"
                                            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                            value={commune}
                                            required
                                            onChange={e => {
                                                setCommune(e.target.value);
                                                setForm(f => ({ ...f, city: e.target.value }));
                                            }}
                                        >
                                            <option value="">Sélectionner une commune</option>
                                            {COMMUNES_BY_WILAYA[wilaya].map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    ) : wilaya ? (
                                        <input
                                            type="text"
                                            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                            placeholder="Commune"
                                            required
                                            value={form.city}
                                            onChange={e => {
                                                setCommune("");
                                                setForm(f => ({ ...f, city: e.target.value }));
                                            }}
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                            placeholder="Commune"
                                            required
                                            value={form.city}
                                            onChange={e => {
                                                setCommune("");
                                                setForm(f => ({ ...f, city: e.target.value }));
                                            }}
                                        />
                                    )}
                                    {wilaya && (
                                        <p className="mt-1.5 text-xs font-medium text-slate-500">Zone de l&apos;artisan : {wilaya}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor="description">Description du besoin</label>
                                    <textarea
                                        id="description"
                                        required
                                        rows={3}
                                        value={form.description}
                                        placeholder="Décrivez rapidement ce qu'il faut faire..."
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 shadow-sm hover:shadow-md"
                                >
                                    {isPending ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
                                    {isPending ? "Création..." : "Confirmer la réservation"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}