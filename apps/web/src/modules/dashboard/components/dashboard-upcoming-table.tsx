/* eslint-disable react-hooks/incompatible-library */

"use client";

import Link from "next/link";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/atoms/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/atoms/card";
import { Spinner } from "@/components/ui/atoms/spinner";
import { StatusBadge } from "@/components/ui/molecules/status-badge";
import { ROUTES } from "@/config/routes";
import { cn, formatDateTime } from "@/lib/utils";
import type { AppointmentRecord } from "@/modules/appointments/types/appointment.types";
import { useI18n } from "@/providers/i18n-provider";

function sortableHeader(label: string) {
  return function Header({
    column,
  }: {
    column: {
      toggleSorting: (desc?: boolean) => void;
      getIsSorted: () => false | "asc" | "desc";
    };
  }) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-auto rounded-full px-3 py-1.5"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {label}
        <ArrowUpDown className="h-3.5 w-3.5" />
      </Button>
    );
  };
}

function getCitizenLabel(appointment: AppointmentRecord) {
  return `${appointment.citizen.firstName} ${appointment.citizen.lastName}`.trim();
}

export function DashboardUpcomingTable({
  data,
  isPending = false,
  isRefreshing = false,
  errorMessage,
  onRetry,
}: {
  data: AppointmentRecord[];
  isPending?: boolean;
  isRefreshing?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
}) {
  const { dictionary, locale } = useI18n();
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "scheduledStart",
      desc: false,
    },
  ]);

  const columns: ColumnDef<AppointmentRecord>[] = [
    {
      accessorKey: "code",
      header: sortableHeader(dictionary.dashboard.upcomingTable.code),
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-semibold tracking-[0.14em] text-foreground">
            {row.original.code}
          </p>
          <p className="text-xs text-muted-foreground">
            {row.original.service.name}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "service.name",
      header: dictionary.dashboard.upcomingTable.service,
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="text-foreground">{row.original.service.name}</p>
          <p className="text-xs text-muted-foreground">
            /{row.original.service.slug}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "branch.name",
      header: dictionary.dashboard.upcomingTable.branch,
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="text-foreground">{row.original.branch.name}</p>
          <p className="text-xs text-muted-foreground">
            /{row.original.branch.slug}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "citizen.lastName",
      header: dictionary.dashboard.upcomingTable.citizen,
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="text-foreground">{getCitizenLabel(row.original)}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.citizen.email ??
              dictionary.appointments.table.noCitizenEmail}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "scheduledStart",
      header: sortableHeader(dictionary.dashboard.upcomingTable.scheduledStart),
      cell: ({ row }) => (
        <div className="space-y-1 text-sm">
          <p className="text-foreground">
            {formatDateTime(row.original.scheduledStart, locale)}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDateTime(row.original.scheduledEnd, locale)}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: dictionary.dashboard.upcomingTable.status,
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>{dictionary.dashboard.upcomingTitle}</CardTitle>
            <CardDescription>
              {dictionary.dashboard.upcomingDescription}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-3">
            <p className="text-sm text-muted-foreground">
              {isRefreshing
                ? dictionary.dashboard.upcomingTable.refreshing
                : `${data.length} ${dictionary.dashboard.upcomingTable.resultsLabel}`}
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href={ROUTES.appointments}>
                {dictionary.dashboard.upcomingTable.openQueue}
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isPending && !data.length ? (
          <div className="flex items-center gap-3 rounded-[1.25rem] border border-border/70 bg-surface px-4 py-6 text-sm text-muted-foreground">
            <Spinner size="sm" />
            {dictionary.dashboard.upcomingTable.loading}
          </div>
        ) : errorMessage && !data.length ? (
          <div className="rounded-[1.25rem] border border-danger/20 bg-danger/5 p-5">
            <p className="text-sm font-semibold text-foreground">
              {dictionary.dashboard.upcomingTable.errorTitle}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {errorMessage}
            </p>
            {onRetry ? (
              <div className="mt-4">
                <Button variant="outline" onClick={onRetry}>
                  {dictionary.common.actions.retry}
                </Button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="overflow-hidden rounded-[1.5rem] border border-border/80">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="bg-surface text-left">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-4 py-3 text-sm font-semibold text-foreground"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-t border-border/70 transition hover:bg-surface/70"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className={cn("px-4 py-4 align-top text-sm text-foreground")}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="px-6 py-16 text-center align-middle"
                      >
                        <div className="mx-auto max-w-md">
                          <h3 className="text-base font-semibold text-foreground">
                            {dictionary.dashboard.upcomingTable.emptyTitle}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {dictionary.dashboard.upcomingTable.emptyDescription}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
