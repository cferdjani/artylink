"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type QualificationFieldTemplate = {
    id: string;
    label: string;
    type: "select" | "checkbox" | "radio";
    options: string[];
};

export async function getQualificationTemplate(categorySlug: string): Promise<QualificationFieldTemplate[]> {
    try {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .from("qualification_templates")
            .select("schema_json")
            .eq("category_slug", categorySlug)
            .maybeSingle();

        if (error || !data) {
            return [];
        }

        return data.schema_json as QualificationFieldTemplate[];
    } catch {
        return [];
    }
}
