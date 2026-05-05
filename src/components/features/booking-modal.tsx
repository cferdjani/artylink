"use client";

import { createBookingWithAddress } from "@/lib/actions/booking";
import { Calendar, CheckCircle, Clock, FileText, Loader2, MapPin, X } from "lucide-react";
import { useState, useTransition } from "react";

interface BookingModalProps {
    artisanId: string;
    artisanName: string;
}

export function BookingModal({ artisanId, artisanName }: BookingModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        setResult(null);

        startTransition(async () => {
            try {
                await createBookingWithAddress(formData);
                setResult({ type: "success", text: "Demande de reservation envoyee avec succes. L'artisan vous contactera rapidement." });
                // Auto-close after 3 seconds on success
                setTimeout(() => {
                    setIsOpen(false);
                    setResult(null);
                }, 3000);
            } catch (err: any) {
                setResult({ type: "error", text: err?.message || "Une erreur est survenue lors de l'envoi de la demande." });
            }
        });
    };

    return (
        <>
            {/* Le bouton d'ouverture (a placer sur le profil artisan) */}
            <button
                onClick={() => { setIsOpen(true); setResult(null); }}
                className="glass-btn-primary w-full py-3 md:w-auto md:px-8 shadow-md hover:shadow-lg"
            >
                Reserver {artisanName}
            </button>

            {/* Le Modal en Glassmorphism */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
                    <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-6 shadow-2xl backdrop-blur-2xl sm:p-8 animate-fade-in-up">

                        <button
                            onClick={() => { setIsOpen(false); setResult(null); }}
                            className="absolute right-4 top-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100/50 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="mb-6">
                            <h2 className="text-2xl font-poppins font-bold text-slate-800">Demande de reservation</h2>
                            <p className="text-sm font-medium text-slate-500 mt-1">
                                Planifiez une intervention avec <span className="text-primary font-bold">{artisanName}</span>.
                            </p>
                        </div>

                        {result?.type === "success" ? (
                            <div className="flex flex-col items-center gap-4 py-8 animate-fade-in-up">
                                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <CheckCircle size={32} className="text-emerald-600" />
                                </div>
                                <p className="text-center text-sm font-bold text-emerald-700 max-w-sm">
                                    {result.text}
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <input type="hidden" name="artisanId" value={artisanId} />

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                            <Calendar size={16} className="text-primary" /> Date
                                        </label>
                                        <input
                                            type="date"
                                            name="date"
                                            required
                                            className="w-full bg-white/60 border border-slate-200/60 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                            <Clock size={16} className="text-primary" /> Heure
                                        </label>
                                        <input
                                            type="time"
                                            name="time"
                                            required
                                            className="w-full bg-white/60 border border-slate-200/60 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <MapPin size={16} className="text-primary" /> Adresse d'intervention
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        required
                                        placeholder="Ex: 123 Rue de la Liberte, Alger Centre..."
                                        className="w-full bg-white/60 border border-slate-200/60 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium placeholder-slate-400"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <FileText size={16} className="text-primary" /> Description du besoin
                                    </label>
                                    <textarea
                                        name="description"
                                        required
                                        rows={3}
                                        placeholder="Decrivez votre probleme ou votre projet en quelques mots..."
                                        className="w-full bg-white/60 border border-slate-200/60 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium placeholder-slate-400 resize-none"
                                    />
                                </div>

                                {result?.type === "error" && (
                                    <div className="bg-rose-50 text-rose-700 p-3 rounded-xl border border-rose-200 text-sm font-medium">
                                        {result.text}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full glass-btn-primary py-3 shadow-md mt-4 flex items-center justify-center disabled:opacity-70"
                                >
                                    {isPending ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
                                    {isPending ? "Envoi en cours..." : "Confirmer la demande"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}