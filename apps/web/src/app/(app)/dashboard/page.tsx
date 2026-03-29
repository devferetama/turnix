import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { PageHeader } from "@/components/ui/organisms/page-header";
import { DashboardPageTemplate } from "@/components/ui/templates/dashboard-page-template";
import { getRequestDictionary } from "@/i18n/request";
import { getQueryClient } from "@/lib/query/get-query-client";
import { dashboardQueryKeys } from "@/modules/dashboard/constants/dashboard.constants";
import { DashboardOverview } from "@/modules/dashboard/components/dashboard-overview";
import {
  getDashboardSummary,
  getDashboardUpcomingAppointments,
} from "@/modules/dashboard/services/dashboard-api";
import { getAppSession } from "@/modules/auth/server/session.server";
import { getServerTenantApiContext } from "@/modules/tenant/server/tenant-context.server";

export default async function DashboardPage() {
  const [session, tenant] = await Promise.all([
    getAppSession(),
    getServerTenantApiContext(),
  ]);
  const { dictionary } = await getRequestDictionary();
  const queryClient = getQueryClient();

  await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: dashboardQueryKeys.summary(session?.user.tenantId),
      queryFn: () =>
        getDashboardSummary({
          tenantId: session?.user.tenantId,
          accessToken: session?.accessToken,
          tenant,
        }),
    }),
    queryClient.prefetchQuery({
      queryKey: dashboardQueryKeys.upcoming(session?.user.tenantId),
      queryFn: () =>
        getDashboardUpcomingAppointments({
          tenantId: session?.user.tenantId,
          accessToken: session?.accessToken,
          tenant,
        }),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardPageTemplate>
        <PageHeader
          title={dictionary.dashboard.page.title}
          description={dictionary.dashboard.page.description}
        />
        <DashboardOverview />
      </DashboardPageTemplate>
    </HydrationBoundary>
  );
}
