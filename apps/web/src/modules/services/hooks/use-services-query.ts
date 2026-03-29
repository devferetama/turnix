"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useCurrentSession } from "@/modules/auth/hooks/use-current-session";
import { servicesQueryKeys } from "@/modules/services/constants/services.constants";
import type { ListServicesQuery } from "@/modules/services/types/service.types";
import { getServices } from "@/modules/services/services/services-api";

export function useServicesQuery(query: ListServicesQuery = {}) {
  const { data: session, status } = useCurrentSession();
  const tenantId = session?.user.tenantId;

  return useQuery({
    queryKey: servicesQueryKeys.list(tenantId, query),
    queryFn: () =>
      getServices({
        filters: query,
        tenantId,
        accessToken: session?.accessToken,
      }),
    enabled: status !== "loading",
    placeholderData: keepPreviousData,
  });
}
