import { featuredArtisans } from "@/lib/marketplace-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const DEFAULT_AVATAR = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232563eb'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

function AnnonceCard({ artisan, isPrivileged }: { artisan: any, isPrivileged: boolean }) {
  const isVip = artisan.subscription_tier === 'vip';

  return (
    <Link href={`/artisan/${artisan.id}`} className="group relative bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl p-4 flex items-start gap-4 hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)] hover:border-primary/30 transition-all duration-300">
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
        <Image
          src={artisan.avatar_url || DEFAULT_AVATAR}
          alt={`Avatar de ${artisan.name}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate" title={artisan.name}>
            {artisan.name}
          </h3>
          <div className="flex flex-col items-end shrink-0 gap-1 mt-0.5">
            {isVip && isPrivileged && (
              <span className="bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                VIP
              </span>
            )}
            {artisan.subscription_tier === 'premium' && (
              <span className="bg-primary/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                À LA UNE
              </span>
            )}
          </div>
        </div>

        <p className="text-xs font-bold text-slate-800 truncate" title={artisan.profession}>
          {artisan.profession}
        </p>

        <p className="text-[11.5px] font-medium text-slate-700 mt-1.5 line-clamp-2 leading-relaxed">
          Prestations en {artisan.profession.toLowerCase()}. Cliquez pour découvrir le profil, les services proposés et les avis clients.
        </p>

        <div className="mt-3 flex items-center justify-between text-xs">
          <div className="flex items-center text-slate-700 font-semibold truncate max-w-[65%]">
            <MapPin className="w-3.5 h-3.5 mr-1 shrink-0 text-slate-500" />
            <span className="truncate">{artisan.wilaya}{artisan.commune ? `, ${artisan.commune}` : ''}</span>
          </div>
          {artisan.rating && artisan.rating > 0 ? (
            <div className="flex items-center text-slate-700 font-bold shrink-0 bg-slate-100 px-1.5 py-0.5 rounded-md">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-1" />
              {artisan.rating.toFixed(1)}
            </div>
          ) : (
             <div className="text-slate-400 text-[10px] font-medium bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100">Nouveau</div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default async function ArtisanAnnonces() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isPrivileged = false;
  if (user) {
    const [{ data: profile }, { data: artisanProfile }] = await Promise.all([
      supabase.from('profiles').select('role').eq('id', user.id).maybeSingle(),
      supabase.from('artisans').select('subscription_tier').eq('id', user.id).maybeSingle()
    ]);
    const role = profile?.role;
    const tier = artisanProfile?.subscription_tier;
    isPrivileged = role === 'admin' || role === 'owner' || role === 'delegate' || tier === 'vip';
  }

  // 1. Charger les artisans payants d'abord (Pro puis Starter)
  const { data: paidArtisans } = await supabase
    .from("artisans")
    .select(`
      id, company_name, profession, wilaya, city, rating, subscription_tier,
      profiles!inner(full_name, avatar_url)
    `)
    .in("subscription_tier", ["vip", "premium"])
    .order("subscription_tier", { ascending: true })
    .order("rating", { ascending: false, nullsFirst: false })
    .limit(12);

  // 2. Si pas assez, compléter avec tous les artisans
  let allArtisans = paidArtisans || [];
  if (allArtisans.length < 8) {
    const { data: freeArtisans } = await supabase
      .from("artisans")
      .select(`
        id, company_name, profession, wilaya, city, rating, subscription_tier,
        profiles!inner(full_name, avatar_url)
      `)
      .eq("subscription_tier", "free")
      .order("rating", { ascending: false, nullsFirst: false })
      .limit(12 - allArtisans.length);

    if (freeArtisans) {
      // deduplicate
      const existingIds = new Set(allArtisans.map((a: any) => a.id));
      const newFreeArtisans = freeArtisans.filter((a: any) => !existingIds.has(a.id));
      allArtisans = [...allArtisans, ...newFreeArtisans];
    }
  }

  // 3. Normaliser
  let annonces = allArtisans.map((a: any) => {
    const profile = Array.isArray(a.profiles) ? a.profiles[0] : a.profiles;
    return {
      id: a.id,
      name: a.company_name || profile?.full_name || "Artisan",
      profession: a.profession || "Prestataire",
      wilaya: a.wilaya || "Algérie",
      commune: a.city,
      rating: a.rating,
      subscription_tier: a.subscription_tier,
      avatar_url: profile?.avatar_url,
    };
  });

  // 4. FALLBACK DÉMO si DB totalement vide
  if (annonces.length === 0) {
    annonces = featuredArtisans.map((a) => ({
      id: a.id,
      name: a.name,
      profession: a.serviceTitle,
      wilaya: a.wilaya,
      commune: a.commune,
      rating: a.ratingAvg,
      subscription_tier: "vip",
      avatar_url: a.avatarUrl,
    }));
  }

  return (
    <section className="mt-8 w-full max-w-[1320px] px-4 md:px-6 mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-slate-900">Annonces artisans</h2>
        <Link href="/search" className="text-sm font-semibold text-primary hover:underline">
          Voir tout &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {annonces.map((a) => (
          <AnnonceCard key={a.id} artisan={a} isPrivileged={isPrivileged} />
        ))}
      </div>
    </section>
  );
}
