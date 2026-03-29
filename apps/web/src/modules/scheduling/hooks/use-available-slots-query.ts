"use client";

import { useQuery } from "@tanstack/react-query";

import { useCurrentSession } from "@/modules/auth/hooks/use-current-session";
import { schedulingQueryKeys } from "@/modules/scheduling/constants/scheduling.constants";
import { getAvailableSlots } from "@/modules/scheduling/services/scheduling-api";

export function useAvailableSlotsQuery(serviceId?: string) {
  const { data: session } = useCurrentSession();

  return useQuery({
    queryKey: schedulingQueryKeys.slots(serviceId ?? "unknown"),
    queryFn: () => getAvailableSlots(serviceId ?? "", session?.accessToken),
    enabled: Boolean(serviceId),
  });
}
