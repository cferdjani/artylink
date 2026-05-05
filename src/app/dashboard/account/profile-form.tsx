"use client";

import { useToast } from "@/components/ui/toast";
import { updateProfileDetails } from "@/lib/actions/profile";
import { useTransition } from "react";

export function ProfileForm({ profile, artisan }: { profile: any; artisan: any }) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            try {
                await updateProfileDetails(formData);
                toast("Profil mis à jour avec succès.", "success");
            } catch (error: any) {
                toast(error.message || "Erreur de mise à jour.", "error");
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <label htmlFor="first_name" className="mb-1 block text-sm font-semibold text-slate-700">Prénom</label>
                    <input id="first_name" name="first_name" type="text" defaultValue={profile?.first_name || ""} required className="glass-input" />
                </div>
                <div>
                    <label htmlFor="last_name" className="mb-1 block text-sm font-semibold text-slate-700">Nom</label>
                    <input id="last_name" name="last_name" type="text" defaultValue={profile?.last_name || ""} required className="glass-input" />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <label htmlFor="phone" className="mb-1 block text-sm font-semibold text-slate-700">Téléphone</label>
                    <input id="phone" name="phone" type="tel" defaultValue={profile?.phone || ""} className="glass-input" />
                </div>

                <div>
                    <label htmlFor="wilaya" className="mb-1 block text-sm font-semibold text-slate-700">Wilaya</label>
                    <input id="wilaya" name="wilaya" type="text" defaultValue={profile?.wilaya || ""} className="glass-input" />
                </div>
                <div>
                    <label htmlFor="commune" className="mb-1 block text-sm font-semibold text-slate-700">Commune</label>
                    <input id="commune" name="commune" type="text" defaultValue={profile?.commune || ""} className="glass-input" />
                </div>
            </div>

            {profile?.role === "artisan" && (
                <>
                    <hr className="glass-divider my-6" />
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Informations Professionnelles</h2>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <label htmlFor="profession" className="mb-1 block text-sm font-semibold text-slate-700">Catégorie Métier</label>
                            <input id="profession" name="profession" type="text" defaultValue={artisan?.profession || ""} className="glass-input" />
                        </div>
                        <div>
                            <label htmlFor="specialties" className="mb-1 block text-sm font-semibold text-slate-700">Spécialité</label>
                            <input id="specialties" name="specialties" type="text" defaultValue={artisan?.specialties?.[0] || ""} className="glass-input" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="bio" className="mb-1 block text-sm font-semibold text-slate-700">Biographie</label>
                        <textarea id="bio" name="bio" rows={4} defaultValue={artisan?.bio || ""} className="glass-input resize-none"></textarea>
                    </div>
                </>
            )}
            <div className="flex justify-end pt-4">
                <button type="submit" disabled={isPending} className="glass-btn-primary w-full md:w-auto">
                    {isPending ? "Enregistrement..." : "Enregistrer les modifications"}
                </button>
            </div>
        </form>
    );
}