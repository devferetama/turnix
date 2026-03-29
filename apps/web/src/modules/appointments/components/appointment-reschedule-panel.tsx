"use client";

import { useForm } from "@tanstack/react-form";
import { useState } from "react";

import { Button } from "@/components/ui/atoms/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/atoms/card";
import { Input } from "@/components/ui/atoms/input";
import { Select } from "@/components/ui/atoms/select";
import { Spinner } from "@/components/ui/atoms/spinner";
import { Textarea } from "@/components/ui/atoms/textarea";
import { FormField } from "@/components/ui/molecules/form-field";
import { ApiError } from "@/lib/api/client";
import { cn, formatDateTime, formatTimeRange } from "@/lib/utils";
import { useRescheduleAppointmentMutation } from "@/modules/appointments/hooks/use-appointment-mutations";
import { useAppointmentSlotOptionsQuery } from "@/modules/appointments/hooks/use-appointment-slot-options-query";
import {
  appointmentRescheduleSchema,
  getAppointmentRescheduleDefaults,
  mapAppointmentRescheduleToPayload,
} from "@/modules/appointments/schemas/appointment-reschedule.schema";
import type { AppointmentRecord } from "@/modules/appointments/types/appointment.types";
import { useBranchesQuery } from "@/modules/branches/hooks/use-branches-query";
import { useI18n } from "@/providers/i18n-provider";

function getErrorText(error: unknown) {
  return typeof error === "string" ? error : undefined;
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    const payload = error.payload as
      | { message?: string | string[] }
      | string
      | undefined;

    if (typeof payload === "string" && payload.trim()) {
      return payload;
    }

    if (payload && typeof payload === "object") {
      if (Array.isArray(payload.message) && payload.message.length > 0) {
        return payload.message.join(" ");
      }

      if (typeof payload.message === "string" && payload.message.trim()) {
        return payload.message;
      }
    }
  }

  return fallback;
}

function getSlotAvailabilityLabel(
  capacity: number,
  reservedCount: number,
  label: string,
) {
  return `${Math.max(capacity - reservedCount, 0)} ${label}`;
}

