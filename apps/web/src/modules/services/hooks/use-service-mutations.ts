"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useCurrentSession } from "@/modules/auth/hooks/use-current-session";
import { servicesQueryKeys } from "@/modules/services/constants/services.constants";
import type {
  CreateServiceInput,
  ServiceRecord,
  UpdateServiceInput,
} from "@/modules/services/types/service.types";
import {
  createService,
  updateService,
} from "@/modules/services/services/services-api";

export function useCreateServiceMutation() {
  const queryClient = useQueryClient();
  const { data: session } = useCurrentSession();
  const tenantId = session?.user.tenantId;

  return useMutation({
    mutationFn: (input: CreateServiceInput) =>
      createService({
        input,
        tenantId,
        accessToken: session?.accessToken,
      }),
    onSuccess: (service) => {
      queryClient.setQueryData(
        servicesQueryKeys.detail(tenantId, service.id),
        service,
      );
      void queryClient.invalidateQueries({
        queryKey: servicesQueryKeys.all,
      });
    },
  });
}

export function useUpdateServiceMutation(serviceId: string) {
  const queryClient = useQueryClient();
  const { data: session } = useCurrentSession();
  const tenantId = session?.user.tenantId;

  return useMutation({
    mutationFn: (input: UpdateServiceInput) =>
      updateService({
        id: serviceId,
        input,
        tenantId,
        accessToken: session?.accessToken,
      }),
    onSuccess: (service: ServiceRecord) => {
      queryClient.setQueryData(
        servicesQueryKeys.detail(tenantId, service.id),
        service,
      );
      void queryClient.invalidateQueries({
        queryKey: servicesQueryKeys.all,
      });
    },
  });
}
