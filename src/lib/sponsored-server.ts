// Import server client dynamically inside functions to avoid bundling server-only code into client builds

import { isSponsoredCampaignVisible } from "./sponsored-campaigns";

type SponsoredPayload = Record<string, unknown> | null;

export type SponsoredItemRow = {
    id: string;
    type: "artisan" | "sponsor";
    payload: SponsoredPayload;
    image_path: string | null;
    link: string | null;
    duration_seconds: number | null;
    start_at: string;
    end_at: string;
};

function readPayloadString(payload: SponsoredPayload, key: string) {
    const value = payload?.[key];
    return typeof value === "string" ? value : "";
}

export async function getActiveSponsoredItems(): Promise<Array<{
    id: string;
    type: "artisan" | "sponsor";
    title: string;
    subtitle?: string;
    imageUrl?: string;
    link?: string;
    durationSeconds?: number;
}>> {
    try {
        const { createSupabaseServerClient } = await import("@/lib/supabase/server");
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .from("sponsored_items")
            .select("id, type, payload, image_path, link, duration_seconds, start_at, end_at")
            .order("created_at", { ascending: false })
            .limit(20);

        if (error || !data) {
            return [];
        }

        const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") ?? "";
        const nowMs = Date.now();
        return (data as SponsoredItemRow[])
            .filter((r) => isSponsoredCampaignVisible(nowMs, r.start_at, r.end_at, r.payload?.admin_status))
            .map((r) => {
                const imageUrl = r.image_path ? `${baseUrl.replace(/\/$/, "")}/storage/v1/object/public/demos/${r.image_path}` : undefined;
                let title = "";
                let subtitle = "";

                if (r.type === "artisan") {
                    title = readPayloadString(r.payload, "name") || "Artisan";
                    subtitle = readPayloadString(r.payload, "profession") || "Prestataire";
                } else {
                    title = readPayloadString(r.payload, "brand_name") || "Sponsor";
                    subtitle = readPayloadString(r.payload, "product_desc") || "Promotion";
                }

                return {
                    id: r.type === "artisan"
                        ? readPayloadString(r.payload, "id") || readPayloadString(r.payload, "artisan_id") || r.id
                        : r.id,
                    type: r.type,
                    title,
                    subtitle,
                    imageUrl,
                    link: r.link ?? undefined,
                    durationSeconds: r.duration_seconds ?? undefined,
                };
            });
    } catch {
        return [];
    }
}
