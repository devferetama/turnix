"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useCurrentSession } from "@/modules/auth/hooks/use-current-session";
import { dashboardQueryKeys } from "@/modules/dashboard/constants/dashboard.constants";
import { getDashboardSummary } from "@/modules/dashboard/services/dashboard-api";

export function useDashboardSummaryQuery() {
  const { data: session, status } = useCurrentSession();
  const tenantId = session?.user.tenantId;

  return useQuery({
    queryKey: dashboardQueryKeys.summary(tenantId),
    queryFn: () =>
      getDashboardSummary({
        tenantId,
        accessToken: session?.accessToken,
      }),
    enabled: status !== "loading",
    placeholderData: keepPreviousData,
  });
}