export function AppointmentReschedulePanel({
  appointment,
  onClose,
  onRescheduled,
}: {
  appointment: AppointmentRecord;
  onClose: () => void;
  onRescheduled: (appointment: AppointmentRecord) => void;
}) {
  const { dictionary, locale } = useI18n();
  const rescheduleMutation = useRescheduleAppointmentMutation(appointment.id);
  const branchesQuery = useBranchesQuery({ isActive: true });
  const [selectedBranchId, setSelectedBranchId] = useState(appointment.branchId);
  const [selectedDate, setSelectedDate] = useState(
    appointment.scheduledStart.slice(0, 10),
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const slotOptionsQuery = useAppointmentSlotOptionsQuery({
    branchId: selectedBranchId || undefined,
    serviceId: appointment.serviceId,
    date: selectedDate || undefined,
  });
  const availableSlots = (slotOptionsQuery.data?.items ?? []).filter(
    (slot) =>
      slot.id !== appointment.slotId &&
      slot.status === "OPEN" &&
      slot.reservedCount < slot.capacity,
  );

  const form = useForm({
    defaultValues: getAppointmentRescheduleDefaults({
      branchId: appointment.branchId,
      selectedDate: appointment.scheduledStart.slice(0, 10),
    }),
    onSubmit: async ({ value }) => {
      const parsed = appointmentRescheduleSchema.safeParse(value);

      if (!parsed.success) {
        setSubmitError(
          parsed.error.issues[0]?.message ??
            dictionary.appointments.reschedule.failed,
        );
        return;
      }

      try {
        const updatedAppointment = await rescheduleMutation.mutateAsync(
          mapAppointmentRescheduleToPayload(parsed.data),
        );

        setSubmitError(null);
        onRescheduled(updatedAppointment);
      } catch (error) {
        setSubmitError(
          getApiErrorMessage(error, dictionary.appointments.reschedule.failed),
        );
      }
    },
  });

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle>{dictionary.appointments.reschedule.title}</CardTitle>
        <CardDescription>
          {dictionary.appointments.reschedule.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-0">
        <div className="rounded-[1.25rem] border border-border/70 bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            {dictionary.appointments.reschedule.currentSlotLabel}
          </p>
          <p className="mt-2 text-sm font-semibold text-foreground">
            {formatDateTime(appointment.scheduledStart, locale)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatTimeRange(
              appointment.scheduledStart,
              appointment.scheduledEnd,
              locale,
            )}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            {appointment.branch.name}
          </p>
        </div>

        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <div className="grid gap-5">
            <form.Field name="branchId">
              {(field) => (
                <FormField
                  label={dictionary.appointments.reschedule.branchLabel}
                  htmlFor={field.name}
                >
                  <Select
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      field.handleChange(nextValue);
                      setSelectedBranchId(nextValue);
                      form.setFieldValue("slotId", "");
                      setSubmitError(null);
                    }}
                  >
                    <option value="">
                      {dictionary.appointments.reschedule.branchPlaceholder}
                    </option>
                    {(branchesQuery.data ?? []).map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </Select>
                </FormField>
              )}
            </form.Field>

            <form.Field name="selectedDate">
              {(field) => (
                <FormField
                  label={dictionary.appointments.reschedule.dateLabel}
                  htmlFor={field.name}
                >
                  <Input
                    id={field.name}
                    name={field.name}
                    type="date"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      field.handleChange(nextValue);
                      setSelectedDate(nextValue);
                      form.setFieldValue("slotId", "");
                      setSubmitError(null);
                    }}
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field name="slotId">
              {(field) => {
                const slotLookupMode = slotOptionsQuery.data?.mode ?? "manual";
                const showManualInput =
                  slotLookupMode === "manual" || slotOptionsQuery.isError;

                return (
                  <FormField
                    label={dictionary.appointments.reschedule.slotLabel}
                    htmlFor={field.name}
                    required
                    hint={
                      showManualInput
                        ? dictionary.appointments.reschedule.slotManualHint
                        : undefined
                    }
                    error={getErrorText(field.state.meta.errors[0])}
                  >
                    {slotOptionsQuery.isPending ? (
                      <div className="flex items-center gap-3 rounded-[1.25rem] border border-border/70 bg-surface px-4 py-3 text-sm text-muted-foreground">
                        <Spinner size="sm" />
                        {dictionary.appointments.reschedule.slotLoading}
                      </div>
                    ) : showManualInput ? (
                      <div className="space-y-3">
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => {
                            field.handleChange(event.target.value);
                            setSubmitError(null);
                          }}
                          placeholder={
                            dictionary.appointments.reschedule.slotManualPlaceholder
                          }
                        />
                        <p className="text-sm leading-6 text-muted-foreground">
                          {slotOptionsQuery.isError
                            ? getApiErrorMessage(
                                slotOptionsQuery.error,
                                dictionary.appointments.reschedule.slotManualDescription,
                              )
                            : dictionary.appointments.reschedule.slotManualDescription}
                        </p>
                      </div>
                    ) : availableSlots.length ? (
                      <div className="grid gap-3">
                        {availableSlots.map((slot) => {
                          const isSelected = field.state.value === slot.id;

                          return (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => {
                                field.handleChange(slot.id);
                                setSubmitError(null);
                              }}
                              className={cn(
                                "rounded-[1.25rem] border p-4 text-left transition",
                                isSelected
                                  ? "border-primary bg-primary/8"
                                  : "border-border/70 bg-background/70 hover:border-primary/35",
                              )}
                            >
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-foreground">
                                    {formatDateTime(slot.startsAt, locale)}
                                  </p>
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    {formatTimeRange(
                                      slot.startsAt,
                                      slot.endsAt,
                                      locale,
                                    )}
                                  </p>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {getSlotAvailabilityLabel(
                                    slot.capacity,
                                    slot.reservedCount,
                                    dictionary.appointments.form.slotAvailabilityLabel,
                                  )}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="rounded-[1.25rem] border border-border/70 bg-surface p-4 text-sm leading-6 text-muted-foreground">
                        {dictionary.appointments.reschedule.slotEmpty}
                      </p>
                    )}
                  </FormField>
                );
              }}
            </form.Field>

            <form.Field name="reason">
              {(field) => (
                <FormField
                  label={dictionary.appointments.reschedule.reasonLabel}
                  htmlFor={field.name}
                  hint={dictionary.booking.appointmentDetail.optionalHint}
                  error={getErrorText(field.state.meta.errors[0])}
                >
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      field.handleChange(event.target.value);
                      setSubmitError(null);
                    }}
                    placeholder={dictionary.appointments.reschedule.reasonPlaceholder}
                    rows={3}
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field name="details">
              {(field) => (
                <FormField
                  label={dictionary.appointments.reschedule.detailsLabel}
                  htmlFor={field.name}
                  hint={dictionary.booking.appointmentDetail.optionalHint}
                  error={getErrorText(field.state.meta.errors[0])}
                >
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      field.handleChange(event.target.value);
                      setSubmitError(null);
                    }}
                    placeholder={dictionary.appointments.reschedule.detailsPlaceholder}
                    rows={4}
                  />
                </FormField>
              )}
            </form.Field>
          </div>

          {submitError ? (
            <p className="text-sm text-danger">{submitError}</p>
          ) : null}

          <form.Subscribe selector={(state) => [state.isSubmitting] as const}>
            {([isSubmitting]) => (
              <div className="flex flex-wrap gap-3">
                <Button
                  type="submit"
                  disabled={isSubmitting || rescheduleMutation.isPending}
                >
                  {isSubmitting || rescheduleMutation.isPending
                    ? dictionary.appointments.reschedule.submitting
                    : dictionary.appointments.reschedule.submit}
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>
                  {dictionary.appointments.reschedule.keepCurrent}
                </Button>
              </div>
            )}
          </form.Subscribe>
        </form>
      </CardContent>
    </Card>
  );
}
