"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/atoms/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/atoms/card";
import { getApiErrorMessage } from "@/modules/auth/utils/auth-error";
import { DashboardInsightsPanel } from "@/modules/dashboard/components/dashboard-insights-panel";
import { DashboardSummaryGrid } from "@/modules/dashboard/components/dashboard-summary-grid";
import { DashboardUpcomingTable } from "@/modules/dashboard/components/dashboard-upcoming-table";
import { useDashboardSummaryQuery } from "@/modules/dashboard/hooks/use-dashboard-summary-query";
import { useDashboardUpcomingQuery } from "@/modules/dashboard/hooks/use-dashboard-upcoming-query";
import { useI18n } from "@/providers/i18n-provider";

function SummaryFallback({
  title,
  description,
  onRetry,
  retryLabel,
}: {
  title: string;
  description: string;
  onRetry: () => void;
  retryLabel: string;
}) {
  return (
    <Card className="border-danger/20">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="rounded-full border border-danger/20 bg-danger/10 p-2 text-danger">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Button variant="outline" onClick={onRetry}>
          {retryLabel}
        </Button>
      </CardContent>
    </Card>
  );
}

export function DashboardOverview() {
  const { dictionary } = useI18n();
  const summaryQuery = useDashboardSummaryQuery();
  const upcomingQuery = useDashboardUpcomingQuery();

  return (
    <div className="space-y-6">
      {summaryQuery.isPending && !summaryQuery.data ? (
        <Card>
          <CardContent className="p-8 text-sm text-muted-foreground">
            {dictionary.dashboard.loading}
          </CardContent>
        </Card>
      ) : summaryQuery.isError && !summaryQuery.data ? (
        <SummaryFallback
          title={dictionary.dashboard.summaryErrorTitle}
          description={
            getApiErrorMessage(summaryQuery.error) ??
            dictionary.dashboard.summaryErrorDescription
          }
          onRetry={() => void summaryQuery.refetch()}
          retryLabel={dictionary.common.actions.retry}
        />
      ) : summaryQuery.data ? (
        <DashboardSummaryGrid
          summary={summaryQuery.data}
          isRefreshing={summaryQuery.isFetching}
        />
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <DashboardUpcomingTable
          data={upcomingQuery.data?.items ?? []}
          isPending={upcomingQuery.isPending}
          isRefreshing={upcomingQuery.isFetching}
          errorMessage={
            upcomingQuery.isError
              ? getApiErrorMessage(upcomingQuery.error) ??
                dictionary.dashboard.upcomingTable.errorDescription
              : null
          }
          onRetry={() => void upcomingQuery.refetch()}
        />

        {summaryQuery.data ? (
          <DashboardInsightsPanel summary={summaryQuery.data} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{dictionary.dashboard.statusBreakdown.title}</CardTitle>
              <CardDescription>
                {dictionary.dashboard.insightsUnavailable}
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
