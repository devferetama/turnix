"use client";

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
import { SearchInput } from "@/components/ui/molecules/search-input";
import type { BranchRecord } from "@/modules/branches/types/branch.types";
import type { ServiceRecord } from "@/modules/services/types/service.types";
import type {
  AppointmentStatus,
  ListAppointmentsQuery,
} from "@/modules/appointments/types/appointment.types";
import { useI18n } from "@/providers/i18n-provider";

export function AppointmentsFilters({
  filters,
  resultCount,
  isFetching,
  hasActiveFilters,
  services,
  branches,
  onSearchChange,
  onStatusChange,
  onServiceChange,
  onBranchChange,
  onDateFromChange,
  onDateToChange,
  onClear,
}: {
  filters: ListAppointmentsQuery;
  resultCount: number;
  isFetching: boolean;
  hasActiveFilters: boolean;
  services: ServiceRecord[];
  branches: BranchRecord[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value?: AppointmentStatus) => void;
  onServiceChange: (value?: string) => void;
  onBranchChange: (value?: string) => void;
  onDateFromChange: (value?: string) => void;
  onDateToChange: (value?: string) => void;
  onClear: () => void;
}) {
  const { dictionary } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dictionary.appointments.filters.title}</CardTitle>
        <CardDescription>
          {dictionary.appointments.filters.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-0">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_220px_220px]">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">
              {dictionary.appointments.filters.searchLabel}
            </p>
            <SearchInput
              value={filters.search ?? ""}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={dictionary.appointments.filters.searchPlaceholder}
              className="max-w-none"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">
              {dictionary.appointments.filters.statusLabel}
            </p>
            <Select
              value={filters.status ?? ""}
              onChange={(event) =>
                onStatusChange(
                  event.target.value
                    ? (event.target.value as AppointmentStatus)
                    : undefined,
                )
              }
            >
              <option value="">{dictionary.appointments.filters.statusAll}</option>
              {Object.entries(dictionary.appointments.options.statuses).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ),
              )}
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">
              {dictionary.appointments.filters.serviceLabel}
            </p>
            <Select
              value={filters.serviceId ?? ""}
              onChange={(event) =>
                onServiceChange(event.target.value || undefined)
              }
            >
              <option value="">{dictionary.appointments.filters.serviceAll}</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[220px_220px_220px]">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">
              {dictionary.appointments.filters.branchLabel}
            </p>
            <Select
              value={filters.branchId ?? ""}
              onChange={(event) =>
                onBranchChange(event.target.value || undefined)
              }
            >
              <option value="">{dictionary.appointments.filters.branchAll}</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">
              {dictionary.appointments.filters.dateFromLabel}
            </p>
            <Input
              type="date"
              value={filters.dateFrom ?? ""}
              onChange={(event) =>
                onDateFromChange(event.target.value || undefined)
              }
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">
              {dictionary.appointments.filters.dateToLabel}
            </p>
            <Input
              type="date"
              value={filters.dateTo ?? ""}
              onChange={(event) =>
                onDateToChange(event.target.value || undefined)
              }
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {isFetching
              ? dictionary.appointments.filters.syncing
              : `${resultCount} ${dictionary.appointments.filters.resultsLabel}`}
          </p>
          {hasActiveFilters ? (
            <Button variant="outline" size="sm" onClick={onClear}>
              {dictionary.appointments.actions.clearFilters}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
