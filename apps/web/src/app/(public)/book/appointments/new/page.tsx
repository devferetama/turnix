import { PageHeader } from "@/components/ui/organisms/page-header";
import { BookingPageTemplate } from "@/components/ui/templates/booking-page-template";
import { getRequestDictionary } from "@/i18n/request";
import { PublicBookingForm } from "@/modules/public-booking/components/public-booking-form";

export default async function NewAppointmentPage() {
  const { dictionary } = await getRequestDictionary();

  return (
    <BookingPageTemplate className="space-y-6">
      <PageHeader
        title={dictionary.booking.formPage.title}
        description={dictionary.booking.formPage.description}
      />
      <PublicBookingForm />
    </BookingPageTemplate>
  );
}
