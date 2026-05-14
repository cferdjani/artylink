import ArtisanAnnonces from "@/components/features/ArtisanAnnonces";
import { HeroSearch } from "@/components/features/hero-search";
import HomeOptions from "@/components/features/home-options";
import PromoBanner from "@/components/features/PromoBanner";
import TrustBar from "@/components/features/TrustBar";
import { getHomepageCategories } from "@/lib/marketplace-server-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Suspense } from "react";

const howItWorks = [
  {
    step: "01",
    title: "Recherche intelligente",
    description:
      "Le visiteur filtre par metier, wilaya et commune pour trouver vite les bons profils.",
  },
  {
    step: "02",
    title: "Connexion et qualification",
    description:
      "En se connectant, le client voit les details, compare et ouvre une demande claire.",
  },
  {
    step: "03",
    title: "Contact direct",
    description:
      "Les utilisateurs echangent librement. ArtyLink fournit la visibilite, pas l'arbitrage des prestations.",
  },
];

const artisanPlans = [
  {
    name: "Basique",
    badge: "Inclu au depart",
    price: "Carte de visite",
    details: "Profil essentiel avec informations de contact et presence locale.",
  },
  {
    name: "Starter",
    badge: "Le plus choisi",
    price: "Visibilite renforcee",
    details: "Mise en avant searchbar, portfolio plus visible et meilleure presence locale.",
  },
  {
    name: "Pro",
    badge: "Croissance",
    price: "Pack premium",
    details: "Carousel pub, landing entreprise, options branding avancees.",
  },
];

export default async function Home() {
  const categories = await getHomepageCategories();
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: bannerArtisans } = await supabase
    .from("artisans")
    .select(`
      id, company_name, profession, wilaya, city, rating,
      profiles!inner(full_name, avatar_url)
    `)
    .eq("subscription_tier", "vip")
    .order("rating", { ascending: false, nullsFirst: false })
    .limit(3);

  return (
    <div className="home-hero-bg apple-shell relative min-h-screen flex flex-col items-center pt-6 pb-4">
      {/* HeroSearch visible uniquement sur mobile/tablette. Sur Desktop (lg), la Navbar prend le relais. */}
      <div className="home-hero-overlay w-full lg:hidden mb-4 px-4">
        <div className="w-full">
          <HeroSearch categories={categories} />
        </div>
      </div>

      {/* ALIBABA HERO LAYOUT — Full-width Banner */}
      <div className="w-full max-w-[1440px] px-4 md:px-6 mx-auto">
        <Suspense fallback={
          <div className="w-full h-[180px] md:h-[200px] lg:h-[240px] rounded-2xl bg-slate-100/50 backdrop-blur-sm animate-pulse border border-white/20" />
        }>
          <PromoBanner bannerArtisans={bannerArtisans || []} />
        </Suspense>
      </div>

      <div className="w-full max-w-[1320px] mx-auto mt-4">
        <TrustBar />
      </div>

      <Suspense fallback={
        <div className="w-full max-w-[1320px] px-4 md:px-6 mx-auto mt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({length: 10}).map((_, i) => (
              <div key={i} className="h-[240px] rounded-2xl bg-slate-100/50 animate-pulse" />
            ))}
          </div>
        </div>
      }>
        <ArtisanAnnonces />
      </Suspense>

      <section className="mt-8 w-full max-w-[1320px] px-4 md:px-6 mx-auto">
        <h2 className="mb-4 text-xl font-bold text-slate-900">Catégories populaires</h2>
        <div className="flex overflow-x-auto gap-3 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/recherche/${cat.slug}`}
              className="apple-panel flex-shrink-0 px-5 py-2.5 flex items-center gap-2 hover:bg-white/60 transition-colors whitespace-nowrap"
            >
              <span className="text-sm font-semibold text-slate-800">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10 w-full max-w-[1320px] px-4 md:px-6 mx-auto">
        <div className="apple-panel p-6 md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="apple-chip inline-flex px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.16em] text-primary">Parcours</p>
              <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Comment ArtyLink cree de la valeur</h3>
            </div>
            <Link
              href="/a-propos"
              className="apple-tile inline-flex items-center justify-center px-4 py-2 text-sm font-bold text-slate-700"
            >
              Voir la vision
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {howItWorks.map((item) => (
              <article
                key={item.step}
                className="apple-tile p-5"
              >
                <p className="text-xs font-semibold tracking-[0.2em] text-primary/80">{item.step}</p>
                <h4 className="mt-2 text-lg font-bold text-slate-900">{item.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-10 w-full max-w-[1320px] px-4 md:px-6 mx-auto">
        <div className="apple-panel p-6 md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="apple-chip inline-flex px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.16em] text-slate-700">Forfaits artisans</p>
              <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Choisis ton rythme de croissance</h3>
            </div>
            <Link
              href="/pricing"
              className="apple-cta inline-flex items-center justify-center px-4 py-2 text-sm font-bold"
            >
              Voir les tarifs
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {artisanPlans.map((plan) => (
              <article key={plan.name} className="apple-tile p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{plan.badge}</p>
                <h4 className="mt-2 text-2xl font-bold text-slate-900">{plan.name}</h4>
                <p className="mt-1 text-sm font-semibold text-primary">{plan.price}</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{plan.details}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <HomeOptions />

      <section className="mt-8 mb-6 w-full max-w-[1320px] px-4 md:px-6 mx-auto">
        <div className="apple-panel p-6 md:p-8">
          <h3 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Besoin d&apos;un artisan maintenant ou pret a booster ton activite ?
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 md:text-base">
            Clients et artisans avancent sur la meme plateforme, avec un parcours clair, des offres
            visibles et des outils de suivi concrets.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/auth/register-type"
              className="apple-cta inline-flex items-center justify-center px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em]"
            >
              Creer un compte
            </Link>
            <Link
              href="/search"
              className="apple-tile inline-flex items-center justify-center px-5 py-3 text-sm font-bold text-slate-700"
            >
              Explorer les profils
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
