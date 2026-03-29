import Link from "next/link";

import { Button } from "@/components/ui/atoms/button";
import { TurnixLogo } from "@/components/ui/icons/turnix-logo";
import { LocaleSwitcher } from "@/components/ui/molecules/locale-switcher";
import { ThemeToggle } from "@/components/ui/molecules/theme-toggle";
import { ROUTES } from "@/config/routes";
import { getRequestDictionary } from "@/i18n/request";
import { getServerTenantContext } from "@/modules/tenant/server/tenant-context.server";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { dictionary } = await getRequestDictionary();
  const tenant = await getServerTenantContext();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href={ROUTES.home}>
              <TurnixLogo />
            </Link>
            {tenant.isResolved ? (
              <div className="hidden rounded-full border border-border/70 bg-card px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:inline-flex">
                {tenant.branding.displayName}
              </div>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <LocaleSwitcher />
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm">
              <Link href={ROUTES.book}>
                {dictionary.common.actions.bookAppointment}
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={ROUTES.login}>
                {dictionary.common.actions.staffLogin}
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <div className="pb-16">{children}</div>
    </div>
  );
}
