"use client";

import { createOrGetChatRoom } from "@/lib/actions/chat";
import { CheckCircle2, Lock, Loader2, MessageCircle, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface PremiumContactGateProps {
    artisanId: string;
    artisanName: string;
    phone?: string | null;
    email?: string | null;
    hasActiveSubscription: boolean;
    isAuthenticated: boolean;
    isOwner?: boolean;
}

export default function PremiumContactGate({
    artisanId,
    artisanName,
    phone,
    email,
    hasActiveSubscription,
    isAuthenticated,
    isOwner = false,
}: PremiumContactGateProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Owners don't see the contact gate
    if (isOwner) return null;

    async function handleStartChat() {
        setLoading(true);
        setError(null);
        try {
            const result = await createOrGetChatRoom(artisanId);
            if ("error" in result && result.error) {
                setError(result.error as string);
            } else if ("roomId" in result && result.roomId) {
                router.push(`/messages/${result.roomId}`);
            }
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Erreur inattendue");
        } finally {
            setLoading(false);
        }
    }

    // Unauthenticated users: login gate
    if (!isAuthenticated) {
        return (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 text-center space-y-4">
                <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 text-orange-600">
                    <Lock size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                    Connexion requise pour contacter
                </h3>
                <p className="text-gray-600 text-sm">
                    Créez un compte ou connectez-vous pour envoyer un message à {artisanName}.
                </p>
                <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href={`/auth/login?redirectedFrom=/artisan/${artisanId}`}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                    >
                        Se connecter
                    </Link>
                    <Link
                        href={`/auth/register-type?redirectedFrom=/artisan/${artisanId}`}
                        className="bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 font-medium py-2 px-6 rounded-lg transition-colors"
                    >
                        Créer un compte
                    </Link>
                </div>
            </div>
        );
    }

    // Authenticated non-owner: full contact panel
    return (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Contacter {artisanName}</h3>
                {hasActiveSubscription && (
                    <span className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                        <CheckCircle2 size={14} className="mr-1" /> Accès PRO
                    </span>
                )}
            </div>

            <div className="p-6 space-y-4">
                {/* Message button — always available to authenticated non-owners */}
                <button
                    onClick={handleStartChat}
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                    {loading ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <MessageCircle size={18} />
                    )}
                    {loading ? "Ouverture..." : "Envoyer un message"}
                </button>

                {error && (
                    <p className="text-sm text-red-600 text-center">{error}</p>
                )}

                {/* Direct contacts — only shown to PRO subscribers */}
                {hasActiveSubscription && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {phone ? (
                            <a
                                href={`tel:${phone}`}
                                className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition-colors group"
                            >
                                <div className="bg-indigo-100 p-2 rounded-full text-indigo-700 group-hover:bg-indigo-200">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">Téléphone</p>
                                    <p className="text-gray-900 font-medium">{phone}</p>
                                </div>
                            </a>
                        ) : null}

                        {email ? (
                            <a
                                href={`mailto:${email}`}
                                className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition-colors group"
                            >
                                <div className="bg-emerald-100 p-2 rounded-full text-emerald-700 group-hover:bg-emerald-200">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">Email</p>
                                    <p className="text-gray-900 font-medium truncate max-w-[180px]">{email}</p>
                                </div>
                            </a>
                        ) : null}
                    </div>
                )}

                {!hasActiveSubscription && (
                    <div className="pt-2 text-center">
                        <p className="text-xs text-gray-500 mb-3">
                            Passez PRO pour accéder au téléphone et à l&apos;email directs.
                        </p>
                        <Link
                            href="/pricing"
                            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium underline underline-offset-2 transition-colors"
                        >
                            Voir les abonnements PRO →
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
