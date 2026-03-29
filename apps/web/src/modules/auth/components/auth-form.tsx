"use client";

import { useForm } from "@tanstack/react-form";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { startTransition, useState } from "react";

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
import { loginSchema } from "@/modules/auth/schemas/login.schema";
import { resolveAuthRedirectTarget } from "@/modules/auth/utils/redirect";
import { getSignInErrorMessage } from "@/modules/auth/utils/auth-error";
import { useI18n } from "@/providers/i18n-provider";

function getErrorText(error: unknown) {
  return typeof error === "string" ? error : undefined;
}

function getSafeBackofficeRoute(input: string | null) {
  if (!input) {
    return ROUTES.dashboard;
  }

  const allowedRoutes = [
    ROUTES.dashboard,
    ROUTES.appointments,
    ROUTES.services,
    ROUTES.branches,
    ROUTES.settings,
  ];

  const match = allowedRoutes.find(
    (route) => input === route || input.startsWith(`${route}/`),
  );

  return match ?? ROUTES.dashboard;
}

export function AuthForm({
  showDevelopmentHint,
}: {
  showDevelopmentHint: boolean;
}) {
  const searchParams = useSearchParams();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const nextRoute = getSafeBackofficeRoute(searchParams.get("next"));
  const { dictionary } = useI18n();

  const form = useForm({
    defaultValues: {
      email: showDevelopmentHint ? "admin@turnix.local" : "",
      password: showDevelopmentHint ? "Turnix123!" : "",
    },
    onSubmit: async ({ value }) => {
      const parsed = loginSchema.safeParse(value);

      if (!parsed.success) {
        setSubmitError(dictionary.auth.login.validationError);
        return;
      }

      setSubmitError(null);

      const result = await signIn("credentials", {
        ...parsed.data,
        redirect: false,
        callbackUrl: nextRoute,
      });

      if (result?.error) {
        setSubmitError(
          getSignInErrorMessage(result.error, dictionary.auth.login.authError),
        );
        return;
      }

      if (!result?.ok) {
        setSubmitError(dictionary.auth.login.authError);
        return;
      }

      startTransition(() => {
        window.location.assign(
          resolveAuthRedirectTarget(result.url, nextRoute),
        );
      });
    },
  });

  return (
    <Card className="overflow-hidden">
      <div className="grid lg:grid-cols-[0.88fr_1.12fr]">
        <div className="border-b border-border/80 bg-surface/80 p-8 lg:border-b-0 lg:border-r lg:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
            {dictionary.auth.login.eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">
            {dictionary.auth.login.title}
          </h1>
          <p className="mt-5 text-base leading-8 text-muted-foreground">
            {dictionary.auth.login.description}
          </p>
          <div className="mt-8 space-y-4">
            {[
              { icon: ShieldCheck, ...dictionary.auth.login.features[0] },
              { icon: LockKeyhole, ...dictionary.auth.login.features[1] },
              { icon: Mail, ...dictionary.auth.login.features[2] },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[1.25rem] border border-border/70 bg-card p-4"
              >
                <item.icon className="h-5 w-5 text-primary" />
                <p className="mt-3 text-sm font-semibold text-foreground">
                  {item.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 lg:p-10">
          <CardHeader className="p-0">
            <CardTitle>{dictionary.auth.login.cardTitle}</CardTitle>
            <CardDescription>
              {dictionary.auth.login.cardDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-0 pt-6">
            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                void form.handleSubmit();
              }}
            >
              <form.Field
                name="email"
                validators={{
                  onBlur: ({ value }) =>
                    loginSchema.shape.email.safeParse(value).success
                      ? undefined
                      : dictionary.auth.login.emailError,
                }}
              >
                {(field) => (
                  <FormField
                    label={dictionary.common.labels.email}
                    htmlFor={field.name}
                    required
                    error={getErrorText(field.state.meta.errors[0])}
                  >
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      autoComplete="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                    />
                  </FormField>
                )}
              </form.Field>

              <form.Field
                name="password"
                validators={{
                  onBlur: ({ value }) =>
                    value.length < 8
                      ? dictionary.auth.login.passwordError
                      : undefined,
                }}
              >
                {(field) => (
                  <FormField
                    label={dictionary.common.labels.password}
                    htmlFor={field.name}
                    required
                    error={getErrorText(field.state.meta.errors[0])}
                  >
                    <div className="relative">
                      <Input
                        id={field.name}
                        name={field.name}
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        value={field.state.value}
                        className="pr-12"
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-muted-foreground transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                        aria-label={
                          showPassword
                            ? dictionary.common.actions.hidePassword
                            : dictionary.common.actions.showPassword
                        }
                        aria-pressed={showPassword}
                        onClick={() => setShowPassword((current) => !current)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
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
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? dictionary.auth.login.signingIn
                      : dictionary.common.actions.signInWithCredentials}
                  </Button>
                )}
              </form.Subscribe>
            </form>

            {showDevelopmentHint ? (
              <div className="rounded-[1.25rem] border border-border/70 bg-surface p-4 text-sm leading-6 text-muted-foreground">
                {dictionary.auth.login.developmentHint}
                <br />
                {dictionary.auth.login.emailLabel}:{" "}
                <code className="font-mono">admin@turnix.local</code>
                <br />
                {dictionary.auth.login.passwordLabel}:{" "}
                <code className="font-mono">Turnix123!</code>
              </div>
            ) : null}
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
