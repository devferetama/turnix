"use client";

import Link from "next/link";
import { useState } from "react";

import { ApiError } from "@/lib/api/client";
import { formatDateTime, formatTimeRange } from "@/lib/utils";
import { Button } from "@/components/ui/atoms/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/atoms/card";
import { Spinner } from "@/components/ui/atoms/spinner";
import { StatusBadge } from "@/components/ui/molecules/status-badge";
import { ROUTES } from "@/config/routes";
import { getApiErrorMessage } from "@/modules/auth/utils/auth-error";
import { usePublicAppointmentQuery } from "@/modules/public-booking/hooks/use-public-booking";
import { PublicAppointmentCancellationForm } from "@/modules/public-booking/components/public-appointment-cancellation-form";
import { PublicAppointmentRescheduleForm } from "@/modules/public-booking/components/public-appointment-reschedule-form";
import type { PublicAppointmentLookupRecord } from "@/modules/public-booking/types/public-booking.types";
import { useI18n } from "@/providers/i18n-provider";

function isPublicAppointmentCancellable(
  appointment: PublicAppointmentLookupRecord,
) {
  return (
    !appointment.cancellation &&
    (appointment.status === "PENDING" || appointment.status === "CONFIRMED")
  );
}

function isPublicAppointmentReschedulable(
  appointment: PublicAppointmentLookupRecord,
) {
  return (
    !appointment.cancellation &&
    (appointment.status === "PENDING" || appointment.status === "CONFIRMED")
  );
}

