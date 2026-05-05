const fs = require('fs');

const component = `"use client";

import { ALGERIA_WILAYAS, COMMUNES_BY_WILAYA } from "@/lib/algeria-data";
import { buildRechercheHref } from "@/lib/search-utils";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function HeroSearch() {
    const router = useRouter();
    
    // We store the selected wilaya so the commune dropdown updates automatically!
    const [selectedWilaya, setSelectedWilaya] = useState<string>("");

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const q = String(formData.get("q") ?? "");
        const wilaya = String(formData.get("wilaya") ?? "");
        const commune = String(formData.get("commune") ?? "");

        const href = buildRechercheHref({
            category: "tous-services",
            wilaya: wilaya === "" ? undefined : wilaya,
            commune: commune === "" ? undefined : commune,
            q: q === "" ? undefined : q,
        });

        router.push(href);
    };

    // Selected communes, or empty if not matched
    const availableCommunes = selectedWilaya ? (COMMUNES_BY_WILAYA[selectedWilaya] ?? []) : [];

    return (
        <section className="relative text-center md:pt-4">
            <h1 className="text-balance text-4xl font-extrabold tracking-tight text-slate-800 drop-shadow-sm md:text-[52px] md:leading-[1.1]">
                Trouvez l&#39;Expert Idéal Près de Chez Vous
            </h1>
            <p className="mt-3 mb-8 text-balance text-xl font-medium text-slate-700/80 drop-shadow-sm md:text-3xl">
                Explorez Nos Catégories de Services
            </p>

            <form onSubmit={handleSubmit} className="relative mx-auto mt-6 max-w-[880px]">
                <div className="flex flex-col gap-2 rounded-[24px] border border-white/60 bg-white/40 p-2 shadow-[0_12px_44px_rgba(0,0,0,0.12)] backdrop-blur-[24px] md:flex-row md:items-center md:gap-0 md:rounded-full">
                    <label className="flex min-w-0 items-center px-4 py-3 text-base text-slate-500 md:flex-1">
                        <input
                            name="q"
                            placeholder="Que recherchez-vous ? (ex: Plombier...)"
                            aria-label="Recherche metier"
                            className="w-full border-none bg-transparent font-medium text-slate-800 outline-none placeholder:text-slate-500/80"
                        />
                    </label>

                    <div className="mx-2 hidden h-8 w-[1.5px] bg-slate-300 md:block" />

                    <label className="flex items-center px-4 py-3 text-base text-slate-500 md:w-[160px]">
                        <select
                            name="wilaya"
                            value={selectedWilaya}
                            onChange={(e) => setSelectedWilaya(e.target.value)}
                            aria-label="Wilaya"
                            className="w-full cursor-pointer appearance-none border-none bg-transparent font-semibold text-slate-900 outline-none"
                        >
                            <option value="">Toute l'Algérie</option>
                            {ALGERIA_WILAYAS.map((wilaya) => (
                                <option key={wilaya} value={wilaya}>
                                    {wilaya}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="flex items-center px-2 py-3 text-base text-slate-500 md:w-[220px]">
                        <select
                            name="commune"
                            defaultValue=""
                            aria-label="Commune"
                            disabled={!selectedWilaya || availableCommunes.length === 0}
                            className="w-full cursor-pointer appearance-none border-none bg-transparent font-medium text-slate-800 outline-none disabled:opacity-50"
                        >
                            <option value="">Toutes les communes</option>
                            {availableCommunes.map((commune) => (
                                <option key={commune} value={commune}>
                                    {commune}
                                </option>
                            ))}
                        </select>
                    </label>

                    <button
                        type="submit"
                        className="mt-2 inline-flex items-center justify-center rounded-[1.5rem] bg-orange-400 px-8 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-[0_6px_14px_rgba(251,146,60,0.4)] transition-all hover:bg-orange-500 hover:shadow-[0_8px_20px_rgba(251,146,60,0.5)] active:scale-95 md:mt-0 md:rounded-full"
                    >
                        RECHERCHER
                    </button>
                </div>
            </form>
        </section>
    );
}`;

fs.writeFileSync('src/components/features/hero-search.tsx', component);
console.log('src/components/features/hero-search.tsx updated');
