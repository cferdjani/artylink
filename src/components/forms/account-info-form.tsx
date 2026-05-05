"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { ALGERIA_WILAYAS, COMMUNES_BY_WILAYA } from "@/lib/algeria-data";
import { updateProfileDetails } from "@/lib/actions/profile";
import { sanitizeRedirectPath } from "@/lib/auth/redirect";
import { featuredCategories } from "@/lib/marketplace-data";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

type AccountType = "client" | "artisan";

type FormMode = "register" | "edit";

type AccountInfoFormProps = {
    mode: FormMode;
    title: string;
    description: string;
    initialAccountType: AccountType;
    initialValues?: {
        firstName?: string | null;
        lastName?: string | null;
        age?: number | null;
        wilaya?: string | null;
        commune?: string | null;
        phone?: string | null;
        profession?: string | null;
        specialty?: string | null;
        email?: string | null;
        companyName?: string | null;
        artisanWilaya?: string | null;
        artisanCity?: string | null;
        address?: string | null;
        hourlyRate?: number | null;
        bio?: string | null;
        availabilityStatus?: string | null;
    };
    redirectedFrom?: string;
};

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const EMPTY_SUBCATEGORIES: string[] = [];
const ARTISAN_CATEGORIES = featuredCategories.map((category) => ({
    profession: category.name,
    slug: category.slug,
    subcategories: category.subcategories.map((subcategory) => subcategory.name),
    subcategorySlugs: category.subcategories.map((subcategory) => subcategory.slug),
}));

function normalizeTaxonomyValue(value: string | null | undefined) {
    return (value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, " ")
        .trim()
        .toLowerCase();
}

function resolveInitialProfession(value: string | null | undefined) {
    if (!value) {
        return "";
    }

    const normalizedValue = normalizeTaxonomyValue(value);
    return (
        ARTISAN_CATEGORIES.find((category) =>
            normalizeTaxonomyValue(category.profession) === normalizedValue ||
            normalizeTaxonomyValue(category.slug) === normalizedValue,
        )?.profession ??
        ""
    );
}

function resolveInitialSpecialty(
    professionValue: string | null | undefined,
    specialtyValue: string | null | undefined,
) {
    if (!specialtyValue) {
        return "";
    }

    const resolvedProfession = resolveInitialProfession(professionValue);
    const category = ARTISAN_CATEGORIES.find((entry) => entry.profession === resolvedProfession);
    if (!category) {
        return "";
    }

    const normalizedValue = normalizeTaxonomyValue(specialtyValue);
    const matchIndex = category.subcategories.findIndex((entry, index) =>
        normalizeTaxonomyValue(entry) === normalizedValue ||
        normalizeTaxonomyValue(category.subcategorySlugs[index]) === normalizedValue ||
        normalizeTaxonomyValue(entry).includes(normalizedValue) ||
        normalizedValue.includes(normalizeTaxonomyValue(entry)),
    );

    return matchIndex >= 0 ? category.subcategories[matchIndex] : "";
}

