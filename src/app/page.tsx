import { CategoryGrid } from "@/components/features/category-grid";
import { HeroSearch } from "@/components/features/hero-search";
import HomeOptions from "@/components/features/home-options";
import { getHomepageCategories } from "@/lib/marketplace-server-data";
import Link from "next/link";

const trustStats = [
  { value: "12k+", label: "Clients actifs" },
  { value: "3.2k+", label: "Cartes de visite" },
  { value: "< 4 min", label: "Temps moyen de reponse" },
  { value: "58", label: "Wilayas couvertes" },
];

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

  return (
    <div className="home-hero-bg apple-shell relative min-h-screen flex flex-col items-center pt-8 pb-4">
      <div className="home-hero-overlay w-full">
        <div className="w-full">
          <HeroSearch categories={categories} />
        </div>
      </div>
      <section className="mt-4 w-full max-w-6xl px-4">
        <div className="apple-panel p-4 md:p-7">
          <p className="apple-chip inline-flex px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.16em] text-primary">
            Plateforme active
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {trustStats.map((stat) => (
              <article
                key={stat.label}
                className="apple-tile px-4 py-5"
              >
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="mt-1 text-sm font-semibold text-slate-600">{stat.label}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-6 w-full max-w-6xl px-4">
        <h2 className="mb-2 text-2xl font-bold text-slate-900">Explorez Par Categorie de Services</h2>
        <CategoryGrid categories={categories} />
      </div>

      <section className="mt-10 w-full max-w-6xl px-4">
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

      <section className="mt-10 w-full max-w-6xl px-4">
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

      <section className="mt-8 mb-6 w-full max-w-6xl px-4">
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
