import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/query/get-query-client";
import {
  DEFAULT_LIST_SERVICES_QUERY,
  servicesQueryKeys,
} from "@/modules/services/constants/services.constants";
import { ServicesManagement } from "@/modules/services/components/services-management";
import { getServices } from "@/modules/services/services/services-api";
import { getAppSession } from "@/modules/auth/server/session.server";
import { getServerTenantApiContext } from "@/modules/tenant/server/tenant-context.server";

export async function ServicesPageContent() {
  const [session, tenant] = await Promise.all([
    getAppSession(),
    getServerTenantApiContext(),
  ]);
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: servicesQueryKeys.list(
      session?.user.tenantId,
      DEFAULT_LIST_SERVICES_QUERY,
    ),
    queryFn: () =>
      getServices({
        filters: DEFAULT_LIST_SERVICES_QUERY,
        tenantId: session?.user.tenantId,
        accessToken: session?.accessToken,
        tenant,
      }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ServicesManagement />
    </HydrationBoundary>
  );
}
