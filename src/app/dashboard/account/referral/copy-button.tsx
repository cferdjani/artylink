"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button onClick={handleCopy} className="p-3 bg-white/60 hover:bg-white border border-slate-200 rounded-xl transition-all text-slate-600 hover:text-primary shadow-sm flex items-center justify-center shrink-0">
            {copied ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} />}
        </button>
    );
}