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

import { Button } from "@/components/ui/atoms/button";
import { Card, CardContent } from "@/components/ui/atoms/card";
import { StatusBadge } from "@/components/ui/molecules/status-badge";
import { cn } from "@/lib/utils";
import type { BranchTableRow } from "@/modules/branches/types/branch.types";
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

export function BranchesTable({
  data,
  isFetching = false,
  selectedBranchId,
  emptyTitle,
  emptyDescription,
  onEditBranch,
}: {
  data: BranchTableRow[];
  isFetching?: boolean;
  selectedBranchId?: string;
  emptyTitle: string;
  emptyDescription: string;
  onEditBranch: (branchId: string) => void;
}) {
  const { dictionary } = useI18n();
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "name",
      desc: false,
    },
  ]);

  const columns: ColumnDef<BranchTableRow>[] = [
    {
      accessorKey: "name",
      header: sortableHeader(dictionary.branches.table.name),
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-semibold text-foreground">{row.original.name}</p>
          {row.original.description ? (
            <p className="line-clamp-2 max-w-xl text-xs leading-5 text-muted-foreground">
              {row.original.description}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: "slug",
      header: sortableHeader(dictionary.branches.table.slug),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          /{row.original.slug}
        </span>
      ),
    },
    {
      accessorKey: "city",
      header: dictionary.branches.table.city,
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.city ?? dictionary.branches.table.notProvided}
        </span>
      ),
    },
    {
      accessorKey: "country",
      header: dictionary.branches.table.country,
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.country ?? dictionary.branches.table.notProvided}
        </span>
      ),
    },
    {
      accessorKey: "isActive",
      header: dictionary.branches.table.status,
      cell: ({ row }) => (
        <StatusBadge status={row.original.isActive ? "active" : "inactive"} />
      ),
    },
    {
      id: "actions",
      header: dictionary.branches.table.actions,
      enableSorting: false,
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(event) => {
            event.stopPropagation();
            onEditBranch(row.original.id);
          }}
        >
          {dictionary.branches.table.edit}
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
              {dictionary.branches.table.catalogTitle}
            </p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {dictionary.branches.table.catalogDescription}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            {isFetching
              ? dictionary.branches.table.updating
              : `${data.length} ${dictionary.branches.filters.resultsLabel}`}
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
                    const isSelected = selectedBranchId === row.original.id;

                    return (
                      <tr
                        key={row.id}
                        onClick={() => onEditBranch(row.original.id)}
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
