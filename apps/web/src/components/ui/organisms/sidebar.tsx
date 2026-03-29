"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  Building2,
  CalendarCheck2,
  ClipboardList,
  LayoutDashboard,
  Settings2,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/atoms/button";
import { TurnixLogo } from "@/components/ui/icons/turnix-logo";
import type { NavigationItem } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { useI18n } from "@/providers/i18n-provider";

const iconMap: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  appointments: CalendarCheck2,
  services: ClipboardList,
  branches: Building2,
  settings: Settings2,
  sparkles: Sparkles,
};

function SidebarContent({
  navigation,
  onNavigate,
  tenantLabel,
}: {
  navigation: NavigationItem[];
  onNavigate?: () => void;
  tenantLabel?: string;
}) {
  const pathname = usePathname();
  const { dictionary } = useI18n();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/80 p-5">
        <TurnixLogo />
      </div>
      <div className="px-5 pt-5">
        <div className="rounded-[1.5rem] bg-surface px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {dictionary.common.shell.workspace}
          </p>
          <p className="mt-2 text-sm font-medium text-foreground">
            {tenantLabel ?? dictionary.publicLayout.tenantWorkspace}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {dictionary.common.shell.tenantReady}
          </p>
        </div>
      </div>
      <nav className="flex-1 px-4 py-6">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = iconMap[item.iconKey] ?? LayoutDashboard;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "group relative flex items-start gap-3 rounded-[1.25rem] px-4 py-3 transition",
                  isActive ? "bg-primary text-primary-foreground" : "hover:bg-surface",
                )}
              >
                <Icon
                  className={cn(
                    "mt-0.5 h-5 w-5 shrink-0",
                    isActive
                      ? "text-primary-foreground"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                <div>
                  <p className="text-sm font-semibold">
                    {dictionary.navigation[item.key].title}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-xs leading-5",
                      isActive
                        ? "text-primary-foreground/85"
                        : "text-muted-foreground",
                    )}
                  >
                    {dictionary.navigation[item.key].description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="border-t border-border/80 px-5 py-4 text-xs leading-5 text-muted-foreground">
        {dictionary.common.shell.sharedFoundation}
      </div>
    </div>
  );
}

export function Sidebar({
  navigation,
  mobileOpen,
  onClose,
  tenantLabel,
}: {
  navigation: NavigationItem[];
  mobileOpen: boolean;
  onClose: () => void;
  tenantLabel?: string;
}) {
  const { dictionary } = useI18n();

  return (
    <>
      <aside className="hidden w-[312px] shrink-0 border-r border-border/80 bg-card lg:block">
        <SidebarContent navigation={navigation} tenantLabel={tenantLabel} />
      </aside>

      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.button
              type="button"
              className="fixed inset-0 z-40 bg-slate-950/35 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -28, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -28, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-y-0 left-0 z-50 w-[312px] border-r border-border/80 bg-card lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-border/80 px-5 py-4">
                <TurnixLogo compact />
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                  <span className="sr-only">
                    {dictionary.common.actions.closeNavigation}
                  </span>
                </Button>
              </div>
              <SidebarContent
                navigation={navigation}
                onNavigate={onClose}
                tenantLabel={tenantLabel}
              />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
