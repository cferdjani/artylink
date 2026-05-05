"use client";

import AvatarUpload from "@/components/ui/avatar-upload";
import { useToast } from "@/components/ui/toast";
import { createBrowserClient } from "@supabase/ssr";
import { Edit2, MapPin, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GlassPanel } from "../AccountTabsClient";
import type { AccountArtisanRecord, AccountProfileRecord } from "../types";

interface Props {
    profile: AccountProfileRecord;
    artisan: AccountArtisanRecord | null;
}

export function AccountProfileTab({ profile, artisan }: Props) {
    const { toast } = useToast();
    const router = useRouter();

    const handleAvatarUpload = async (url: string) => {
        try {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );
            await supabase.from("profiles").update({ avatar_url: url }).eq("id", profile.id);
            await supabase.auth.updateUser({ data: { avatar_url: url } });
            toast("Photo de profil mise à jour.", "success");
            router.refresh();
        } catch {
            toast("Erreur lors de la sauvegarde de l'avatar.", "error");
        }
    };

    return (
        <GlassPanel>
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200/70">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <User size={18} />
                    </div>
                    <h2 className="text-base font-black text-slate-900">Informations personnelles</h2>
                </div>
                <Link
                    href="/dashboard/account/info"
                    className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-hover transition-colors"
                >
                        <Edit2 size={16} /> Modifier
                </Link>
            </div>

            <div className="mb-8 flex flex-col sm:flex-row items-center gap-6">
                <AvatarUpload uid={profile.id} url={profile.avatar_url} onUpload={handleAvatarUpload} />
                <div className="text-center sm:text-left">
                    <h3 className="text-2xl font-bold text-slate-900">{profile.full_name || "Utilisateur"}</h3>
                    <p className="text-sm font-medium text-slate-500 capitalize">{profile.role}</p>
                    {(profile.commune || profile.wilaya || profile.city) && (
                        <p className="text-sm font-medium text-slate-400 mt-1 flex items-center justify-center sm:justify-start gap-1">
                            <MapPin size={14} /> {[profile.commune, profile.wilaya].filter(Boolean).join(", ") || profile.city}
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-8 animate-fade-in-up">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                            <p className="mb-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Prénom</p>
                            <p className="text-sm font-bold text-slate-900">{profile.first_name || "-"}</p>
                        </div>
                        <div>
                            <p className="mb-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Nom</p>
                            <p className="text-sm font-bold text-slate-900">{profile.last_name || "-"}</p>
                        </div>
                        <div>
                            <p className="mb-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Téléphone</p>
                            <p className="text-sm font-bold text-slate-900">{profile.phone || "-"}</p>
                        </div>
                        <div>
                            <p className="mb-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Age</p>
                            <p className="text-sm font-bold text-slate-900">{profile.age ? `${profile.age} ans` : "-"}</p>
                        </div>
                        <div>
                            <p className="mb-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Wilaya</p>
                            <p className="text-sm font-bold text-slate-900">{profile.wilaya || "-"}</p>
                        </div>
                        <div>
                            <p className="mb-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Commune</p>
                            <p className="text-sm font-bold text-slate-900">{profile.commune || profile.city || "-"}</p>
                        </div>
                    </div>

                    {artisan && (
                        <>
                            <hr className="border-slate-200/70 my-2" />
                            <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">Informations professionnelles</h3>
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div>
                                    <p className="mb-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Raison sociale</p>
                                    <p className="text-sm font-bold text-slate-900">{artisan.company_name || "-"}</p>
                                </div>
                                <div>
                                    <p className="mb-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Métier</p>
                                    <p className="text-sm font-bold text-slate-900">{artisan.profession || "-"}</p>
                                </div>
                                <div>
                                    <p className="mb-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Spécialités</p>
                                    <p className="text-sm font-bold text-slate-900">{artisan.specialties?.filter(Boolean).join(", ") || "-"}</p>
                                </div>
                                <div>
                                    <p className="mb-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Disponibilité</p>
                                    <p className="text-sm font-bold text-slate-900">
                                        {artisan.availability_status === 'unavailable' ? '🔴 Hors ligne' : '🟢 En ligne'}
                                    </p>
                                </div>
                                <div>
                                    <p className="mb-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Wilaya d'intervention</p>
                                    <p className="text-sm font-bold text-slate-900">{artisan.wilaya || "-"}</p>
                                </div>
                                <div>
                                    <p className="mb-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Ville d'intervention</p>
                                    <p className="text-sm font-bold text-slate-900">{artisan.city || "-"}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="mb-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Adresse</p>
                                    <p className="text-sm font-bold text-slate-900">{artisan.address || "-"}</p>
                                </div>
                                <div>
                                    <p className="mb-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Tarif horaire</p>
                                    <p className="text-sm font-bold text-slate-900">
                                        {artisan.hourly_rate ? `${artisan.hourly_rate} ${artisan.currency || 'DZD'}` : "-"}
                                    </p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="mb-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Biographie</p>
                                    <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap leading-relaxed">{artisan.bio || "-"}</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
        </GlassPanel>
    );
}
