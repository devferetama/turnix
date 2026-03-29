/* eslint-disable react-hooks/incompatible-library */

"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useDeferredValue, useState } from "react";

import { Button } from "@/components/ui/atoms/button";
import { Card, CardContent } from "@/components/ui/atoms/card";
import { SearchInput } from "@/components/ui/molecules/search-input";
import { cn } from "@/lib/utils";
import { useI18n } from "@/providers/i18n-provider";

export function DataTable<TData>({
  columns,
  data,
  searchPlaceholder,
  emptyTitle,
  emptyDescription,
}: {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  searchPlaceholder?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  const { dictionary } = useI18n();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const deferredGlobalFilter = useDeferredValue(globalFilter);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter: deferredGlobalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: "includesString",
  });

  return (
    <Card>
      <CardContent className="space-y-5 p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            placeholder={searchPlaceholder ?? dictionary.common.table.searchRecords}
          />
          <p className="text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length}{" "}
            {table.getFilteredRowModel().rows.length === 1
              ? dictionary.common.table.result
              : dictionary.common.table.results}
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
                          {emptyTitle ?? dictionary.common.table.noResultsFound}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {emptyDescription ?? dictionary.common.table.adjustFilters}
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
            {dictionary.common.table.of}{" "}
            {table.getPageCount() || 1}
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
