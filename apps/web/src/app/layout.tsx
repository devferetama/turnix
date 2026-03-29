import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";

import { createBaseMetadata } from "@/config/site";
import { getDictionary } from "@/i18n/get-dictionary";
import { getRequestLocale } from "@/i18n/request";
import { cn } from "@/lib/utils";
import { getServerTenantContext } from "@/modules/tenant/server/tenant-context.server";
import { AppProviders } from "@/providers/app-providers";
import "@/styles/globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const dictionary = await getDictionary(locale);

  return createBaseMetadata(dictionary);
}

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();
  const dictionary = await getDictionary(locale);
  const tenant = await getServerTenantContext();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn(manrope.variable, ibmPlexMono.variable)}
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AppProviders locale={locale} dictionary={dictionary} tenant={tenant}>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
