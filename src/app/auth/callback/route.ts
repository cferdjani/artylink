import { createSupabaseServerClient } from '@/lib/supabase/server';
import { resolvePostLoginPathWithAdminState, sanitizeRedirectPath } from '@/lib/auth/redirect';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    // next est un paramètre optionnel pour rediriger vers une page spécifique après le login
    const next = sanitizeRedirectPath(searchParams.get('next') ?? searchParams.get('redirectedFrom'));

    if (code) {
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            const { data: adminAccount } = await supabase
                .from("admin_accounts")
                .select("admin_type, is_active, activation_status")
                .maybeSingle();

            let adminPermissions = null;

            if (adminAccount?.admin_type === "delegate" && adminAccount.is_active && adminAccount.activation_status === "active") {
                const { data: permissions } = await supabase
                    .from("admin_permissions")
                    .select("can_view_dashboard, can_manage_users, can_manage_payments, can_manage_sponsoring, can_manage_support_logs")
                    .maybeSingle();

                adminPermissions = permissions;
            }

            // Si la session est créée, on redirige vers l'url finale
            const target = resolvePostLoginPathWithAdminState({
                email: data.user?.email ?? null,
                requestedPath: next,
                adminAccount,
                adminPermissions,
            });
            return NextResponse.redirect(`${origin}${target}`);
        } else {
            console.error('Auth Error:', error.message);
        }
    }

    // En cas d'erreur ou d'absence de code, on redirige vers le login avec une erreur
    return NextResponse.redirect(`${origin}/auth/login?error=Could not authenticate user`);
}
