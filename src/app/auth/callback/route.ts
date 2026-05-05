import { createSupabaseServerClient } from '@/lib/supabase/server';
import { resolvePostLoginPath, sanitizeRedirectPath } from '@/lib/auth/redirect';
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
            // Si la session est créée, on redirige vers l'url finale
            const target = resolvePostLoginPath(data.user?.email ?? null, next);
            return NextResponse.redirect(`${origin}${target}`);
        } else {
            console.error('Auth Error:', error.message);
        }
    }

    // En cas d'erreur ou d'absence de code, on redirige vers le login avec une erreur
    return NextResponse.redirect(`${origin}/auth/login?error=Could not authenticate user`);
}
