import { createClient } from "@supabase/supabase-js";

export const MISSING_SUPABASE_SERVICE_ROLE_ERROR =
    "Missing Supabase service role configuration";

export function hasSupabaseServiceRoleConfiguration() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    return Boolean(supabaseUrl && supabaseServiceKey);
}

export function createSupabaseAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error(MISSING_SUPABASE_SERVICE_ROLE_ERROR);
    }

    return createClient(supabaseUrl, supabaseServiceKey);
}

export function createSupabaseAdminClientOrNull() {
    if (!hasSupabaseServiceRoleConfiguration()) {
        return null;
    }

    return createSupabaseAdminClient();
}
