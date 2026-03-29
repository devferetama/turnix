"use client";

import { useQuery } from "@tanstack/react-query";

import { useCurrentSession } from "@/modules/auth/hooks/use-current-session";
import { branchesQueryKeys } from "@/modules/branches/constants/branches.constants";
import type { BranchRecord } from "@/modules/branches/types/branch.types";
import { getBranchById } from "@/modules/branches/services/branches-api";

export function useBranchQuery(branchId?: string, initialData?: BranchRecord) {
  const { data: session, status } = useCurrentSession();
  const tenantId = session?.user.tenantId;

  return useQuery({
    queryKey: branchesQueryKeys.detail(tenantId, branchId),
    queryFn: () =>
      getBranchById({
        id: branchId ?? "",
        tenantId,
        accessToken: session?.accessToken,
      }),
    enabled: status !== "loading" && Boolean(branchId),
    initialData,
  });
}
