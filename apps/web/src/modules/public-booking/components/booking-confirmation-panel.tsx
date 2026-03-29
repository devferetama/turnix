"use client";

import Link from "next/link";

import { Button } from "@/components/ui/atoms/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/atoms/card";
import { StatusBadge } from "@/components/ui/molecules/status-badge";
import { formatDateTime, formatTimeRange } from "@/lib/utils";
import { useBookingFlow } from "@/modules/public-booking/hooks/use-public-booking";
import { ROUTES } from "@/config/routes";
import { useI18n } from "@/providers/i18n-provider";

export function BookingConfirmationPanel() {
  const { confirmation, reset } = useBookingFlow();
  const { dictionary, locale } = useI18n();

  if (!confirmation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{dictionary.booking.confirmation.missingTitle}</CardTitle>
          <CardDescription>
            {dictionary.booking.confirmation.missingDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href={ROUTES.bookingServices}>
              {dictionary.common.actions.startNewBooking}
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
      <Card className="overflow-hidden border-transparent bg-[linear-gradient(145deg,rgba(14,165,233,0.08),rgba(248,250,252,0.72),rgba(16,185,129,0.08))]">
        <CardHeader>
          <div className="flex items-center gap-3">
            <StatusBadge status={confirmation.status} />
          </div>
          <CardTitle>{dictionary.booking.confirmation.confirmedTitle}</CardTitle>
          <CardDescription>
            {dictionary.booking.confirmation.confirmedDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-[1.5rem] border border-border/70 bg-card/85 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              {dictionary.common.labels.bookingCode}
            </p>
            <p className="mt-3 font-mono text-4xl font-semibold tracking-[0.18em] text-foreground">
              {confirmation.code}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.25rem] border border-border/70 bg-card/85 p-4">
              <p className="text-sm font-semibold text-foreground">
                {dictionary.common.labels.service}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {confirmation.service.name}
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-border/70 bg-card/85 p-4">
              <p className="text-sm font-semibold text-foreground">
                {dictionary.booking.confirmation.branchLabel}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {confirmation.branch.name}
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-border/70 bg-card/85 p-4">
              <p className="text-sm font-semibold text-foreground">
                {dictionary.common.labels.when}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {formatDateTime(
                  confirmation.scheduledStart,
                  locale,
                  confirmation.branch.timezone,
                )}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatTimeRange(
                  confirmation.scheduledStart,
                  confirmation.scheduledEnd,
                  locale,
                  confirmation.branch.timezone,
                )}
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-border/70 bg-card/85 p-4">
              <p className="text-sm font-semibold text-foreground">
                {dictionary.booking.confirmation.contactLabel}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {confirmation.citizen.firstName} {confirmation.citizen.lastName}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {confirmation.citizen.email ??
                  confirmation.citizen.phone ??
                  dictionary.booking.confirmation.contactFallback}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={ROUTES.home}>{dictionary.common.actions.returnHome}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={ROUTES.bookingAppointment(confirmation.code)}>
                {dictionary.common.actions.viewAppointment}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={ROUTES.bookingServices} onClick={() => reset()}>
                {dictionary.common.actions.bookAnotherAppointment}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{dictionary.booking.confirmation.summaryTitle}</CardTitle>
          <CardDescription>
            {dictionary.booking.confirmation.summaryDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-[1.25rem] border border-border/70 bg-surface p-4 text-sm leading-6 text-muted-foreground">
            <span className="font-semibold text-foreground">
              {dictionary.booking.confirmation.branchLabel}:
            </span>{" "}
            {confirmation.branch.name}
            {confirmation.branch.city ? `, ${confirmation.branch.city}` : ""}
          </div>
          <div className="rounded-[1.25rem] border border-border/70 bg-surface p-4 text-sm leading-6 text-muted-foreground">
            <span className="font-semibold text-foreground">
              {dictionary.booking.confirmation.statusLabel}:
            </span>{" "}
            <span className="inline-flex translate-y-[2px]">
              <StatusBadge status={confirmation.status} />
            </span>
          </div>
          <div className="rounded-[1.25rem] border border-border/70 bg-surface p-4 text-sm leading-6 text-muted-foreground">
            {confirmation.citizenNotes?.trim()
              ? confirmation.citizenNotes
              : dictionary.booking.confirmation.noteFallback}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
