"use client";

import { Search, Clock3, ArrowRight, Building2, ShieldCheck } from "lucide-react";
import { startTransition, useDeferredValue, useState } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/atoms/badge";
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
import { ROUTES } from "@/config/routes";
import { getApiErrorMessage } from "@/modules/auth/utils/auth-error";
import { useBookingFlow, usePublicServicesQuery } from "@/modules/public-booking/hooks/use-public-booking";
import { useI18n } from "@/providers/i18n-provider";

export function ServiceSelectionGrid() {
  const router = useRouter();
  const { setSelectedService } = useBookingFlow();
  const { dictionary } = useI18n();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const servicesQuery = usePublicServicesQuery({
    search: deferredSearch.trim() || undefined,
  });

  if (servicesQuery.isPending && !servicesQuery.data) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 p-8 text-sm text-muted-foreground">
          <Spinner size="sm" />
          {dictionary.booking.servicesPage.loading}
        </CardContent>
      </Card>
    );
  }

  if (servicesQuery.isError && !servicesQuery.data) {
    return (
      <Card className="border-danger/20">
        <CardHeader>
          <CardTitle>{dictionary.booking.servicesPage.errorTitle}</CardTitle>
          <CardDescription>
            {getApiErrorMessage(servicesQuery.error) ??
              dictionary.booking.servicesPage.errorDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => void servicesQuery.refetch()}>
            {dictionary.booking.servicesPage.retry}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const services = servicesQuery.data ?? [];

  return (
    <div className="space-y-6">
      <Card className="border-transparent bg-[linear-gradient(145deg,rgba(14,165,233,0.08),rgba(248,250,252,0.7),rgba(16,185,129,0.07))]">
        <CardContent className="p-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                {dictionary.booking.servicesPage.filterEyebrow}
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                {dictionary.booking.servicesPage.filterDescription}
              </p>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={dictionary.booking.servicesPage.searchPlaceholder}
                className="pl-10 lg:w-[22rem]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {services.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{dictionary.booking.servicesPage.emptyTitle}</CardTitle>
            <CardDescription>
              {dictionary.booking.servicesPage.emptyDescription}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {services.map((service) => (
            <Card
              key={service.id}
              className="overflow-hidden border-border/80 bg-card/95 shadow-soft"
            >
              <CardHeader className="space-y-4">
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
                <div>
                  <CardTitle className="text-xl">
                    {service.name}
                  </CardTitle>
                  <CardDescription className="mt-2 text-sm leading-6">
                    {service.description ||
                      dictionary.booking.servicesPage.cardDescription}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 pt-0">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.25rem] border border-border/70 bg-surface p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Clock3 className="h-4 w-4 text-primary" />
                      {dictionary.booking.servicesPage.durationLabel}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {service.durationMinutes}{" "}
                      {dictionary.booking.servicesPage.minuteBlock}
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] border border-border/70 bg-surface p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Building2 className="h-4 w-4 text-primary" />
                      {dictionary.booking.servicesPage.branchLabel}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {service.branch?.name ??
                        dictionary.booking.servicesPage.multipleBranches}
                    </p>
                  </div>
                </div>

                <div className="rounded-[1.25rem] border border-border/70 bg-surface p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    {dictionary.booking.servicesPage.bookingPolicyLabel}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {service.requiresApproval
                      ? dictionary.booking.servicesPage.bookingPolicyApproval
                      : dictionary.booking.servicesPage.bookingPolicyInstant}
                  </p>
                </div>

                <Button
                  className="w-full"
                  onClick={() => {
                    setSelectedService(service);
                    startTransition(() => {
                      router.push(
                        `${ROUTES.bookingNewAppointment}?serviceId=${service.id}`,
                      );
                    });
                  }}
                >
                  {dictionary.common.actions.continueWithService}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
