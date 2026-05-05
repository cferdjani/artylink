import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

type CommuneRow = {
    commune_name_ascii: string | null;
};

type WilayaLookupRow = {
    wilaya_code: string;
    wilaya_name_ascii: string | null;
    wilaya_name: string | null;
};

let cachedLocalCommunesMap: Map<string, string[]> | null = null;

function normalizeWilayaName(value: string) {
    return value
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .replace(/[-_']/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

async function getLocalCommunesMap() {
    if (cachedLocalCommunesMap) {
        return cachedLocalCommunesMap;
    }

    const sqlPath = path.join(process.cwd(), "..", "algeria_cities_postgres.sql");
    const sqlContent = await readFile(sqlPath, "utf8");

    const map = new Map<string, Set<string>>();
    const insertRegex = /VALUES\s*\(\d+,'(?:[^']|'')*','((?:[^']|'')*)','(?:[^']|'')*','(?:[^']|'')*','(?:[^']|'')*','(?:[^']|'')*','((?:[^']|'')*)'\)/g;

    let match: RegExpExecArray | null;
    while ((match = insertRegex.exec(sqlContent)) !== null) {
        const communeAscii = match[1].replace(/''/g, "'").trim();
        const wilayaAscii = match[2].replace(/''/g, "'").trim();

        if (!communeAscii || !wilayaAscii) {
            continue;
        }

        const key = normalizeWilayaName(wilayaAscii);
        const list = map.get(key) ?? new Set<string>();
        list.add(communeAscii);
        map.set(key, list);
    }

    cachedLocalCommunesMap = new Map(
        Array.from(map.entries()).map(([key, values]) => [key, Array.from(values).sort((a, b) => a.localeCompare(b))]),
    );

    return cachedLocalCommunesMap;
}

async function getCommunesFallback(wilayaParam: string) {
    try {
        const map = await getLocalCommunesMap();
        return map.get(normalizeWilayaName(wilayaParam)) ?? [];
    } catch {
        return [];
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const wilayaParam = (searchParams.get("wilaya") ?? "").trim();

    if (!wilayaParam) {
        return NextResponse.json({ communes: [] });
    }

    const localCommunes = await getCommunesFallback(wilayaParam);
    if (localCommunes.length > 0) {
        return NextResponse.json({ communes: localCommunes });
    }

    try {
        const supabase = await createSupabaseServerClient();
        const { data: wilayaRows, error: wilayaError } = await supabase
            .from("algeria_cities")
            .select("wilaya_code, wilaya_name_ascii, wilaya_name");

        if (wilayaError || !wilayaRows?.length) {
            const fallbackCommunes = await getCommunesFallback(wilayaParam);
            return NextResponse.json({ communes: fallbackCommunes });
        }

        const normalizedInput = normalizeWilayaName(wilayaParam);
        const wilayaByCode = new Map<string, WilayaLookupRow>();

        for (const row of wilayaRows as WilayaLookupRow[]) {
            if (!wilayaByCode.has(row.wilaya_code)) {
                wilayaByCode.set(row.wilaya_code, row);
            }
        }

        const matchedWilaya = Array.from(wilayaByCode.values()).find((row) => {
            const ascii = normalizeWilayaName(row.wilaya_name_ascii ?? "");
            const nativeName = normalizeWilayaName(row.wilaya_name ?? "");
            return ascii === normalizedInput || nativeName === normalizedInput;
        });

        if (!matchedWilaya) {
            const fallbackCommunes = await getCommunesFallback(wilayaParam);
            return NextResponse.json({ communes: fallbackCommunes });
        }

        const { data: communeRows, error: communeError } = await supabase
            .from("algeria_cities")
            .select("commune_name_ascii")
            .eq("wilaya_code", matchedWilaya.wilaya_code)
            .order("commune_name_ascii", { ascending: true });

        if (communeError || !communeRows) {
            const fallbackCommunes = await getCommunesFallback(wilayaParam);
            return NextResponse.json({ communes: fallbackCommunes });
        }

        const communes = Array.from(
            new Set(
                (communeRows as CommuneRow[])
                    .map((row) => row.commune_name_ascii?.trim())
                    .filter((name): name is string => Boolean(name)),
            ),
        );

        if (communes.length === 0) {
            const fallbackCommunes = await getCommunesFallback(wilayaParam);
            return NextResponse.json({ communes: fallbackCommunes });
        }

        return NextResponse.json({ communes });
    } catch {
        const fallbackCommunes = await getCommunesFallback(wilayaParam);
        return NextResponse.json({ communes: fallbackCommunes });
    }
}
