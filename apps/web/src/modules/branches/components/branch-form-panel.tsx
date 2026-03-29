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
import { Spinner } from "@/components/ui/atoms/spinner";
import { Textarea } from "@/components/ui/atoms/textarea";
import { FormField } from "@/components/ui/molecules/form-field";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { useBranchQuery } from "@/modules/branches/hooks/use-branch-query";
import {
  useCreateBranchMutation,
  useUpdateBranchMutation,
} from "@/modules/branches/hooks/use-branch-mutations";
import {
  branchFormSchema,
  getBranchFormDefaults,
  mapBranchFormValuesToPayload,
  normalizeBranchSlug,
} from "@/modules/branches/schemas/branch-form.schema";
import type { BranchRecord } from "@/modules/branches/types/branch.types";
import { useI18n } from "@/providers/i18n-provider";

type BranchEditorState =
  | {
      mode: "create";
    }
  | {
      mode: "edit";
      branchId: string;
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

function BranchBooleanField({
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

function BranchForm({
  mode,
  branch,
  onCancel,
  onSuccess,
}: {
  mode: "create" | "edit";
  branch?: BranchRecord;
  onCancel: () => void;
  onSuccess: (branch: BranchRecord) => void;
}) {
  const { dictionary } = useI18n();
  const createMutation = useCreateBranchMutation();
  const updateMutation = useUpdateBranchMutation(branch?.id ?? "");
  const mutation = mode === "create" ? createMutation : updateMutation;
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const form = useForm({
    defaultValues: getBranchFormDefaults(branch),
    onSubmit: async ({ value }) => {
      const parsed = branchFormSchema.safeParse(value);

      if (!parsed.success) {
        setSubmitSuccess(null);
        setSubmitError(dictionary.branches.form.validationError);
        return;
      }

      try {
        const savedBranch =
          mode === "create"
            ? await createMutation.mutateAsync(
                mapBranchFormValuesToPayload(parsed.data),
              )
            : await updateMutation.mutateAsync(
                mapBranchFormValuesToPayload(parsed.data),
              );

        setSubmitError(null);
        setSubmitSuccess(
          mode === "create"
            ? dictionary.branches.form.createReady
            : dictionary.branches.form.updateReady,
        );
        onSuccess(savedBranch);
      } catch (error) {
        setSubmitSuccess(null);
        setSubmitError(
          getApiErrorMessage(
            error,
            mode === "create"
              ? dictionary.branches.form.createFailed
              : dictionary.branches.form.updateFailed,
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
        <p className="text-sm font-semibold text-foreground">
          {dictionary.branches.form.generalTitle}
        </p>

        <div className="grid gap-5">
          <form.Field
            name="name"
            validators={{
              onBlur: ({ value }) =>
                branchFormSchema.shape.name.safeParse(value).success
                  ? undefined
                  : dictionary.branches.form.nameError,
            }}
          >
            {(field) => (
              <FormField
                label={dictionary.branches.form.nameLabel}
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
                branchFormSchema.shape.slug.safeParse(value).success
                  ? undefined
                  : dictionary.branches.form.slugError,
            }}
          >
            {(field) => (
              <FormField
                label={dictionary.branches.form.slugLabel}
                htmlFor={field.name}
                required
                hint={dictionary.branches.form.slugHint}
                error={getErrorText(field.state.meta.errors[0])}
              >
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={() => {
                    field.handleChange(normalizeBranchSlug(field.state.value));
                    field.handleBlur();
                  }}
                  onChange={(event) =>
                    field.handleChange(normalizeBranchSlug(event.target.value))
                  }
                  placeholder={dictionary.branches.form.slugPlaceholder}
                />
              </FormField>
            )}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <FormField
                label={dictionary.branches.form.descriptionLabel}
                htmlFor={field.name}
                error={getErrorText(field.state.meta.errors[0])}
              >
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder={dictionary.branches.form.descriptionPlaceholder}
                />
              </FormField>
            )}
          </form.Field>

          <form.Field name="timezone">
            {(field) => (
              <FormField
                label={dictionary.branches.form.timezoneLabel}
                htmlFor={field.name}
                hint={dictionary.branches.form.timezoneHint}
                error={getErrorText(field.state.meta.errors[0])}
              >
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder={dictionary.branches.form.timezonePlaceholder}
                />
              </FormField>
            )}
          </form.Field>
        </div>
      </div>

      <div className="space-y-5">
        <p className="text-sm font-semibold text-foreground">
          {dictionary.branches.form.locationTitle}
        </p>

        <div className="grid gap-5">
          <form.Field name="addressLine1">
            {(field) => (
              <FormField
                label={dictionary.branches.form.addressLine1Label}
                htmlFor={field.name}
                error={getErrorText(field.state.meta.errors[0])}
              >
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder={dictionary.branches.form.addressLine1Placeholder}
                />
              </FormField>
            )}
          </form.Field>

          <form.Field name="addressLine2">
            {(field) => (
              <FormField
                label={dictionary.branches.form.addressLine2Label}
                htmlFor={field.name}
                error={getErrorText(field.state.meta.errors[0])}
              >
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder={dictionary.branches.form.addressLine2Placeholder}
                />
              </FormField>
            )}
          </form.Field>

          <div className="grid gap-5 md:grid-cols-2">
            <form.Field name="city">
              {(field) => (
                <FormField
                  label={dictionary.branches.form.cityLabel}
                  htmlFor={field.name}
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

            <form.Field name="state">
              {(field) => (
                <FormField
                  label={dictionary.branches.form.stateLabel}
                  htmlFor={field.name}
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

            <form.Field name="country">
              {(field) => (
                <FormField
                  label={dictionary.branches.form.countryLabel}
                  htmlFor={field.name}
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

            <form.Field name="postalCode">
              {(field) => (
                <FormField
                  label={dictionary.branches.form.postalCodeLabel}
                  htmlFor={field.name}
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
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <p className="text-sm font-semibold text-foreground">
          {dictionary.branches.form.operationsTitle}
        </p>

        <form.Field name="isActive">
          {(field) => (
            <BranchBooleanField
              id={field.name}
              checked={field.state.value}
              onChange={field.handleChange}
              title={dictionary.branches.form.isActiveTitle}
              description={dictionary.branches.form.isActiveDescription}
            />
          )}
        </form.Field>
      </div>

      {submitError ? <p className="text-sm text-danger">{submitError}</p> : null}
      {submitSuccess ? (
        <p className="text-sm text-success">{submitSuccess}</p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onCancel}>
          {dictionary.branches.actions.closeEditor}
        </Button>
        <form.Subscribe selector={(state) => [state.isSubmitting] as const}>
          {([isSubmitting]) => (
            <Button type="submit" disabled={isSubmitting || mutation.isPending}>
              {isSubmitting || mutation.isPending
                ? mode === "create"
                  ? dictionary.branches.form.creating
                  : dictionary.branches.form.updating
                : mode === "create"
                  ? dictionary.branches.form.submitCreate
                  : dictionary.branches.form.submitUpdate}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}

export function BranchFormPanel({
  editorState,
  initialBranch,
  onClose,
  onSaved,
}: {
  editorState: BranchEditorState;
  initialBranch?: BranchRecord;
  onClose: () => void;
  onSaved: (branch: BranchRecord) => void;
}) {
  const { dictionary } = useI18n();
  const detailQuery = useBranchQuery(
    editorState?.mode === "edit" ? editorState.branchId : undefined,
    initialBranch,
  );

  if (!editorState) {
    return (
      <Card className="xl:sticky xl:top-6">
        <CardHeader>
          <CardTitle>{dictionary.branches.editor.emptyTitle}</CardTitle>
          <CardDescription>
            {dictionary.branches.editor.emptyDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="rounded-[1.25rem] border border-border/70 bg-surface p-4 text-sm leading-6 text-muted-foreground">
            {dictionary.branches.editor.emptyHint}
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
          <CardTitle>{dictionary.branches.editor.loading}</CardTitle>
          <CardDescription>
            {dictionary.branches.editor.editDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-3 pt-0 text-sm text-muted-foreground">
          <Spinner size="sm" />
          {dictionary.branches.editor.loading}
        </CardContent>
      </Card>
    );
  }

  if (editorState.mode === "edit" && detailQuery.isError && !detailQuery.data) {
    return (
      <Card className="xl:sticky xl:top-6">
        <CardHeader>
          <CardTitle>{dictionary.branches.editor.loadErrorTitle}</CardTitle>
          <CardDescription>
            {dictionary.branches.editor.loadError}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pt-0">
          <Button variant="outline" onClick={() => void detailQuery.refetch()}>
            {dictionary.branches.actions.retry}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            {dictionary.branches.actions.closeEditor}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const branch = editorState.mode === "edit" ? detailQuery.data : undefined;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={editorState.mode === "create" ? "create-branch" : branch?.id ?? "edit-branch"}
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
                ? dictionary.branches.editor.createTitle
                : branch?.name ?? dictionary.branches.editor.editTitle}
            </CardTitle>
            <CardDescription>
              {editorState.mode === "create"
                ? dictionary.branches.editor.createDescription
                : dictionary.branches.editor.editDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <BranchForm
              key={editorState.mode === "create" ? "create-form" : branch?.id ?? "edit-form"}
              mode={editorState.mode}
              branch={branch}
              onCancel={onClose}
              onSuccess={onSaved}
            />
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
