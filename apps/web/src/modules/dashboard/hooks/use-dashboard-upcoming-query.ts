"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useCurrentSession } from "@/modules/auth/hooks/use-current-session";
import { dashboardQueryKeys } from "@/modules/dashboard/constants/dashboard.constants";
import { getDashboardUpcomingAppointments } from "@/modules/dashboard/services/dashboard-api";

export function useDashboardUpcomingQuery() {
  const { data: session, status } = useCurrentSession();
  const tenantId = session?.user.tenantId;

  return useQuery({
    queryKey: dashboardQueryKeys.upcoming(tenantId),
    queryFn: () =>
      getDashboardUpcomingAppointments({
        tenantId,
        accessToken: session?.accessToken,
      }),
    enabled: status !== "loading",
    placeholderData: keepPreviousData,
  });
}
