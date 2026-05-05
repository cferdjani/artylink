import { NotificationProvider } from "@/components/notifications/NotificationProvider";
import { ToastProvider } from "@/components/ui/toast";
import { getRecentNotifications, getUnreadCount } from "@/lib/actions/notifications";
import { isExpectedDynamicServerUsageError } from "@/lib/next-runtime";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Suspense } from "react";

import { Footer } from "@/components/shared/footer";
import { Navbar } from "@/components/shared/navbar";
import { PremiumMarqueeContainer } from "./PremiumMarqueeContainer";
import { PremiumMarqueeSkeleton } from "./PremiumMarqueeSkeleton";

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "ArtyLink - Trouvez votre expert local",
    template: "%s | ArtyLink",
  },
  description:
    "Marketplace de services locale pour connecter clients et artisans avec recherche Wilaya/Commune.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let user = null;
  let unreadCount = 0;
  let recentNotifications: any[] = [];
  let availabilityStatus: string | null = null;

  try {
    const supabase = await createSupabaseServerClient();
    const result = await supabase.auth.getUser();
    user = result?.data?.user ?? null;

    if (user) {
      unreadCount = await getUnreadCount();
      recentNotifications = await getRecentNotifications();

      const { data: artisan } = await supabase
        .from('artisans')
        .select('availability_status')
        .eq('id', user.id)
        .maybeSingle();
      if (artisan) availabilityStatus = artisan.availability_status;
    }
  } catch (err) {
    if (!isExpectedDynamicServerUsageError(err)) {
      console.error("Supabase init error in RootLayout:", err);
    }
    user = null;
  }

  return (
    <html
      lang="fr"
      className="h-full antialiased"
    >
      <body className="min-h-full text-text-primary">
        <ToastProvider>
          <NotificationProvider
            userId={user?.id || null}
            initialUnreadCount={unreadCount}
            initialNotifications={recentNotifications as any}
          >
            <div className="relative isolate flex min-h-screen flex-col overflow-x-clip bg-transparent">

              {/* 1. NOUVEAU BLOC FIXE : Englobe la Navbar et le Carousel */}
              <header className="fixed top-0 left-0 w-full z-50 flex flex-col">
                <Navbar user={user} availabilityStatus={availabilityStatus} />
              </header>

              <main className="relative z-10 flex-1 pt-[120px] pb-[80px]">
                {children}
              </main>

              <Footer />

              <div className="fixed bottom-0 left-0 w-full z-[100] bg-white/70 backdrop-blur-2xl border-t border-white/60 shadow-[0_-8px_30px_rgba(0,0,0,0.05)]">
                <Suspense fallback={<PremiumMarqueeSkeleton />}>
                  <PremiumMarqueeContainer />
                </Suspense>
              </div>
            </div>
          </NotificationProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
