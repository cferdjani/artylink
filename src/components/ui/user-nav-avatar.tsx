"use client";

import { User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function UserNavAvatar({ url, name }: { url?: string | null; name?: string | null }) {
    return (
        <Link
            href="/dashboard/account"
            className="flex items-center gap-2 rounded-full border border-slate-200/50 bg-white/50 p-1 pr-3 transition-colors hover:bg-white shadow-sm backdrop-blur-sm"
        >
            <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-slate-200">
                {url ? (
                    <Image src={url} alt="Avatar" fill className="object-cover" />
                ) : (
                    <User className="h-5 w-5 text-slate-500" />
                )}
            </div>
            <span className="hidden text-sm font-bold text-slate-700 sm:block">
                {name || "Compte"}
            </span>
        </Link>
    );
}