export function PublicAppointmentDetails({ code }: { code: string }) {
  const { dictionary, locale } = useI18n();
  const appointmentQuery = usePublicAppointmentQuery(code);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (appointmentQuery.isPending && !appointmentQuery.data) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 p-8 text-sm text-muted-foreground">
          <Spinner size="sm" />
          {dictionary.booking.appointmentDetail.loading}
        </CardContent>
      </Card>
    );
  }

  if (appointmentQuery.isError && !appointmentQuery.data) {
    const isNotFound =
      appointmentQuery.error instanceof ApiError &&
      appointmentQuery.error.status === 404;

    return (
      <Card className={isNotFound ? undefined : "border-danger/20"}>
        <CardHeader>
          <CardTitle>
            {isNotFound
              ? dictionary.booking.appointmentDetail.notFoundTitle
              : dictionary.booking.appointmentDetail.errorTitle}
          </CardTitle>
          <CardDescription>
            {isNotFound
              ? dictionary.booking.appointmentDetail.notFoundDescription
              : getApiErrorMessage(appointmentQuery.error) ??
                dictionary.booking.appointmentDetail.errorDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={ROUTES.bookingLookup}>
                {dictionary.booking.appointmentDetail.lookupAnother}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={ROUTES.bookingServices}>
                {dictionary.common.actions.startNewBooking}
              </Link>
            </Button>
            {!isNotFound ? (
              <Button
                variant="outline"
                onClick={() => void appointmentQuery.refetch()}
              >
                {dictionary.booking.appointmentDetail.retry}
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    );
  }

  const appointment = appointmentQuery.data;

  if (!appointment) {
    return null;
  }

  const isCancellable = isPublicAppointmentCancellable(appointment);
  const isReschedulable = isPublicAppointmentReschedulable(appointment);

  return (
    <div className="space-y-6">
      {successMessage ? (
        <div className="rounded-[1.25rem] border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
          {successMessage}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
        <Card className="overflow-hidden border-transparent bg-[linear-gradient(145deg,rgba(14,165,233,0.08),rgba(248,250,252,0.74),rgba(16,185,129,0.08))]">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={appointment.status} />
            </div>
            <CardTitle>
              {dictionary.booking.appointmentDetail.title}
            </CardTitle>
            <CardDescription>
              {dictionary.booking.appointmentDetail.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-[1.5rem] border border-border/70 bg-card/85 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                {dictionary.common.labels.bookingCode}
              </p>
              <p className="mt-3 font-mono text-4xl font-semibold tracking-[0.18em] text-foreground">
                {appointment.code}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.25rem] border border-border/70 bg-card/85 p-4">
                <p className="text-sm font-semibold text-foreground">
                  {dictionary.common.labels.when}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {formatDateTime(
                    appointment.scheduledStart,
                    locale,
                    appointment.branch.timezone,
                  )}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatTimeRange(
                    appointment.scheduledStart,
                    appointment.scheduledEnd,
                    locale,
                    appointment.branch.timezone,
                  )}
                </p>
              </div>

              <div className="rounded-[1.25rem] border border-border/70 bg-card/85 p-4">
                <p className="text-sm font-semibold text-foreground">
                  {dictionary.common.labels.service}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {appointment.service.name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {dictionary.services.options.mode[appointment.service.mode]}
                </p>
              </div>

              <div className="rounded-[1.25rem] border border-border/70 bg-card/85 p-4">
                <p className="text-sm font-semibold text-foreground">
                  {dictionary.common.labels.branch}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {appointment.branch.name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {[appointment.branch.city, appointment.branch.country]
                    .filter(Boolean)
                    .join(", ") || dictionary.booking.appointmentDetail.noAddress}
                </p>
              </div>

              <div className="rounded-[1.25rem] border border-border/70 bg-card/85 p-4">
                <p className="text-sm font-semibold text-foreground">
                  {dictionary.booking.confirmation.contactLabel}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {appointment.citizen.firstName} {appointment.citizen.lastName}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {appointment.citizen.email ??
                    appointment.citizen.phone ??
                    dictionary.booking.confirmation.contactFallback}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {isReschedulable ? (
                <Button
                  variant={showRescheduleForm ? "secondary" : "outline"}
                  onClick={() => {
                    setShowRescheduleForm((current) => !current);
                    setShowCancelForm(false);
                    setSuccessMessage(null);
                  }}
                >
                  {showRescheduleForm
                    ? dictionary.booking.appointmentDetail.reschedule.hide
                    : dictionary.booking.appointmentDetail.reschedule.show}
                </Button>
              ) : null}
              {isCancellable ? (
                <Button
                  variant={showCancelForm ? "secondary" : "danger"}
                  onClick={() => {
                    setShowCancelForm((current) => !current);
                    setShowRescheduleForm(false);
                    setSuccessMessage(null);
                  }}
                >
                  {showCancelForm
                    ? dictionary.booking.appointmentDetail.cancel.hide
                    : dictionary.booking.appointmentDetail.cancel.show}
                </Button>
              ) : null}
              <Button asChild variant="outline">
                <Link href={ROUTES.bookingLookup}>
                  {dictionary.booking.appointmentDetail.lookupAnother}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={ROUTES.bookingServices}>
                  {dictionary.common.actions.bookAnotherAppointment}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{dictionary.booking.appointmentDetail.summaryTitle}</CardTitle>
            <CardDescription>
              {dictionary.booking.appointmentDetail.summaryDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[1.25rem] border border-border/70 bg-surface p-4 text-sm leading-6 text-muted-foreground">
              <span className="font-semibold text-foreground">
                {dictionary.booking.appointmentDetail.durationLabel}:
              </span>{" "}
              {appointment.service.durationMinutes}{" "}
              {dictionary.booking.appointmentDetail.durationUnit}
            </div>
            <div className="rounded-[1.25rem] border border-border/70 bg-surface p-4 text-sm leading-6 text-muted-foreground">
              <span className="font-semibold text-foreground">
                {dictionary.booking.confirmation.statusLabel}:
              </span>{" "}
              <span className="inline-flex translate-y-[2px]">
                <StatusBadge status={appointment.status} />
              </span>
            </div>
            {appointment.cancellation ? (
              <div className="rounded-[1.25rem] border border-danger/20 bg-danger/5 p-4 text-sm leading-6 text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {dictionary.booking.appointmentDetail.cancelledAtLabel}:
                </span>{" "}
                {formatDateTime(
                  appointment.cancellation.cancelledAt,
                  locale,
                  appointment.branch.timezone,
                )}
              </div>
            ) : isReschedulable ? (
              <div className="rounded-[1.25rem] border border-border/70 bg-surface p-4 text-sm leading-6 text-muted-foreground">
                {dictionary.booking.appointmentDetail.reschedule.availableDescription}
              </div>
            ) : isCancellable ? (
              <div className="rounded-[1.25rem] border border-border/70 bg-surface p-4 text-sm leading-6 text-muted-foreground">
                {dictionary.booking.appointmentDetail.cancel.availableDescription}
              </div>
            ) : (
              <div className="rounded-[1.25rem] border border-border/70 bg-surface p-4 text-sm leading-6 text-muted-foreground">
                {dictionary.booking.appointmentDetail.cancel.unavailableDescription}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {showCancelForm && isCancellable ? (
        <PublicAppointmentCancellationForm
          code={appointment.code}
          onClose={() => setShowCancelForm(false)}
          onCancelled={(updatedAppointment) => {
            void updatedAppointment.cancellation;
            setShowCancelForm(false);
            setSuccessMessage(dictionary.booking.appointmentDetail.cancel.success);
          }}
        />
      ) : null}

      {showRescheduleForm && isReschedulable ? (
        <PublicAppointmentRescheduleForm
          appointment={appointment}
          onClose={() => setShowRescheduleForm(false)}
          onRescheduled={() => {
            setShowRescheduleForm(false);
            setSuccessMessage(
              dictionary.booking.appointmentDetail.reschedule.success,
            );
          }}
        />
      ) : null}
    </div>
  );
}
