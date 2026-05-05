import { PortfolioGallery } from "@/components/features/portfolio-gallery";
import { ReviewForm } from "@/components/features/review-form";
import { getArtisanById } from "@/lib/actions/artisan";
import { getFavoriteStatus } from "@/lib/actions/favorites";
import { getArtisanReviews } from "@/lib/actions/reviews";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
    ArrowLeft,
    Briefcase,
    Images,
    Lock,
    Mail,
    MapPin,
    PenSquare,
    Phone,
    Sparkles,
    Star,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FavoriteArtisanButton } from "./components/FavoriteArtisanButton";
import PremiumContactGate from "./components/PremiumContactGate";

type ArtisanReview = {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    profiles?: {
        full_name: string | null;
        avatar_url: string | null;
    } | null;
};

type ArtisanReviewRow = {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    profiles?:
    | {
        full_name: string | null;
        avatar_url: string | null;
    }
    | {
        full_name: string | null;
        avatar_url: string | null;
    }[]
    | null;
};

type ArtisanPortfolio = {
    id: string;
    image_url: string;
    caption?: string;
};

type ArtisanPortfolioRow = {
    id: string;
    image_url: string;
    caption: string | null;
};

type PublicArtisanProfile = {
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
    email: string | null;
    age: number | null;
    wilaya: string | null;
    commune: string | null;
};

function maskPhone(phone?: string | null) {
    if (!phone) return "Contact prive";
    const cleanPhone = phone.trim();
    if (cleanPhone.length <= 4) return "****";
    return `${cleanPhone.slice(0, 3)} **** ${cleanPhone.slice(-2)}`;
}

function maskEmail(email?: string | null) {
    if (!email) return "Adresse privee";
    const [name, domain] = email.split("@");
    if (!domain) return "Adresse privee";
    const visible = name.length > 2 ? name.slice(0, 2) : name.slice(0, 1);
    return `${visible}***@${domain}`;
}

