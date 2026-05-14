"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type PromoSlide = {
  id: string;
  title: string;
  subtitle: string;
  cta: {
    label: string;
    href: string;
  };
  gradient: string;
  isArtisan?: boolean;
  avatar_url?: string | null;
};

type BannerArtisan = {
  id: string;
  company_name: string | null;
  profession: string | null;
  wilaya: string | null;
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

const PROMO_SLIDES: PromoSlide[] = [
  {
    id: "promo-1",
    title: "Trouvez votre artisan en quelques clics",
    subtitle: "Plombier, électricien, peintre — comparez et contactez les meilleurs pros près de chez vous",
    cta: { label: "Rechercher maintenant", href: "/search" },
    gradient: "from-blue-600 to-indigo-700",
  },
  {
    id: "promo-2",
    title: "Artisans — Boostez votre visibilité",
    subtitle: "Le forfait Pro vous place en tête des résultats et dans la bannière promotionnelle",
    cta: { label: "Voir les forfaits", href: "/pricing" },
    gradient: "from-emerald-600 to-teal-700",
  },
  {
    id: "promo-3",
    title: "29 catégories de services",
    subtitle: "Électricité, construction, beauté, informatique, traiteur et bien plus",
    cta: { label: "Explorer les catégories", href: "/search" },
    gradient: "from-violet-600 to-purple-700",
  },
  {
    id: "promo-4",
    title: "Nouveau ? Créez votre compte gratuit",
    subtitle: "Accédez aux coordonnées des artisans et contactez-les directement",
    cta: { label: "S'inscrire gratuitement", href: "/auth/register-type" },
    gradient: "from-rose-600 to-pink-700",
  },
];

export default function PromoBanner({ bannerArtisans = [] }: { bannerArtisans?: BannerArtisan[] }) {
  const dynamicSlides: PromoSlide[] = bannerArtisans.map((artisan, index) => {
    const profile = Array.isArray(artisan.profiles) ? artisan.profiles[0] : artisan.profiles;
    const name = artisan.company_name || profile?.full_name || "Artisan Pro";
    const profession = artisan.profession || "service professionnel";
    const wilaya = artisan.wilaya || "Algérie";
    const gradients = [
      "from-amber-500 to-orange-700",
      "from-cyan-600 to-blue-700",
      "from-fuchsia-600 to-purple-700"
    ];
    return {
      id: `artisan-${artisan.id}`,
      title: `${name} — Artisan d'Excellence`,
      subtitle: `Spécialiste en ${profession} basé à ${wilaya}. Cliquez pour découvrir ses prestations et voir les avis clients.`,
      cta: { label: "Voir le profil professionnel", href: `/artisan/${artisan.id}` },
      gradient: gradients[index % gradients.length],
      isArtisan: true,
      avatar_url: profile?.avatar_url
    };
  });

  const allSlides = [...PROMO_SLIDES, ...dynamicSlides];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((current) => (current + 1) % allSlides.length);
  }, [allSlides.length]);

  useEffect(() => {
    if (!isPaused) {
      timeoutRef.current = setInterval(nextSlide, 5000);
    }
    return () => {
      if (timeoutRef.current) clearInterval(timeoutRef.current);
    };
  }, [isPaused, nextSlide]);

  return (
    <div
      className="relative w-full h-[180px] md:h-[200px] lg:h-full lg:min-h-[220px] rounded-2xl overflow-hidden shadow-[0_20px_45px_rgba(15,23,42,0.12)] group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div
        className="flex h-full w-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {allSlides.map((slide) => (
          <div
            key={slide.id}
            className={`min-w-full h-full relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${slide.gradient}`}
          >
            {/* Abstract background shapes */}
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-48 h-48 bg-black/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 px-6 md:px-12 w-full h-full text-center md:text-left">
              {slide.isArtisan && slide.avatar_url && (
                <div className="hidden md:block w-24 h-24 shrink-0 rounded-full overflow-hidden border-4 border-white/20 shadow-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={slide.avatar_url} alt={slide.title} className="w-full h-full object-cover" />
                </div>
              )}
              
              <div className="flex flex-col gap-2 md:gap-3 flex-1 max-w-2xl">
                {slide.isArtisan && (
                  <span className="inline-block bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded w-max mx-auto md:mx-0 shadow-sm uppercase tracking-widest mb-1">
                    Annonce Sponsorisée
                  </span>
                )}
                <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
                  {slide.title}
                </h3>
                <p className="text-sm md:text-base text-white/90 font-medium line-clamp-2 md:line-clamp-none">
                  {slide.subtitle}
                </p>
              </div>

              <Link
                href={slide.cta.href}
                className="bg-white text-slate-900 font-bold rounded-full px-6 py-2.5 hover:bg-white/90 hover:scale-105 hover:shadow-xl transition-all duration-200 mt-2"
              >
                {slide.cta.label}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
        {allSlides.map((_, index) => (
          <button
            key={`dot-${index}`}
            onClick={(e) => {
              e.preventDefault();
              setCurrentIndex(index);
            }}
            className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "bg-white scale-125"
                : "bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Aller au slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
