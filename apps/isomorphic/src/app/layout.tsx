import type { Metadata } from "next";
import { Suspense } from "react";
import { inter, lexendDeca } from "@/app/fonts";
import cn from "@core/utils/class-names";
import NextProgress from "@core/components/next-progress";
import NavigationLoader from "@/app/shared/navigation-loader";
import HydrogenLayout from "@/layouts/hydrogen/layout";
import { ThemeProvider, JotaiProvider } from "@/app/shared/theme-provider";
import GlobalDrawer from "@/app/shared/drawer-views/container";
import GlobalModal from "@/app/shared/modal-views/container";
import { Toaster } from "react-hot-toast";

import "./globals.css";

export const metadata: Metadata = {
  title: "IWA Platform",
  description: "The Bittensor Subnet 36 Leaderboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      // 💡 Prevent next-themes hydration warning
      suppressHydrationWarning
      lang="en"
    >
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        // to prevent any warning that is caused by third party extensions like Grammarly
        suppressHydrationWarning
        className={cn(inter.variable, lexendDeca.variable, "font-inter")}
      >
        <Toaster
          position="top-right"
          gutter={8}
          toastOptions={{
            // ensure it sits above your z-[9999] dropdowns/portals
            style: { zIndex: 999999, background: "#0b1220", color: "#e6faff" },
            success: {
              iconTheme: { primary: "#22d3ee", secondary: "#0b1220" },
            },
            error: { iconTheme: { primary: "#f59e0b", secondary: "#0b1220" } },
          }}
        />
        <ThemeProvider>
          <NextProgress />
          <Suspense fallback={null}>
            <NavigationLoader />
          </Suspense>
          <JotaiProvider>
            <HydrogenLayout>{children}</HydrogenLayout>
            <GlobalDrawer />
            <GlobalModal />
          </JotaiProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
