"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, ShieldCheck, TimerReset } from "lucide-react";

import { Button } from "@/components/ui/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/atoms/card";
import { ROUTES } from "@/config/routes";
import { useI18n } from "@/providers/i18n-provider";

const bookingSignals = [
  {
    icon: CalendarDays,
    label: "Guided multi-step booking",
  },
  {
    icon: ShieldCheck,
    label: "Clear public-service experience",
  },
  {
    icon: TimerReset,
    label: "Ready for lookup and rescheduling",
  },
];

export function BookingHero() {
  const { dictionary } = useI18n();

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <Card className="overflow-hidden border-transparent bg-[linear-gradient(135deg,rgba(14,165,233,0.08),rgba(226,232,240,0.14),rgba(20,184,166,0.08))]">
        <CardContent className="p-8 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
            {dictionary.booking.hero.eyebrow}
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {dictionary.booking.hero.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
            {dictionary.booking.hero.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href={ROUTES.bookingServices}>
                {dictionary.common.actions.startBooking}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={ROUTES.bookingLookup}>
                {dictionary.common.actions.lookupAppointment}
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link href={ROUTES.login}>
                {dictionary.common.actions.openStaffBackoffice}
              </Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {bookingSignals.map((item, index) => (
              <div
                key={item.label}
                className="rounded-[1.5rem] border border-border/70 bg-card/80 p-4 backdrop-blur"
              >
                <item.icon className="h-5 w-5 text-primary" />
                <p className="mt-3 text-sm font-semibold text-foreground">
                  {dictionary.booking.hero.signals[index]}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{dictionary.booking.hero.whyTitle}</CardTitle>
          <CardDescription>{dictionary.booking.hero.whyDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {dictionary.booking.hero.highlights.map((item) => (
            <div
              key={item.title}
              className="rounded-[1.25rem] border border-border/70 bg-surface p-4"
            >
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
