"use client";

import { Languages } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/atoms/button";
import type { Locale } from "@/i18n/config";
import { useI18n } from "@/providers/i18n-provider";

const localeOptions: Locale[] = ["es", "en"];

export function LocaleSwitcher() {
  const router = useRouter();
  const { locale, dictionary } = useI18n();
  const [isPending, startTransition] = useTransition();

  async function updateLocale(nextLocale: Locale) {
    if (nextLocale === locale) {
      return;
    }

    await fetch("/api/locale", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        locale: nextLocale,
      }),
    });

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-border/80 bg-card/70 p-1 shadow-soft backdrop-blur">
      <span className="sr-only">{dictionary.common.localeSwitcher.label}</span>
      <div className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground">
        <Languages className="h-4 w-4" />
      </div>
      {localeOptions.map((item) => {
        const active = item === locale;

        return (
          <Button
            key={item}
            variant={active ? "secondary" : "ghost"}
            size="sm"
            className="rounded-full px-3"
            disabled={isPending}
            onClick={() => void updateLocale(item)}
          >
            {dictionary.common.localeSwitcher[item]}
          </Button>
        );
      })}
    </div>
  );
}
