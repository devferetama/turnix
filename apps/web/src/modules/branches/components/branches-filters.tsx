"use client";

import { Button } from "@/components/ui/atoms/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/atoms/card";
import { Select } from "@/components/ui/atoms/select";
import { SearchInput } from "@/components/ui/molecules/search-input";
import type { ListBranchesQuery } from "@/modules/branches/types/branch.types";
import { useI18n } from "@/providers/i18n-provider";

export function BranchesFilters({
  filters,
  resultCount,
  isFetching,
  hasActiveFilters,
  onSearchChange,
  onIsActiveChange,
  onClear,
}: {
  filters: ListBranchesQuery;
  resultCount: number;
  isFetching: boolean;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onIsActiveChange: (value?: boolean) => void;
  onClear: () => void;
}) {
  const { dictionary } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dictionary.branches.filters.title}</CardTitle>
        <CardDescription>
          {dictionary.branches.filters.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-0">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_220px]">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">
              {dictionary.branches.filters.searchLabel}
            </p>
            <SearchInput
              value={filters.search ?? ""}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={dictionary.branches.filters.searchPlaceholder}
              className="max-w-none"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">
              {dictionary.branches.filters.statusLabel}
            </p>
            <Select
              value={
                filters.isActive === undefined
                  ? ""
                  : filters.isActive
                    ? "true"
                    : "false"
              }
              onChange={(event) => {
                if (event.target.value === "true") {
                  onIsActiveChange(true);
                  return;
                }

                if (event.target.value === "false") {
                  onIsActiveChange(false);
                  return;
                }

                onIsActiveChange(undefined);
              }}
            >
              <option value="">{dictionary.branches.filters.statusAll}</option>
              <option value="true">{dictionary.branches.filters.statusActive}</option>
              <option value="false">
                {dictionary.branches.filters.statusInactive}
              </option>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {isFetching
              ? dictionary.branches.filters.syncing
              : `${resultCount} ${dictionary.branches.filters.resultsLabel}`}
          </p>
          {hasActiveFilters ? (
            <Button variant="outline" size="sm" onClick={onClear}>
              {dictionary.branches.actions.clearFilters}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
