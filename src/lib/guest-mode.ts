import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useGuestMode() {
    useEffect(() => {
        let mounted = true;
        (async () => {
            if (typeof window === "undefined") return;
            try {
                const supabase = createSupabaseBrowserClient();
                const { data } = await supabase.auth.getUser();
                if (!mounted) return;
                if (data?.user) {
                    // Authenticated users should never have guest mode
                    localStorage.removeItem("guest_mode");
                    document.body.classList.remove("guest-mode");
                    return;
                }
            } catch (e) {
                // ignore and fallback to localStorage
            }

            const guest = localStorage.getItem("guest_mode");
            if (!mounted) return;
            if (guest === "1") {
                document.body.classList.add("guest-mode");
            } else {
                document.body.classList.remove("guest-mode");
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);
}

export async function requireAuthOrGuest(action: () => void, guestFallback: () => void) {
    if (typeof window === "undefined") return;
    try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
            // authenticated -> perform action
            localStorage.removeItem("guest_mode");
            action();
            return;
        }
    } catch (e) {
        // ignore and fallback
    }

    const guest = localStorage.getItem("guest_mode");
    if (guest === "1") {
        guestFallback();
    } else {
        action();
    }
}

export async function setGuestMode() {
    if (typeof window === "undefined") return false;
    try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
            // Do not set guest mode for authenticated users
            localStorage.removeItem("guest_mode");
            document.body.classList.remove("guest-mode");
            return false;
        }
    } catch (e) {
        // ignore and fallback to localStorage
    }

    localStorage.setItem("guest_mode", "1");
    document.body.classList.add("guest-mode");
    return true;
}

export function clearGuestMode() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("guest_mode");
    document.body.classList.remove("guest-mode");
}

export function isGuestMode() {
    if (typeof window === "undefined") return false;
    const guest = localStorage.getItem("guest_mode");
    return guest === "1";
}

export function logoutGuest(router: ReturnType<typeof useRouter>) {
    if (typeof window === "undefined") return;
    clearGuestMode();
    router.replace("/");
}
