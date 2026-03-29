"use client";

import { useForm } from "@tanstack/react-form";
import { AnimatePresence, motion } from "motion/react";
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
import { cn } from "@/lib/utils";
import { useCreateServiceMutation, useUpdateServiceMutation } from "@/modules/services/hooks/use-service-mutations";
import { useServiceQuery } from "@/modules/services/hooks/use-service-query";
import {
  getServiceFormDefaults,
  mapServiceFormValuesToPayload,
  normalizeServiceSlug,
  serviceFormSchema,
} from "@/modules/services/schemas/service-form.schema";
import type { ServiceRecord } from "@/modules/services/types/service.types";
import { useI18n } from "@/providers/i18n-provider";

type ServiceEditorState =
  | {
      mode: "create";
    }
  | {
      mode: "edit";
      serviceId: string;
    }
  | null;

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

function parseIntegerInput(value: string, emptyValue = 0) {
  if (value === "") {
    return emptyValue;
  }

  const parsed = Number.parseInt(value, 10);

  return Number.isNaN(parsed) ? emptyValue : parsed;
}

function ServiceBooleanField({
  id,
  checked,
  disabled,
  title,
  description,
  onChange,
}: {
  id: string;
  checked: boolean;
  disabled?: boolean;
  title: string;
  description: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-[1.25rem] border p-4 transition",
        checked
          ? "border-primary/40 bg-primary/8"
          : "border-border/70 bg-surface",
        disabled ? "cursor-not-allowed opacity-70" : "hover:border-primary/30",
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
      />
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </label>
  );
}

