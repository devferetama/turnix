"use client";

import { Cog, ShieldCheck, Waypoints } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/atoms/card";
import { StatusBadge } from "@/components/ui/molecules/status-badge";
import type { SettingsArea } from "@/modules/settings/types/settings.types";
import { useI18n } from "@/providers/i18n-provider";

const icons = [Cog, ShieldCheck, Waypoints];

export function SettingsOverview({ areas }: { areas: SettingsArea[] }) {
  const { dictionary } = useI18n();

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {areas.map((area, index) => {
        const Icon = icons[index] ?? Cog;

        return (
          <Card key={area.key}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <StatusBadge status={area.status.replaceAll(" ", "_")} />
              </div>
              <CardTitle className="mt-5">
                {dictionary.settings.areas[area.key].title}
              </CardTitle>
              <CardDescription>
                {dictionary.settings.areas[area.key].description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm leading-6 text-muted-foreground">
                {dictionary.settings.scaffold}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
