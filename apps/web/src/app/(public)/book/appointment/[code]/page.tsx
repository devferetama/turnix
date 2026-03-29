import { PageHeader } from "@/components/ui/organisms/page-header";
import { BookingPageTemplate } from "@/components/ui/templates/booking-page-template";
import { getRequestDictionary } from "@/i18n/request";
import { PublicAppointmentDetails } from "@/modules/public-booking/components/public-appointment-details";

export default async function PublicAppointmentPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const [{ dictionary }, { code }] = await Promise.all([
    getRequestDictionary(),
    params,
  ]);

  return (
    <BookingPageTemplate className="space-y-6">
      <PageHeader
        title={dictionary.booking.appointmentPage.title}
        description={dictionary.booking.appointmentPage.description}
      />
      <PublicAppointmentDetails code={code} />
    </BookingPageTemplate>
  );
}
