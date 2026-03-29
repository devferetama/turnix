import { PageHeader } from "@/components/ui/organisms/page-header";
import { BookingPageTemplate } from "@/components/ui/templates/booking-page-template";
import { getRequestDictionary } from "@/i18n/request";
import { BookingConfirmationPanel } from "@/modules/public-booking/components/booking-confirmation-panel";

export default async function BookingConfirmationPage() {
  const { dictionary } = await getRequestDictionary();

  return (
    <BookingPageTemplate className="space-y-6">
      <PageHeader
        title={dictionary.booking.confirmationPage.title}
        description={dictionary.booking.confirmationPage.description}
      />
      <BookingConfirmationPanel />
    </BookingPageTemplate>
  );
}
