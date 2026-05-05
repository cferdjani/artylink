import { GlassCard } from "@/components/ui/glass-card";
import { Building2, Globe, HandHeart, MapPin, Megaphone, Sparkles, Target, Users } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "A propos | ArtyLink",
    description: "ArtyLink connecte clients, artisans et freelances en Algerie avec un moteur de recherche locale par wilaya et commune.",
};

const values = [
    {
        icon: Megaphone,
        title: "Visibilite claire",
        description: "Les artisans gagnent une vitrine locale et les clients trouvent plus vite les profils, annonces et cartes de visite.",
    },
    {
        icon: MapPin,
        title: "Ancrage local",
        description: "Une recherche geographique precise par wilaya et commune pour trouver des artisans proches de chez vous, dans toute l'Algerie.",
    },
    {
        icon: HandHeart,
        title: "Accessibilite pour tous",
        description: "Un service gratuit pour les clients, et des formules accessibles pour les artisans souhaitant augmenter leur visibilite.",
    },
    {
        icon: Users,
        title: "Communaute",
        description: "Un reseau de professionnels et de clients qui partagent des valeurs d'excellence et de respect mutuel.",
    },
];

export default function AboutPage() {
    return (
        <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-8 md:px-8 animate-fade-in-up">
            {/* Hero Section */}
            <GlassCard className="p-8 md:p-12 relative overflow-hidden mb-10">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -left-16 bottom-0 w-48 h-48 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary mb-4">
                        <Sparkles size={14} />
                        A propos de nous
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-4">
                        ArtyLink
                    </h1>
                    <p className="text-lg text-slate-600 leading-relaxed max-w-3xl font-medium">
                        ArtyLink est une plateforme algerienne de visibilite et de mise en contact
                        entre clients, artisans et freelances. Notre mission est de simplifier la recherche
                        locale et de valoriser les cartes de visite, annonces et demandes utiles.
                    </p>
                </div>
            </GlassCard>

            {/* Mission */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <GlassCard className="p-8">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                        <Target size={24} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-3">Notre Mission</h2>
                    <p className="text-slate-600 leading-relaxed font-medium">
                        Democratiser l'acces aux services artisanaux en Algerie en offrant une
                        plateforme numerique claire, locale et accessible. Nous croyons
                        que chaque artisan merite une vitrine pour son talent, et chaque client
                        merite de trouver les bons contacts facilement.
                    </p>
                </GlassCard>

                <GlassCard className="p-8">
                    <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary mb-4">
                        <Globe size={24} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-3">Notre Vision</h2>
                    <p className="text-slate-600 leading-relaxed font-medium">
                        Devenir la reference incontournable pour la recherche locale en Algerie
                        et dans la region MENA, en construisant un ecosysteme ou la visibilite,
                        la clarte des annonces et le contact direct sont au coeur du service.
                    </p>
                </GlassCard>
            </div>

            {/* Values */}
            <div className="mb-10">
                <h2 className="text-3xl font-black text-slate-900 mb-6 flex items-center gap-3">
                    <Building2 className="text-primary" size={28} /> Nos Valeurs
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {values.map((value) => {
                        const Icon = value.icon;
                        return (
                            <GlassCard key={value.title} className="p-6">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                                    <Icon size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">{value.title}</h3>
                                <p className="text-sm text-slate-600 leading-relaxed font-medium">{value.description}</p>
                            </GlassCard>
                        );
                    })}
                </div>
            </div>

            {/* CTA */}
            <GlassCard className="p-8 text-center bg-gradient-to-br from-primary/5 to-transparent">
                <h2 className="text-2xl font-black text-slate-900 mb-3">Rejoignez la communaute ArtyLink</h2>
                <p className="text-slate-600 font-medium mb-6 max-w-xl mx-auto">
                    Que vous soyez un artisan souhaitant developper votre activite ou un client
                    a la recherche d'un contact local, ArtyLink est fait pour vous.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Link href="/auth/register-type?type=artisan" className="glass-btn-primary px-6">
                        Devenir artisan
                    </Link>
                    <Link href="/auth/register-type?type=client" className="glass-btn-secondary px-6">
                        S'inscrire comme client
                    </Link>
                </div>
            </GlassCard>
        </div>
    );
}
