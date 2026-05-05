"use client";

import { useToast } from "@/components/ui/toast";
import { pauseSponsoredItem, prolongSponsoredItem, resumeSponsoredItem, terminateSponsoredItem } from "@/lib/actions/sponsoring-admin";
import { Loader2, PauseCircle, PlayCircle, PlusCircle, Skull } from "lucide-react";
import { useState, useTransition } from "react";

type SponsoredItemActionsProps = {
    itemId: string;
    currentStatus: "active" | "scheduled" | "expired" | "paused" | "terminated";
};

type ActionKind = "pause" | "resume" | "prolong" | "terminate";

type ActionModalState = {
    action: ActionKind;
    title: string;
    description: string;
    noteLabel: string;
    confirmLabel: string;
    daysLabel?: string;
    daysDefault?: string;
} | null;

export function SponsoredItemActions({ itemId, currentStatus }: SponsoredItemActionsProps) {
    const [isPending, startTransition] = useTransition();
    const [activeAction, setActiveAction] = useState<ActionKind | null>(null);
    const [actionModal, setActionModal] = useState<ActionModalState>(null);
    const [noteValue, setNoteValue] = useState("");
    const [daysValue, setDaysValue] = useState("7");
    const { toast } = useToast();

    const runAction = (action: ActionKind, fn: () => Promise<void>) => {
        setActiveAction(action);
        startTransition(async () => {
            try {
                await fn();
            } catch (error) {
                toast(error instanceof Error ? error.message : "Erreur inattendue.", "error");
            } finally {
                setActiveAction(null);
                setActionModal(null);
                setNoteValue("");
                setDaysValue("7");
            }
        });
    };

    const openActionModal = (config: ActionModalState) => {
        setActionModal(config);
        setNoteValue("");
        setDaysValue(config?.daysDefault ?? "7");
    };

    const handlePause = () => {
        openActionModal({
            action: "pause",
            title: "Suspendre la campagne",
            description: "La campagne sera mise en pause immédiatement.",
            noteLabel: "Note interne (optionnel)",
            confirmLabel: "Confirmer la suspension",
        });
    };

    const handleResume = () => {
        openActionModal({
            action: "resume",
            title: "Reprendre la campagne",
            description: "La durée restante sera recalculée à partir de maintenant.",
            noteLabel: "Note interne (optionnel)",
            confirmLabel: "Confirmer la reprise",
        });
    };

    const handleProlong = () => {
        openActionModal({
            action: "prolong",
            title: "Prolonger la campagne",
            description: "Ajoutez des jours supplémentaires à la date de fin.",
            noteLabel: "Note interne (optionnel)",
            confirmLabel: "Confirmer la prolongation",
            daysLabel: "Jours supplémentaires",
            daysDefault: "7",
        });
    };

    const handleTerminate = () => {
        openActionModal({
            action: "terminate",
            title: "Terminer la campagne",
            description: "Cette action marque la campagne comme terminée.",
            noteLabel: "Raison interne (optionnel)",
            confirmLabel: "Confirmer la clôture",
        });
    };

    const submitAction = () => {
        if (!actionModal) return;

        if (actionModal.action === "pause") {
            runAction("pause", async () => {
                await pauseSponsoredItem(itemId, noteValue);
            });
            return;
        }

        if (actionModal.action === "resume") {
            runAction("resume", async () => {
                await resumeSponsoredItem(itemId, noteValue);
            });
            return;
        }

        if (actionModal.action === "prolong") {
            const extraDays = Number.parseInt(daysValue, 10);
            if (!Number.isInteger(extraDays) || extraDays <= 0) {
                return;
            }

            runAction("prolong", async () => {
                await prolongSponsoredItem(itemId, extraDays, noteValue);
            });
            return;
        }

        runAction("terminate", async () => {
            await terminateSponsoredItem(itemId, noteValue);
        });
    };

    if (currentStatus === "terminated") {
        return (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-500">
                Cette campagne est terminée.
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-wrap gap-3 pt-4">
                {currentStatus === "paused" ? (
                    <button
                        type="button"
                        onClick={handleResume}
                        disabled={isPending}
                        className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50"
                    >
                        {isPending && activeAction === "resume" ? <Loader2 size={16} className="animate-spin" /> : <PlayCircle size={16} />}
                        Reprendre
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handlePause}
                        disabled={isPending}
                        className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700 transition-colors hover:bg-amber-100 disabled:opacity-50"
                    >
                        {isPending && activeAction === "pause" ? <Loader2 size={16} className="animate-spin" /> : <PauseCircle size={16} />}
                        Suspendre
                    </button>
                )}

                <button
                    type="button"
                    onClick={handleProlong}
                    disabled={isPending}
                    className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary/15 disabled:opacity-50"
                >
                    {isPending && activeAction === "prolong" ? <Loader2 size={16} className="animate-spin" /> : <PlusCircle size={16} />}
                    Prolonger
                </button>

                <button
                    type="button"
                    onClick={handleTerminate}
                    disabled={isPending}
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700 transition-colors hover:bg-rose-100 disabled:opacity-50"
                >
                    {isPending && activeAction === "terminate" ? <Loader2 size={16} className="animate-spin" /> : <Skull size={16} />}
                    Terminer
                </button>
            </div>

            {actionModal ? (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <button
                        type="button"
                        className="absolute inset-0 bg-slate-900/45 backdrop-blur-sm"
                        onClick={() => setActionModal(null)}
                        aria-label="Fermer"
                    />
                    <div className="apple-panel relative z-10 w-full max-w-md p-6">
                        <h3 className="text-xl font-black text-slate-900">{actionModal.title}</h3>
                        <p className="mt-2 text-sm font-medium text-slate-600">{actionModal.description}</p>

                        <div className="mt-5 space-y-3">
                            {actionModal.daysLabel ? (
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                                        {actionModal.daysLabel}
                                    </span>
                                    <input
                                        type="number"
                                        min={1}
                                        value={daysValue}
                                        onChange={(event) => setDaysValue(event.target.value)}
                                        className="glass-input"
                                    />
                                </label>
                            ) : null}

                            <label className="block">
                                <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                                    {actionModal.noteLabel}
                                </span>
                                <textarea
                                    rows={3}
                                    value={noteValue}
                                    onChange={(event) => setNoteValue(event.target.value)}
                                    className="glass-input resize-none"
                                />
                            </label>
                        </div>

                        <div className="mt-6 flex flex-wrap justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setActionModal(null)}
                                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={submitAction}
                                disabled={isPending || (actionModal.action === "prolong" && (!Number.isInteger(Number.parseInt(daysValue, 10)) || Number.parseInt(daysValue, 10) <= 0))}
                                className="apple-cta inline-flex items-center rounded-xl px-4 py-2 text-sm font-bold disabled:opacity-60"
                            >
                                {isPending ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
                                {actionModal.confirmLabel}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
}
