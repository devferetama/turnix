import { PageHeader } from "@/components/ui/organisms/page-header";
import { BookingPageTemplate } from "@/components/ui/templates/booking-page-template";
import { getRequestDictionary } from "@/i18n/request";
import { ServiceSelectionGrid } from "@/modules/public-booking/components/service-selection-grid";

export default async function BookingServicesPage() {
  const { dictionary } = await getRequestDictionary();

  return (
    <BookingPageTemplate className="space-y-6">
      <PageHeader
        title={dictionary.booking.servicesPage.title}
        description={dictionary.booking.servicesPage.description}
      />
      <ServiceSelectionGrid />
    </BookingPageTemplate>
  );
}
