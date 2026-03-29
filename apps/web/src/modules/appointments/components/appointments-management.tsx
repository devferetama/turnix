"use client";

import { useDeferredValue, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/atoms/button";
import { Spinner } from "@/components/ui/atoms/spinner";
import { PageHeader } from "@/components/ui/organisms/page-header";
import { ROUTES } from "@/config/routes";
import { ApiError } from "@/lib/api/client";
import { AppointmentsFilters } from "@/modules/appointments/components/appointments-filters";
import { AppointmentsTable } from "@/modules/appointments/components/appointments-table";
import { useAppointmentsQuery } from "@/modules/appointments/hooks/use-appointments-query";
import type { ListAppointmentsQuery } from "@/modules/appointments/types/appointment.types";
import { useBranchesQuery } from "@/modules/branches/hooks/use-branches-query";
import { useServicesQuery } from "@/modules/services/hooks/use-services-query";
import { useI18n } from "@/providers/i18n-provider";

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

function getSelectedAppointmentId(pathname: string) {
  if (!pathname.startsWith(`${ROUTES.appointments}/`)) {
    return undefined;
  }

  const segment = pathname.slice(`${ROUTES.appointments}/`.length).split("/")[0];

  if (!segment || segment === "create") {
    return undefined;
  }

  return decodeURIComponent(segment);
}

export function AppointmentsManagement() {
  const { dictionary } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = useState<ListAppointmentsQuery>({ search: "" });
  const deferredSearch = useDeferredValue(filters.search ?? "");
  const queryFilters: ListAppointmentsQuery = {
    ...filters,
    search: deferredSearch.trim() || undefined,
  };
  const appointmentsQuery = useAppointmentsQuery(queryFilters);
  const branchesQuery = useBranchesQuery({});
  const servicesQuery = useServicesQuery({});
  const selectedAppointmentId = getSelectedAppointmentId(pathname);
  const isCreateRoute = pathname === ROUTES.appointmentCreate;
  const hasActiveFilters = Boolean(
    filters.search?.trim() ||
      filters.status ||
      filters.serviceId ||
      filters.branchId ||
      filters.dateFrom ||
      filters.dateTo,
  );

  return (
    <>
      <PageHeader
        title={dictionary.appointments.page.title}
        description={dictionary.appointments.page.description}
        actions={
          <Button
            variant={isCreateRoute ? "secondary" : "primary"}
            onClick={() => router.push(ROUTES.appointmentCreate)}
          >
            {dictionary.appointments.actions.create}
          </Button>
        }
      />

      <div className="space-y-6">
        <AppointmentsFilters
          filters={filters}
          resultCount={appointmentsQuery.data?.length ?? 0}
          isFetching={appointmentsQuery.isFetching}
          hasActiveFilters={hasActiveFilters}
          services={servicesQuery.data ?? []}
          branches={branchesQuery.data ?? []}
          onSearchChange={(search) =>
            setFilters((current) => ({
              ...current,
              search,
            }))
          }
          onStatusChange={(status) =>
            setFilters((current) => ({
              ...current,
              status,
            }))
          }
          onServiceChange={(serviceId) =>
            setFilters((current) => ({
              ...current,
              serviceId,
            }))
          }
          onBranchChange={(branchId) =>
            setFilters((current) => ({
              ...current,
              branchId,
            }))
          }
          onDateFromChange={(dateFrom) =>
            setFilters((current) => ({
              ...current,
              dateFrom,
            }))
          }
          onDateToChange={(dateTo) =>
            setFilters((current) => ({
              ...current,
              dateTo,
            }))
          }
          onClear={() => setFilters({ search: "" })}
        />

        {appointmentsQuery.isPending && !appointmentsQuery.data ? (
          <div className="rounded-[1.75rem] border border-border/80 bg-card p-8 shadow-soft">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Spinner size="sm" />
              {dictionary.appointments.table.loading}
            </div>
          </div>
        ) : appointmentsQuery.isError && !appointmentsQuery.data ? (
          <div className="rounded-[1.75rem] border border-danger/20 bg-card p-8 shadow-soft">
            <p className="text-base font-semibold text-foreground">
              {dictionary.appointments.editor.loadErrorTitle}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {getApiErrorMessage(
                appointmentsQuery.error,
                dictionary.appointments.editor.loadError,
              )}
            </p>
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => void appointmentsQuery.refetch()}
              >
                {dictionary.appointments.actions.retry}
              </Button>
            </div>
          </div>
        ) : (
          <AppointmentsTable
            data={appointmentsQuery.data ?? []}
            isFetching={appointmentsQuery.isFetching}
            selectedAppointmentId={selectedAppointmentId}
            emptyTitle={dictionary.appointments.table.emptyTitle}
            emptyDescription={dictionary.appointments.table.emptyDescription}
            onSelectAppointment={(appointmentId) =>
              router.push(ROUTES.appointmentDetail(appointmentId))
            }
          />
        )}
      </div>
    </>
  );
}
