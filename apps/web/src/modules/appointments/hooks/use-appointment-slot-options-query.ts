"use client";

import { useQuery } from "@tanstack/react-query";

import { useCurrentSession } from "@/modules/auth/hooks/use-current-session";
import { appointmentsQueryKeys } from "@/modules/appointments/constants/appointments.constants";
import { getAppointmentSlotOptions } from "@/modules/appointments/services/appointments-api";

export function useAppointmentSlotOptionsQuery({
  branchId,
  serviceId,
  date,
}: {
  branchId?: string;
  serviceId?: string;
  date?: string;
}) {
  const { data: session, status } = useCurrentSession();
  const tenantId = session?.user.tenantId;

  return useQuery({
    queryKey: appointmentsQueryKeys.slots(tenantId, branchId, serviceId, date),
    queryFn: () =>
      getAppointmentSlotOptions({
        branchId,
        serviceId,
        date,
        tenantId,
        accessToken: session?.accessToken,
      }),
    enabled:
      status !== "loading" && Boolean(branchId && serviceId && date),
  });
}
