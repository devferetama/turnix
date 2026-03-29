"use client";

import { useI18n } from "@/providers/i18n-provider";

export default function Loading() {
  const { dictionary } = useI18n();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="flex items-center gap-3 rounded-full border border-border/80 bg-card px-5 py-3 text-sm text-muted-foreground shadow-soft">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
        {dictionary.common.messages.loadingApp}
      </div>
    </div>
  );
}
