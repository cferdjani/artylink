import { GlassCard } from "@/components/ui/glass-card";
import { Database, Eye, Lock, Shield, Trash2, UserCheck } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Politique de Confidentialite | ArtyLink",
    description: "Decouvrez comment ArtyLink protege vos donnees personnelles et respecte votre vie privee.",
};

const sections = [
    {
        icon: Database,
        title: "Donnees collectees",
        content: `ArtyLink collecte les donnees necessaires au fonctionnement du service :
        
- Informations d'inscription : nom, adresse email, numero de telephone
- Donnees de profil artisan : nom d'entreprise, wilaya, commune, bio, portfolio
- Donnees d'utilisation : reservations, messages, avis et notations
- Donnees techniques : adresse IP, type de navigateur (a des fins de securite uniquement)`,
    },
    {
        icon: Eye,
        title: "Utilisation des donnees",
        content: `Vos donnees sont utilisees exclusivement pour :

- Fournir et ameliorer le service ArtyLink
- Permettre la mise en relation entre clients et artisans
- Gerer votre compte et vos abonnements
- Envoyer des notifications liees a votre activite (reservations, messages)
- Assurer la securite et prevenir les fraudes

ArtyLink ne vend jamais vos donnees a des tiers. Aucune donnee n'est partagee avec des annonceurs.`,
    },
    {
        icon: Lock,
        title: "Protection des donnees",
        content: `ArtyLink met en oeuvre des mesures techniques et organisationnelles pour proteger vos donnees :

- Chiffrement SSL/TLS pour toutes les communications
- Stockage securise sur des serveurs certifies (Supabase / AWS)
- Acces aux donnees restreint aux equipes autorisees
- Politiques RLS (Row Level Security) sur toutes les tables de donnees
- Authentification securisee avec options de verification email`,
    },
    {
        icon: UserCheck,
        title: "Vos droits",
        content: `Conformement a la legislation algerienne sur la protection des donnees personnelles, vous disposez des droits suivants :

- Droit d'acces : consulter les donnees que nous detenons sur vous
- Droit de rectification : modifier vos informations personnelles
- Droit de suppression : demander la suppression de votre compte et de vos donnees
- Droit d'opposition : refuser certains traitements de vos donnees

Pour exercer vos droits, contactez-nous a support@artylink.com.`,
    },
    {
        icon: Trash2,
        title: "Conservation des donnees",
        content: `Vos donnees personnelles sont conservees pendant la duree de votre inscription sur la plateforme.

- Donnees de compte : conservees tant que le compte est actif
- Messages : conserves 12 mois apres la derniere activite
- Donnees de paiement : conservees selon les obligations legales (5 ans)
- En cas de suppression de compte : les donnees sont anonymisees sous 30 jours`,
    },
];

export default function PrivacyPage() {
    return (
        <div className="mx-auto w-full max-w-4xl px-4 pb-16 pt-8 md:px-8 animate-fade-in-up">
            <div className="mb-10">
                <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                    <Shield className="text-primary" size={32} />
                    Politique de Confidentialite
                </h1>
                <p className="mt-3 text-slate-600 font-medium max-w-2xl">
                    ArtyLink s'engage a proteger votre vie privee. Cette page explique comment
                    nous collectons, utilisons et protegeons vos donnees personnelles.
                </p>
                <p className="mt-2 text-xs text-slate-400 font-medium">
                    Derniere mise a jour : Avril 2026
                </p>
            </div>

            <div className="space-y-6">
                {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                        <GlassCard key={section.title} className="p-6 md:p-8">
                            <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                                <Icon size={20} className="text-primary" /> {section.title}
                            </h2>
                            <div className="text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-line">
                                {section.content}
                            </div>
                        </GlassCard>
                    );
                })}
            </div>

            {/* Contact */}
            <GlassCard className="p-8 mt-8 text-center bg-gradient-to-br from-primary/5 to-transparent">
                <h2 className="text-xl font-black text-slate-900 mb-2">Des questions sur vos donnees ?</h2>
                <p className="text-slate-600 font-medium mb-6 text-sm">
                    Notre equipe est disponible pour repondre a toutes vos questions concernant
                    la protection de vos donnees personnelles.
                </p>
                <a href="mailto:support@artylink.com" className="glass-btn-primary px-6">
                    Contacter le support
                </a>
            </GlassCard>

            <div className="mt-8 flex gap-4">
                <Link href="/legal" className="glass-btn-secondary px-6 py-2">
                    Conditions d'utilisation
                </Link>
                <Link href="/" className="glass-btn-secondary px-6 py-2">
                    Retour a l'accueil
                </Link>
            </div>
        </div>
    );
}
