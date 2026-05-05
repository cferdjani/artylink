"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { useToast } from "@/components/ui/toast";
import {
    createDelegate,
    regenerateDelegateSecret,
    revokeDelegate,
    searchUsersForDelegate,
    toggleDelegateActive,
    updateDelegatePermissions,
} from "@/lib/actions/admin-delegates";
import {
    ADMIN_PERMISSION_LABELS,
    getPermissionSummary,
    type AdminPermissionKey,
    type AdminPermissions,
} from "@/lib/auth/admin-access";
import { CheckCircle2, Loader2, RefreshCw, Search, ShieldCheck, Trash2, UserRoundPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

type DelegateRecord = {
    userId: string;
    fullName: string | null;
    email: string | null;
    role: string | null;
    adminType: "delegate";
    activationStatus: string;
    isActive: boolean;
    permissions: AdminPermissions;
    createdAt: string | null;
};

type SearchResult = {
    userId: string;
    fullName: string | null;
    email: string | null;
    role: string | null;
};

const PERMISSION_KEYS = Object.keys(ADMIN_PERMISSION_LABELS) as AdminPermissionKey[];

function formatPermissionSummary(permissions: AdminPermissions) {
    const summary = getPermissionSummary(permissions);
    return summary.length > 0 ? summary : ["Aucun module activé"];
}

function buildDraftMap(delegates: DelegateRecord[]) {
    return Object.fromEntries(
        delegates.map((delegate) => [delegate.userId, { ...delegate.permissions }]),
    ) as Record<string, AdminPermissions>;
}

export function AdminDelegatesClient({ initialDelegates }: { initialDelegates: DelegateRecord[] }) {
    const router = useRouter();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [delegates, setDelegates] = useState<DelegateRecord[]>(initialDelegates);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [newPermissions, setNewPermissions] = useState<AdminPermissions>({
        can_view_dashboard: true,
        can_manage_users: false,
        can_manage_payments: false,
        can_manage_sponsoring: false,
        can_manage_support_logs: false,
    });
    const [drafts, setDrafts] = useState<Record<string, AdminPermissions>>(() => buildDraftMap(initialDelegates));
    const [activeMutationKey, setActiveMutationKey] = useState("");
    const [delegateToRevoke, setDelegateToRevoke] = useState<DelegateRecord | null>(null);
    const [newSecretCode, setNewSecretCode] = useState<string | null>(null);

    useEffect(() => {
        setDelegates(initialDelegates);
        setDrafts(buildDraftMap(initialDelegates));
    }, [initialDelegates]);

    const selectedUser = searchResults.find((result) => result.userId === selectedUserId) ?? null;

    const updatePermissionsState = (
        current: AdminPermissions,
        permission: AdminPermissionKey,
        checked: boolean,
    ) => ({
        ...current,
        [permission]: checked,
    });

    const runMutation = (
        key: string,
        task: () => Promise<void>,
        successMessage: string,
        shouldRefresh = true,
    ) => {
        setActiveMutationKey(key);
        startTransition(async () => {
            try {
                await task();
                toast(successMessage, "success");
                if (shouldRefresh) {
                    router.refresh();
                }
            } catch (error) {
                toast(error instanceof Error ? error.message : "Erreur inattendue.", "error");
            } finally {
                setActiveMutationKey("");
            }
        });
    };

    const handleSearch = () => {
        const trimmedQuery = searchQuery.trim();
        if (trimmedQuery.length < 2) {
            toast("Saisissez au moins 2 caractères pour rechercher un utilisateur.", "error");
            return;
        }

        runMutation("search", async () => {
            const results = await searchUsersForDelegate(trimmedQuery);
            setSearchResults(results);
            setSelectedUserId(results[0]?.userId ?? "");
        }, "Recherche mise à jour.", false);
    };

    const handleCreateDelegate = () => {
        if (!selectedUserId) {
            toast("Sélectionnez un utilisateur avant de créer un délégué.", "error");
            return;
        }

        runMutation("create", async () => {
            const res = await createDelegate({
                userId: selectedUserId,
                permissions: newPermissions,
            });
            setSearchResults([]);
            setSearchQuery("");
            setSelectedUserId("");
            if (res.rawSecret) {
                setNewSecretCode(res.rawSecret);
            }
        }, "Délégué créé ou réactivé.");
    };

    const handleSavePermissions = (delegate: DelegateRecord) => {
        runMutation(`save:${delegate.userId}`, async () => {
            await updateDelegatePermissions({
                userId: delegate.userId,
                permissions: drafts[delegate.userId] ?? delegate.permissions,
            });
        }, "Permissions mises à jour.");
    };

    const handleToggleActive = (delegate: DelegateRecord) => {
        runMutation(`toggle:${delegate.userId}`, async () => {
            await toggleDelegateActive(delegate.userId, !delegate.isActive);
        }, delegate.isActive ? "Délégué désactivé." : "Délégué réactivé.");
    };

    const handleRegenerateSecret = (userId: string) => {
        runMutation(`regen:${userId}`, async () => {
            const res = await regenerateDelegateSecret(userId);
            if (res.rawSecret) {
                setNewSecretCode(res.rawSecret);
            }
        }, "Nouveau code généré.");
    };

    const handleRevokeDelegate = () => {
        if (!delegateToRevoke) {
            return;
        }

        const userId = delegateToRevoke.userId;

        runMutation(`revoke:${userId}`, async () => {
            await revokeDelegate(userId);
            setDelegates((current) => current.filter((delegate) => delegate.userId !== userId));
            setDrafts((current) => {
                const next = { ...current };
                delete next[userId];
                return next;
            });
            setDelegateToRevoke(null);
        }, "Accès admin supprimé.", false);
    };

    return (
        <div className="space-y-6">
            <GlassCard className="p-6 border-white/70 bg-white/85 shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Créer un délégué</p>
                        <h2 className="mt-2 text-2xl font-black text-slate-900">Recherche d&apos;un compte existant</h2>
                        <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500">
                            Le délégué doit déjà exister dans `profiles`. Sélectionnez un utilisateur, cochez ses modules, puis créez son accès admin sans modifier son rôle métier.
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
                        <ShieldCheck size={14} /> Owner only
                    </div>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
                    <div className="space-y-4">
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    placeholder="Rechercher par email ou nom..."
                                    className="glass-input h-11 w-full pl-9 text-sm"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleSearch}
                                disabled={isPending}
                                className="apple-cta inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-bold disabled:opacity-60"
                            >
                                {isPending && activeMutationKey === "search" ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Search size={16} className="mr-2" />}
                                Rechercher
                            </button>
                        </div>

                        <div className="space-y-2">
                            {searchResults.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm font-medium text-slate-500">
                                    Lancez une recherche pour afficher les utilisateurs éligibles.
                                </div>
                            ) : (
                                searchResults.map((result) => {
                                    const isSelected = result.userId === selectedUserId;

                                    return (
                                        <button
                                            key={result.userId}
                                            type="button"
                                            onClick={() => setSelectedUserId(result.userId)}
                                            className={`flex w-full items-start justify-between rounded-2xl border px-4 py-3 text-left transition ${isSelected
                                                    ? "border-cyan-300 bg-cyan-50/80 shadow-[0_12px_30px_rgba(6,182,212,0.12)]"
                                                    : "border-slate-200 bg-white hover:border-slate-300"
                                                }`}
                                        >
                                            <div>
                                                <p className="text-sm font-black text-slate-900">{result.fullName || result.email || "Utilisateur"}</p>
                                                <p className="mt-1 text-xs font-semibold text-slate-500">{result.email || "Email non renseigné"}</p>
                                                <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">{result.role || "role inconnu"}</p>
                                            </div>
                                            {isSelected ? <CheckCircle2 size={18} className="shrink-0 text-cyan-600" /> : null}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
                        <div className="flex items-center gap-2 text-slate-900">
                            <UserRoundPlus size={18} className="text-primary" />
                            <h3 className="text-lg font-black">Permissions du nouveau délégué</h3>
                        </div>
                        <p className="mt-2 text-sm font-medium text-slate-500">
                            {selectedUser
                                ? `${selectedUser.fullName || selectedUser.email || "Utilisateur sélectionné"} recevra ces accès.`
                                : "Sélectionnez un utilisateur pour finaliser la création."}
                        </p>

                        <div className="mt-5 space-y-3">
                            {PERMISSION_KEYS.map((permission) => (
                                <label key={permission} className="flex items-start gap-3 rounded-2xl border border-white bg-white px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={newPermissions[permission]}
                                        onChange={(event) => setNewPermissions((current) => updatePermissionsState(current, permission, event.target.checked))}
                                        className="mt-1 h-4 w-4 rounded border-slate-300"
                                    />
                                    <span>
                                        <span className="block text-sm font-bold text-slate-900">{ADMIN_PERMISSION_LABELS[permission]}</span>
                                        <span className="block text-xs font-medium text-slate-500">{permission}</span>
                                    </span>
                                </label>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={handleCreateDelegate}
                            disabled={isPending || !selectedUserId}
                            className="apple-cta mt-5 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-bold disabled:opacity-60"
                        >
                            {isPending && activeMutationKey === "create" ? <Loader2 size={16} className="mr-2 animate-spin" /> : <ShieldCheck size={16} className="mr-2" />}
                            Créer le délégué
                        </button>
                    </div>
                </div>
            </GlassCard>

            <div className="grid gap-4">
                {delegates.length === 0 ? (
                    <GlassCard className="p-10 text-center border-dashed border-2 border-slate-200 bg-white/80 text-slate-500 font-medium">
                        Aucun admin délégué n&apos;est encore configuré.
                    </GlassCard>
                ) : (
                    delegates.map((delegate) => {
                        const draftPermissions = drafts[delegate.userId] ?? delegate.permissions;
                        const mutationKey = activeMutationKey;
                        const statusLabels = { pending: "En attente", active: "Actif", declined: "Refusé" };
                        const statusLabel = statusLabels[delegate.activationStatus as keyof typeof statusLabels] || delegate.activationStatus;
                        const statusColor = delegate.activationStatus === "active" ? "bg-emerald-100 text-emerald-700" :
                            delegate.activationStatus === "pending" ? "bg-amber-100 text-amber-700" :
                                "bg-rose-100 text-rose-700";

                        return (
                            <GlassCard key={delegate.userId} className="p-6 border-white/70 bg-white/90 shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-xl font-black text-slate-900">{delegate.fullName || delegate.email || "Délégué"}</h3>
                                            <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${delegate.isActive
                                                    ? "bg-slate-200 text-slate-700"
                                                    : "bg-slate-200 text-slate-600"
                                                }`}>
                                                {delegate.isActive ? "Actif" : "Inactif"}
                                            </span>
                                            <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${statusColor}`}>
                                                {statusLabel}
                                            </span>
                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                                                {delegate.role || "role inconnu"}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-sm font-semibold text-slate-500">{delegate.email || "Email non renseigné"}</p>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {formatPermissionSummary(delegate.permissions).map((label) => (
                                                <span key={`${delegate.userId}:${label}`} className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-[11px] font-bold text-cyan-700">
                                                    {label}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleToggleActive(delegate)}
                                            disabled={isPending}
                                            className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-slate-300 disabled:opacity-60"
                                        >
                                            {isPending && mutationKey === `toggle:${delegate.userId}` ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
                                            {delegate.isActive ? "Désactiver" : "Réactiver"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleSavePermissions(delegate)}
                                            disabled={isPending}
                                            className="apple-cta inline-flex items-center rounded-xl px-4 py-2 text-sm font-bold disabled:opacity-60"
                                        >
                                            {isPending && mutationKey === `save:${delegate.userId}` ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
                                            Enregistrer les droits
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleRegenerateSecret(delegate.userId)}
                                            disabled={isPending}
                                            className="inline-flex items-center rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700 transition hover:bg-amber-100 disabled:opacity-60"
                                        >
                                            {isPending && mutationKey === `regen:${delegate.userId}` ? <Loader2 size={16} className="mr-2 animate-spin" /> : <RefreshCw size={16} className="mr-2" />}
                                            Régénérer code
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDelegateToRevoke(delegate)}
                                            disabled={isPending}
                                            className="inline-flex items-center rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
                                        >
                                            <Trash2 size={16} className="mr-2" />
                                            Supprimer l&apos;accès admin
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                    {PERMISSION_KEYS.map((permission) => (
                                        <label key={`${delegate.userId}:${permission}`} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={draftPermissions[permission]}
                                                onChange={(event) => {
                                                    setDrafts((current) => ({
                                                        ...current,
                                                        [delegate.userId]: updatePermissionsState(
                                                            current[delegate.userId] ?? delegate.permissions,
                                                            permission,
                                                            event.target.checked,
                                                        ),
                                                    }));
                                                }}
                                                className="mt-1 h-4 w-4 rounded border-slate-300"
                                            />
                                            <span>
                                                <span className="block text-sm font-bold text-slate-900">{ADMIN_PERMISSION_LABELS[permission]}</span>
                                                <span className="block text-xs font-medium text-slate-500">{permission}</span>
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </GlassCard>
                        );
                    })
                )}
            </div>

            {delegateToRevoke ? (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <button
                        type="button"
                        className="absolute inset-0 bg-slate-900/45 backdrop-blur-sm"
                        onClick={() => setDelegateToRevoke(null)}
                        aria-label="Fermer"
                    />
                    <div className="apple-panel relative z-10 w-full max-w-md p-6">
                        <h3 className="text-xl font-black text-slate-900">Supprimer l&apos;accès admin</h3>
                        <p className="mt-2 text-sm font-medium text-slate-600">
                            Cette action supprime uniquement le rôle admin de <span className="font-bold text-slate-900">{delegateToRevoke.fullName || delegateToRevoke.email || "ce délégué"}</span>.
                            Le compte utilisateur et ses données `client/artisan` restent intacts.
                        </p>
                        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                            Effet attendu : suppression des entrées `admin_accounts` et `admin_permissions` pour ce délégué.
                        </div>

                        <div className="mt-6 flex flex-wrap justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setDelegateToRevoke(null)}
                                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={handleRevokeDelegate}
                                disabled={isPending}
                                className="inline-flex items-center rounded-xl border border-rose-200 bg-rose-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                            >
                                {isPending && delegateToRevoke && activeMutationKey === `revoke:${delegateToRevoke.userId}` ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Trash2 size={16} className="mr-2" />}
                                Confirmer la suppression
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}

            {newSecretCode ? (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                    <div className="apple-panel relative z-10 w-full max-w-lg p-8 text-center">
                        <ShieldCheck size={48} className="mx-auto text-emerald-500" />
                        <h3 className="mt-4 text-2xl font-black text-slate-900">Code Secret Admin Généré</h3>
                        <p className="mt-2 text-sm font-medium text-slate-600">
                            Transmettez ce code de manière sécurisée au délégué. Il ne sera affiché qu&apos;une seule fois et est requis pour l&apos;activation.
                        </p>
                        <div className="mt-6 rounded-2xl bg-slate-100 p-6 shadow-inner">
                            <span className="text-3xl font-mono font-black tracking-widest text-slate-900">{newSecretCode}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setNewSecretCode(null)}
                            className="apple-cta mt-8 w-full rounded-xl px-4 py-3 font-bold"
                        >
                            J&apos;ai copié le code
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
