"use client";

import { useRouter } from "next/navigation";

import { ROUTES } from "@/config/routes";
import { AppointmentDetailPanel } from "@/modules/appointments/components/appointment-detail-panel";

export function AppointmentDetailRoutePanel({
  appointmentId,
}: {
  appointmentId: string;
}) {
  const router = useRouter();

  return (
    <AppointmentDetailPanel
      appointmentId={appointmentId}
      onClose={() => router.push(ROUTES.appointments)}
    />
  );
}
