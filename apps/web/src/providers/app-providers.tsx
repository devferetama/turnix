"use client";

import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { QueryProvider } from "@/providers/query-provider";
import { I18nProvider } from "@/providers/i18n-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { TenantProvider } from "@/modules/tenant/providers/tenant-provider";
import type { TenantRuntimeContext } from "@/modules/tenant/types/tenant.types";

export function AppProviders({
  children,
  locale,
  dictionary,
  tenant,
}: {
  children: React.ReactNode;
  locale: Locale;
  dictionary: Dictionary;
  tenant: TenantRuntimeContext;
}) {
  return (
    <I18nProvider locale={locale} dictionary={dictionary}>
      <ThemeProvider>
        <TenantProvider tenant={tenant}>
          <QueryProvider>{children}</QueryProvider>
        </TenantProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
