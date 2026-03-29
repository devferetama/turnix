"use client";

import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

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
import { Badge } from "@/components/ui/atoms/badge";
import { FormField } from "@/components/ui/molecules/form-field";
import { StatusBadge } from "@/components/ui/molecules/status-badge";
import { ROUTES } from "@/config/routes";
import { cn, formatCalendarDate, formatTimeRange } from "@/lib/utils";
import { getApiErrorMessage } from "@/modules/auth/utils/auth-error";
import {
  useBookingFlow,
  useCreatePublicBookingMutation,
  usePublicServicesQuery,
  usePublicSlotsQuery,
} from "@/modules/public-booking/hooks/use-public-booking";
import {
  getPublicBookingFormDefaults,
  mapPublicBookingFormValuesToPayload,
  publicBookingFormSchema,
} from "@/modules/public-booking/schemas/public-booking.schema";
import { useI18n } from "@/providers/i18n-provider";

function getErrorText(error: unknown) {
  return typeof error === "string" ? error : undefined;
}

export function PublicBookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dictionary, locale } = useI18n();
  const {
    selectedService,
    selectedSlot,
    draft,
    setDraft,
    setSelectedService,
    setSelectedSlot,
    clearSelectedSlot,
    setConfirmation,
  } = useBookingFlow();
  const servicesQuery = usePublicServicesQuery();
  const mutation = useCreatePublicBookingMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState(draft.branchId ?? "");
  const requestedServiceId =
    searchParams.get("serviceId") ?? selectedService?.id ?? draft.serviceId ?? "";
  const resolvedService =
    selectedService && selectedService.id === requestedServiceId
      ? selectedService
      : (servicesQuery.data ?? []).find((service) => service.id === requestedServiceId);

  const slotFilters = selectedDate
    ? {
        dateFrom: selectedDate,
        dateTo: selectedDate,
      }
    : {};
  const slotsQuery = usePublicSlotsQuery(resolvedService?.id, slotFilters);
  const slots = slotsQuery.data ?? [];
  const branchOptions = Array.from(
    new Map(slots.map((slot) => [slot.branch.id, slot.branch])).values(),
  );
  const activeBranchId = resolvedService?.branchId ?? selectedBranchId;
  const availableSlots = slots.filter(
    (slot) =>
      slot.availableCapacity > 0 &&
      (!activeBranchId || slot.branchId === activeBranchId),
  );
  const groupedSlots = availableSlots.reduce<
    Array<{ dateKey: string; slots: typeof availableSlots }>
  >((groups, slot) => {
    const dateKey = slot.startsAt.slice(0, 10);
    const existingGroup = groups.find((group) => group.dateKey === dateKey);

    if (existingGroup) {
      existingGroup.slots.push(slot);
      return groups;
    }

    groups.push({
      dateKey,
      slots: [slot],
    });

    return groups;
  }, []);

  const form = useForm({
    defaultValues: getPublicBookingFormDefaults(draft),
    onSubmit: async ({ value }) => {
      if (!resolvedService) {
        setSubmitError(dictionary.booking.form.selectServiceFirstDescription);
        return;
      }

      const parsed = publicBookingFormSchema.safeParse(value);

      if (!parsed.success) {
        setSubmitError(dictionary.booking.form.incompleteDetails);
        return;
      }

      if (!selectedSlot) {
        setSubmitError(dictionary.booking.form.slotError);
        return;
      }

      setSubmitError(null);
      setDraft(parsed.data);

      try {
        const confirmation = await mutation.mutateAsync(
          mapPublicBookingFormValuesToPayload(
            parsed.data,
            resolvedService.id,
            selectedSlot,
          ),
        );

        setConfirmation(confirmation);
        router.push(ROUTES.bookingConfirmation);
      } catch (error) {
        setSubmitError(
          getApiErrorMessage(error) ?? dictionary.booking.form.submitFailed,
        );
      }
    },
  });

  useEffect(() => {
    if (
      resolvedService &&
      (!selectedService || selectedService.id !== resolvedService.id)
    ) {
      setSelectedService(resolvedService);
    }
  }, [resolvedService, selectedService, setSelectedService]);

  useEffect(() => {
    form.setFieldValue("slotId", selectedSlot?.id ?? "");
  }, [form, selectedSlot?.id]);

  useEffect(() => {
    if (
      selectedSlot &&
      !availableSlots.some((slot) => slot.id === selectedSlot.id)
    ) {
      clearSelectedSlot();
    }
  }, [availableSlots, clearSelectedSlot, selectedSlot]);

  const hasSelectedService = Boolean(resolvedService);
  const serviceLoadFailed =
    !servicesQuery.isPending &&
    requestedServiceId &&
    !resolvedService &&
    !servicesQuery.isError;
  const isLoadingSlots = slotsQuery.isPending && !slotsQuery.data;

  if (!hasSelectedService && servicesQuery.isPending && requestedServiceId) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 p-8 text-sm text-muted-foreground">
          <Spinner size="sm" />
          {dictionary.booking.form.loadingService}
        </CardContent>
      </Card>
    );
  }

  if (!hasSelectedService && serviceLoadFailed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{dictionary.booking.form.serviceNotFoundTitle}</CardTitle>
          <CardDescription>
            {dictionary.booking.form.serviceNotFoundDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href={ROUTES.bookingServices}>
              {dictionary.common.actions.browseServices}
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!hasSelectedService && servicesQuery.isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{dictionary.booking.form.serviceLoadErrorTitle}</CardTitle>
          <CardDescription>
            {getApiErrorMessage(servicesQuery.error) ??
              dictionary.booking.form.serviceLoadErrorDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href={ROUTES.bookingServices}>
                {dictionary.common.actions.browseServices}
              </Link>
            </Button>
            <Button variant="outline" onClick={() => void servicesQuery.refetch()}>
              {dictionary.booking.form.retryServices}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!resolvedService) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{dictionary.booking.form.selectServiceFirstTitle}</CardTitle>
          <CardDescription>
            {dictionary.booking.form.selectServiceFirstDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href={ROUTES.bookingServices}>
              {dictionary.common.actions.browseServices}
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const service = resolvedService;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(320px,0.88fr)_minmax(0,1.12fr)]">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary">
              {dictionary.services.options.mode[service.mode]}
            </Badge>
            <Badge variant={service.requiresApproval ? "warning" : "success"}>
              {service.requiresApproval
                ? dictionary.booking.servicesPage.requiresApproval
                : dictionary.booking.servicesPage.instantConfirmation}
            </Badge>
          </div>
          <CardTitle>{service.name}</CardTitle>
          <CardDescription>
            {service.durationMinutes}{" "}
            {dictionary.booking.form.preparedAppointment}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="rounded-[1.25rem] border border-border/70 bg-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              {dictionary.booking.flow.stepLabel} 1
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {dictionary.booking.form.selectedService}
            </p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {service.description ||
                dictionary.booking.form.selectedServiceDescription}
            </p>
          </div>
          <div className="grid gap-3">
            <div className="rounded-[1.25rem] border border-border/70 bg-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                {dictionary.booking.flow.stepLabel} 2
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {dictionary.booking.form.branchSummaryLabel}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {service.branch?.name ??
                  dictionary.booking.form.branchSummaryDescription}
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-border/70 bg-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                {dictionary.booking.flow.stepLabel} 3
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {dictionary.booking.form.confirmationSummaryLabel}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {service.requiresApproval
                  ? dictionary.booking.form.confirmationSummaryApproval
                  : dictionary.booking.form.confirmationSummaryInstant}
              </p>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link href={ROUTES.bookingServices}>
              {dictionary.common.actions.changeService}
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{dictionary.booking.form.chooseTimeTitle}</CardTitle>
          <CardDescription>{dictionary.booking.form.chooseTimeDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-0">
          <div className="space-y-3">
            <div className="grid gap-4 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <FormField
                label={dictionary.booking.form.dateFilterLabel}
                htmlFor="booking-date-filter"
                hint={dictionary.booking.form.dateFilterHint}
              >
                <Input
                  id="booking-date-filter"
                  type="date"
                  value={selectedDate}
                  onChange={(event) => {
                    setSelectedDate(event.target.value);
                    clearSelectedSlot();
                  }}
                />
              </FormField>

              {branchOptions.length > 1 ? (
                <FormField
                  label={dictionary.booking.form.branchFilterLabel}
                  htmlFor="booking-branch-filter"
                  hint={dictionary.booking.form.branchFilterHint}
                >
                  <Select
                    id="booking-branch-filter"
                    value={activeBranchId}
                    onChange={(event) => {
                      setSelectedBranchId(event.target.value);
                      clearSelectedSlot();
                    }}
                  >
                    <option value="">
                      {dictionary.booking.form.branchFilterAll}
                    </option>
                    {branchOptions.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </Select>
                </FormField>
              ) : null}
            </div>

            <form.Field
              name="slotId"
              validators={{
                onSubmit: ({ value }) =>
                  value.trim().length > 0
                    ? undefined
                    : dictionary.booking.form.slotError,
              }}
            >
              {(field) => (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">
                    {dictionary.common.labels.availableSlots}
                  </p>

                  {isLoadingSlots ? (
                    <div className="rounded-[1.25rem] border border-border/70 bg-surface p-4 text-sm text-muted-foreground">
                      {dictionary.booking.form.loadingTimes}
                    </div>
                  ) : slotsQuery.isError ? (
                    <div className="rounded-[1.25rem] border border-danger/20 bg-surface p-4">
                      <p className="text-sm font-semibold text-foreground">
                        {dictionary.booking.form.slotLoadErrorTitle}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {getApiErrorMessage(slotsQuery.error) ??
                          dictionary.booking.form.slotLoadErrorDescription}
                      </p>
                      <div className="mt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => void slotsQuery.refetch()}
                        >
                          {dictionary.booking.form.retrySlots}
                        </Button>
                      </div>
                    </div>
                  ) : groupedSlots.length ? (
                    <div className="space-y-4">
                      {groupedSlots.map((group) => (
                        <div
                          key={group.dateKey}
                          className="rounded-[1.5rem] border border-border/70 bg-surface p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-foreground">
                              {formatCalendarDate(
                                group.slots[0].startsAt,
                                locale,
                                group.slots[0].branch.timezone,
                              )}
                            </p>
                            <span className="text-xs font-medium text-muted-foreground">
                              {group.slots.length}{" "}
                              {dictionary.booking.form.slotOptionsLabel}
                            </span>
                          </div>
                          <div className="mt-4 grid gap-3 md:grid-cols-2">
                            {group.slots.map((slot) => {
                              const isSelected = selectedSlot?.id === slot.id;

                              return (
                                <button
                                  key={slot.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedSlot(slot);
                                    field.handleChange(slot.id);
                                  }}
                                  className={cn(
                                    "rounded-[1.25rem] border p-4 text-left transition",
                                    isSelected
                                      ? "border-primary bg-primary/8 shadow-soft"
                                      : "border-border/70 bg-card hover:border-primary/40",
                                  )}
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm font-semibold text-foreground">
                                      {formatTimeRange(
                                        slot.startsAt,
                                        slot.endsAt,
                                        locale,
                                        slot.branch.timezone,
                                      )}
                                    </p>
                                    {isSelected ? (
                                      <StatusBadge status={slot.status} />
                                    ) : null}
                                  </div>
                                  <p className="mt-2 text-sm text-muted-foreground">
                                    {slot.branch.name}
                                  </p>
                                  <p className="mt-3 text-xs font-medium text-muted-foreground">
                                    {slot.availableCapacity}{" "}
                                    {dictionary.booking.form.slotsRemainingSuffix}
                                  </p>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-[1.25rem] border border-border/70 bg-surface p-4 text-sm text-muted-foreground">
                      {selectedDate
                        ? dictionary.booking.form.noSlotsForDate
                        : dictionary.booking.form.noSlots}
                    </div>
                  )}

                  {getErrorText(field.state.meta.errors[0]) ? (
                    <p className="text-sm text-danger">
                      {getErrorText(field.state.meta.errors[0])}
                    </p>
                  ) : null}
                </div>
              )}
            </form.Field>
          </div>

          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              void form.handleSubmit();
            }}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <form.Field
                name="firstName"
                validators={{
                  onBlur: ({ value }) =>
                    value.trim().length < 2
                      ? dictionary.booking.form.firstNameError
                      : undefined,
                }}
              >
                {(field) => (
                  <FormField
                    label={dictionary.booking.form.firstNameLabel}
                    htmlFor={field.name}
                    required
                    error={getErrorText(field.state.meta.errors[0])}
                  >
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        field.handleChange(event.target.value);
                        setDraft({ firstName: event.target.value });
                      }}
                      placeholder={dictionary.booking.form.firstNamePlaceholder}
                    />
                  </FormField>
                )}
              </form.Field>

              <form.Field
                name="lastName"
                validators={{
                  onBlur: ({ value }) =>
                    value.trim().length < 2
                      ? dictionary.booking.form.lastNameError
                      : undefined,
                }}
              >
                {(field) => (
                  <FormField
                    label={dictionary.booking.form.lastNameLabel}
                    htmlFor={field.name}
                    required
                    error={getErrorText(field.state.meta.errors[0])}
                  >
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        field.handleChange(event.target.value);
                        setDraft({ lastName: event.target.value });
                      }}
                      placeholder={dictionary.booking.form.lastNamePlaceholder}
                    />
                  </FormField>
                )}
              </form.Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <form.Field
                name="email"
                validators={{
                  onBlur: ({ value }) =>
                    publicBookingFormSchema.shape.email.safeParse(value).success
                      ? undefined
                      : dictionary.booking.form.emailError,
                }}
              >
                {(field) => (
                  <FormField
                    label={dictionary.common.labels.email}
                    htmlFor={field.name}
                    hint={dictionary.booking.form.optionalHint}
                    error={getErrorText(field.state.meta.errors[0])}
                  >
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        field.handleChange(event.target.value);
                        setDraft({ email: event.target.value });
                      }}
                      placeholder={dictionary.booking.form.emailPlaceholder}
                    />
                  </FormField>
                )}
              </form.Field>

              <form.Field name="phone">
                {(field) => (
                  <FormField
                    label={dictionary.booking.form.phoneLabel}
                    htmlFor={field.name}
                    hint={dictionary.booking.form.optionalHint}
                    error={getErrorText(field.state.meta.errors[0])}
                  >
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        field.handleChange(event.target.value);
                        setDraft({ phone: event.target.value });
                      }}
                      placeholder={dictionary.booking.form.phonePlaceholder}
                    />
                  </FormField>
                )}
              </form.Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <form.Field name="documentType">
                {(field) => (
                  <FormField
                    label={dictionary.booking.form.documentTypeLabel}
                    htmlFor={field.name}
                    hint={dictionary.booking.form.optionalHint}
                    error={getErrorText(field.state.meta.errors[0])}
                  >
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        field.handleChange(event.target.value);
                        setDraft({ documentType: event.target.value });
                      }}
                      placeholder={dictionary.booking.form.documentTypePlaceholder}
                    />
                  </FormField>
                )}
              </form.Field>

              <form.Field name="documentNumber">
                {(field) => (
                  <FormField
                    label={dictionary.booking.form.documentNumberLabel}
                    htmlFor={field.name}
                    hint={dictionary.booking.form.optionalHint}
                    error={getErrorText(field.state.meta.errors[0])}
                  >
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        field.handleChange(event.target.value);
                        setDraft({ documentNumber: event.target.value });
                      }}
                      placeholder={dictionary.booking.form.documentNumberPlaceholder}
                    />
                  </FormField>
                )}
              </form.Field>
            </div>

            <form.Field name="citizenNotes">
              {(field) => (
                <FormField
                  label={dictionary.booking.form.citizenNotesLabel}
                  htmlFor={field.name}
                  hint={dictionary.booking.form.optionalHint}
                  error={getErrorText(field.state.meta.errors[0])}
                >
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      field.handleChange(event.target.value);
                      setDraft({ citizenNotes: event.target.value });
                    }}
                    placeholder={dictionary.booking.form.citizenNotesPlaceholder}
                  />
                </FormField>
              )}
            </form.Field>

            {submitError ? (
              <p className="text-sm text-danger">{submitError}</p>
            ) : null}

            <form.Subscribe
              selector={(state) => [state.isSubmitting] as const}
            >
              {([isSubmitting]) => (
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting || mutation.isPending || !selectedSlot}
                  >
                    {isSubmitting || mutation.isPending
                      ? dictionary.booking.form.submitting
                      : dictionary.common.actions.confirmAppointment}
                  </Button>
                  {selectedDate ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSelectedDate("");
                        clearSelectedSlot();
                      }}
                    >
                      {dictionary.booking.form.clearDate}
                    </Button>
                  ) : null}
                </div>
              )}
            </form.Subscribe>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
