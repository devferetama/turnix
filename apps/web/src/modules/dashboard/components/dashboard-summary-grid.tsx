"use client";

import { useSyncExternalStore } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/atoms/card";
import { formatDateTime } from "@/lib/utils";
import type { DashboardSummary } from "@/modules/dashboard/types/dashboard.types";
import { useI18n } from "@/providers/i18n-provider";

function getMetricToneClasses(
  tone: DashboardSummary["metrics"][number]["tone"],
) {
  switch (tone) {
    case "success":
      return "border-emerald-500/20 bg-emerald-500/5";
    case "warning":
      return "border-amber-500/20 bg-amber-500/5";
    case "danger":
      return "border-rose-500/20 bg-rose-500/5";
    case "neutral":
      return "border-slate-500/15 bg-slate-500/5";
    default:
      return "border-sky-500/20 bg-sky-500/5";
  }
}

export function DashboardSummaryGrid({
  summary,
  isRefreshing = false,
}: {
  summary: DashboardSummary;
  isRefreshing?: boolean;
}) {
  const { dictionary, locale } = useI18n();
  const hasHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const updatedAtText = isRefreshing
    ? dictionary.dashboard.refreshing
    : hasHydrated
      ? `${dictionary.dashboard.updatedAtLabel}: ${formatDateTime(
          summary.generatedAt,
          locale,
        )}`
      : "";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {summary.unavailableSections.length
            ? dictionary.dashboard.partialData
            : dictionary.dashboard.ready}
        </p>
        <p className="text-sm text-muted-foreground" suppressHydrationWarning>
          {updatedAtText}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {summary.metrics.map((metric) => (
          <Card
            key={metric.key}
            className={`border ${getMetricToneClasses(metric.tone)}`}
          >
            <CardHeader className="pb-3">
              <CardDescription>
                {dictionary.dashboard.metrics[metric.key].label}
              </CardDescription>
              <CardTitle className="mt-3 text-3xl">
                {metric.value ?? dictionary.dashboard.unavailableValue}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm leading-6 text-muted-foreground">
                {dictionary.dashboard.metrics[metric.key].description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
