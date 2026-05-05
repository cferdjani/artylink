import { GlassCard } from "@/components/ui/glass-card";
import { FileText, Scale, Shield } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Mentions Legales & CGU | ArtyLink",
    description: "Conditions Generales d'Utilisation et Mentions Legales de la plateforme ArtyLink.",
};

export default function LegalPage() {
    return (
        <main className="max-w-4xl mx-auto px-4 py-12 animate-fade-in-up min-h-[70vh]">
            <div className="mb-10">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <Scale className="text-primary" size={32} />
                    Informations Legales
                </h1>
                <p className="mt-3 text-slate-600 font-medium max-w-2xl">
                    Cette page regroupe les Conditions Generales d'Utilisation (CGU) et les Mentions Legales de la plateforme ArtyLink.
                </p>
            </div>

            {/* CGU */}
            <GlassCard className="p-8 md:p-10 mb-8">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                    <FileText size={22} className="text-primary" /> Conditions Generales d'Utilisation
                </h2>
                <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed space-y-4 text-sm">
                    <h3 className="text-lg font-bold text-slate-800">1. Objet</h3>
                    <p>
                        Les presentes Conditions Generales d'Utilisation (CGU) definissent les modalites d'acces et d'utilisation
                        de la plateforme ArtyLink, accessible a l'adresse artylink.com et via ses applications mobiles.
                        ArtyLink est un service de mise en relation entre des clients et des artisans professionnels
                        exercant en Algerie.
                    </p>

                    <h3 className="text-lg font-bold text-slate-800">2. Acceptation des CGU</h3>
                    <p>
                        L'inscription et l'utilisation de la plateforme impliquent l'acceptation pleine et entiere
                        des presentes CGU. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser le service.
                    </p>

                    <h3 className="text-lg font-bold text-slate-800">3. Description du service</h3>
                    <p>
                        ArtyLink propose un moteur de recherche local permettant aux clients de trouver des annonces,
                        cartes de visite et profils professionnels par wilaya et commune. La plateforme vend de la
                        visibilite, de la mise en avant et des outils de contact pour les professionnels.
                    </p>

                    <h3 className="text-lg font-bold text-slate-800">4. Inscription et comptes</h3>
                    <p>
                        L'inscription est gratuite pour les clients. Les artisans peuvent s'inscrire gratuitement
                        avec un plan basique, ou souscrire a un abonnement pour beneficier d'une visibilite accrue.
                        Chaque utilisateur est responsable de la confidentialite de ses identifiants de connexion.
                    </p>

                    <h3 className="text-lg font-bold text-slate-800">5. Responsabilites</h3>
                    <p>
                        ArtyLink agit en qualite d'intermediaire technique et de plateforme de visibilite. La plateforme
                        ne verifie pas les prestations, ne garantit pas l'identite commerciale des utilisateurs, ne gere
                        pas les litiges, et ne peut etre tenue responsable des escroqueries, paiements externes ou accords
                        conclus directement entre utilisateurs. Les echanges et conflits doivent etre resolus directement
                        entre les parties concernees.
                    </p>

                    <h3 className="text-lg font-bold text-slate-800">6. Propriete intellectuelle</h3>
                    <p>
                        L'ensemble des contenus presents sur ArtyLink (logos, textes, images, interface) sont proteges
                        par le droit de la propriete intellectuelle. Toute reproduction non autorisee est interdite.
                    </p>

                    <h3 className="text-lg font-bold text-slate-800">7. Modification des CGU</h3>
                    <p>
                        ArtyLink se reserve le droit de modifier les presentes CGU a tout moment.
                        Les utilisateurs seront informes de toute modification substantielle par notification
                        sur la plateforme.
                    </p>
                </div>
            </GlassCard>

            {/* Mentions Legales */}
            <GlassCard className="p-8 md:p-10 mb-8">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                    <Shield size={22} className="text-primary" /> Mentions Legales
                </h2>
                <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed space-y-4 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/50 p-4 rounded-xl border border-slate-100">
                            <h4 className="font-bold text-slate-800 mb-2">Editeur du site</h4>
                            <p>ArtyLink SARL</p>
                            <p>Algerie</p>
                            <p>Email : support@artylink.com</p>
                        </div>
                        <div className="bg-white/50 p-4 rounded-xl border border-slate-100">
                            <h4 className="font-bold text-slate-800 mb-2">Hebergement</h4>
                            <p>Vercel Inc.</p>
                            <p>Base de donnees : Supabase</p>
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Cookies */}
            <GlassCard className="p-8 md:p-10 mb-8" id="cookies">
                <h2 className="text-2xl font-black text-slate-900 mb-6">Politique de Cookies</h2>
                <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed space-y-4 text-sm">
                    <p>
                        ArtyLink utilise des cookies strictement necessaires au fonctionnement du site,
                        notamment pour la gestion de l'authentification et le maintien de votre session.
                    </p>
                    <p>
                        Aucun cookie publicitaire ou de suivi tiers n'est utilise sur la plateforme.
                        Les cookies de session sont automatiquement supprimes a la fermeture du navigateur.
                    </p>
                </div>
            </GlassCard>

            <div className="mt-10 flex gap-4">
                <Link href="/privacy" className="glass-btn-secondary px-6 py-2">
                    Politique de confidentialite
                </Link>
                <Link href="/" className="glass-btn-secondary px-6 py-2">
                    Retour a l'accueil
                </Link>
            </div>
        </main>
    );
}
