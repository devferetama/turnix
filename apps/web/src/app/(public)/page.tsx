import Link from "next/link";
import { ArrowRightLeft, Building2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/atoms/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/atoms/card";
import { PublicPageTemplate } from "@/components/ui/templates/public-page-template";
import { ROUTES } from "@/config/routes";
import { getRequestDictionary } from "@/i18n/request";
import { BookingHero } from "@/modules/public-booking/components/booking-hero";

const experienceCards = [
  {
    title: "Public experience",
    icon: Building2,
    description:
      "Designed for clarity, low-friction booking, and fast availability review without administrative authentication.",
  },
  {
    title: "Protected backoffice",
    icon: ShieldCheck,
    description:
      "Prepared for role-aware operations, service configuration, scheduling management, and reporting.",
  },
];

export default async function HomePage() {
  const { dictionary } = await getRequestDictionary();

  return (
    <PublicPageTemplate className="space-y-8">
      <BookingHero />
      <div className="grid gap-4 lg:grid-cols-2">
        {experienceCards.map((card, index) => (
          <Card key={card.title}>
            <CardHeader>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                <card.icon className="h-5 w-5" />
              </div>
              <CardTitle className="mt-5">
                {dictionary.home.experiences[index].title}
              </CardTitle>
              <CardDescription>
                {dictionary.home.experiences[index].description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm leading-6 text-muted-foreground">
                {dictionary.home.architecture}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{dictionary.home.foundationTitle}</CardTitle>
          <CardDescription>{dictionary.home.foundationDescription}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3 pt-0">
          <Button asChild>
            <Link href={ROUTES.bookingServices}>
              {dictionary.common.actions.beginBookingFlow}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={ROUTES.dashboard}>
              {dictionary.common.actions.exploreBackofficeFoundation}
              <ArrowRightLeft className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </PublicPageTemplate>
  );
}
