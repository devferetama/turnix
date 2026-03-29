import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/query/get-query-client";
import {
  appointmentsQueryKeys,
  DEFAULT_LIST_APPOINTMENTS_QUERY,
} from "@/modules/appointments/constants/appointments.constants";
import { AppointmentsManagement } from "@/modules/appointments/components/appointments-management";
import { getAppointments } from "@/modules/appointments/services/appointments-api";
import { getAppSession } from "@/modules/auth/server/session.server";
import { getServerTenantApiContext } from "@/modules/tenant/server/tenant-context.server";

export async function AppointmentsPageContent() {
  const [session, tenant] = await Promise.all([
    getAppSession(),
    getServerTenantApiContext(),
  ]);
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: appointmentsQueryKeys.list(
      session?.user.tenantId,
      DEFAULT_LIST_APPOINTMENTS_QUERY,
    ),
    queryFn: () =>
      getAppointments({
        filters: DEFAULT_LIST_APPOINTMENTS_QUERY,
        tenantId: session?.user.tenantId,
        accessToken: session?.accessToken,
        tenant,
      }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AppointmentsManagement />
    </HydrationBoundary>
  );
}