function ServiceForm({
  mode,
  service,
  onCancel,
  onSuccess,
}: {
  mode: "create" | "edit";
  service?: ServiceRecord;
  onCancel: () => void;
  onSuccess: (service: ServiceRecord) => void;
}) {
  const { dictionary } = useI18n();
  const createMutation = useCreateServiceMutation();
  const updateMutation = useUpdateServiceMutation(service?.id ?? "");
  const mutation = mode === "create" ? createMutation : updateMutation;
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const form = useForm({
    defaultValues: getServiceFormDefaults(service),
    onSubmit: async ({ value }) => {
      const parsed = serviceFormSchema.safeParse(value);

      if (!parsed.success) {
        setSubmitSuccess(null);
        setSubmitError(dictionary.services.form.validationError);
        return;
      }

      try {
        const savedService =
          mode === "create"
            ? await createMutation.mutateAsync(
                mapServiceFormValuesToPayload(parsed.data),
              )
            : await updateMutation.mutateAsync(
                mapServiceFormValuesToPayload(parsed.data),
              );

        setSubmitError(null);
        setSubmitSuccess(
          mode === "create"
            ? dictionary.services.form.createReady
            : dictionary.services.form.updateReady,
        );
        onSuccess(savedService);
      } catch (error) {
        setSubmitSuccess(null);
        setSubmitError(
          getApiErrorMessage(
            error,
            mode === "create"
              ? dictionary.services.form.createFailed
              : dictionary.services.form.updateFailed,
          ),
        );
      }
    },
  });

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <div className="space-y-5">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {dictionary.services.form.generalTitle}
          </p>
        </div>

        <div className="grid gap-5">
          <form.Field
            name="name"
            validators={{
              onBlur: ({ value }) =>
                serviceFormSchema.shape.name.safeParse(value).success
                  ? undefined
                  : dictionary.services.form.nameError,
            }}
          >
            {(field) => (
              <FormField
                label={dictionary.services.form.nameLabel}
                htmlFor={field.name}
                required
                error={getErrorText(field.state.meta.errors[0])}
              >
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
              </FormField>
            )}
          </form.Field>

          <form.Field
            name="slug"
            validators={{
              onBlur: ({ value }) =>
                serviceFormSchema.shape.slug.safeParse(value).success
                  ? undefined
                  : dictionary.services.form.slugError,
            }}
          >
            {(field) => (
              <FormField
                label={dictionary.services.form.slugLabel}
                htmlFor={field.name}
                required
                hint={dictionary.services.form.slugHint}
                error={getErrorText(field.state.meta.errors[0])}
              >
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={() => {
                    field.handleChange(normalizeServiceSlug(field.state.value));
                    field.handleBlur();
                  }}
                  onChange={(event) =>
                    field.handleChange(normalizeServiceSlug(event.target.value))
                  }
                  placeholder={dictionary.services.form.slugPlaceholder}
                />
              </FormField>
            )}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <FormField
                label={dictionary.services.form.descriptionLabel}
                htmlFor={field.name}
                error={getErrorText(field.state.meta.errors[0])}
              >
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder={dictionary.services.form.descriptionPlaceholder}
                />
              </FormField>
            )}
          </form.Field>

          <div className="grid gap-5 md:grid-cols-2">
            <form.Field name="visibility">
              {(field) => (
                <FormField
                  label={dictionary.services.form.visibilityLabel}
                  htmlFor={field.name}
                >
                  <Select
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value as never)}
                  >
                    <option value="PUBLIC">
                      {dictionary.services.options.visibility.PUBLIC}
                    </option>
                    <option value="PRIVATE">
                      {dictionary.services.options.visibility.PRIVATE}
                    </option>
                    <option value="INTERNAL">
                      {dictionary.services.options.visibility.INTERNAL}
                    </option>
                  </Select>
                </FormField>
              )}
            </form.Field>

            <form.Field name="mode">
              {(field) => (
                <FormField
                  label={dictionary.services.form.modeLabel}
                  htmlFor={field.name}
                >
                  <Select
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value as never)}
                  >
                    <option value="IN_PERSON">
                      {dictionary.services.options.mode.IN_PERSON}
                    </option>
                    <option value="REMOTE">
                      {dictionary.services.options.mode.REMOTE}
                    </option>
                    <option value="HYBRID">
                      {dictionary.services.options.mode.HYBRID}
                    </option>
                  </Select>
                </FormField>
              )}
            </form.Field>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {dictionary.services.form.planningTitle}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <form.Field
            name="durationMinutes"
            validators={{
              onBlur: ({ value }) =>
                serviceFormSchema.shape.durationMinutes.safeParse(value).success
                  ? undefined
                  : dictionary.services.form.durationError,
            }}
          >
            {(field) => (
              <FormField
                label={dictionary.services.form.durationLabel}
                htmlFor={field.name}
                required
                error={getErrorText(field.state.meta.errors[0])}
              >
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  min={1}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange(parseIntegerInput(event.target.value))
                  }
                />
              </FormField>
            )}
          </form.Field>

          <form.Field
            name="slotCapacity"
            validators={{
              onBlur: ({ value }) =>
                serviceFormSchema.shape.slotCapacity.safeParse(value).success
                  ? undefined
                  : dictionary.services.form.slotCapacityError,
            }}
          >
            {(field) => (
              <FormField
                label={dictionary.services.form.slotCapacityLabel}
                htmlFor={field.name}
                error={getErrorText(field.state.meta.errors[0])}
              >
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  min={1}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange(parseIntegerInput(event.target.value, 1))
                  }
                />
              </FormField>
            )}
          </form.Field>

          <form.Field
            name="bufferBeforeMinutes"
            validators={{
              onBlur: ({ value }) =>
                serviceFormSchema.shape.bufferBeforeMinutes.safeParse(value).success
                  ? undefined
                  : dictionary.services.form.bufferError,
            }}
          >
            {(field) => (
              <FormField
                label={dictionary.services.form.bufferBeforeLabel}
                htmlFor={field.name}
                error={getErrorText(field.state.meta.errors[0])}
              >
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  min={0}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange(parseIntegerInput(event.target.value))
                  }
                />
              </FormField>
            )}
          </form.Field>

          <form.Field
            name="bufferAfterMinutes"
            validators={{
              onBlur: ({ value }) =>
                serviceFormSchema.shape.bufferAfterMinutes.safeParse(value).success
                  ? undefined
                  : dictionary.services.form.bufferError,
            }}
          >
            {(field) => (
              <FormField
                label={dictionary.services.form.bufferAfterLabel}
                htmlFor={field.name}
                error={getErrorText(field.state.meta.errors[0])}
              >
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  min={0}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange(parseIntegerInput(event.target.value))
                  }
                />
              </FormField>
            )}
          </form.Field>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {dictionary.services.form.rulesTitle}
          </p>
        </div>

        <div className="grid gap-3">
          <form.Field name="allowOnlineBooking">
            {(field) => (
              <ServiceBooleanField
                id={field.name}
                checked={field.state.value}
                onChange={field.handleChange}
                title={dictionary.services.form.allowOnlineBookingTitle}
                description={
                  dictionary.services.form.allowOnlineBookingDescription
                }
              />
            )}
          </form.Field>

          <form.Field name="requiresApproval">
            {(field) => (
              <ServiceBooleanField
                id={field.name}
                checked={field.state.value}
                onChange={field.handleChange}
                title={dictionary.services.form.requiresApprovalTitle}
                description={dictionary.services.form.requiresApprovalDescription}
              />
            )}
          </form.Field>

          <form.Field name="requiresAuthentication">
            {(field) => (
              <ServiceBooleanField
                id={field.name}
                checked={field.state.value}
                onChange={field.handleChange}
                title={dictionary.services.form.requiresAuthenticationTitle}
                description={
                  dictionary.services.form.requiresAuthenticationDescription
                }
              />
            )}
          </form.Field>

          <form.Field name="allowsCancellation">
            {(field) => (
              <ServiceBooleanField
                id={field.name}
                checked={field.state.value}
                onChange={field.handleChange}
                title={dictionary.services.form.allowsCancellationTitle}
                description={
                  dictionary.services.form.allowsCancellationDescription
                }
              />
            )}
          </form.Field>

          <form.Field name="allowsReschedule">
            {(field) => (
              <ServiceBooleanField
                id={field.name}
                checked={field.state.value}
                onChange={field.handleChange}
                title={dictionary.services.form.allowsRescheduleTitle}
                description={
                  dictionary.services.form.allowsRescheduleDescription
                }
              />
            )}
          </form.Field>

          <form.Field name="isActive">
            {(field) => (
              <ServiceBooleanField
                id={field.name}
                checked={field.state.value}
                onChange={field.handleChange}
                title={dictionary.services.form.isActiveTitle}
                description={dictionary.services.form.isActiveDescription}
              />
            )}
          </form.Field>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {dictionary.services.form.linkingTitle}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <form.Field
            name="branchId"
            validators={{
              onBlur: ({ value }) =>
                serviceFormSchema.shape.branchId.safeParse(value).success
                  ? undefined
                  : dictionary.services.form.referenceError,
            }}
          >
            {(field) => (
              <FormField
                label={dictionary.services.form.branchIdLabel}
                htmlFor={field.name}
                hint={dictionary.services.form.branchIdHint}
                error={getErrorText(field.state.meta.errors[0])}
              >
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder={dictionary.services.form.branchIdPlaceholder}
                />
              </FormField>
            )}
          </form.Field>

          <form.Field
            name="categoryId"
            validators={{
              onBlur: ({ value }) =>
                serviceFormSchema.shape.categoryId.safeParse(value).success
                  ? undefined
                  : dictionary.services.form.referenceError,
            }}
          >
            {(field) => (
              <FormField
                label={dictionary.services.form.categoryIdLabel}
                htmlFor={field.name}
                hint={dictionary.services.form.categoryIdHint}
                error={getErrorText(field.state.meta.errors[0])}
              >
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder={dictionary.services.form.categoryIdPlaceholder}
                />
              </FormField>
            )}
          </form.Field>
        </div>
      </div>

      {submitError ? <p className="text-sm text-danger">{submitError}</p> : null}
      {submitSuccess ? (
        <p className="text-sm text-success">{submitSuccess}</p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onCancel}>
          {dictionary.services.actions.closeEditor}
        </Button>
        <form.Subscribe selector={(state) => [state.isSubmitting] as const}>
          {([isSubmitting]) => (
            <Button type="submit" disabled={isSubmitting || mutation.isPending}>
              {isSubmitting || mutation.isPending
                ? mode === "create"
                  ? dictionary.services.form.creating
                  : dictionary.services.form.updating
                : mode === "create"
                  ? dictionary.services.form.submitCreate
                  : dictionary.services.form.submitUpdate}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}

export function ServiceFormPanel({
  editorState,
  initialService,
  onClose,
  onSaved,
}: {
  editorState: ServiceEditorState;
  initialService?: ServiceRecord;
  onClose: () => void;
  onSaved: (service: ServiceRecord) => void;
}) {
  const { dictionary } = useI18n();
  const detailQuery = useServiceQuery(
    editorState?.mode === "edit" ? editorState.serviceId : undefined,
    initialService,
  );

  if (!editorState) {
    return (
      <Card className="xl:sticky xl:top-6">
        <CardHeader>
          <CardTitle>{dictionary.services.editor.emptyTitle}</CardTitle>
          <CardDescription>
            {dictionary.services.editor.emptyDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="rounded-[1.25rem] border border-border/70 bg-surface p-4 text-sm leading-6 text-muted-foreground">
            {dictionary.services.editor.emptyHint}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (
    editorState.mode === "edit" &&
    detailQuery.isPending &&
    !detailQuery.data
  ) {
    return (
      <Card className="xl:sticky xl:top-6">
        <CardHeader>
          <CardTitle>{dictionary.services.editor.loading}</CardTitle>
          <CardDescription>
            {dictionary.services.editor.editDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-3 pt-0 text-sm text-muted-foreground">
          <Spinner size="sm" />
          {dictionary.services.editor.loading}
        </CardContent>
      </Card>
    );
  }

  if (editorState.mode === "edit" && detailQuery.isError && !detailQuery.data) {
    return (
      <Card className="xl:sticky xl:top-6">
        <CardHeader>
          <CardTitle>{dictionary.services.editor.loadErrorTitle}</CardTitle>
          <CardDescription>
            {dictionary.services.editor.loadError}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pt-0">
          <Button variant="outline" onClick={() => void detailQuery.refetch()}>
            {dictionary.services.actions.retry}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            {dictionary.services.actions.closeEditor}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const service = editorState.mode === "edit" ? detailQuery.data : undefined;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={editorState.mode === "create" ? "create-service" : service?.id ?? "edit-service"}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 12 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="xl:sticky xl:top-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>
              {editorState.mode === "create"
                ? dictionary.services.editor.createTitle
                : service?.name ?? dictionary.services.editor.editTitle}
            </CardTitle>
            <CardDescription>
              {editorState.mode === "create"
                ? dictionary.services.editor.createDescription
                : dictionary.services.editor.editDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ServiceForm
              key={editorState.mode === "create" ? "create-form" : service?.id ?? "edit-form"}
              mode={editorState.mode}
              service={service}
              onCancel={onClose}
              onSuccess={onSaved}
            />
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
