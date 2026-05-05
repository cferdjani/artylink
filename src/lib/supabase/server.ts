import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY. La persistance n'est pas possible sans ces variables. Veuillez vérifier votre fichier .env.local.");
    }

    const cookieStore = await cookies();

    return createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        cookieStore.set(name, value, options);
                    });
                } catch {
                    // No-op for read-only contexts.
                }
            },
        },
    });
}

/**
 * Assure que l'utilisateur est authentifié. Utile pour les Server Actions ou Layouts.
 * Lève une erreur s'il n'y a pas d'utilisateur actif.
 */
export async function requireUser() {
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        throw new Error("unauthorized");
    }

    return user;
}

/**
 * Vérifie si l'utilisateur a un abonnement actif (pro ou starter).
 * En mode MVP "Option de transition", nous renvoyons `true` par défaut 
 * s'il n'y a pas encore d'intégration de paiement, ou on vérifie la DB `subscriptions`.
 */
export async function requireSubscription() {
    const user = await requireUser();
    const supabase = await createSupabaseServerClient();

    // Verification base de données
    const { data: sub, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['active'])
        .maybeSingle();

    // Si pas d'abonnement actif, lever une erreur ou retourner false selon le cas
    // En MVP de démo on laisse passer si le flag est défini, ou on force "unsubscribed"
    if (error || !sub) {
        throw new Error("subscription_required");
    }

    return { user, subscription: sub };
}
