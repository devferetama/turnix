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
import { cn, formatDateTime, formatTimeRange } from "@/lib/utils";
import { getApiErrorMessage } from "@/modules/auth/utils/auth-error";
import {
  usePublicServicesQuery,
  usePublicSlotsQuery,
  useReschedulePublicAppointmentMutation,
} from "@/modules/public-booking/hooks/use-public-booking";
import {
  getPublicAppointmentRescheduleDefaults,
  mapPublicAppointmentRescheduleToPayload,
  publicAppointmentRescheduleSchema,
} from "@/modules/public-booking/schemas/public-booking.schema";
import type {
  PublicAppointmentLookupRecord,
  PublicServiceSlotRecord,
} from "@/modules/public-booking/types/public-booking.types";
import { useI18n } from "@/providers/i18n-provider";

function getErrorText(error: unknown) {
  return typeof error === "string" ? error : undefined;
}

function isCurrentAppointmentSlot(
  appointment: PublicAppointmentLookupRecord,
  slot: PublicServiceSlotRecord,
) {
  return (
    slot.startsAt === appointment.scheduledStart &&
    slot.endsAt === appointment.scheduledEnd &&
    slot.branch.slug === appointment.branch.slug
  );
}

export function PublicAppointmentRescheduleForm({
  appointment,
  onRescheduled,
  onClose,
}: {
  appointment: PublicAppointmentLookupRecord;
  onRescheduled: (appointment: PublicAppointmentLookupRecord) => void;
  onClose: () => void;
}) {
  const { dictionary, locale } = useI18n();
  const servicesQuery = usePublicServicesQuery();
  const mutation = useReschedulePublicAppointmentMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(
    appointment.scheduledStart.slice(0, 10),
  );
  const [selectedBranchId, setSelectedBranchId] = useState(
    appointment.branch.id ?? "",
  );

  const resolvedService = (servicesQuery.data ?? []).find(
    (service) =>
      service.id === appointment.service.id || service.slug === appointment.service.slug,
  );
  const slotFilters = {
    dateFrom: selectedDate || undefined,
    dateTo: selectedDate || undefined,
    branchId: selectedBranchId || undefined,
  };
  const slotsQuery = usePublicSlotsQuery(resolvedService?.id, slotFilters);
  const branchOptions = Array.from(
    new Map((slotsQuery.data ?? []).map((slot) => [slot.branch.id, slot.branch])).values(),
  );
  const availableSlots = (slotsQuery.data ?? []).filter(
    (slot) =>
      slot.availableCapacity > 0 && !isCurrentAppointmentSlot(appointment, slot),
  );

  const form = useForm({
    defaultValues: getPublicAppointmentRescheduleDefaults({
      selectedDate: appointment.scheduledStart.slice(0, 10),
      branchId: appointment.branch.id ?? "",
    }),
    onSubmit: async ({ value }) => {
      const parsed = publicAppointmentRescheduleSchema.safeParse(value);

      if (!parsed.success) {
        setSubmitError(
          parsed.error.issues[0]?.message ??
            dictionary.booking.appointmentDetail.reschedule.submitFailed,
        );
        return;
      }

      try {
        const updatedAppointment = await mutation.mutateAsync({
          code: appointment.code,
          payload: mapPublicAppointmentRescheduleToPayload(parsed.data),
        });

        setSubmitError(null);
        onRescheduled(updatedAppointment);
      } catch (error) {
        setSubmitError(
          getApiErrorMessage(error) ??
            dictionary.booking.appointmentDetail.reschedule.submitFailed,
        );
      }
    },
  });

  if (servicesQuery.isPending && !servicesQuery.data) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
          <Spinner size="sm" />
          {dictionary.booking.appointmentDetail.reschedule.loadingService}
        </CardContent>
      </Card>
    );
  }

  if (!resolvedService) {
    return (
      <Card className="border-warning/30">
        <CardHeader>
          <CardTitle>
            {dictionary.booking.appointmentDetail.reschedule.unavailableTitle}
          </CardTitle>
          <CardDescription>
            {servicesQuery.isError
              ? getApiErrorMessage(servicesQuery.error) ??
                dictionary.booking.appointmentDetail.reschedule.serviceUnavailableDescription
              : dictionary.booking.appointmentDetail.reschedule
                  .serviceUnavailableDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Button type="button" variant="outline" onClick={onClose}>
            {dictionary.booking.appointmentDetail.reschedule.keepCurrent}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle>{dictionary.booking.appointmentDetail.reschedule.title}</CardTitle>
        <CardDescription>
          {dictionary.booking.appointmentDetail.reschedule.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-0">
        <div className="rounded-[1.25rem] border border-border/70 bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            {dictionary.booking.appointmentDetail.reschedule.currentTimeLabel}
          </p>
          <p className="mt-2 text-sm font-semibold text-foreground">
            {formatDateTime(
              appointment.scheduledStart,
              locale,
              appointment.branch.timezone,
            )}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatTimeRange(
              appointment.scheduledStart,
              appointment.scheduledEnd,
              locale,
              appointment.branch.timezone,
            )}
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
          <div className="grid gap-4 md:grid-cols-[minmax(0,0.9fr)_auto]">
            <form.Field name="selectedDate">
              {(field) => (
                <FormField
                  label={dictionary.booking.appointmentDetail.reschedule.dateLabel}
                  htmlFor={field.name}
                  hint={dictionary.booking.appointmentDetail.reschedule.dateHint}
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

            <div className="flex items-end">
              <Button
                type="button"
                variant="ghost"
                className="w-full md:w-auto"
                onClick={() => {
                  setSelectedDate("");
                  form.setFieldValue("selectedDate", "");
                  form.setFieldValue("slotId", "");
                  setSubmitError(null);
                }}
              >
                {dictionary.booking.form.clearDate}
              </Button>
            </div>
          </div>

          {branchOptions.length > 1 ? (
            <form.Field name="branchId">
              {(field) => (
                <FormField
                  label={dictionary.booking.appointmentDetail.reschedule.branchLabel}
                  htmlFor={field.name}
                  hint={dictionary.booking.appointmentDetail.reschedule.branchHint}
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
                      {dictionary.booking.appointmentDetail.reschedule.branchAll}
                    </option>
                    {branchOptions.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </Select>
                </FormField>
              )}
            </form.Field>
          ) : null}

          <form.Field name="slotId">
            {(field) => (
              <FormField
                label={dictionary.booking.appointmentDetail.reschedule.slotLabel}
                htmlFor={field.name}
                required
                error={getErrorText(field.state.meta.errors[0])}
              >
                {slotsQuery.isPending && !slotsQuery.data ? (
                  <div className="flex items-center gap-3 rounded-[1.25rem] border border-border/70 bg-surface px-4 py-3 text-sm text-muted-foreground">
                    <Spinner size="sm" />
                    {dictionary.booking.appointmentDetail.reschedule.loadingSlots}
                  </div>
                ) : slotsQuery.isError ? (
                  <div className="space-y-3 rounded-[1.25rem] border border-danger/20 bg-danger/5 p-4">
                    <p className="text-sm leading-6 text-muted-foreground">
                      {getApiErrorMessage(slotsQuery.error) ??
                        dictionary.booking.appointmentDetail.reschedule.slotLoadError}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void slotsQuery.refetch()}
                    >
                      {dictionary.booking.appointmentDetail.retry}
                    </Button>
                  </div>
                ) : availableSlots.length ? (
                  <div className="grid gap-3">
                    {availableSlots.map((slot) => {
                      const isSelected = field.state.value === slot.id;

                      return (
                        <button
                          key={slot.id}
                          type="button"
                          className={cn(
                            "rounded-[1.25rem] border p-4 text-left transition",
                            isSelected
                              ? "border-primary bg-primary/8"
                              : "border-border/70 bg-surface hover:border-primary/40",
                          )}
                          onClick={() => {
                            field.handleChange(slot.id);
                            setSubmitError(null);
                          }}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {formatDateTime(
                                  slot.startsAt,
                                  locale,
                                  slot.branch.timezone,
                                )}
                              </p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {formatTimeRange(
                                  slot.startsAt,
                                  slot.endsAt,
                                  locale,
                                  slot.branch.timezone,
                                )}
                              </p>
                            </div>
                            <div className="text-right text-sm text-muted-foreground">
                              <p>{slot.branch.name}</p>
                              <p>
                                {slot.availableCapacity}{" "}
                                {dictionary.booking.form.slotsRemainingSuffix}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-[1.25rem] border border-border/70 bg-surface p-4 text-sm leading-6 text-muted-foreground">
                    {selectedDate
                      ? dictionary.booking.form.noSlotsForDate
                      : dictionary.booking.appointmentDetail.reschedule.noSlots}
                  </div>
                )}
              </FormField>
            )}
          </form.Field>

          <form.Field name="reason">
            {(field) => (
              <FormField
                label={dictionary.booking.appointmentDetail.reschedule.reasonLabel}
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
                  placeholder={
                    dictionary.booking.appointmentDetail.reschedule.reasonPlaceholder
                  }
                  rows={3}
                />
              </FormField>
            )}
          </form.Field>

          <form.Field name="details">
            {(field) => (
              <FormField
                label={dictionary.booking.appointmentDetail.reschedule.detailsLabel}
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
                  placeholder={
                    dictionary.booking.appointmentDetail.reschedule.detailsPlaceholder
                  }
                  rows={4}
                />
              </FormField>
            )}
          </form.Field>

          {submitError ? (
            <p className="text-sm text-danger">{submitError}</p>
          ) : null}

          <form.Subscribe selector={(state) => [state.isSubmitting] as const}>
            {([isSubmitting]) => (
              <div className="flex flex-wrap gap-3">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting || mutation.isPending}
                >
                  {isSubmitting || mutation.isPending
                    ? dictionary.booking.appointmentDetail.reschedule.submitting
                    : dictionary.booking.appointmentDetail.reschedule.submit}
                </Button>
                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  onClick={onClose}
                >
                  {dictionary.booking.appointmentDetail.reschedule.keepCurrent}
                </Button>
              </div>
            )}
          </form.Subscribe>
        </form>
      </CardContent>
    </Card>
  );
}
