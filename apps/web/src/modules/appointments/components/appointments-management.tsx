"use client";

import { AnimatePresence, motion } from "motion/react";
import { useDeferredValue, useState } from "react";

import { Button } from "@/components/ui/atoms/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/atoms/card";
import { Spinner } from "@/components/ui/atoms/spinner";
import { PageHeader } from "@/components/ui/organisms/page-header";
import { ApiError } from "@/lib/api/client";
import { AppointmentCreatePanel } from "@/modules/appointments/components/appointment-create-panel";
import { AppointmentDetailPanel } from "@/modules/appointments/components/appointment-detail-panel";
import { AppointmentsFilters } from "@/modules/appointments/components/appointments-filters";
import { AppointmentsTable } from "@/modules/appointments/components/appointments-table";
import { useAppointmentsQuery } from "@/modules/appointments/hooks/use-appointments-query";
import type {
  AppointmentRecord,
  ListAppointmentsQuery,
} from "@/modules/appointments/types/appointment.types";
import { useBranchesQuery } from "@/modules/branches/hooks/use-branches-query";
import { useServicesQuery } from "@/modules/services/hooks/use-services-query";
import { useI18n } from "@/providers/i18n-provider";

type AppointmentPanelState =
  | {
      mode: "create";
    }
  | {
      mode: "detail";
      appointmentId: string;
    }
  | null;

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

function EmptyPanel() {
  const { dictionary } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dictionary.appointments.editor.emptyTitle}</CardTitle>
        <CardDescription>
          {dictionary.appointments.editor.emptyDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="rounded-[1.25rem] border border-border/70 bg-surface p-4 text-sm leading-6 text-muted-foreground">
          {dictionary.appointments.editor.emptyHint}
        </p>
      </CardContent>
    </Card>
  );
}

export function AppointmentsManagement() {
  const { dictionary } = useI18n();
  const [filters, setFilters] = useState<ListAppointmentsQuery>({ search: "" });
  const [panelState, setPanelState] = useState<AppointmentPanelState>(null);
  const deferredSearch = useDeferredValue(filters.search ?? "");
  const queryFilters: ListAppointmentsQuery = {
    ...filters,
    search: deferredSearch.trim() || undefined,
  };
  const appointmentsQuery = useAppointmentsQuery(queryFilters);
  const branchesQuery = useBranchesQuery({});
  const servicesQuery = useServicesQuery({});
  const selectedAppointment =
    panelState?.mode === "detail"
      ? appointmentsQuery.data?.find(
          (appointment) => appointment.id === panelState.appointmentId,
        )
      : undefined;
  const hasActiveFilters = Boolean(
    filters.search?.trim() ||
      filters.status ||
      filters.serviceId ||
      filters.branchId ||
      filters.dateFrom ||
      filters.dateTo,
  );

  const handleAppointmentCreated = (appointment: AppointmentRecord) => {
    setPanelState({
      mode: "detail",
      appointmentId: appointment.id,
    });
  };

  return (
    <>
      <PageHeader
        title={dictionary.appointments.page.title}
        description={dictionary.appointments.page.description}
        actions={
          <Button onClick={() => setPanelState({ mode: "create" })}>
            {dictionary.appointments.actions.create}
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(380px,0.92fr)]">
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
              selectedAppointmentId={
                panelState?.mode === "detail" ? panelState.appointmentId : undefined
              }
              emptyTitle={dictionary.appointments.table.emptyTitle}
              emptyDescription={dictionary.appointments.table.emptyDescription}
              onSelectAppointment={(appointmentId) =>
                setPanelState({
                  mode: "detail",
                  appointmentId,
                })
              }
            />
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={
              panelState?.mode === "create"
                ? "appointments-create"
                : panelState?.mode === "detail"
                  ? `appointments-${panelState.appointmentId}`
                  : "appointments-empty"
            }
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="xl:sticky xl:top-6"
          >
            {panelState?.mode === "create" ? (
              <AppointmentCreatePanel
                onClose={() => setPanelState(null)}
                onCreated={handleAppointmentCreated}
              />
            ) : panelState?.mode === "detail" ? (
              <AppointmentDetailPanel
                appointmentId={panelState.appointmentId}
                initialAppointment={selectedAppointment}
                onClose={() => setPanelState(null)}
              />
            ) : (
              <EmptyPanel />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
