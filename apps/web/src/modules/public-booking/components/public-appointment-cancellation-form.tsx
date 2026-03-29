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
import { Textarea } from "@/components/ui/atoms/textarea";
import { FormField } from "@/components/ui/molecules/form-field";
import { getApiErrorMessage } from "@/modules/auth/utils/auth-error";
import { useCancelPublicAppointmentMutation } from "@/modules/public-booking/hooks/use-public-booking";
import {
  getPublicAppointmentCancellationDefaults,
  mapPublicAppointmentCancellationToPayload,
  publicAppointmentCancellationSchema,
} from "@/modules/public-booking/schemas/public-booking.schema";
import type { PublicAppointmentLookupRecord } from "@/modules/public-booking/types/public-booking.types";
import { useI18n } from "@/providers/i18n-provider";

function getErrorText(error: unknown) {
  return typeof error === "string" ? error : undefined;
}

export function PublicAppointmentCancellationForm({
  code,
  onCancelled,
  onClose,
}: {
  code: string;
  onCancelled: (appointment: PublicAppointmentLookupRecord) => void;
  onClose: () => void;
}) {
  const { dictionary } = useI18n();
  const cancelMutation = useCancelPublicAppointmentMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: getPublicAppointmentCancellationDefaults(),
    onSubmit: async ({ value }) => {
      const parsed = publicAppointmentCancellationSchema.safeParse(value);

      if (!parsed.success) {
        setSubmitError(
          parsed.error.issues[0]?.message ??
            dictionary.booking.appointmentDetail.cancel.submitFailed,
        );
        return;
      }

      try {
        const appointment = await cancelMutation.mutateAsync({
          code,
          payload: mapPublicAppointmentCancellationToPayload(parsed.data),
        });

        setSubmitError(null);
        onCancelled(appointment);
      } catch (error) {
        setSubmitError(
          getApiErrorMessage(error) ??
            dictionary.booking.appointmentDetail.cancel.submitFailed,
        );
      }
    },
  });

  return (
    <Card className="border-danger/20">
      <CardHeader>
        <CardTitle>{dictionary.booking.appointmentDetail.cancel.title}</CardTitle>
        <CardDescription>
          {dictionary.booking.appointmentDetail.cancel.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-0">
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <form.Field name="reason">
            {(field) => (
              <FormField
                label={dictionary.booking.appointmentDetail.cancel.reasonLabel}
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
                    dictionary.booking.appointmentDetail.cancel.reasonPlaceholder
                  }
                  rows={3}
                />
              </FormField>
            )}
          </form.Field>

          <form.Field name="details">
            {(field) => (
              <FormField
                label={dictionary.booking.appointmentDetail.cancel.detailsLabel}
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
                    dictionary.booking.appointmentDetail.cancel.detailsPlaceholder
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
                  variant="danger"
                  disabled={isSubmitting || cancelMutation.isPending}
                >
                  {isSubmitting || cancelMutation.isPending
                    ? dictionary.booking.appointmentDetail.cancel.submitting
                    : dictionary.booking.appointmentDetail.cancel.submit}
                </Button>
                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  onClick={onClose}
                >
                  {dictionary.booking.appointmentDetail.cancel.keepAppointment}
                </Button>
              </div>
            )}
          </form.Subscribe>
        </form>
      </CardContent>
    </Card>
  );
}
