"use client";

import { cn } from "@/lib/utils";
import { useI18n } from "@/providers/i18n-provider";

export function TurnixLogo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { dictionary } = useI18n();

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
        <svg
          viewBox="0 0 48 48"
          className="h-6 w-6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11 13h26l-8 9.2v12.8l-10-5.6V22.2L11 13Z"
            fill="currentColor"
            fillOpacity="0.95"
          />
          <path
            d="M19 30.3V22h10v13"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {!compact ? (
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
            {dictionary.branding.appName}
          </p>
          <p className="text-xs text-muted-foreground">
            {dictionary.branding.tagline}
          </p>
        </div>
      ) : null}
    </div>
  );
}
