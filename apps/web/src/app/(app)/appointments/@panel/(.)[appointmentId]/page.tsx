import { AppointmentDetailRoutePanel } from "@/modules/appointments/components/appointment-detail-route-panel";

export default async function InterceptedAppointmentPanelPage({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}) {
  const { appointmentId } = await params;

  return <AppointmentDetailRoutePanel appointmentId={appointmentId} />;
}
