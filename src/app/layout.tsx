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
import { RouteAwareBottomBar } from "./RouteAwareBottomBar";

import type { Metadata } from "next";
import "./globals.css";

function resolveMetadataBase() {
  const fallbackUrl = "http://localhost:3000";
  const candidate = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!candidate) {
    return new URL(fallbackUrl);
  }

  try {
    return new URL(candidate);
  } catch {
    console.warn("Invalid NEXT_PUBLIC_SITE_URL, falling back to localhost:", candidate);
    return new URL(fallbackUrl);
  }
}

export const metadata: Metadata = {
  metadataBase: resolveMetadataBase(),
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

              <RouteAwareBottomBar>
                <Suspense fallback={<PremiumMarqueeSkeleton />}>
                  <PremiumMarqueeContainer />
                </Suspense>
              </RouteAwareBottomBar>
            </div>
          </NotificationProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
