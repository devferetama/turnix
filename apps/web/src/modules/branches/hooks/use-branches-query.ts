"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useCurrentSession } from "@/modules/auth/hooks/use-current-session";
import { branchesQueryKeys } from "@/modules/branches/constants/branches.constants";
import type { ListBranchesQuery } from "@/modules/branches/types/branch.types";
import { getBranches } from "@/modules/branches/services/branches-api";

export function useBranchesQuery(query: ListBranchesQuery = {}) {
  const { data: session, status } = useCurrentSession();
  const tenantId = session?.user.tenantId;

  return useQuery({
    queryKey: branchesQueryKeys.list(tenantId, query),
    queryFn: () =>
      getBranches({
        filters: query,
        tenantId,
        accessToken: session?.accessToken,
      }),
    enabled: status !== "loading",
    placeholderData: keepPreviousData,
  });
}
