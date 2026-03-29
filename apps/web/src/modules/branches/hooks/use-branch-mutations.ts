"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useCurrentSession } from "@/modules/auth/hooks/use-current-session";
import { branchesQueryKeys } from "@/modules/branches/constants/branches.constants";
import type {
  BranchRecord,
  CreateBranchInput,
  UpdateBranchInput,
} from "@/modules/branches/types/branch.types";
import {
  createBranch,
  updateBranch,
} from "@/modules/branches/services/branches-api";

export function useCreateBranchMutation() {
  const queryClient = useQueryClient();
  const { data: session } = useCurrentSession();
  const tenantId = session?.user.tenantId;

  return useMutation({
    mutationFn: (input: CreateBranchInput) =>
      createBranch({
        input,
        tenantId,
        accessToken: session?.accessToken,
      }),
    onSuccess: (branch) => {
      queryClient.setQueryData(
        branchesQueryKeys.detail(tenantId, branch.id),
        branch,
      );
      void queryClient.invalidateQueries({
        queryKey: branchesQueryKeys.all,
      });
    },
  });
}

export function useUpdateBranchMutation(branchId: string) {
  const queryClient = useQueryClient();
  const { data: session } = useCurrentSession();
  const tenantId = session?.user.tenantId;

  return useMutation({
    mutationFn: (input: UpdateBranchInput) =>
      updateBranch({
        id: branchId,
        input,
        tenantId,
        accessToken: session?.accessToken,
      }),
    onSuccess: (branch: BranchRecord) => {
      queryClient.setQueryData(
        branchesQueryKeys.detail(tenantId, branch.id),
        branch,
      );
      void queryClient.invalidateQueries({
        queryKey: branchesQueryKeys.all,
      });
    },
  });
}
