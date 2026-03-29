"use client";

import { LogOut, Menu, PanelTopClose, ShieldCheck } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";

import { Button } from "@/components/ui/atoms/button";
import { LocaleSwitcher } from "@/components/ui/molecules/locale-switcher";
import { ThemeToggle } from "@/components/ui/molecules/theme-toggle";
import { ROUTES } from "@/config/routes";
import { getInitials } from "@/lib/utils";
import { resolveAuthRedirectTarget } from "@/modules/auth/utils/redirect";
import { useI18n } from "@/providers/i18n-provider";
import type { SessionUser } from "@/types/domain";

export function Topbar({
  user,
  tenantLabel,
  mobileSidebarOpen,
  onToggleSidebar,
}: {
  user: SessionUser;
  tenantLabel?: string;
  mobileSidebarOpen: boolean;
  onToggleSidebar: () => void;
}) {
  const { dictionary } = useI18n();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      const result = await signOut({
        redirect: false,
        callbackUrl: ROUTES.login,
      });

      window.location.assign(
        resolveAuthRedirectTarget(result?.url, ROUTES.login),
      );
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 px-4 py-4 backdrop-blur xl:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            onClick={onToggleSidebar}
          >
            {mobileSidebarOpen ? (
              <PanelTopClose className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
            <span className="sr-only">{dictionary.common.shell.backoffice}</span>
          </Button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              {dictionary.common.shell.backoffice}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>
                {tenantLabel ?? dictionary.publicLayout.tenantWorkspace}
              </span>
              <span className="hidden h-1 w-1 rounded-full bg-border sm:block" />
              <span className="capitalize">
                {
                  dictionary.common.roles[
                    user.role as keyof typeof dictionary.common.roles
                  ]
                }
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <ThemeToggle />
          <Button
            variant="outline"
            size="sm"
            className="h-10 rounded-full px-3 sm:px-4"
            disabled={isSigningOut}
            onClick={() => void handleSignOut()}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">
              {isSigningOut
                ? dictionary.common.actions.signingOut
                : dictionary.common.actions.signOut}
            </span>
            <span className="sr-only sm:hidden">
              {isSigningOut
                ? dictionary.common.actions.signingOut
                : dictionary.common.actions.signOut}
            </span>
          </Button>
          <div className="flex items-center gap-3 rounded-full border border-border/80 bg-card px-3 py-2 shadow-soft">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/12 text-sm font-semibold text-primary">
              {getInitials(user.name ?? user.email)}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-foreground">
                {user.name ?? dictionary.branding.appName}
              </p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
