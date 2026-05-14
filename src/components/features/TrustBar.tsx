import { Handshake, MapPin, MessageCircle, ShieldCheck } from "lucide-react";

export default function TrustBar() {
    return (
        <section className="w-full px-4 md:px-6">
            <div className="apple-panel p-4 flex flex-col sm:flex-row flex-wrap items-center justify-between gap-4 md:gap-6">

                <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
                    <Handshake className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span className="text-sm font-semibold text-slate-700">Mise en relation directe</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
                    <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm font-semibold text-slate-700">Profils authentifiés (Google)</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
                    <MessageCircle className="w-5 h-5 text-purple-500 flex-shrink-0" />
                    <span className="text-sm font-semibold text-slate-700">Messagerie intégrée</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
                    <MapPin className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    <span className="text-sm font-semibold text-slate-700">58 Wilayas couvertes</span>
                </div>

            </div>
        </section>
    );
}