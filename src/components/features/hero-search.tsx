"use client";

import { ALGERIA_WILAYAS } from "@/lib/algeria-data";
import type { MarketplaceCategory } from "@/lib/marketplace-data";
import { buildRechercheHref } from "@/lib/search-utils";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

type Props = {
    categories: MarketplaceCategory[];
};

export function HeroSearch({ categories }: Props) {
    const router = useRouter();

    const [selectedWilaya, setSelectedWilaya] = useState<string>("");
    const [selectedCommune, setSelectedCommune] = useState<string>("");
    const [availableCommunes, setAvailableCommunes] = useState<string[]>([]);
    const [isLoadingCommunes, setIsLoadingCommunes] = useState(false);

    useEffect(() => {
        if (!selectedWilaya) {
            setAvailableCommunes([]);
            setSelectedCommune("");
            return;
        }

        const controller = new AbortController();

        const loadCommunes = async () => {
            setIsLoadingCommunes(true);

            try {
                const response = await fetch(
                    `/api/geo/communes?wilaya=${encodeURIComponent(selectedWilaya)}`,
                    { signal: controller.signal },
                );

                if (!response.ok) {
                    setAvailableCommunes([]);
                    setSelectedCommune("");
                    return;
                }

                const payload = (await response.json()) as { communes?: string[] };
                const communes = Array.isArray(payload.communes) ? payload.communes : [];
                setAvailableCommunes(communes);

                setSelectedCommune((current) => (communes.includes(current) ? current : ""));
            } catch {
                if (!controller.signal.aborted) {
                    setAvailableCommunes([]);
                    setSelectedCommune("");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoadingCommunes(false);
                }
            }
        };

        loadCommunes();

        return () => {
            controller.abort();
        };
    }, [selectedWilaya]);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const q = String(formData.get("q") ?? "");
        const wilaya = String(formData.get("wilaya") ?? "");
        const commune = selectedCommune;

        const href = buildRechercheHref({
            category: "tous-services",
            wilaya: wilaya === "" ? undefined : wilaya,
            commune: commune === "" ? undefined : commune,
            q: q === "" ? undefined : q,
        });

        router.push(href);
    };

    return (
        <section className="relative text-center md:pt-8 pb-4">
            <div className="animate-fade-in-up">
                <h1 className="mb-4 text-4xl font-bold tracking-[-0.03em] text-slate-900 drop-shadow-sm leading-[1.1] md:text-5xl lg:text-6xl">
                    Trouvez l'Expert <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Idéal</span><br />
                    Près de Chez Vous
                </h1>
                <p className="mt-4 mb-10 text-base md:text-lg font-medium text-slate-600 max-w-2xl mx-auto">
                    Des annonces, cartes de visite et services locaux pour entrer en contact directement, sans promesse artificielle.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="relative mx-auto mt-2 max-w-[920px] animate-fade-in-up delay-1">
                <div className="flex flex-col gap-3 rounded-3xl border border-white/60 bg-white/50 p-2.5 shadow-xl backdrop-blur-2xl md:flex-row md:items-center md:gap-0 md:rounded-full">
                    <label className="flex min-w-0 items-center px-4 py-3 text-base text-slate-500 md:flex-1 relative group">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-focus-within:text-primary transition-colors shrink-0 mr-3"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        <input
                            name="q"
                            placeholder="Que recherchez-vous ? (ex: Plombier...)"
                            aria-label="Recherche metier"
                            className="w-full border-none bg-transparent font-medium text-slate-800 outline-none placeholder:text-slate-400"
                        />
                    </label>

                    <div className="mx-1 hidden h-10 w-px bg-slate-200 md:block" />

                    <label className="flex items-center px-4 py-3 text-base text-slate-500 md:w-[180px] relative group">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-focus-within:text-primary transition-colors shrink-0 mr-3"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        <select
                            name="wilaya"
                            value={selectedWilaya}
                            onChange={(e) => setSelectedWilaya(e.target.value)}
                            aria-label="Wilaya"
                            className="w-full cursor-pointer appearance-none border-none bg-transparent font-semibold text-slate-800 outline-none truncate"
                        >
                            <option value="">Toute l'Algérie</option>
                            {ALGERIA_WILAYAS.map((wilaya) => (
                                <option key={wilaya} value={wilaya}>
                                    {wilaya}
                                </option>
                            ))}
                        </select>
                    </label>

                    <div className="mx-1 hidden h-10 w-px bg-slate-200 md:block" />

                    <label className="flex items-center px-4 py-3 text-base text-slate-500 md:w-[200px] relative group">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-focus-within:text-primary transition-colors shrink-0 mr-3"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg>
                        <select
                            name="commune"
                            value={selectedCommune}
                            onChange={(e) => setSelectedCommune(e.target.value)}
                            aria-label="Commune"
                            disabled={!selectedWilaya || isLoadingCommunes || availableCommunes.length === 0}
                            className="w-full cursor-pointer appearance-none border-none bg-transparent font-medium text-slate-800 outline-none disabled:opacity-50 truncate"
                        >
                            <option value="">
                                {isLoadingCommunes ? "Chargement..." : "Communes"}
                            </option>
                            {availableCommunes.map((commune) => (
                                <option key={commune} value={commune}>
                                    {commune}
                                </option>
                            ))}
                        </select>
                    </label>

                    <button
                        type="submit"
                        className="mt-2 inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-blue-500 px-8 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-95 md:mt-0 md:rounded-full"
                    >
                        <span>Rechercher</span>
                    </button>
                </div>
            </form>
        </section>
    );
}
