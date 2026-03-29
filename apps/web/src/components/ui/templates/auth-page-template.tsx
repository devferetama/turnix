"use client";

import { motion } from "motion/react";

import { LocaleSwitcher } from "@/components/ui/molecules/locale-switcher";
import { ThemeToggle } from "@/components/ui/molecules/theme-toggle";
import { cn } from "@/lib/utils";

export function AuthPageTemplate({
  children,
  className,
  tenantLabel,
}: {
  children: React.ReactNode;
  className?: string;
  tenantLabel?: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="fixed right-4 top-4 z-30 flex items-center gap-3 sm:right-6 sm:top-6">
        <LocaleSwitcher />
        <ThemeToggle />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
        className={cn("w-full max-w-5xl", className)}
      >
        {tenantLabel ? (
          <div className="mb-4 inline-flex rounded-full border border-border/70 bg-card px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {tenantLabel}
          </div>
        ) : null}
        {children}
      </motion.div>
    </div>
  );
}