function formatReviewDate(value: string) {
    return new Date(value).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function StatTile({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-4 backdrop-blur-sm">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
        </div>
    );
}

function normalizeTextValue(value: string | null | undefined) {
    const normalized = value?.trim();
    return normalized ? normalized : null;
}

function getProfileAgeLabel(age: unknown) {
    return typeof age === "number" && age >= 18 ? `${age} ans` : null;
}

function pickProfile(
    profile: PublicArtisanProfile | PublicArtisanProfile[] | null | undefined,
) {
    if (Array.isArray(profile)) {
        return profile[0] ?? null;
    }

    return profile ?? null;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const artisan = await getArtisanById(id);

    if (!artisan) {
        return {
            title: "Profil indisponible | ArtyLink",
            description: "Ce profil n'est pas disponible pour le moment.",
        };
    }

    const profile = pickProfile(artisan.profiles);
    const displayName = profile?.full_name || artisan.company_name || "Artisan ArtyLink";
    const profession = normalizeTextValue(artisan.profession);
    const description =
        artisan.bio?.trim() ||
        `${displayName} presente son profil public${profession ? ` en ${profession}` : ""}, ses photos et ses moyens de contact sur ArtyLink.`;
    const previewImage = profile?.avatar_url || undefined;

    return {
        title: `${displayName} | ArtyLink`,
        description,
        openGraph: {
            title: `${displayName} | ArtyLink`,
            description,
            images: previewImage ? [{ url: previewImage }] : undefined,
        },
    };
}

export default async function ArtisanProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const artisan = await getArtisanById(id);

    if (!artisan) {
        return (
            <main className="min-h-screen bg-[#020202] text-white">
                <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center px-4 py-16 md:px-8">
                    <Link
                        href="/"
                        className="inline-flex w-fit items-center gap-2 text-sm font-medium text-white/60 transition hover:text-white"
                    >
                        <ArrowLeft size={16} />
                        Retour a l'accueil
                    </Link>

                    <div className="mt-10 max-w-2xl">
                        <p className="text-xs uppercase tracking-[0.3em] text-white/35">Profil</p>
                        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-6xl">
                            Profil indisponible
                        </h1>
                        <p className="mt-6 text-base leading-7 text-white/70">
                            Cette carte du carousel pointe vers une fiche de demonstration ou vers un profil qui n&apos;est
                            plus accessible. Le carousel peut continuer a l&apos;afficher, mais il n&apos;y a pas de vitrine
                            publique exploitable derriere ce lien.
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    const authClient = await createSupabaseServerClient();
    const {
        data: { user },
    } = await authClient.auth.getUser();

    const isOwner = user?.id === artisan.id;
    const isFavorite = user && !isOwner ? await getFavoriteStatus(id) : false;

    // Check active subscription for PRO contact access
    let hasActiveSubscription = false;
    if (user && !isOwner) {
        const { data: sub } = await authClient
            .from("subscriptions")
            .select("id")
            .eq("user_id", user.id)
            .eq("status", "active")
            .limit(1)
            .single();
        hasActiveSubscription = !!sub;
    }

    const rawReviews = (await getArtisanReviews(id)) as ArtisanReviewRow[];
    const reviews = rawReviews.map<ArtisanReview>((review) => ({
        ...review,
        profiles: Array.isArray(review.profiles) ? review.profiles[0] ?? null : review.profiles ?? null,
    }));

    const { data: portfolioRows } = await authClient
        .from("artisan_portfolios")
        .select("id, image_url, caption")
        .eq("artisan_id", id)
        .order("created_at", { ascending: false });

    const portfolios = ((portfolioRows ?? []) as ArtisanPortfolioRow[]).map<ArtisanPortfolio>((portfolio) => ({
        ...portfolio,
        caption: portfolio.caption ?? undefined,
    }));

    const profile = pickProfile(artisan.profiles);
    const displayName = profile?.full_name || artisan.company_name || "Artisan ArtyLink";
    const profession = normalizeTextValue(artisan.profession);
    const specialties = Array.isArray(artisan.specialties)
        ? artisan.specialties.map((entry: string) => entry.trim()).filter(Boolean)
        : [];
    const primarySpecialty = specialties[0] ?? null;
    const ageLabel = getProfileAgeLabel(profile?.age);
    const locationLabel =
        [normalizeTextValue(artisan.city), normalizeTextValue(artisan.wilaya)]
            .filter(Boolean)
            .join(", ") ||
        [normalizeTextValue(profile?.commune), normalizeTextValue(profile?.wilaya)]
            .filter(Boolean)
            .join(", ") ||
        "Toute l'Algerie";
    const expertiseHighlights = [profession, ...specialties].filter(
        (value, index, array) => Boolean(value) && array.indexOf(value) === index,
    );
    const businessName = artisan.company_name || profession || "Profil professionnel";
    const activityLabel = primarySpecialty || profession || businessName;
    const artisanPath = `/artisan/${id}`;
    const redirectQuery = new URLSearchParams({ redirectedFrom: artisanPath }).toString();
    const loginHref = `/auth/login?${redirectQuery}`;
    const registerHref = `/auth/register-type?${redirectQuery}`;
    const ratingLabel =
        typeof artisan.rating === "number" && artisan.rating > 0 ? `${artisan.rating.toFixed(1)} / 5` : "Nouveau";
    const heroImage = portfolios[0]?.image_url || profile?.avatar_url || null;
    const directPhone = profile?.phone || null;
    const directEmail = profile?.email || null;
    const phoneLabel = user ? directPhone || "Non renseigne" : maskPhone(directPhone);
    const emailLabel = user ? directEmail || "Non renseignee" : maskEmail(directEmail);
    const visibleReviews = user ? reviews : reviews.slice(0, 3);
    const hasHiddenReviews = !user && reviews.length > visibleReviews.length;

    return (
        <main className="min-h-screen bg-[#020202] text-white">
            <section className="relative overflow-hidden border-b border-white/10">
                <div className="absolute inset-0">
                    {heroImage ? (
                        <Image
                            src={heroImage}
                            alt={displayName}
                            fill
                            priority
                            className="object-cover opacity-28"
                        />
                    ) : (
                        <div className="h-full w-full bg-[linear-gradient(135deg,#0a0a0a_0%,#141414_45%,#050505_100%)]" />
                    )}
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,2,2,0.94)_0%,rgba(2,2,2,0.82)_48%,rgba(2,2,2,0.92)_100%)]" />
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12)_0%,transparent_22%,transparent_78%,rgba(255,255,255,0.08)_100%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_34%)]" />
                </div>

                <div className="relative mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-12">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm font-medium text-white/60 transition hover:text-white"
                    >
                        <ArrowLeft size={16} />
                        Retour a l'accueil
                    </Link>

                    <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.85fr] lg:items-end">
                        <div className="max-w-3xl">
                            <div className="flex flex-wrap gap-2">
                                <span className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/55">
                                    Vitrine publique
                                </span>
                                <span className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/55">
                                    {artisan.wilaya || "Algerie"}
                                </span>
                                {profession ? (
                                    <span className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/55">
                                        {profession}
                                    </span>
                                ) : null}
                                {primarySpecialty ? (
                                    <span className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/55">
                                        {primarySpecialty}
                                    </span>
                                ) : null}
                                {ageLabel ? (
                                    <span className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/55">
                                        {ageLabel}
                                    </span>
                                ) : null}
                                {isOwner ? (
                                    <span className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/55">
                                        Proprietaire
                                    </span>
                                ) : null}
                            </div>

                            <div className="mt-6 flex items-start gap-4 md:gap-5">
                                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-white/12 bg-white/[0.05] md:h-28 md:w-28">
                                    {profile?.avatar_url ? (
                                        <Image
                                            src={profile.avatar_url}
                                            alt={displayName}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-white/60">
                                            {displayName.charAt(0)}
                                        </div>
                                    )}
                                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.26)_0%,transparent_45%,transparent_100%)]" />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs uppercase tracking-[0.26em] text-white/40">{businessName}</p>
                                    <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white md:text-6xl">
                                        {displayName}
                                    </h1>
                                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/72">
                                        <span className="inline-flex items-center gap-2">
                                            <MapPin size={16} className="text-white/45" />
                                            {locationLabel}
                                        </span>
                                        <span className="inline-flex items-center gap-2">
                                            <Briefcase size={16} className="text-white/45" />
                                            {activityLabel}
                                        </span>
                                        <span className="inline-flex items-center gap-2">
                                            <Star size={16} className="text-white/45" />
                                            {ratingLabel}
                                        </span>
                                    </div>
                                    {expertiseHighlights.length > 0 ? (
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {expertiseHighlights.slice(0, 3).map((highlight) => (
                                                <span
                                                    key={highlight}
                                                    className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-medium text-white/82"
                                                >
                                                    {highlight}
                                                </span>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>
                            </div>

                            <p className="mt-6 max-w-2xl text-base leading-7 text-white/78">
                                {artisan.bio ||
                                    "Ce professionnel n'a pas encore ajoute de texte de presentation. Sa vitrine reste visible avec ses informations essentielles et ses realisations."}
                            </p>

                            <div className="mt-8 flex flex-wrap gap-3">
                                {isOwner ? (
                                    <>
                                        <Link
                                            href="/dashboard/account"
                                            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/12 bg-white text-sm font-semibold text-black transition hover:bg-white/90"
                                        >
                                            <PenSquare size={16} />
                                            Modifier mon profil
                                        </Link>
                                        <Link
                                            href="/dashboard/account/portfolio"
                                            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/12 bg-white/[0.05] px-4 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
                                        >
                                            <Images size={16} />
                                            Gerer mes photos
                                        </Link>
                                    </>
                                ) : user ? (
                                    <>
                                        {directPhone ? (
                                            <a
                                                href={`tel:${directPhone}`}
                                                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/12 bg-white text-sm font-semibold text-black transition hover:bg-white/90"
                                            >
                                                <Phone size={16} />
                                                Appeler
                                            </a>
                                        ) : null}
                                        {directEmail ? (
                                            <a
                                                href={`mailto:${directEmail}`}
                                                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/12 bg-white/[0.05] px-4 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
                                            >
                                                <Mail size={16} />
                                                Envoyer un email
                                            </a>
                                        ) : null}
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href={loginHref}
                                            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/12 bg-white text-sm font-semibold text-black transition hover:bg-white/90"
                                        >
                                            <Lock size={16} />
                                            Se connecter pour contacter
                                        </Link>
                                        <Link
                                            href={registerHref}
                                            className="inline-flex h-11 items-center justify-center rounded-lg border border-white/12 bg-white/[0.05] px-4 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
                                        >
                                            Creer un compte
                                        </Link>
                                    </>
                                )}
                            </div>

                            {user && !isOwner ? (
                                <div className="mt-3">
                                    <FavoriteArtisanButton
                                        artisanId={artisan.id}
                                        initialIsFavorite={isFavorite}
                                        tone="dark"
                                    />
                                </div>
                            ) : null}
                        </div>

                        <div className="lg:pl-8">
                            <div className="grid grid-cols-2 gap-3">
                                <StatTile label="Note" value={ratingLabel} />
                                <StatTile label="Avis" value={String(reviews.length)} />
                                <StatTile label="Photos" value={String(portfolios.length)} />
                                <StatTile label="Profil" value={ageLabel || activityLabel} />
                            </div>

                            {/* Contact info box — masked for guests, direct for logged-in users */}
                            <div className="mt-4 rounded-lg border border-white/10 bg-black/30 p-5 backdrop-blur-sm">
                                <p className="text-[11px] uppercase tracking-[0.22em] text-white/42">Contact</p>
                                <div className="mt-4 space-y-4">
                                    <div className="rounded-lg border border-white/8 bg-white/[0.03] px-4 py-3">
                                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/40">
                                            <Phone size={14} />
                                            Telephone
                                        </div>
                                        <p className="mt-2 text-sm font-medium text-white/88">{phoneLabel}</p>
                                    </div>
                                    <div className="rounded-lg border border-white/8 bg-white/[0.03] px-4 py-3">
                                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/40">
                                            <Mail size={14} />
                                            Email
                                        </div>
                                        <p className="mt-2 text-sm font-medium text-white/88">{emailLabel}</p>
                                    </div>
                                </div>
                                {!user ? (
                                    <p className="mt-4 text-sm leading-6 text-white/60">
                                        Les coordonnees directes se debloquent apres connexion. La vitrine, les photos et
                                        les elements de preuve restent visibles.
                                    </p>
                                ) : null}
                            </div>

                            {/* PremiumContactGate — messaging CTA for authenticated non-owners */}
                            {user && !isOwner ? (
                                <div className="mt-4">
                                    <PremiumContactGate
                                        artisanId={artisan.id}
                                        artisanName={displayName}
                                        phone={directPhone}
                                        email={directEmail}
                                        hasActiveSubscription={hasActiveSubscription}
                                        isAuthenticated={true}
                                        isOwner={false}
                                    />
                                </div>
                            ) : null}

                            {isOwner ? (
                                <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.04] p-5">
                                    <p className="text-[11px] uppercase tracking-[0.22em] text-white/42">
                                        Tableau de bord
                                    </p>
                                    <p className="mt-3 text-sm leading-6 text-white/72">
                                        Cette affiche reprend votre bio, votre photo de profil et vos realisations. Les
                                        mises a jour se font depuis votre espace professionnel.
                                    </p>
                                    <div className="mt-4 flex flex-wrap gap-3">
                                        <Link
                                            href="/dashboard/account"
                                            className="inline-flex h-10 items-center justify-center rounded-lg border border-white/12 bg-white/[0.05] px-4 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
                                        >
                                            Profil
                                        </Link>
                                        <Link
                                            href="/dashboard/account/portfolio"
                                            className="inline-flex h-10 items-center justify-center rounded-lg border border-white/12 bg-white/[0.05] px-4 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
                                        >
                                            Portfolio
                                        </Link>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </section>

            {!user ? (
                <section className="border-b border-white/10 bg-[#050505]">
                    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between md:px-8">
                        <p className="text-sm leading-6 text-white/70">
                            Connectez-vous pour appeler, enregistrer ce profil dans vos favoris et publier un avis.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href={loginHref}
                                className="inline-flex h-10 items-center justify-center rounded-lg border border-white/12 bg-white text-sm font-semibold text-black transition hover:bg-white/90"
                            >
                                Se connecter
                            </Link>
                            <Link
                                href={registerHref}
                                className="inline-flex h-10 items-center justify-center rounded-lg border border-white/12 bg-white/[0.05] px-4 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
                            >
                                Creer un compte
                            </Link>
                        </div>
                    </div>
                </section>
            ) : null}

            <section className="border-b border-white/10">
                <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 md:px-8 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
                        <p className="text-xs uppercase tracking-[0.24em] text-white/40">A propos</p>
                        <h2 className="mt-3 text-2xl font-semibold text-white">Une vitrine concise, lisible, directe.</h2>
                        <p className="mt-4 text-base leading-7 text-white/72">
                            {artisan.bio ||
                                "Le descriptif n'est pas encore renseigne. Les visiteurs peuvent deja consulter la localisation, les photos et les moyens de contact autorises."}
                        </p>
                        {expertiseHighlights.length > 0 || ageLabel ? (
                            <div className="mt-5 flex flex-wrap gap-2">
                                {expertiseHighlights.slice(0, 4).map((highlight) => (
                                    <span
                                        key={highlight}
                                        className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-medium text-white/82"
                                    >
                                        {highlight}
                                    </span>
                                ))}
                                {ageLabel ? (
                                    <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-medium text-white/82">
                                        {ageLabel}
                                    </span>
                                ) : null}
                            </div>
                        ) : null}
                    </div>

                    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
                        <p className="text-xs uppercase tracking-[0.24em] text-white/40">Presence</p>
                        <h2 className="mt-3 text-2xl font-semibold text-white">Une affiche qui joue le role de carte de visite.</h2>
                        <div className="mt-5 space-y-4 text-sm leading-6 text-white/70">
                            <div className="flex items-start gap-3">
                                <Sparkles size={18} className="mt-0.5 text-white/45" />
                                <p>
                                    {profession
                                        ? `Metier affiche publiquement: ${profession}.`
                                        : "Le metier principal s'affiche ici des qu'il est renseigne a l'inscription."}
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <Images size={18} className="mt-0.5 text-white/45" />
                                <p>
                                    {primarySpecialty
                                        ? `Specialite mise en avant: ${primarySpecialty}.`
                                        : "Les specialites validees a l'inscription peuvent enrichir la carte et la fiche publique."}
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <Lock size={18} className="mt-0.5 text-white/45" />
                                <p>
                                    Zone affichee: {locationLabel}. Les coordonnees directes restent protegees pour les visiteurs anonymes.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="border-b border-white/10">
                <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-8">
                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.24em] text-white/40">Portfolio</p>
                            <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">Photos deja publiees</h2>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/68">
                                Chaque image chargee par le proprietaire peut devenir une preuve immediate de savoir-faire sur cette page.
                            </p>
                        </div>
                        <p className="text-sm font-medium text-white/52">{portfolios.length} photo(s)</p>
                    </div>

                    <div className="mt-8">
                        {portfolios.length > 0 ? (
                            <PortfolioGallery portfolios={portfolios} tone="dark" />
                        ) : isOwner ? (
                            <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.02] px-6 py-10 text-center">
                                <p className="text-lg font-medium text-white">Votre vitrine attend ses premieres photos.</p>
                                <p className="mt-3 text-sm leading-6 text-white/60">
                                    Ajoutez des realisations pour donner a cette page le vrai rendu affiche haut de gamme
                                    que vous cherchez.
                                </p>
                                <Link
                                    href="/dashboard/account/portfolio"
                                    className="mt-6 inline-flex h-11 items-center justify-center rounded-lg border border-white/12 bg-white text-sm font-semibold text-black transition hover:bg-white/90"
                                >
                                    Ajouter des photos
                                </Link>
                            </div>
                        ) : (
                            <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.02] px-6 py-10 text-center">
                                <p className="text-lg font-medium text-white">Pas encore de photos publiques.</p>
                                <p className="mt-3 text-sm leading-6 text-white/60">
                                    L'artisan n'a pas encore renseigne de realisations visibles dans son portfolio.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section>
                <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-10 md:px-8 lg:grid-cols-[1.05fr_0.95fr]">
                    <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-white/40">Avis</p>
                        <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">Ce que les clients racontent</h2>
                        <p className="mt-3 text-sm leading-6 text-white/66">
                            Les avis gardent une presence editoriale sobre. La page reste utile meme avec peu de texte.
                        </p>

                        <div className="mt-8 space-y-4">
                            {visibleReviews.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.02] px-6 py-10">
                                    <p className="text-lg font-medium text-white">Aucun avis publie pour le moment.</p>
                                    <p className="mt-3 text-sm leading-6 text-white/60">
                                        La vitrine reste active avec la presentation du profil et le portfolio.
                                    </p>
                                </div>
                            ) : (
                                visibleReviews.map((review) => (
                                    <article
                                        key={review.id}
                                        className="rounded-lg border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/[0.05]">
                                                    {review.profiles?.avatar_url ? (
                                                        <Image
                                                            src={review.profiles.avatar_url}
                                                            alt={review.profiles.full_name || "Client"}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-white/60">
                                                            {(review.profiles?.full_name || "U").charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-white">
                                                        {review.profiles?.full_name || "Utilisateur"}
                                                    </p>
                                                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/38">
                                                        {formatReviewDate(review.created_at)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-medium text-white">
                                                <Star size={14} className="fill-white text-white" />
                                                {review.rating}/5
                                            </div>
                                        </div>

                                        <p className="mt-4 text-sm leading-7 text-white/74">{review.comment}</p>
                                    </article>
                                ))
                            )}

                            {hasHiddenReviews ? (
                                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
                                    <p className="text-sm font-medium text-white">
                                        Connectez-vous pour voir tous les avis et laisser le votre.
                                    </p>
                                    <div className="mt-4 flex flex-wrap gap-3">
                                        <Link
                                            href={loginHref}
                                            className="inline-flex h-10 items-center justify-center rounded-lg border border-white/12 bg-white text-sm font-semibold text-black transition hover:bg-white/90"
                                        >
                                            Se connecter
                                        </Link>
                                        <Link
                                            href={registerHref}
                                            className="inline-flex h-10 items-center justify-center rounded-lg border border-white/12 bg-white/[0.05] px-4 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
                                        >
                                            Creer un compte
                                        </Link>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div>
                        {isOwner ? (
                            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
                                <p className="text-xs uppercase tracking-[0.24em] text-white/40">Mode proprietaire</p>
                                <h2 className="mt-3 text-2xl font-semibold text-white">Votre vitrine est en ligne.</h2>
                                <p className="mt-4 text-sm leading-7 text-white/68">
                                    Continuez a l'alimenter depuis votre compte: texte de presentation, photo de profil,
                                    portfolio et informations de contact. Cette page devient alors votre affiche
                                    partageable depuis le carousel.
                                </p>
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <Link
                                        href="/dashboard/account"
                                        className="inline-flex h-11 items-center justify-center rounded-lg border border-white/12 bg-white text-sm font-semibold text-black transition hover:bg-white/90"
                                    >
                                        Modifier mon profil
                                    </Link>
                                    <Link
                                        href="/dashboard/account/portfolio"
                                        className="inline-flex h-11 items-center justify-center rounded-lg border border-white/12 bg-white/[0.05] px-4 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
                                    >
                                        Gerer mon portfolio
                                    </Link>
                                </div>
                            </div>
                        ) : user ? (
                            <ReviewForm artisanId={id} tone="dark" />
                        ) : (
                            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
                                <p className="text-xs uppercase tracking-[0.24em] text-white/40">Interaction</p>
                                <h2 className="mt-3 text-2xl font-semibold text-white">Laisser un avis apres connexion</h2>
                                <p className="mt-4 text-sm leading-7 text-white/68">
                                    La vitrine reste consultable en public, mais la participation se fait depuis un compte
                                    connecte pour garder des preuves plus fiables.
                                </p>
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <Link
                                        href={loginHref}
                                        className="inline-flex h-11 items-center justify-center rounded-lg border border-white/12 bg-white text-sm font-semibold text-black transition hover:bg-white/90"
                                    >
                                        Se connecter
                                    </Link>
                                    <Link
                                        href={registerHref}
                                        className="inline-flex h-11 items-center justify-center rounded-lg border border-white/12 bg-white/[0.05] px-4 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
                                    >
                                        Creer un compte
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}
