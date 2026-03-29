"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/atoms/card";
import { StatusBadge } from "@/components/ui/molecules/status-badge";
import type { DashboardSummary } from "@/modules/dashboard/types/dashboard.types";
import { useI18n } from "@/providers/i18n-provider";

function mapHighlightToneToClass(
  tone: DashboardSummary["highlights"][number]["tone"],
) {
  switch (tone) {
    case "success":
      return "border-emerald-500/20 bg-emerald-500/5";
    case "warning":
      return "border-amber-500/20 bg-amber-500/5";
    case "neutral":
      return "border-slate-500/15 bg-slate-500/5";
    default:
      return "border-sky-500/20 bg-sky-500/5";
  }
}

export function DashboardInsightsPanel({
  summary,
}: {
  summary: DashboardSummary;
}) {
  const { dictionary } = useI18n();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{dictionary.dashboard.highlights.title}</CardTitle>
          <CardDescription>
            {dictionary.dashboard.highlights.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 pt-0">
          {summary.highlights.map((highlight) => (
            <div
              key={highlight.key}
              className={`rounded-[1.25rem] border p-4 ${mapHighlightToneToClass(highlight.tone)}`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                {dictionary.dashboard.highlights.items[highlight.key].label}
              </p>
              <p className="mt-3 text-2xl font-semibold text-foreground">
                {highlight.value ?? dictionary.dashboard.unavailableValue}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {dictionary.dashboard.highlights.items[highlight.key].description}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{dictionary.dashboard.statusBreakdown.title}</CardTitle>
          <CardDescription>
            {dictionary.dashboard.statusBreakdown.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {summary.statusBreakdown.length ? (
            summary.statusBreakdown.map((item) => (
              <div
                key={item.status}
                className="flex items-center justify-between gap-3 rounded-[1rem] border border-border/70 bg-surface px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-sm font-semibold text-foreground">{item.count}</p>
              </div>
            ))
          ) : (
            <p className="rounded-[1rem] border border-border/70 bg-surface p-4 text-sm leading-6 text-muted-foreground">
              {dictionary.dashboard.statusBreakdown.empty}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
