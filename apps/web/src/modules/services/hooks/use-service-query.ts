"use client";

import { useQuery } from "@tanstack/react-query";

import { useCurrentSession } from "@/modules/auth/hooks/use-current-session";
import { servicesQueryKeys } from "@/modules/services/constants/services.constants";
import type { ServiceRecord } from "@/modules/services/types/service.types";
import { getServiceById } from "@/modules/services/services/services-api";

export function useServiceQuery(
  serviceId?: string,
  initialData?: ServiceRecord,
) {
  const { data: session, status } = useCurrentSession();
  const tenantId = session?.user.tenantId;

  return useQuery({
    queryKey: servicesQueryKeys.detail(tenantId, serviceId),
    queryFn: () =>
      getServiceById({
        id: serviceId ?? "",
        tenantId,
        accessToken: session?.accessToken,
      }),
    enabled: status !== "loading" && Boolean(serviceId),
    initialData,
  });
}
