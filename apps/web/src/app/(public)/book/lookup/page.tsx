import { PageHeader } from "@/components/ui/organisms/page-header";
import { BookingPageTemplate } from "@/components/ui/templates/booking-page-template";
import { getRequestDictionary } from "@/i18n/request";
import { PublicAppointmentLookupForm } from "@/modules/public-booking/components/public-appointment-lookup-form";

export default async function BookingLookupPage() {
  const { dictionary } = await getRequestDictionary();

  return (
    <BookingPageTemplate className="space-y-6">
      <PageHeader
        title={dictionary.booking.lookupPage.title}
        description={dictionary.booking.lookupPage.description}
      />
      <PublicAppointmentLookupForm />
    </BookingPageTemplate>
  );
}
