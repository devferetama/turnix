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
import { useCreateAppointmentMutation } from "@/modules/appointments/hooks/use-appointment-mutations";
import { useAppointmentSlotOptionsQuery } from "@/modules/appointments/hooks/use-appointment-slot-options-query";
import {
  appointmentFormSchema,
  getAppointmentFormDefaults,
  mapAppointmentFormValuesToPayload,
} from "@/modules/appointments/schemas/appointment-form.schema";
import type { AppointmentRecord } from "@/modules/appointments/types/appointment.types";
import { useBranchesQuery } from "@/modules/branches/hooks/use-branches-query";
import { useServicesQuery } from "@/modules/services/hooks/use-services-query";
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

export function AppointmentCreatePanel({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (appointment: AppointmentRecord) => void;
}) {
  const { dictionary, locale } = useI18n();
  const createMutation = useCreateAppointmentMutation();
  const branchesQuery = useBranchesQuery({ isActive: true });
  const servicesQuery = useServicesQuery({ isActive: true });
  const defaults = getAppointmentFormDefaults();
  const [selectedBranchId, setSelectedBranchId] = useState(defaults.branchId);
  const [selectedServiceId, setSelectedServiceId] = useState(defaults.serviceId);
  const [selectedDate, setSelectedDate] = useState(defaults.selectedDate);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const availableServices = (servicesQuery.data ?? []).filter(
    (service) =>
      !selectedBranchId || !service.branchId || service.branchId === selectedBranchId,
  );
  const slotOptionsQuery = useAppointmentSlotOptionsQuery({
    branchId: selectedBranchId || undefined,
    serviceId: selectedServiceId || undefined,
    date: selectedDate || undefined,
  });

  const form = useForm({
    defaultValues: defaults,
    onSubmit: async ({ value }) => {
      const parsed = appointmentFormSchema.safeParse(value);

      if (!parsed.success) {
        setSubmitSuccess(null);
        setSubmitError(dictionary.appointments.form.validationError);
        return;
      }

      try {
        const createdAppointment = await createMutation.mutateAsync(
          mapAppointmentFormValuesToPayload(parsed.data),
        );

        setSubmitError(null);
        setSubmitSuccess(dictionary.appointments.form.createReady);
        onCreated(createdAppointment);
      } catch (error) {
        setSubmitSuccess(null);
        setSubmitError(
          getApiErrorMessage(error, dictionary.appointments.form.createFailed),
        );
      }
    },
  });

  const areLookupsLoading =
    branchesQuery.isPending ||
    servicesQuery.isPending ||
    (selectedBranchId && selectedServiceId && selectedDate && slotOptionsQuery.isPending);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dictionary.appointments.editor.createTitle}</CardTitle>
        <CardDescription>
          {dictionary.appointments.editor.createDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-0">
        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <div className="space-y-5">
            <p className="text-sm font-semibold text-foreground">
              {dictionary.appointments.form.schedulingTitle}
            </p>

            <div className="grid gap-5">
              <form.Field
                name="branchId"
                validators={{
                  onBlur: ({ value }) =>
                    value.trim().length > 0
                      ? undefined
                      : dictionary.appointments.form.branchError,
                }}
              >
                {(field) => (
                  <FormField
                    label={dictionary.appointments.form.branchLabel}
                    htmlFor={field.name}
                    required
                    error={getErrorText(field.state.meta.errors[0])}
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
                      }}
                    >
                      <option value="">
                        {dictionary.appointments.form.branchPlaceholder}
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

              <form.Field
                name="serviceId"
                validators={{
                  onBlur: ({ value }) =>
                    value.trim().length > 0
                      ? undefined
                      : dictionary.appointments.form.serviceError,
                }}
              >
                {(field) => (
                  <FormField
                    label={dictionary.appointments.form.serviceLabel}
                    htmlFor={field.name}
                    required
                    error={getErrorText(field.state.meta.errors[0])}
                  >
                    <Select
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        const nextValue = event.target.value;
                        field.handleChange(nextValue);
                        setSelectedServiceId(nextValue);
                        form.setFieldValue("slotId", "");
                      }}
                    >
                      <option value="">
                        {dictionary.appointments.form.servicePlaceholder}
                      </option>
                      {availableServices.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                )}
              </form.Field>

              <form.Field
                name="selectedDate"
                validators={{
                  onBlur: ({ value }) =>
                    value.trim().length > 0
                      ? undefined
                      : dictionary.appointments.form.dateError,
                }}
              >
                {(field) => (
                  <FormField
                    label={dictionary.appointments.form.dateLabel}
                    htmlFor={field.name}
                    required
                    error={getErrorText(field.state.meta.errors[0])}
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
                      }}
                    />
                  </FormField>
                )}
              </form.Field>

              <form.Field
                name="slotId"
                validators={{
                  onBlur: ({ value }) =>
                    value.trim().length > 0
                      ? undefined
                      : dictionary.appointments.form.slotError,
                }}
              >
                {(field) => {
                  const slotLookupMode = slotOptionsQuery.data?.mode ?? "manual";
                  const slotOptions = slotOptionsQuery.data?.items ?? [];
                  const showManualInput =
                    slotLookupMode === "manual" || slotOptionsQuery.isError;

                  return (
                    <FormField
                      label={dictionary.appointments.form.slotLabel}
                      htmlFor={field.name}
                      required
                      hint={
                        showManualInput
                          ? dictionary.appointments.form.slotManualHint
                          : undefined
                      }
                      error={getErrorText(field.state.meta.errors[0])}
                    >
                      {slotOptionsQuery.isPending ? (
                        <div className="flex items-center gap-3 rounded-[1.25rem] border border-border/70 bg-surface px-4 py-3 text-sm text-muted-foreground">
                          <Spinner size="sm" />
                          {dictionary.appointments.form.slotLoading}
                        </div>
                      ) : showManualInput ? (
                        <div className="space-y-3">
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(event) =>
                              field.handleChange(event.target.value)
                            }
                            placeholder={
                              dictionary.appointments.form.slotManualPlaceholder
                            }
                          />
                          <p className="text-sm leading-6 text-muted-foreground">
                            {slotOptionsQuery.isError
                              ? getApiErrorMessage(
                                  slotOptionsQuery.error,
                                  dictionary.appointments.form.slotManualDescription,
                                )
                              : dictionary.appointments.form.slotManualDescription}
                          </p>
                        </div>
                      ) : slotOptions.length ? (
                        <div className="space-y-3">
                          <Select
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(event) =>
                              field.handleChange(event.target.value)
                            }
                          >
                            <option value="">
                              {dictionary.appointments.form.slotPlaceholder}
                            </option>
                            {slotOptions.map((slot) => (
                              <option key={slot.id} value={slot.id}>
                                {`${formatDateTime(slot.startsAt, locale)} · ${formatTimeRange(
                                  slot.startsAt,
                                  slot.endsAt,
                                  locale,
                                )}`}
                              </option>
                            ))}
                          </Select>
                          <div className="grid gap-3">
                            {slotOptions.map((slot) => {
                              const isSelected = field.state.value === slot.id;

                              return (
                                <button
                                  key={`${slot.id}-preview`}
                                  type="button"
                                  onClick={() => field.handleChange(slot.id)}
                                  className={cn(
                                    "rounded-[1.25rem] border p-4 text-left transition",
                                    isSelected
                                      ? "border-primary bg-primary/8"
                                      : "border-border/70 bg-surface hover:border-primary/40",
                                  )}
                                >
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
                                  <p className="mt-2 text-xs font-medium text-muted-foreground">
                                    {getSlotAvailabilityLabel(
                                      slot.capacity,
                                      slot.reservedCount,
                                      dictionary.appointments.form.slotAvailabilityLabel,
                                    )}
                                  </p>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-[1.25rem] border border-border/70 bg-surface p-4 text-sm leading-6 text-muted-foreground">
                          {dictionary.appointments.form.slotEmpty}
                        </div>
                      )}
                    </FormField>
                  );
                }}
              </form.Field>
            </div>
          </div>

          <div className="space-y-5">
            <p className="text-sm font-semibold text-foreground">
              {dictionary.appointments.form.citizenTitle}
            </p>

            <form.Field name="citizenMode">
              {(field) => (
                <FormField
                  label={dictionary.appointments.form.citizenModeLabel}
                  htmlFor={field.name}
                >
                  <Select
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) =>
                      field.handleChange(
                        event.target.value as "existing" | "create",
                      )
                    }
                  >
                    <option value="create">
                      {dictionary.appointments.form.citizenModeCreate}
                    </option>
                    <option value="existing">
                      {dictionary.appointments.form.citizenModeExisting}
                    </option>
                  </Select>
                </FormField>
              )}
            </form.Field>

            <form.Subscribe
              selector={(state) => state.values.citizenMode}
            >
              {(citizenMode) =>
                citizenMode === "existing" ? (
                  <form.Field
                    name="citizenId"
                    validators={{
                      onBlur: ({ value }) =>
                        value.trim().length > 0
                          ? undefined
                          : dictionary.appointments.form.citizenIdError,
                    }}
                  >
                    {(field) => (
                      <FormField
                        label={dictionary.appointments.form.citizenIdLabel}
                        htmlFor={field.name}
                        hint={dictionary.appointments.form.citizenIdHint}
                        required
                        error={getErrorText(field.state.meta.errors[0])}
                      >
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          placeholder={dictionary.appointments.form.citizenIdPlaceholder}
                        />
                      </FormField>
                    )}
                  </form.Field>
                ) : (
                  <div className="grid gap-5 md:grid-cols-2">
                    <form.Field
                      name="citizenFirstName"
                      validators={{
                        onBlur: ({ value }) =>
                          value.trim().length > 0
                            ? undefined
                            : dictionary.appointments.form.citizenFirstNameError,
                      }}
                    >
                      {(field) => (
                        <FormField
                          label={dictionary.appointments.form.citizenFirstNameLabel}
                          htmlFor={field.name}
                          required
                          error={getErrorText(field.state.meta.errors[0])}
                        >
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(event) =>
                              field.handleChange(event.target.value)
                            }
                          />
                        </FormField>
                      )}
                    </form.Field>

                    <form.Field
                      name="citizenLastName"
                      validators={{
                        onBlur: ({ value }) =>
                          value.trim().length > 0
                            ? undefined
                            : dictionary.appointments.form.citizenLastNameError,
                      }}
                    >
                      {(field) => (
                        <FormField
                          label={dictionary.appointments.form.citizenLastNameLabel}
                          htmlFor={field.name}
                          required
                          error={getErrorText(field.state.meta.errors[0])}
                        >
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(event) =>
                              field.handleChange(event.target.value)
                            }
                          />
                        </FormField>
                      )}
                    </form.Field>

                    <form.Field
                      name="citizenEmail"
                      validators={{
                        onBlur: ({ value }) =>
                          appointmentFormSchema.shape.citizenEmail.safeParse(value)
                            .success
                            ? undefined
                            : dictionary.appointments.form.citizenEmailError,
                      }}
                    >
                      {(field) => (
                        <FormField
                          label={dictionary.appointments.form.citizenEmailLabel}
                          htmlFor={field.name}
                          error={getErrorText(field.state.meta.errors[0])}
                        >
                          <Input
                            id={field.name}
                            name={field.name}
                            type="email"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(event) =>
                              field.handleChange(event.target.value)
                            }
                          />
                        </FormField>
                      )}
                    </form.Field>

                    <form.Field name="citizenPhone">
                      {(field) => (
                        <FormField
                          label={dictionary.appointments.form.citizenPhoneLabel}
                          htmlFor={field.name}
                          error={getErrorText(field.state.meta.errors[0])}
                        >
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(event) =>
                              field.handleChange(event.target.value)
                            }
                          />
                        </FormField>
                      )}
                    </form.Field>

                    <form.Field name="citizenDocumentType">
                      {(field) => (
                        <FormField
                          label={dictionary.appointments.form.citizenDocumentTypeLabel}
                          htmlFor={field.name}
                          error={getErrorText(field.state.meta.errors[0])}
                        >
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(event) =>
                              field.handleChange(event.target.value)
                            }
                          />
                        </FormField>
                      )}
                    </form.Field>

                    <form.Field name="citizenDocumentNumber">
                      {(field) => (
                        <FormField
                          label={dictionary.appointments.form.citizenDocumentNumberLabel}
                          htmlFor={field.name}
                          error={getErrorText(field.state.meta.errors[0])}
                        >
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(event) =>
                              field.handleChange(event.target.value)
                            }
                          />
                        </FormField>
                      )}
                    </form.Field>
                  </div>
                )
              }
            </form.Subscribe>
          </div>

          <div className="space-y-5">
            <p className="text-sm font-semibold text-foreground">
              {dictionary.appointments.form.assignmentTitle}
            </p>

            <div className="grid gap-5 md:grid-cols-2">
              <form.Field name="source">
                {(field) => (
                  <FormField
                    label={dictionary.appointments.form.sourceLabel}
                    htmlFor={field.name}
                  >
                    <Select
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(
                          event.target.value as AppointmentRecord["source"],
                        )
                      }
                    >
                      {Object.entries(dictionary.appointments.options.sources).map(
                        ([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ),
                      )}
                    </Select>
                  </FormField>
                )}
              </form.Field>

              <form.Field name="staffUserId">
                {(field) => (
                  <FormField
                    label={dictionary.appointments.form.staffUserIdLabel}
                    htmlFor={field.name}
                    hint={dictionary.appointments.form.staffUserIdHint}
                    error={getErrorText(field.state.meta.errors[0])}
                  >
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      placeholder={dictionary.appointments.form.staffUserIdPlaceholder}
                    />
                  </FormField>
                )}
              </form.Field>
            </div>
          </div>

          <div className="space-y-5">
            <p className="text-sm font-semibold text-foreground">
              {dictionary.appointments.form.notesTitle}
            </p>

            <div className="grid gap-5">
              <form.Field name="citizenNotes">
                {(field) => (
                  <FormField
                    label={dictionary.appointments.form.citizenNotesLabel}
                    htmlFor={field.name}
                    error={getErrorText(field.state.meta.errors[0])}
                  >
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                    />
                  </FormField>
                )}
              </form.Field>

              <form.Field name="internalNotes">
                {(field) => (
                  <FormField
                    label={dictionary.appointments.form.internalNotesLabel}
                    htmlFor={field.name}
                    error={getErrorText(field.state.meta.errors[0])}
                  >
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                    />
                  </FormField>
                )}
              </form.Field>
            </div>
          </div>

          {areLookupsLoading ? (
            <div className="flex items-center gap-3 rounded-[1.25rem] border border-border/70 bg-surface px-4 py-3 text-sm text-muted-foreground">
              <Spinner size="sm" />
              {dictionary.appointments.form.loadingLookups}
            </div>
          ) : null}

          {submitError ? <p className="text-sm text-danger">{submitError}</p> : null}
          {submitSuccess ? (
            <p className="text-sm text-success">{submitSuccess}</p>
          ) : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={onClose}>
              {dictionary.appointments.actions.closePanel}
            </Button>
            <form.Subscribe selector={(state) => [state.isSubmitting] as const}>
              {([isSubmitting]) => (
                <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
                  {isSubmitting || createMutation.isPending
                    ? dictionary.appointments.form.creating
                    : dictionary.appointments.form.submitCreate}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
