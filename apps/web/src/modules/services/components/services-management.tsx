"use client";

import { useDeferredValue, useState } from "react";

import { Button } from "@/components/ui/atoms/button";
import { Spinner } from "@/components/ui/atoms/spinner";
import { PageHeader } from "@/components/ui/organisms/page-header";
import { ApiError } from "@/lib/api/client";
import { ServiceFormPanel } from "@/modules/services/components/service-form-panel";
import { ServicesFilters } from "@/modules/services/components/services-filters";
import { ServicesTable } from "@/modules/services/components/services-table";
import { useServicesQuery } from "@/modules/services/hooks/use-services-query";
import type {
  ListServicesQuery,
  ServiceRecord,
} from "@/modules/services/types/service.types";
import { useI18n } from "@/providers/i18n-provider";

type ServiceEditorState =
  | {
      mode: "create";
    }
  | {
      mode: "edit";
      serviceId: string;
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

export function ServicesManagement() {
  const { dictionary } = useI18n();
  const [filters, setFilters] = useState<ListServicesQuery>({ search: "" });
  const [editorState, setEditorState] = useState<ServiceEditorState>(null);
  const deferredSearch = useDeferredValue(filters.search ?? "");
  const queryFilters: ListServicesQuery = {
    ...filters,
    search: deferredSearch.trim() || undefined,
  };
  const servicesQuery = useServicesQuery(queryFilters);
  const selectedService =
    editorState?.mode === "edit"
      ? servicesQuery.data?.find((service) => service.id === editorState.serviceId)
      : undefined;
  const hasActiveFilters = Boolean(
    filters.search?.trim() ||
      filters.visibility ||
      filters.isActive !== undefined,
  );

  const handleServiceSaved = (service: ServiceRecord) => {
    setEditorState({
      mode: "edit",
      serviceId: service.id,
    });
  };

  return (
    <>
      <PageHeader
        title={dictionary.services.page.title}
        description={dictionary.services.page.description}
        actions={
          <Button onClick={() => setEditorState({ mode: "create" })}>
            {dictionary.services.actions.create}
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.9fr)]">
        <div className="space-y-6">
          <ServicesFilters
            filters={filters}
            resultCount={servicesQuery.data?.length ?? 0}
            isFetching={servicesQuery.isFetching}
            hasActiveFilters={hasActiveFilters}
            onSearchChange={(search) =>
              setFilters((current) => ({
                ...current,
                search,
              }))
            }
            onVisibilityChange={(visibility) =>
              setFilters((current) => ({
                ...current,
                visibility,
              }))
            }
            onIsActiveChange={(isActive) =>
              setFilters((current) => ({
                ...current,
                isActive,
              }))
            }
            onClear={() => setFilters({ search: "" })}
          />

          {servicesQuery.isPending && !servicesQuery.data ? (
            <div className="rounded-[1.75rem] border border-border/80 bg-card p-8 shadow-soft">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Spinner size="sm" />
                {dictionary.services.table.loading}
              </div>
            </div>
          ) : servicesQuery.isError && !servicesQuery.data ? (
            <div className="rounded-[1.75rem] border border-danger/20 bg-card p-8 shadow-soft">
              <p className="text-base font-semibold text-foreground">
                {dictionary.services.form.loadFailed}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {getApiErrorMessage(
                  servicesQuery.error,
                  dictionary.services.form.loadFailed,
                )}
              </p>
              <div className="mt-4">
                <Button variant="outline" onClick={() => void servicesQuery.refetch()}>
                  {dictionary.services.actions.retry}
                </Button>
              </div>
            </div>
          ) : (
            <ServicesTable
              data={servicesQuery.data ?? []}
              isFetching={servicesQuery.isFetching}
              selectedServiceId={
                editorState?.mode === "edit" ? editorState.serviceId : undefined
              }
              emptyTitle={dictionary.services.table.emptyTitle}
              emptyDescription={dictionary.services.table.emptyDescription}
              onEditService={(serviceId) =>
                setEditorState({
                  mode: "edit",
                  serviceId,
                })
              }
            />
          )}
        </div>

        <ServiceFormPanel
          editorState={editorState}
          initialService={selectedService}
          onClose={() => setEditorState(null)}
          onSaved={handleServiceSaved}
        />
      </div>
    </>
  );
}
