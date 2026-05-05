"use client";

import { updateProfileDetails } from "@/lib/actions/profile";
import { featuredCategories } from "@/lib/marketplace-data";
import { Loader2, Pencil, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const EMPTY_SUBCATEGORIES: string[] = [];
const ARTISAN_CATEGORIES = featuredCategories.map((category) => ({
    profession: category.name,
    subcategories: category.subcategories.map((subcategory) => subcategory.name),
}));

function getSubcategoriesForProfession(profession: string | null | undefined) {
    return ARTISAN_CATEGORIES.find((category) => category.profession === (profession ?? ""))?.subcategories ?? EMPTY_SUBCATEGORIES;
}

function getValidProfession(profession: string | null | undefined) {
    return ARTISAN_CATEGORIES.some((category) => category.profession === (profession ?? "")) ? (profession ?? "") : "";
}

function getValidSpecialty(profession: string | null | undefined, specialties: string[] | null | undefined) {
    const firstSpecialty = specialties?.[0]?.trim() || "";
    return firstSpecialty && getSubcategoriesForProfession(profession).includes(firstSpecialty) ? firstSpecialty : "";
}

interface ProfileFormProps {
    profile: {
        full_name: string | null;
        first_name: string | null;
        last_name: string | null;
        email: string | null;
        phone: string | null;
        wilaya: string | null;
        commune: string | null;
        role: string | null;
        profession: string | null;
        specialties: string[] | null;
        bio: string | null;
    };
}

export default function ProfileForm({ profile }: ProfileFormProps) {
    const router = useRouter();
    const [editing, setEditing] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [artisanProfession, setArtisanProfession] = useState(() => getValidProfession(profile.profession));
    const [artisanSpecialty, setArtisanSpecialty] = useState(() => getValidSpecialty(profile.profession, profile.specialties));

    const availableSubcategories = getSubcategoriesForProfession(artisanProfession);
    const hasLegacyProfession = Boolean(profile.profession) && !ARTISAN_CATEGORIES.some((category) => category.profession === profile.profession);
    const hasLegacySpecialty = Boolean(profile.specialties?.[0]) && !getSubcategoriesForProfession(profile.profession).includes(profile.specialties?.[0] ?? "");

    function resetArtisanFields() {
        setArtisanProfession(getValidProfession(profile.profession));
        setArtisanSpecialty(getValidSpecialty(profile.profession, profile.specialties));
    }

    function handleSubmit(formData: FormData) {
        setMessage(null);
        startTransition(async () => {
            try {
                await updateProfileDetails(formData);
                setMessage({ type: "success", text: "Profil mis à jour avec succès !" });
                setEditing(false);
                router.refresh();
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "Une erreur est survenue.";
                setMessage({ type: "error", text: message });
            }
        });
    }

    return (
        <div className="flex-1 text-center sm:text-left">
            {/* Mode Lecture */}
            {!editing && (
                <>
                    <h2 className="text-2xl font-bold text-slate-900">
                        {profile.full_name || "Utilisateur"}
                    </h2>
                    <p className="font-medium text-slate-500">{profile.email}</p>
                    <p className="mt-1 text-sm text-slate-400">
                        {profile.phone || "Aucun numéro renseigné"}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                        {[profile.commune, profile.wilaya].filter(Boolean).join(", ") || "Zone non renseignée"}
                    </p>
                    {profile.role === "artisan" && profile.profession ? (
                        <p className="mt-1 text-sm text-slate-500">
                            {profile.profession}
                            {profile.specialties?.length ? ` • ${profile.specialties.join(", ")}` : ""}
                        </p>
                    ) : null}

                    <div className="mt-4 flex justify-center gap-2 sm:justify-start">
                        <button
                            onClick={() => {
                                resetArtisanFields();
                                setEditing(true);
                                setMessage(null);
                            }}
                            className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200"
                        >
                            <Pencil size={16} /> Éditer le profil
                        </button>
                    </div>
                </>
            )}

            {/* Mode Édition */}
            {editing && (
                <form action={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="last_name" className="mb-1 block text-sm font-medium text-slate-700">
                                Nom
                            </label>
                            <input
                                id="last_name"
                                name="last_name"
                                type="text"
                                defaultValue={profile.last_name || ""}
                                required
                                className="w-full rounded-lg border border-slate-200 bg-white/70 px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                            />
                        </div>

                        <div>
                            <label htmlFor="first_name" className="mb-1 block text-sm font-medium text-slate-700">
                                Prenom
                            </label>
                            <input
                                id="first_name"
                                name="first_name"
                                type="text"
                                defaultValue={profile.first_name || ""}
                                required
                                className="w-full rounded-lg border border-slate-200 bg-white/70 px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-700">
                                Telephone
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                defaultValue={profile.phone || ""}
                                placeholder="Ex: 0555 123 456"
                                className="w-full rounded-lg border border-slate-200 bg-white/70 px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                            />
                        </div>

                        <div>
                            <label htmlFor="wilaya" className="mb-1 block text-sm font-medium text-slate-700">
                                Wilaya
                            </label>
                            <input
                                id="wilaya"
                                name="wilaya"
                                type="text"
                                defaultValue={profile.wilaya || ""}
                                className="w-full rounded-lg border border-slate-200 bg-white/70 px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                            />
                        </div>

                        <div>
                            <label htmlFor="commune" className="mb-1 block text-sm font-medium text-slate-700">
                                Commune
                            </label>
                            <input
                                id="commune"
                                name="commune"
                                type="text"
                                defaultValue={profile.commune || ""}
                                className="w-full rounded-lg border border-slate-200 bg-white/70 px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                            />
                        </div>
                    </div>

                    {profile.role === "artisan" ? (
                        <>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="profession" className="mb-1 block text-sm font-medium text-slate-700">
                                        Categorie metier
                                    </label>
                                    <select
                                        id="profession"
                                        name="profession"
                                        value={artisanProfession}
                                        onChange={(event) => {
                                            const nextProfession = event.target.value;
                                            setArtisanProfession(nextProfession);

                                            if (!getSubcategoriesForProfession(nextProfession).includes(artisanSpecialty)) {
                                                setArtisanSpecialty("");
                                            }
                                        }}
                                        required
                                        className="w-full rounded-lg border border-slate-200 bg-white/70 px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                                    >
                                        <option value="">Selectionner une categorie</option>
                                        {ARTISAN_CATEGORIES.map((category) => (
                                            <option key={category.profession} value={category.profession}>
                                                {category.profession}
                                            </option>
                                        ))}
                                    </select>
                                    {hasLegacyProfession ? (
                                        <p className="mt-1 text-xs font-medium text-amber-600">
                                            Ancienne valeur libre detectee. Choisissez une categorie normalisee.
                                        </p>
                                    ) : null}
                                </div>

                                <div>
                                    <label htmlFor="specialties" className="mb-1 block text-sm font-medium text-slate-700">
                                        Sous-categorie / specialite
                                    </label>
                                    <select
                                        id="specialties"
                                        name="specialties"
                                        value={artisanSpecialty}
                                        onChange={(event) => setArtisanSpecialty(event.target.value)}
                                        required
                                        disabled={!artisanProfession}
                                        className="w-full rounded-lg border border-slate-200 bg-white/70 px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 disabled:bg-slate-100 disabled:text-slate-400"
                                    >
                                        <option value="">
                                            {artisanProfession ? "Selectionner une specialite" : "Choisissez d'abord une categorie"}
                                        </option>
                                        {availableSubcategories.map((subcategory) => (
                                            <option key={subcategory} value={subcategory}>
                                                {subcategory}
                                            </option>
                                        ))}
                                    </select>
                                    {hasLegacySpecialty ? (
                                        <p className="mt-1 text-xs font-medium text-amber-600">
                                            Ancienne specialite libre detectee. Choisissez une sous-categorie normalisee.
                                        </p>
                                    ) : null}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="bio" className="mb-1 block text-sm font-medium text-slate-700">
                                    Bio
                                </label>
                                <textarea
                                    id="bio"
                                    name="bio"
                                    rows={4}
                                    defaultValue={profile.bio || ""}
                                    className="w-full rounded-lg border border-slate-200 bg-white/70 px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 resize-none"
                                />
                            </div>
                        </>
                    ) : null}

                    <div className="flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-orange-600 disabled:opacity-50"
                        >
                            {isPending ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Save size={16} />
                            )}
                            {isPending ? "Enregistrement..." : "Enregistrer"}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                resetArtisanFields();
                                setEditing(false);
                                setMessage(null);
                            }}
                            disabled={isPending}
                            className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-200 disabled:opacity-50"
                        >
                            <X size={16} /> Annuler
                        </button>
                    </div>
                </form>
            )}

            {/* Message feedback */}
            {message && (
                <p
                    className={`mt-3 text-sm font-medium ${message.type === "success" ? "text-emerald-600" : "text-red-500"
                        }`}
                >
                    {message.text}
                </p>
            )}
        </div>
    );
}
