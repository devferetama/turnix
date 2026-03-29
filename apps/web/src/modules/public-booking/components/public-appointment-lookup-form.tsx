"use client";

import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { FormField } from "@/components/ui/molecules/form-field";
import { ROUTES } from "@/config/routes";
import { getApiErrorMessage } from "@/modules/auth/utils/auth-error";
import { publicBookingQueryKeys } from "@/modules/public-booking/constants/public-booking.constants";
import {
  getPublicAppointmentLookupDefaults,
  publicAppointmentLookupSchema,
} from "@/modules/public-booking/schemas/public-booking.schema";
import { getPublicAppointmentByCode } from "@/modules/public-booking/services/public-booking-api";
import { useCurrentTenant } from "@/modules/tenant/hooks/use-current-tenant";
import { useI18n } from "@/providers/i18n-provider";

function getErrorText(error: unknown) {
  return typeof error === "string" ? error : undefined;
}

export function PublicAppointmentLookupForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { dictionary } = useI18n();
  const tenant = useCurrentTenant();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: getPublicAppointmentLookupDefaults(),
    onSubmit: async ({ value }) => {
      const parsed = publicAppointmentLookupSchema.safeParse(value);

      if (!parsed.success) {
        setSubmitError(
          parsed.error.issues[0]?.message ??
            dictionary.booking.lookup.submitFailed,
        );
        return;
      }

      try {
        const code = parsed.data.code;

        await queryClient.fetchQuery({
          queryKey: publicBookingQueryKeys.appointment(tenant.slug, code),
          queryFn: () => getPublicAppointmentByCode(code),
        });

        setSubmitError(null);
        router.push(ROUTES.bookingAppointment(code));
      } catch (error) {
        setSubmitError(
          getApiErrorMessage(error) ?? dictionary.booking.lookup.submitFailed,
        );
      }
    },
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.02fr)_minmax(320px,0.98fr)]">
      <Card className="overflow-hidden border-transparent bg-[linear-gradient(145deg,rgba(14,165,233,0.08),rgba(248,250,252,0.74),rgba(16,185,129,0.08))]">
        <CardHeader>
          <CardTitle>{dictionary.booking.lookup.cardTitle}</CardTitle>
          <CardDescription>
            {dictionary.booking.lookup.cardDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-[1.25rem] border border-border/70 bg-card/85 p-4 text-sm leading-6 text-muted-foreground">
            {dictionary.booking.lookup.helpText}
          </div>

          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              void form.handleSubmit();
            }}
          >
            <form.Field
              name="code"
              validators={{
                onBlur: ({ value }) =>
                  publicAppointmentLookupSchema.shape.code.safeParse(value)
                    .success
                    ? undefined
                    : dictionary.booking.lookup.codeError,
              }}
            >
              {(field) => (
                <FormField
                  label={dictionary.common.labels.bookingCode}
                  htmlFor={field.name}
                  required
                  hint={dictionary.booking.lookup.codeHint}
                  error={getErrorText(field.state.meta.errors[0])}
                >
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        field.handleChange(event.target.value.toUpperCase());
                        setSubmitError(null);
                      }}
                      placeholder={dictionary.booking.lookup.codePlaceholder}
                      className="pl-10 font-mono tracking-[0.16em]"
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </div>
                </FormField>
              )}
            </form.Field>

            {submitError ? (
              <p className="text-sm text-danger">{submitError}</p>
            ) : null}

            <form.Subscribe selector={(state) => [state.isSubmitting] as const}>
              {([isSubmitting]) => (
                <div className="flex flex-wrap gap-3">
                  <Button type="submit" size="lg" disabled={isSubmitting}>
                    {isSubmitting
                      ? dictionary.booking.lookup.submitting
                      : dictionary.booking.lookup.submit}
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href={ROUTES.bookingServices}>
                      {dictionary.common.actions.browseServices}
                    </Link>
                  </Button>
                </div>
              )}
            </form.Subscribe>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{dictionary.booking.lookup.sideTitle}</CardTitle>
          <CardDescription>
            {dictionary.booking.lookup.sideDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {dictionary.booking.lookup.highlights.map((item) => (
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
