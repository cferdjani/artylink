'use client';

import { GlassCard } from "@/components/ui/glass-card";
import { resolvePostLoginPathWithAdminState, sanitizeRedirectPath } from "@/lib/auth/redirect";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

async function resolveAuthenticatedRedirectPath(nextPath: string, email: string | null | undefined) {
    const supabase = createSupabaseBrowserClient();

    const { data: adminAccount } = await supabase
        .from("admin_accounts")
        .select("admin_type, is_active, activation_status")
        .maybeSingle();

    let adminPermissions = null;

    if (adminAccount?.admin_type === "delegate" && adminAccount.is_active && adminAccount.activation_status === "active") {
        const { data } = await supabase
            .from("admin_permissions")
            .select("can_view_dashboard, can_manage_users, can_manage_payments, can_manage_sponsoring, can_manage_support_logs")
            .maybeSingle();

        adminPermissions = data;
    }

    return resolvePostLoginPathWithAdminState({
        email,
        requestedPath: nextPath,
        adminAccount,
        adminPermissions,
    });
}

function LoginPageContent() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);
    const searchParams = useSearchParams();
    const nextPath = sanitizeRedirectPath(searchParams.get("redirectedFrom") ?? searchParams.get("next"));

    useEffect(() => {
        let mounted = true;

        const redirectIfAlreadyLoggedIn = async () => {
            try {
                const supabase = createSupabaseBrowserClient();
                const {
                    data: { user },
                } = await supabase.auth.getUser();

                if (!mounted) {
                    return;
                }

                if (user) {
                    const target = await resolveAuthenticatedRedirectPath(nextPath, user.email);
                    window.location.replace(target);
                    return;
                }
            } catch {
                // If Supabase is temporarily unavailable, keep the login form visible.
            }

            if (mounted) {
                setCheckingSession(false);
            }
        };

        redirectIfAlreadyLoggedIn();

        return () => {
            mounted = false;
        };
    }, [nextPath]);

    const handleGoogleLogin = async () => {
        try {
            setIsLoadingGoogle(true);
            const supabase = createSupabaseBrowserClient();
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
                }
            });
            if (error) {
                setError(error.message);
            }
        } catch {
            setError("Erreur inattendue lors de la connexion Google.");
        } finally {
            setIsLoadingGoogle(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        if (!email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
            setError("Adresse email invalide.");
            return;
        }
        if (password.length < 8) {
            setError("Le mot de passe doit contenir au moins 8 caractères.");
            return;
        }
        setLoading(true);
        try {
            const supabase = createSupabaseBrowserClient();
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) {
                setError(error.message);
            } else {
                setSuccess(true);
                const target = await resolveAuthenticatedRedirectPath(nextPath, data.user?.email ?? email);
                window.location.href = target;
            }
        } catch {
            setError("Erreur inattendue. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
            setError("Entrez votre email ci-dessus avant de demander la reinitialisation.");
            return;
        }
        setResetLoading(true);
        setError(null);
        try {
            const supabase = createSupabaseBrowserClient();
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
            });
            if (error) {
                setError(error.message);
            } else {
                setResetSent(true);
            }
        } catch {
            setError("Erreur lors de l'envoi du lien de reinitialisation.");
        } finally {
            setResetLoading(false);
        }
    };

    if (checkingSession) {
        return (
            <div className="mx-auto w-full max-w-md px-4 pb-16 pt-6 md:px-0 mt-20">
                <GlassCard className="p-6 md:p-8 flex flex-col items-center text-center">
                    <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                    <h1 className="text-xl font-bold text-text-primary">Vérification de votre session</h1>
                    <p className="mt-2 text-sm text-text-secondary">
                        Si vous êtes déjà connecté, ArtyLink vous renvoie automatiquement vers votre espace.
                    </p>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-md px-4 pb-16 pt-6 md:px-0 mt-20">
            <GlassCard className="p-6 md:p-8 flex flex-col items-center">
                <h1 className="text-2xl font-bold text-text-primary mb-2">Bienvenue</h1>
                <p className="mb-6 text-sm text-text-secondary text-center">
                    Connectez-vous pour accéder à votre profil Artisan ou Client.
                </p>
                <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit} autoComplete="off">
                    <label className="flex flex-col gap-1">
                        <span className="text-sm font-medium">Adresse email</span>
                        <input
                            type="email"
                            className="rounded-lg border border-slate-200 px-4 py-2 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            autoFocus
                            placeholder="votre@email.com"
                        />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-sm font-medium">Mot de passe</span>
                        <input
                            type="password"
                            className="rounded-lg border border-slate-200 px-4 py-2 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            minLength={8}
                            placeholder="••••••••"
                        />
                    </label>
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={handleForgotPassword}
                            disabled={resetLoading}
                            className="text-xs font-semibold text-primary hover:underline disabled:opacity-50"
                        >
                            {resetLoading ? "Envoi..." : "Mot de passe oublie ?"}
                        </button>
                    </div>
                    {error && (
                        <div className="rounded bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm w-full">{error}</div>
                    )}
                    {success && (
                        <div className="rounded bg-green-50 border border-green-200 text-green-700 px-4 py-2 text-sm w-full">
                            Connexion reussie ! Redirection en cours...
                        </div>
                    )}
                    {resetSent && (
                        <div className="rounded bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 text-sm w-full">
                            Un lien de reinitialisation a ete envoye a {email}. Verifiez votre boite mail.
                        </div>
                    )}
                    <button
                        type="submit"
                        className="mt-2 rounded-lg bg-primary px-6 py-2.5 text-base font-bold text-white shadow-sm transition hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? "Connexion..." : "Se connecter"}
                    </button>
                </form>
                <div className="my-6 w-full flex items-center gap-2">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-xs text-slate-400">ou</span>
                    <div className="flex-1 h-px bg-slate-200" />
                </div>
                <button
                    onClick={handleGoogleLogin}
                    disabled={isLoadingGoogle}
                    className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 disabled:opacity-50"
                >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    {isLoadingGoogle ? 'Connexion...' : 'Continuer avec Google'}
                </button>
                <div className="mt-6 text-center text-sm text-slate-600 w-full">
                    Pas encore de compte ?{' '}
                    <a href={`/auth/register-type?${new URLSearchParams({ redirectedFrom: nextPath }).toString()}`} className="text-primary font-semibold hover:underline">S&apos;inscrire</a>
                </div>
                <p className="mt-6 text-xs text-center text-text-secondary">
                    En continuant, vous acceptez nos{' '}
                    <a href="/legal" className="text-primary hover:underline">conditions d&apos;utilisation</a>{' '}
                    et notre{' '}
                    <a href="/privacy" className="text-primary hover:underline">politique de confidentialite</a>.
                </p>
            </GlassCard>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="mx-auto w-full max-w-md px-4 pb-16 pt-6 md:px-0 mt-20 text-center text-slate-500">
                Chargement...
            </div>
        }>
            <LoginPageContent />
        </Suspense>
    );
}
