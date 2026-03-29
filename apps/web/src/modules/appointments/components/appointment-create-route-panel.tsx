"use client";

import { useRouter } from "next/navigation";

import { ROUTES } from "@/config/routes";
import { AppointmentCreatePanel } from "@/modules/appointments/components/appointment-create-panel";

export function AppointmentCreateRoutePanel() {
  const router = useRouter();

  return (
    <AppointmentCreatePanel
      onClose={() => router.push(ROUTES.appointments)}
      onCreated={(appointment) =>
        router.replace(ROUTES.appointmentDetail(appointment.id))
      }
    />
  );
}
