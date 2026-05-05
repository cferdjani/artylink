"use client";

import { ArrowRight, Briefcase, CheckCircle, FileText } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Note: Ces types sont déduits de votre schéma DB. Ajustez si vos actions retournent une forme différente.
type Booking = { id: string; description: string; status: string; artisan: { full_name: string } };
type Demand = { id: string; title: string; status: string; bids_count: number };
type Confirmed = { id: string; description: string; status: string; artisan: { full_name: string } };

interface ServicesTabsProps {
    bookings: Booking[];
    demands: Demand[];
    confirmed: Confirmed[];
}

export function ServicesTabs({ bookings, demands, confirmed }: ServicesTabsProps) {
    const [activeTab, setActiveTab] = useState("bookings");

    const tabs = [
        { id: "bookings", label: "Mes Réservations", icon: Briefcase, count: bookings.length },
        { id: "demands", label: "Mes Demandes", icon: FileText, count: demands.length },
        { id: "confirmed", label: "Services Confirmés", icon: CheckCircle, count: confirmed.length },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case "bookings":
                return bookings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bookings.map((booking) => <BookingCard key={booking.id} item={booking} />)}
                    </div>
                ) : (
                    <EmptyState
                        title="Aucune réservation en cours"
                        description="Vous n'avez pas encore demandé de réservation. Trouvez le professionnel qu'il vous faut."
                        ctaLink="/search"
                        ctaText="Chercher un professionnel"
                    />
                );
            case "demands":
                return demands.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {demands.map((demand) => <DemandCard key={demand.id} item={demand} />)}
                    </div>
                ) : (
                    <EmptyState
                        title="Aucune demande publiée"
                        description="Publiez un appel d'offres pour recevoir des devis de plusieurs artisans."
                        ctaLink="/search"
                        ctaText="Chercher un artisan"
                    />
                );
            case "confirmed":
                return confirmed.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {confirmed.map((service) => <BookingCard key={service.id} item={service} />)}
                    </div>
                ) : (
                    <EmptyState
                        title="Aucun service confirmé"
                        description="Une fois qu'un artisan accepte votre demande, elle apparaîtra ici."
                        ctaLink="/dashboard/calendar"
                        ctaText="Voir mon agenda"
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div>
            <div className="mb-8 border-b border-white/10">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`${activeTab === tab.id
                                    ? 'border-orange-500 text-orange-400'
                                    : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'
                                } group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                        >
                            <tab.icon className="-ml-0.5 mr-2 h-5 w-5" />
                            <span>{tab.label}</span>
                            <span className={`${activeTab === tab.id ? 'bg-orange-500/20 text-orange-300' : 'bg-white/10 text-gray-300'
                                } hidden ml-3 py-0.5 px-2.5 rounded-full text-xs font-medium md:inline-block`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </nav>
            </div>
            <div>{renderContent()}</div>
        </div>
    );
}

function BookingCard({ item }: { item: Booking | Confirmed }) {
    return (
        <div className="glass-card p-5 rounded-xl border border-white/10 bg-black/20 flex flex-col justify-between gap-4 h-full">
            <div>
                <p className="text-gray-300 text-sm font-inter line-clamp-3">{item.description}</p>
            </div>
            <div className="border-t border-white/10 pt-3 mt-3 flex justify-between items-center">
                <span className="text-xs text-gray-400">Avec {item.artisan.full_name}</span>
                <span className="text-xs font-semibold capitalize px-2 py-1 rounded-md bg-white/10 text-white">{item.status}</span>
            </div>
        </div>
    )
}

function DemandCard({ item }: { item: Demand }) {
    return (
        <div className="glass-card p-5 rounded-xl border border-white/10 bg-black/20 flex flex-col justify-between gap-4 h-full">
            <div>
                <p className="font-semibold text-white font-poppins">{item.title}</p>
            </div>
            <div className="border-t border-white/10 pt-3 mt-3 flex justify-between items-center">
                <span className="text-xs text-gray-400">{item.bids_count} devis reçu(s)</span>
                <span className="text-xs font-semibold capitalize px-2 py-1 rounded-md bg-white/10 text-white">{item.status}</span>
            </div>
        </div>
    )
}

function EmptyState({ title, description, ctaLink, ctaText }: { title: string, description: string, ctaLink: string, ctaText: string }) {
    return (
        <div className="text-center glass-panel rounded-2xl p-12 border border-white/10 bg-white/5">
            <h3 className="text-lg font-medium text-white font-poppins">{title}</h3>
            <p className="mt-2 text-sm text-gray-400 font-inter">{description}</p>
            <div className="mt-6">
                <Link href={ctaLink}>
                    <button type="button" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                        {ctaText} <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                </Link>
            </div>
        </div>
    );
}