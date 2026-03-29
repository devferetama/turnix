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
import type {
  ListServicesQuery,
  ServiceVisibility,
} from "@/modules/services/types/service.types";
import { useI18n } from "@/providers/i18n-provider";

export function ServicesFilters({
  filters,
  resultCount,
  isFetching,
  hasActiveFilters,
  onSearchChange,
  onVisibilityChange,
  onIsActiveChange,
  onClear,
}: {
  filters: ListServicesQuery;
  resultCount: number;
  isFetching: boolean;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onVisibilityChange: (value?: ServiceVisibility) => void;
  onIsActiveChange: (value?: boolean) => void;
  onClear: () => void;
}) {
  const { dictionary } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dictionary.services.filters.title}</CardTitle>
        <CardDescription>
          {dictionary.services.filters.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-0">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_220px_220px]">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">
              {dictionary.services.filters.searchLabel}
            </p>
            <SearchInput
              value={filters.search ?? ""}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={dictionary.services.filters.searchPlaceholder}
              className="max-w-none"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">
              {dictionary.services.filters.visibilityLabel}
            </p>
            <Select
              value={filters.visibility ?? ""}
              onChange={(event) =>
                onVisibilityChange(
                  event.target.value
                    ? (event.target.value as ServiceVisibility)
                    : undefined,
                )
              }
            >
              <option value="">{dictionary.services.filters.visibilityAll}</option>
              <option value="PUBLIC">
                {dictionary.services.options.visibility.PUBLIC}
              </option>
              <option value="PRIVATE">
                {dictionary.services.options.visibility.PRIVATE}
              </option>
              <option value="INTERNAL">
                {dictionary.services.options.visibility.INTERNAL}
              </option>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">
              {dictionary.services.filters.statusLabel}
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
              <option value="">{dictionary.services.filters.statusAll}</option>
              <option value="true">{dictionary.services.filters.statusActive}</option>
              <option value="false">
                {dictionary.services.filters.statusInactive}
              </option>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {isFetching
              ? dictionary.services.filters.syncing
              : `${resultCount} ${dictionary.services.filters.resultsLabel}`}
          </p>
          {hasActiveFilters ? (
            <Button variant="outline" size="sm" onClick={onClear}>
              {dictionary.services.actions.clearFilters}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
