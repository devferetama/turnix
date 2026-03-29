"use client";

import { useQuery } from "@tanstack/react-query";

import { useCurrentSession } from "@/modules/auth/hooks/use-current-session";
import { appointmentsQueryKeys } from "@/modules/appointments/constants/appointments.constants";
import { getAppointmentById } from "@/modules/appointments/services/appointments-api";
import type { AppointmentRecord } from "@/modules/appointments/types/appointment.types";

export function useAppointmentQuery(
  appointmentId?: string,
  initialData?: AppointmentRecord,
) {
  const { data: session, status } = useCurrentSession();
  const tenantId = session?.user.tenantId;

  return useQuery({
    queryKey: appointmentsQueryKeys.detail(tenantId, appointmentId),
    queryFn: () =>
      getAppointmentById({
        id: appointmentId ?? "",
        tenantId,
        accessToken: session?.accessToken,
      }),
    enabled: status !== "loading" && Boolean(appointmentId),
    initialData,
  });
}