export function AccountInfoForm({
    mode,
    title,
    description,
    initialAccountType,
    initialValues,
    redirectedFrom = "/",
}: AccountInfoFormProps) {
    const router = useRouter();
    const safeRedirect = sanitizeRedirectPath(redirectedFrom);
    const [accountType, setAccountType] = useState<AccountType>(initialAccountType);
    const [firstName, setFirstName] = useState(initialValues?.firstName ?? "");
    const [lastName, setLastName] = useState(initialValues?.lastName ?? "");
    const [age, setAge] = useState(initialValues?.age ? String(initialValues.age) : "");
    const [wilaya, setWilaya] = useState(initialValues?.wilaya ?? "");
    const [commune, setCommune] = useState(initialValues?.commune ?? "");
    const [phone, setPhone] = useState(initialValues?.phone ?? "");
    const [profession, setProfession] = useState(() => resolveInitialProfession(initialValues?.profession));
    const [specialty, setSpecialty] = useState(() =>
        resolveInitialSpecialty(initialValues?.profession, initialValues?.specialty),
    );
    const [email, setEmail] = useState(initialValues?.email ?? "");
    const [companyName, setCompanyName] = useState(initialValues?.companyName ?? "");
    const [artisanWilaya, setArtisanWilaya] = useState(initialValues?.artisanWilaya ?? initialValues?.wilaya ?? "");
    const [artisanCity, setArtisanCity] = useState(initialValues?.artisanCity ?? initialValues?.commune ?? "");
    const [address, setAddress] = useState(initialValues?.address ?? "");
    const [hourlyRate, setHourlyRate] = useState(
        typeof initialValues?.hourlyRate === "number" ? String(initialValues.hourlyRate) : "",
    );
    const [bio, setBio] = useState(initialValues?.bio ?? "");
    const [availabilityStatus, setAvailabilityStatus] = useState(initialValues?.availabilityStatus ?? "available");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [availableCommunes, setAvailableCommunes] = useState<string[]>([]);
    const [isLoadingCommunes, setIsLoadingCommunes] = useState(false);
    const [manualCommune, setManualCommune] = useState(false);
    const [showPassword, setShowPassword] = useState(true);
    const [showConfirmPassword, setShowConfirmPassword] = useState(true);
    const [loading, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const selectedCategory = ARTISAN_CATEGORIES.find((category) => category.profession === profession);
    const availableSubcategories = selectedCategory?.subcategories ?? EMPTY_SUBCATEGORIES;
    const isRegisterMode = mode === "register";

    useEffect(() => {
        if (!wilaya) {
            setAvailableCommunes([]);
            setCommune("");
            setManualCommune(false);
            return;
        }

        const controller = new AbortController();
        const fallbackCommunes = COMMUNES_BY_WILAYA[wilaya] || [];

        const loadCommunes = async () => {
            setIsLoadingCommunes(true);

            try {
                const response = await fetch(
                    `/api/geo/communes?wilaya=${encodeURIComponent(wilaya)}`,
                    { signal: controller.signal },
                );

                if (!response.ok) {
                    setAvailableCommunes(fallbackCommunes);
                    setManualCommune(commune ? !fallbackCommunes.includes(commune) : false);
                    return;
                }

                const payload = (await response.json()) as { communes?: string[] };
                const communesList = Array.isArray(payload.communes) ? payload.communes : fallbackCommunes;
                setAvailableCommunes(communesList);
                setManualCommune(commune ? !communesList.includes(commune) : false);
            } catch {
                if (!controller.signal.aborted) {
                    setAvailableCommunes(fallbackCommunes);
                    setManualCommune(commune ? !fallbackCommunes.includes(commune) : false);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoadingCommunes(false);
                }
            }
        };

        loadCommunes();

        return () => {
            controller.abort();
        };
    }, [wilaya, commune]);

    useEffect(() => {
        if (!availableSubcategories.includes(specialty)) {
            setSpecialty("");
        }
    }, [availableSubcategories, specialty]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);

        const normalizedFirstName = firstName.trim();
        const normalizedLastName = lastName.trim();
        const normalizedPhone = phone.trim();
        const normalizedProfession = profession.trim();
        const normalizedSpecialty = specialty.trim();
        const normalizedCompanyName = companyName.trim();
        const normalizedArtisanWilaya = artisanWilaya.trim();
        const normalizedArtisanCity = artisanCity.trim();
        const normalizedAddress = address.trim();
        const normalizedBio = bio.trim();
        const normalizedHourlyRate = hourlyRate.trim();
        const parsedAge = Number(age);
        const fullName = `${normalizedFirstName} ${normalizedLastName}`.trim();

        if (!normalizedFirstName || !normalizedLastName) {
            setError("Nom et prenom sont obligatoires.");
            return;
        }
        if (!Number.isInteger(parsedAge) || parsedAge < 18 || parsedAge > 100) {
            setError("L'age doit etre un nombre valide entre 18 et 100.");
            return;
        }
        if (!wilaya || !commune) {
            setError("Choisissez une wilaya et une commune.");
            return;
        }
        if (accountType === "artisan" && !normalizedProfession) {
            setError("La profession est obligatoire pour un artisan.");
            return;
        }
        if (accountType === "artisan" && !normalizedSpecialty) {
            setError("La specialite est obligatoire pour un artisan.");
            return;
        }

        if (isRegisterMode) {
            if (!EMAIL_REGEX.test(email)) {
                setError("Adresse email invalide.");
                return;
            }
            if (password.length < 8) {
                setError("Le mot de passe doit contenir au moins 8 caracteres.");
                return;
            }
            if (password !== confirm) {
                setError("Les mots de passe ne correspondent pas.");
                return;
            }
        }

        startTransition(async () => {
            try {
                if (isRegisterMode) {
                    const supabase = createSupabaseBrowserClient();
                    const nextAfterConfirm = accountType === "artisan" ? "/onboarding/freelance" : safeRedirect;
                    const { error: signUpError } = await supabase.auth.signUp({
                        email: email.trim(),
                        password,
                        options: {
                            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextAfterConfirm)}`,
                            data: {
                                role: accountType,
                                first_name: normalizedFirstName,
                                last_name: normalizedLastName,
                                full_name: fullName,
                                age: parsedAge,
                                wilaya,
                                commune,
                                city: commune,
                                phone: normalizedPhone || null,
                                profession: accountType === "artisan" ? normalizedProfession : null,
                                specialties: accountType === "artisan" && normalizedSpecialty ? [normalizedSpecialty] : [],
                            },
                        },
                    });

                    if (signUpError) {
                        setError(signUpError.message);
                        return;
                    }

                    setSuccess("Inscription reussie. Verifiez votre boite mail pour valider votre compte.");
                    return;
                }

                const formData = new FormData();
                formData.set("first_name", normalizedFirstName);
                formData.set("last_name", normalizedLastName);
                formData.set("age", String(parsedAge));
                formData.set("wilaya", wilaya);
                formData.set("commune", commune);
                formData.set("phone", normalizedPhone);

                if (accountType === "artisan") {
                    formData.set("profession", normalizedProfession);
                    formData.set("specialties", normalizedSpecialty);
                    formData.set("company_name", normalizedCompanyName);
                    formData.set("artisan_wilaya", normalizedArtisanWilaya || wilaya);
                    formData.set("artisan_city", normalizedArtisanCity || commune);
                    formData.set("address", normalizedAddress);
                    formData.set("hourly_rate", normalizedHourlyRate);
                    formData.set("bio", normalizedBio);
                    formData.set("availability_status", availabilityStatus);
                }

                await updateProfileDetails(formData);
                setSuccess("Informations mises a jour avec succes.");
                router.push("/dashboard/account");
                router.refresh();
            } catch (submitError) {
                setError(submitError instanceof Error ? submitError.message : "Erreur inattendue. Veuillez reessayer.");
            }
        });
    };

    return (
        <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-8 md:px-6">
            <GlassCard className="p-6 md:p-8">
                <h1 className="mb-2 text-2xl font-bold text-text-primary md:text-3xl">{title}</h1>
                <p className="mb-6 text-sm text-text-secondary">{description}</p>

                <div className="mb-6 grid gap-3 md:grid-cols-2">
                    <button
                        type="button"
                        onClick={() => {
                            if (isRegisterMode) {
                                setAccountType("client");
                            }
                        }}
                        className={`rounded-lg border px-4 py-4 text-left transition ${
                            accountType === "client"
                                ? "border-primary bg-primary/10 text-slate-900 shadow-sm"
                                : "border-slate-200 bg-white text-slate-600"
                        } ${isRegisterMode ? "" : "cursor-default"}`}
                    >
                        <div className="text-sm font-bold uppercase tracking-wide">Client</div>
                        <div className="mt-1 text-sm">Je cherche un artisan ou un service.</div>
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            if (isRegisterMode) {
                                setAccountType("artisan");
                            }
                        }}
                        className={`rounded-lg border px-4 py-4 text-left transition ${
                            accountType === "artisan"
                                ? "border-primary bg-primary/10 text-slate-900 shadow-sm"
                                : "border-slate-200 bg-white text-slate-600"
                        } ${isRegisterMode ? "" : "cursor-default"}`}
                    >
                        <div className="text-sm font-bold uppercase tracking-wide">Artisan</div>
                        <div className="mt-1 text-sm">Je propose mes services et je veux etre visible.</div>
                    </button>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit} autoComplete="off">
                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="flex flex-col gap-1.5">
                            <span className="text-sm font-medium">Nom</span>
                            <input
                                type="text"
                                className="rounded-lg border border-slate-200 px-4 py-3 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                                value={lastName}
                                onChange={(event) => setLastName(event.target.value)}
                                required
                                placeholder="Votre nom"
                            />
                        </label>
                        <label className="flex flex-col gap-1.5">
                            <span className="text-sm font-medium">Prenom</span>
                            <input
                                type="text"
                                className="rounded-lg border border-slate-200 px-4 py-3 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                                value={firstName}
                                onChange={(event) => setFirstName(event.target.value)}
                                required
                                placeholder="Votre prenom"
                            />
                        </label>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <label className="flex flex-col gap-1.5">
                            <span className="text-sm font-medium">Age</span>
                            <input
                                type="number"
                                min={18}
                                max={100}
                                className="rounded-lg border border-slate-200 px-4 py-3 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                                value={age}
                                onChange={(event) => setAge(event.target.value)}
                                required
                                placeholder="30"
                            />
                        </label>
                        <label className="flex flex-col gap-1.5 md:col-span-2">
                            <span className="text-sm font-medium">Telephone facultatif</span>
                            <input
                                type="tel"
                                className="rounded-lg border border-slate-200 px-4 py-3 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                                value={phone}
                                onChange={(event) => setPhone(event.target.value)}
                                placeholder="+213 5..."
                            />
                        </label>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="flex flex-col gap-1.5">
                            <span className="text-sm font-medium">Wilaya</span>
                            <select
                                className="rounded-lg border border-slate-200 px-4 py-3 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                                value={wilaya}
                                onChange={(event) => setWilaya(event.target.value)}
                                required
                            >
                                <option value="">Selectionner une wilaya</option>
                                {ALGERIA_WILAYAS.map((entry) => (
                                    <option key={entry} value={entry}>
                                        {entry}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="flex flex-col gap-1.5">
                            <span className="text-sm font-medium">Commune</span>
                            {!manualCommune ? (
                                <select
                                    className="rounded-lg border border-slate-200 px-4 py-3 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition disabled:bg-slate-100 disabled:text-slate-400"
                                    value={commune}
                                    onChange={(event) => {
                                        const value = event.target.value;
                                        if (value === "__manual__") {
                                            setManualCommune(true);
                                            setCommune("");
                                            return;
                                        }
                                        setCommune(value);
                                    }}
                                    required
                                    disabled={!wilaya || isLoadingCommunes}
                                >
                                    <option value="">
                                        {!wilaya
                                            ? "Choisissez d'abord une wilaya"
                                            : isLoadingCommunes
                                                ? "Chargement..."
                                                : "Selectionner une commune"}
                                    </option>
                                    {availableCommunes.map((entry) => (
                                        <option key={entry} value={entry}>
                                            {entry}
                                        </option>
                                    ))}
                                    {!isLoadingCommunes ? (
                                        <option value="__manual__">Saisie manuelle</option>
                                    ) : null}
                                </select>
                            ) : (
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        className="rounded-lg border border-slate-200 px-4 py-3 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition disabled:bg-slate-100 disabled:text-slate-400"
                                        value={commune}
                                        onChange={(event) => setCommune(event.target.value)}
                                        required
                                        disabled={!wilaya}
                                        placeholder="Saisir votre commune"
                                    />
                                    <button
                                        type="button"
                                        className="text-xs font-semibold text-primary hover:underline"
                                        onClick={() => {
                                            setManualCommune(false);
                                            setCommune("");
                                        }}
                                    >
                                        Revenir au menu des communes
                                    </button>
                                </div>
                            )}
                        </label>
                    </div>

                    {accountType === "artisan" ? (
                        <>
                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="flex flex-col gap-1.5">
                                    <span className="text-sm font-medium">Categorie metier</span>
                                    <select
                                        className="rounded-lg border border-slate-200 px-4 py-3 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                                        value={profession}
                                        onChange={(event) => setProfession(event.target.value)}
                                        required
                                    >
                                        <option value="">Selectionner une categorie</option>
                                        {ARTISAN_CATEGORIES.map((category) => (
                                            <option key={category.profession} value={category.profession}>
                                                {category.profession}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label className="flex flex-col gap-1.5">
                                    <span className="text-sm font-medium">Sous-categorie / specialite</span>
                                    <select
                                        className="rounded-lg border border-slate-200 px-4 py-3 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition disabled:bg-slate-100 disabled:text-slate-400"
                                        value={specialty}
                                        onChange={(event) => setSpecialty(event.target.value)}
                                        required
                                        disabled={!profession}
                                    >
                                        <option value="">
                                            {profession ? "Selectionner une specialite" : "Choisissez d'abord une categorie"}
                                        </option>
                                        {availableSubcategories.map((entry) => (
                                            <option key={entry} value={entry}>
                                                {entry}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            {!isRegisterMode ? (
                                <>
                                    <div className="rounded border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                                        Informations professionnelles
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <label className="flex flex-col gap-1.5">
                                            <span className="text-sm font-medium">Raison sociale</span>
                                            <input
                                                type="text"
                                                className="rounded-lg border border-slate-200 px-4 py-3 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                                                value={companyName}
                                                onChange={(event) => setCompanyName(event.target.value)}
                                                placeholder="Nom affiche de votre activite"
                                            />
                                        </label>
                                        <label className="flex flex-col gap-1.5">
                                            <span className="text-sm font-medium">Disponibilite</span>
                                            <select
                                                className="rounded-lg border border-slate-200 px-4 py-3 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                                                value={availabilityStatus}
                                                onChange={(event) => setAvailabilityStatus(event.target.value)}
                                            >
                                                <option value="available">En ligne</option>
                                                <option value="busy">Occupe</option>
                                                <option value="unavailable">Hors ligne</option>
                                            </select>
                                        </label>
                                        <label className="flex flex-col gap-1.5">
                                            <span className="text-sm font-medium">Wilaya d&apos;intervention</span>
                                            <select
                                                className="rounded-lg border border-slate-200 px-4 py-3 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                                                value={artisanWilaya}
                                                onChange={(event) => setArtisanWilaya(event.target.value)}
                                            >
                                                <option value="">Selectionner une wilaya</option>
                                                {ALGERIA_WILAYAS.map((entry) => (
                                                    <option key={entry} value={entry}>
                                                        {entry}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                        <label className="flex flex-col gap-1.5">
                                            <span className="text-sm font-medium">Ville d&apos;intervention</span>
                                            <input
                                                type="text"
                                                className="rounded-lg border border-slate-200 px-4 py-3 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                                                value={artisanCity}
                                                onChange={(event) => setArtisanCity(event.target.value)}
                                                placeholder="Votre ville d'intervention"
                                            />
                                        </label>
                                        <label className="flex flex-col gap-1.5">
                                            <span className="text-sm font-medium">Tarif horaire</span>
                                            <input
                                                type="number"
                                                min={0}
                                                step="0.01"
                                                className="rounded-lg border border-slate-200 px-4 py-3 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                                                value={hourlyRate}
                                                onChange={(event) => setHourlyRate(event.target.value)}
                                                placeholder="3500"
                                            />
                                        </label>
                                        <label className="flex flex-col gap-1.5 md:col-span-2">
                                            <span className="text-sm font-medium">Adresse</span>
                                            <input
                                                type="text"
                                                className="rounded-lg border border-slate-200 px-4 py-3 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                                                value={address}
                                                onChange={(event) => setAddress(event.target.value)}
                                                placeholder="Votre adresse professionnelle"
                                            />
                                        </label>
                                        <label className="flex flex-col gap-1.5 md:col-span-2">
                                            <span className="text-sm font-medium">Biographie</span>
                                            <textarea
                                                className="min-h-32 rounded-lg border border-slate-200 px-4 py-3 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                                                value={bio}
                                                onChange={(event) => setBio(event.target.value)}
                                                placeholder="Presentez votre activite, votre experience et vos services."
                                            />
                                        </label>
                                    </div>
                                </>
                            ) : null}
                        </>
                    ) : null}

                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="flex flex-col gap-1.5">
                            <span className="text-sm font-medium">Adresse email</span>
                            <input
                                type="email"
                                className="rounded-lg border border-slate-200 px-4 py-3 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition disabled:bg-slate-100 disabled:text-slate-500"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required={isRegisterMode}
                                readOnly={!isRegisterMode}
                                disabled={!isRegisterMode}
                                autoFocus
                                placeholder="votre@email.com"
                            />
                        </label>
                        <div />
                    </div>

                    {isRegisterMode ? (
                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="flex flex-col gap-1.5">
                                <span className="text-sm font-medium">Mot de passe</span>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="w-full rounded-lg border border-slate-200 px-4 py-3 pr-12 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        required
                                        minLength={8}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-500 transition hover:text-primary"
                                        aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </label>
                            <label className="flex flex-col gap-1.5">
                                <span className="text-sm font-medium">Confirmer le mot de passe</span>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        className="w-full rounded-lg border border-slate-200 px-4 py-3 pr-12 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                                        value={confirm}
                                        onChange={(event) => setConfirm(event.target.value)}
                                        required
                                        minLength={8}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-500 transition hover:text-primary"
                                        aria-label={showConfirmPassword ? "Masquer la confirmation du mot de passe" : "Afficher la confirmation du mot de passe"}
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </label>
                        </div>
                    ) : (
                        <div className="rounded border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                            L&apos;email et le mot de passe restent gérés séparément. Ici, vous modifiez la fiche d&apos;information issue de votre inscription.
                        </div>
                    )}

                    {error ? (
                        <div className="rounded bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">{error}</div>
                    ) : null}

                    {success ? (
                        <div className="rounded bg-green-50 border border-green-200 text-green-700 px-4 py-2 text-sm">
                            {success}
                        </div>
                    ) : null}

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                            type="submit"
                            className="rounded-lg bg-primary px-6 py-2.5 text-base font-bold text-white shadow-sm transition hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed w-full"
                            disabled={loading}
                        >
                            {loading
                                ? isRegisterMode
                                    ? "Creation du compte..."
                                    : "Enregistrement..."
                                : isRegisterMode
                                    ? accountType === "artisan"
                                        ? "Creer mon compte artisan"
                                        : "Creer mon compte client"
                                    : "Enregistrer mes informations"}
                        </button>
                        {!isRegisterMode ? (
                            <button
                                type="button"
                                className="w-full rounded-lg border border-slate-200 bg-white px-6 py-2.5 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
                                onClick={() => router.push("/dashboard/account")}
                            >
                                Retour
                            </button>
                        ) : null}
                    </div>
                </form>

                {isRegisterMode ? (
                    <div className="mt-6 text-center text-sm text-slate-600">
                        Deja un compte ?{" "}
                        <a href={`/auth/login?${new URLSearchParams({ redirectedFrom: safeRedirect }).toString()}`} className="text-primary font-semibold hover:underline">Se connecter</a>
                    </div>
                ) : null}
            </GlassCard>
        </div>
    );
}
