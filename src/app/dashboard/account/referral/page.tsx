import { GlassCard } from "@/components/ui/glass-card";
import { getReferralStats } from "@/lib/actions/referral";
import { Gift, Users, Wallet } from "lucide-react";
import { CopyButton } from "./copy-button";

export const dynamic = "force-dynamic";

export default async function ReferralPage() {
    const stats = await getReferralStats();
    const referralLink = `https://artylink.com/auth/register?ref=${stats.code}`;

    return (
        <div className="max-w-4xl space-y-8 animate-fade-in-up">
            <div>
                <h1 className="glass-section-title">Programme de Parrainage</h1>
                <p className="text-slate-500 font-medium mt-1">Invitez d'autres professionnels et gagnez des crédits sur votre portefeuille.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassCard className="p-6 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Gift size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500">Votre Code Parrain</p>
                            <h2 className="text-2xl font-black text-slate-900 tracking-widest">{stats.code}</h2>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <input type="text" readOnly value={referralLink} className="glass-input flex-1 text-sm text-slate-500" />
                        <CopyButton text={referralLink} />
                    </div>
                </GlassCard>

                <div className="space-y-6">
                    <GlassCard className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500">Amis parrainés</p>
                            <h2 className="text-2xl font-black text-slate-900">{stats.referredCount} <span className="text-sm font-medium text-slate-400">inscrits</span></h2>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                            <Wallet size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500">Gains générés</p>
                            <h2 className="text-2xl font-black text-slate-900">{stats.earnedAmount} <span className="text-sm font-medium text-slate-400">DZD</span></h2>
                        </div>
                    </GlassCard>
                </div>
            </div>

            <GlassCard className="p-8 border-dashed border-2 border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Comment ça marche ?</h3>
                <p className="text-slate-600 font-medium">Partagez votre lien. Lorsqu'un collègue s'inscrit avec votre code, vous recevez automatiquement 500 DZD sur votre portefeuille ArtyLink !</p>
            </GlassCard>
        </div>
    );
}