"use client";

import { Provider } from "jotai";
import { siteConfig } from "@/config/site.config";
import { ThemeProvider as NextThemeProvider } from "next-themes";

export function ThemeProvider({
  children,
}: Readonly<React.PropsWithChildren<{}>>) {
  return (
    <NextThemeProvider
      enableSystem={false}
      defaultTheme={String(siteConfig.mode)}
      attribute="data-theme"
    >
      {children}
    </NextThemeProvider>
  );
}

export function JotaiProvider({
  children,
}: Readonly<React.PropsWithChildren<{}>>) {
  return <Provider>{children}</Provider>;
}
