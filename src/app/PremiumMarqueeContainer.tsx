import PremiumMarquee, { type PremiumItem } from "@/components/ui/PremiumMarquee";
import { isExpectedDynamicServerUsageError } from "@/lib/next-runtime";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSponsoredCampaignVisible } from "@/lib/sponsored-campaigns";

function readPayloadString(payload: Record<string, unknown> | null, key: string) {
    const value = payload?.[key];
    return typeof value === "string" ? value : "";
}

function readPayloadNumber(payload: Record<string, unknown> | null, key: string, fallback: number) {
    const value = payload?.[key];
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export async function PremiumMarqueeContainer() {
    let premiumItems: PremiumItem[] = [];

    try {
        const supabase = await createSupabaseServerClient();
        const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") ?? "";

        // ── 1. Artisans premium via Shuffle Bag RPC ──
        const { data: proArtisans } = await supabase
            .rpc("get_next_premium_batch", { batch_size: 10 });

        if (proArtisans && proArtisans.length > 0) {
            premiumItems = proArtisans.map((a: any) => ({
                id: a.artisan_id || a.id,
                type: "artisan" as const,
                name: a.name || "Artisan Pro",
                profession: a.profession || "Expert",
                rating: a.rating || 5.0,
                avatar_url: a.avatar_url,
                link: a.link || undefined,
                priority: 0,
            }));
        }

        // ── 2. Campagnes sponsorisées (table sponsored_items) ──
        const { data: sponsoredRows } = await supabase
            .from("sponsored_items")
            .select("id, type, payload, image_path, link, duration_seconds, start_at, end_at")
            .order("created_at", { ascending: false })
            .limit(20);

        if (sponsoredRows && sponsoredRows.length > 0) {
            const nowMs = Date.now();

            const sponsoredItems: PremiumItem[] = sponsoredRows
                .filter((r: any) =>
                    isSponsoredCampaignVisible(nowMs, r.start_at, r.end_at, r.payload?.admin_status)
                )
                .map((r: any) => {
                    const priority = readPayloadNumber(r.payload, "priority", 0);
                    const imageUrl = r.image_path
                        ? `${baseUrl}/storage/v1/object/public/demos/${r.image_path}`
                        : undefined;

                    if (r.type === "artisan") {
                        return {
                            id: readPayloadString(r.payload, "artisan_id") || r.id,
                            type: "artisan" as const,
                            name: readPayloadString(r.payload, "name") || "Artisan",
                            profession: readPayloadString(r.payload, "profession") || "Prestataire",
                            avatar_url: imageUrl,
                            link: r.link ?? undefined,
                            priority,
                        };
                    }

                    return {
                        id: r.id,
                        type: "sponsor" as const,
                        brand_name: readPayloadString(r.payload, "brand_name") || "Sponsor",
                        product_desc: readPayloadString(r.payload, "product_desc") || "Promotion",
                        logo_url: imageUrl,
                        link: r.link ?? undefined,
                        priority,
                    };
                });

            premiumItems = [...premiumItems, ...sponsoredItems];
        }

        // ── 3. Tri par priorité (plus haute d'abord) ──
        premiumItems.sort((a, b) => ((b as any).priority ?? 0) - ((a as any).priority ?? 0));

        // ── 4. Fallback si rien ──
        if (premiumItems.length === 0) {
            premiumItems = [
                { id: "fallback-1", type: "sponsor", brand_name: "Devenez Sponsor", product_desc: "Espace disponible" },
            ];
        }
    } catch (err) {
        if (!isExpectedDynamicServerUsageError(err)) {
            console.error("Error fetching premium items in PremiumMarqueeContainer:", err);
        }
        premiumItems = [];
    }

    return <PremiumMarquee items={premiumItems} durationSeconds={60} />;
}
