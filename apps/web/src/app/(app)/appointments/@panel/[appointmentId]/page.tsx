import { AppointmentDetailRoutePanel } from "@/modules/appointments/components/appointment-detail-route-panel";

export default async function AppointmentPanelPage({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}) {
  const { appointmentId } = await params;

  return <AppointmentDetailRoutePanel appointmentId={appointmentId} />;
}
