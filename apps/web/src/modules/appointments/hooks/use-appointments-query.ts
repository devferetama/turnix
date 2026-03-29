"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useCurrentSession } from "@/modules/auth/hooks/use-current-session";
import { appointmentsQueryKeys } from "@/modules/appointments/constants/appointments.constants";
import { getAppointments } from "@/modules/appointments/services/appointments-api";
import type { ListAppointmentsQuery } from "@/modules/appointments/types/appointment.types";

export function useAppointmentsQuery(query: ListAppointmentsQuery = {}) {
  const { data: session, status } = useCurrentSession();
  const tenantId = session?.user.tenantId;

  return useQuery({
    queryKey: appointmentsQueryKeys.list(tenantId, query),
    queryFn: () =>
      getAppointments({
        filters: query,
        tenantId,
        accessToken: session?.accessToken,
      }),
    enabled: status !== "loading",
    placeholderData: keepPreviousData,
  });
}
