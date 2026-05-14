import { Mail, MapPin } from "lucide-react";
import Link from "next/link";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";

export function Footer() {
    return (
        <footer className="relative z-10 w-full mt-16 bg-white/40 border-t border-white/60 backdrop-blur-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
            <div className="mx-auto w-full max-w-[1320px] px-6 pt-12 pb-12 md:pt-16 md:pb-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
                    {/* Brand Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <Link href="/" className="inline-flex items-center gap-2 group">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-primary/80 text-lg font-black text-white shadow-glow-primary transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_40px_rgba(37,99,235,0.4)]">
                                A
                            </span>
                            <span className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-primary transition-colors">
                                ArtyLink
                            </span>
                        </Link>
                        <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                            La plateforme de visibilité qui aide artisans, freelances et clients à se trouver plus vite partout en Algérie.
                        </p>
                        <div className="flex items-center gap-4 pt-2">
                            <a href="https://facebook.com/artylink" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="p-2.5 rounded-xl bg-white/60 border border-white/80 text-slate-500 hover:bg-white hover:text-[#1877F2] transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1">
                                <FaFacebook size={18} />
                            </a>
                            <a href="https://instagram.com/artylink" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="p-2.5 rounded-xl bg-white/60 border border-white/80 text-slate-500 hover:bg-white hover:text-[#E4405F] transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1">
                                <FaInstagram size={18} />
                            </a>
                            <a href="https://twitter.com/artylink" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="p-2.5 rounded-xl bg-white/60 border border-white/80 text-slate-500 hover:bg-white hover:text-[#1DA1F2] transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1">
                                <FaTwitter size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Links Section 1 */}
                    <div>
                        <h3 className="font-bold text-slate-900 mb-4 tracking-tight">Services</h3>
                        <ul className="space-y-3">
                            <li><Link href="/search" className="text-sm text-slate-500 hover:text-primary transition-colors">Recherche locale</Link></li>
                            <li><Link href="/search" className="text-sm text-slate-500 hover:text-primary transition-colors">Métiers & Catégories</Link></li>
                            <li><Link href="/onboarding/freelance" className="text-sm text-slate-500 hover:text-primary transition-colors">Devenir Artisan</Link></li>
                            <li><Link href="/pricing" className="text-sm text-slate-500 hover:text-primary transition-colors">Tarifs PRO</Link></li>
                        </ul>
                    </div>

                    {/* Links Section 2 */}
                    <div>
                        <h3 className="font-bold text-slate-900 mb-4 tracking-tight">Entreprise</h3>
                        <ul className="space-y-3">
                            <li><Link href="/a-propos" className="text-sm text-slate-500 hover:text-primary transition-colors">À propos</Link></li>
                            <li><Link href="/legal" className="text-sm text-slate-500 hover:text-primary transition-colors">Mentions légales</Link></li>
                            <li><Link href="/privacy" className="text-sm text-slate-500 hover:text-primary transition-colors">Confidentialité</Link></li>
                            <li><Link href="/legal" className="text-sm text-slate-500 hover:text-primary transition-colors">Cookies</Link></li>
                        </ul>
                    </div>

                    {/* Contact Section */}
                    <div>
                        <h3 className="font-bold text-slate-900 mb-4 tracking-tight">Contact</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-sm text-slate-500">
                                <MapPin size={18} className="shrink-0 text-primary mt-0.5" />
                                <span>Alger, Algérie<br />16000 Centre-ville</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-slate-500">
                                <Mail size={18} className="shrink-0 text-primary" />
                                <a href="mailto:support@artylink.com" className="hover:text-primary transition-colors">support@artylink.com</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-400 font-medium">
                        © {new Date().getFullYear()} ArtyLink. Tous droits réservés.
                    </p>
                    <div className="flex gap-6 text-xs text-slate-400 font-medium">
                        <Link href="/legal" className="hover:text-slate-600 transition-colors">CGU</Link>
                        <Link href="/privacy" className="hover:text-slate-600 transition-colors">Confidentialité</Link>
                        <Link href="/legal" className="hover:text-slate-600 transition-colors">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
