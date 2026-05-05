"use client";

import { CheckCircle2, XCircle, X } from "lucide-react";
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = useCallback((message: string, type: ToastType = "info") => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`pointer-events-auto flex items-center gap-3 rounded-2xl p-4 shadow-[0_8px_30px_rgba(15,23,42,0.12)] border backdrop-blur-xl animate-fade-in-up transition-all ${
                            t.type === "success"
                                ? "bg-emerald-50/90 border-emerald-200/50 text-emerald-900"
                                : t.type === "error"
                                ? "bg-rose-50/90 border-rose-200/50 text-rose-900"
                                : "bg-white/90 border-slate-200/50 text-slate-900"
                        }`}
                    >
                        {t.type === "success" && <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />}
                        {t.type === "error" && <XCircle size={20} className="text-rose-500 shrink-0" />}
                        <p className="text-sm font-bold">{t.message}</p>
                        <button onClick={() => removeToast(t.id)} className="ml-2 text-slate-400 hover:text-slate-600 transition-colors">
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}
