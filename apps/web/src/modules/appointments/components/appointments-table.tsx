/* eslint-disable react-hooks/incompatible-library */

"use client";

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/atoms/badge";
import { Button } from "@/components/ui/atoms/button";
import { Card, CardContent } from "@/components/ui/atoms/card";
import { StatusBadge } from "@/components/ui/molecules/status-badge";
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

function getSourceBadgeVariant(source: AppointmentRecord["source"]) {
  if (source === "STAFF") {
    return "primary";
  }

  if (source === "WEB") {
    return "secondary";
  }

  if (source === "IMPORT") {
    return "warning";
  }

  return "outline";
}

function getCitizenLabel(appointment: AppointmentRecord) {
  return `${appointment.citizen.firstName} ${appointment.citizen.lastName}`.trim();
}

export function AppointmentsTable({
  data,
  isFetching = false,
  selectedAppointmentId,
  emptyTitle,
  emptyDescription,
  onSelectAppointment,
}: {
  data: AppointmentRecord[];
  isFetching?: boolean;
  selectedAppointmentId?: string;
  emptyTitle: string;
  emptyDescription: string;
  onSelectAppointment: (appointmentId: string) => void;
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
      header: sortableHeader(dictionary.appointments.table.code),
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-semibold tracking-[0.14em] text-foreground">
            {row.original.code}
          </p>
          <Badge variant={getSourceBadgeVariant(row.original.source)}>
            {
              dictionary.appointments.options.sources[
                row.original.source as keyof typeof dictionary.appointments.options.sources
              ]
            }
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "service.name",
      header: dictionary.appointments.table.service,
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-semibold text-foreground">
            {row.original.service.name}
          </p>
          <p className="text-xs text-muted-foreground">
            /{row.original.service.slug}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "branch.name",
      header: dictionary.appointments.table.branch,
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
      header: dictionary.appointments.table.citizen,
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
      header: sortableHeader(dictionary.appointments.table.scheduledStart),
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
      header: dictionary.appointments.table.status,
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "source",
      header: dictionary.appointments.table.source,
      cell: ({ row }) => (
        <Badge variant={getSourceBadgeVariant(row.original.source)}>
          {
            dictionary.appointments.options.sources[
              row.original.source as keyof typeof dictionary.appointments.options.sources
            ]
          }
        </Badge>
      ),
    },
    {
      id: "actions",
      header: dictionary.appointments.table.actions,
      enableSorting: false,
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(event) => {
            event.stopPropagation();
            onSelectAppointment(row.original.id);
          }}
        >
          {dictionary.appointments.table.view}
        </Button>
      ),
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
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Card>
      <CardContent className="space-y-5 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-base font-semibold text-foreground">
              {dictionary.appointments.table.title}
            </p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {dictionary.appointments.table.description}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            {isFetching
              ? dictionary.appointments.table.updating
              : `${data.length} ${dictionary.appointments.filters.resultsLabel}`}
          </p>
        </div>

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
                  table.getRowModel().rows.map((row) => {
                    const isSelected = selectedAppointmentId === row.original.id;

                    return (
                      <tr
                        key={row.id}
                        onClick={() => onSelectAppointment(row.original.id)}
                        className={cn(
                          "cursor-pointer border-t border-border/70 transition hover:bg-surface/70",
                          isSelected ? "bg-primary/6" : undefined,
                        )}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="px-4 py-4 align-top text-sm text-foreground"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-6 py-16 text-center align-middle"
                    >
                      <div className="mx-auto max-w-md">
                        <h3 className="text-base font-semibold text-foreground">
                          {emptyTitle}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {emptyDescription}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {dictionary.common.table.page}{" "}
            {table.getState().pagination.pageIndex + 1}{" "}
            {dictionary.common.table.of} {table.getPageCount() || 1}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {dictionary.common.actions.previous}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {dictionary.common.actions.next}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
