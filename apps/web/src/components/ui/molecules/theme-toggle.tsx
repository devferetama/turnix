"use client";

import { MonitorCog, MoonStar, SunMedium } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/atoms/button";
import { useI18n } from "@/providers/i18n-provider";

const themes = ["light", "dark", "system"] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { dictionary } = useI18n();
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const activeTheme = isClient ? theme ?? "system" : "system";

  return (
    <div className="flex items-center gap-1 rounded-full border border-border/80 bg-card/70 p-1 shadow-soft backdrop-blur">
      {themes.map((item) => {
        const isActive = activeTheme === item;
        const Icon =
          item === "light"
            ? SunMedium
            : item === "dark"
              ? MoonStar
              : MonitorCog;

        return (
          <Button
            key={item}
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-full"
            aria-pressed={isActive}
            onClick={() => setTheme(item)}
          >
            {isActive ? (
              <motion.span
                layoutId="active-theme"
                className="absolute inset-0 rounded-full bg-primary/12"
                transition={{ duration: 0.2 }}
              />
            ) : null}
            <Icon className="relative h-4 w-4" />
            <span className="sr-only">{dictionary.common.theme[item]}</span>
          </Button>
        );
      })}
    </div>
  );
}
