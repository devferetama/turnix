import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { DashboardPageTemplate } from "@/components/ui/templates/dashboard-page-template";
import {
  branchesQueryKeys,
  DEFAULT_LIST_BRANCHES_QUERY,
} from "@/modules/branches/constants/branches.constants";
import { BranchesManagement } from "@/modules/branches/components/branches-management";
import { getBranches } from "@/modules/branches/services/branches-api";
import { getQueryClient } from "@/lib/query/get-query-client";
import { getAppSession } from "@/modules/auth/server/session.server";
import { getServerTenantApiContext } from "@/modules/tenant/server/tenant-context.server";

export default async function BranchesPage() {
  const [session, tenant] = await Promise.all([
    getAppSession(),
    getServerTenantApiContext(),
  ]);
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: branchesQueryKeys.list(
      session?.user.tenantId,
      DEFAULT_LIST_BRANCHES_QUERY,
    ),
    queryFn: () =>
      getBranches({
        filters: DEFAULT_LIST_BRANCHES_QUERY,
        tenantId: session?.user.tenantId,
        accessToken: session?.accessToken,
        tenant,
      }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardPageTemplate>
        <BranchesManagement />
      </DashboardPageTemplate>
    </HydrationBoundary>
  );
}
