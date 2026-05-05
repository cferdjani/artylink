import { getActiveSponsoredItems } from "@/lib/sponsored-server";
import PremiumMarquee, { PremiumItem } from "./PremiumMarquee";

export default async function PremiumMarqueeExample() {
    const rows = await getActiveSponsoredItems();

    // S'il n'y a aucun sponsor réel en base de données, on ne rend pas le composant en production
    if (!rows || rows.length === 0) {
        return null;
    }

    const items: PremiumItem[] = rows.map((r) =>
        r.type === "artisan"
            ? ({ id: r.id, type: "artisan", name: r.title, profession: r.subtitle, avatar_url: r.imageUrl ?? undefined, link: r.link ?? undefined } as PremiumItem)
            : ({ id: r.id, type: "sponsor", brand_name: r.title, product_desc: r.subtitle, logo_url: r.imageUrl ?? undefined, link: r.link ?? undefined } as PremiumItem),
    );

    return (
        <div className="mx-auto max-w-6xl px-4 py-1">
            <h2 className="mb-1 text-lg font-semibold text-slate-800">Artisans & Sponsors Premium</h2>
            <PremiumMarquee items={items} durationSeconds={30} />
        </div>
    );
}
