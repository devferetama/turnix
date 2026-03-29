import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/atoms/card";
import { BookingPageTemplate } from "@/components/ui/templates/booking-page-template";
import { getRequestDictionary } from "@/i18n/request";
import { BookingHero } from "@/modules/public-booking/components/booking-hero";

export default async function BookPage() {
  const { dictionary } = await getRequestDictionary();

  return (
    <BookingPageTemplate className="space-y-6">
      <BookingHero />
      <Card>
        <CardHeader>
          <CardTitle>{dictionary.booking.overview.title}</CardTitle>
          <CardDescription>{dictionary.booking.overview.description}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {dictionary.booking.overview.cards.map((item) => (
            <div
              key={item}
              className="rounded-[1.25rem] border border-border/70 bg-surface p-4 text-sm leading-6 text-muted-foreground"
            >
              {item}
            </div>
          ))}
        </CardContent>
      </Card>
    </BookingPageTemplate>
  );
}
