"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

function shouldHideBottomBar(pathname: string) {
    return (
        pathname.startsWith("/admin") ||
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/messages")
    );
}

export function RouteAwareBottomBar({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    if (shouldHideBottomBar(pathname)) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 w-full z-[100] bg-white/70 backdrop-blur-2xl border-t border-white/60 shadow-[0_-8px_30px_rgba(0,0,0,0.05)]">
            {children}
        </div>
    );
}
