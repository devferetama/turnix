"use client";

import { useDeferredValue, useState } from "react";

import { Button } from "@/components/ui/atoms/button";
import { Spinner } from "@/components/ui/atoms/spinner";
import { PageHeader } from "@/components/ui/organisms/page-header";
import { ApiError } from "@/lib/api/client";
import { BranchFormPanel } from "@/modules/branches/components/branch-form-panel";
import { BranchesFilters } from "@/modules/branches/components/branches-filters";
import { BranchesTable } from "@/modules/branches/components/branches-table";
import { useBranchesQuery } from "@/modules/branches/hooks/use-branches-query";
import {
  mapBranchToTableRow,
  type BranchRecord,
  type ListBranchesQuery,
} from "@/modules/branches/types/branch.types";
import { useI18n } from "@/providers/i18n-provider";

type BranchEditorState =
  | {
      mode: "create";
    }
  | {
      mode: "edit";
      branchId: string;
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

export function BranchesManagement() {
  const { dictionary } = useI18n();
  const [filters, setFilters] = useState<ListBranchesQuery>({ search: "" });
  const [editorState, setEditorState] = useState<BranchEditorState>(null);
  const deferredSearch = useDeferredValue(filters.search ?? "");
  const queryFilters: ListBranchesQuery = {
    ...filters,
    search: deferredSearch.trim() || undefined,
  };
  const branchesQuery = useBranchesQuery(queryFilters);
  const selectedBranch =
    editorState?.mode === "edit"
      ? branchesQuery.data?.find((branch) => branch.id === editorState.branchId)
      : undefined;
  const hasActiveFilters = Boolean(
    filters.search?.trim() || filters.isActive !== undefined,
  );

  const handleBranchSaved = (branch: BranchRecord) => {
    setEditorState({
      mode: "edit",
      branchId: branch.id,
    });
  };

  return (
    <>
      <PageHeader
        title={dictionary.branches.page.title}
        description={dictionary.branches.page.description}
        actions={
          <Button onClick={() => setEditorState({ mode: "create" })}>
            {dictionary.branches.actions.create}
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.9fr)]">
        <div className="space-y-6">
          <BranchesFilters
            filters={filters}
            resultCount={branchesQuery.data?.length ?? 0}
            isFetching={branchesQuery.isFetching}
            hasActiveFilters={hasActiveFilters}
            onSearchChange={(search) =>
              setFilters((current) => ({
                ...current,
                search,
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

          {branchesQuery.isPending && !branchesQuery.data ? (
            <div className="rounded-[1.75rem] border border-border/80 bg-card p-8 shadow-soft">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Spinner size="sm" />
                {dictionary.branches.table.loading}
              </div>
            </div>
          ) : branchesQuery.isError && !branchesQuery.data ? (
            <div className="rounded-[1.75rem] border border-danger/20 bg-card p-8 shadow-soft">
              <p className="text-base font-semibold text-foreground">
                {dictionary.branches.form.loadFailed}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {getApiErrorMessage(
                  branchesQuery.error,
                  dictionary.branches.form.loadFailed,
                )}
              </p>
              <div className="mt-4">
                <Button variant="outline" onClick={() => void branchesQuery.refetch()}>
                  {dictionary.branches.actions.retry}
                </Button>
              </div>
            </div>
          ) : (
            <BranchesTable
              data={(branchesQuery.data ?? []).map(mapBranchToTableRow)}
              isFetching={branchesQuery.isFetching}
              selectedBranchId={
                editorState?.mode === "edit" ? editorState.branchId : undefined
              }
              emptyTitle={dictionary.branches.table.emptyTitle}
              emptyDescription={dictionary.branches.table.emptyDescription}
              onEditBranch={(branchId) =>
                setEditorState({
                  mode: "edit",
                  branchId,
                })
              }
            />
          )}
        </div>

        <BranchFormPanel
          editorState={editorState}
          initialBranch={selectedBranch}
          onClose={() => setEditorState(null)}
          onSaved={handleBranchSaved}
        />
      </div>
    </>
  );
}
