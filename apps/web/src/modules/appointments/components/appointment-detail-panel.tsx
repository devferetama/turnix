"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/atoms/card";
import { Badge } from "@/components/ui/atoms/badge";
import { Button } from "@/components/ui/atoms/button";
import { Spinner } from "@/components/ui/atoms/spinner";
import { Textarea } from "@/components/ui/atoms/textarea";
import { StatusBadge } from "@/components/ui/molecules/status-badge";
import { ApiError } from "@/lib/api/client";
import { formatDateTime, formatTimeRange } from "@/lib/utils";
import { AppointmentReschedulePanel } from "@/modules/appointments/components/appointment-reschedule-panel";
import { appointmentStatusFlow } from "@/modules/appointments/constants/appointments.constants";
import {
  useAppointmentQuery,
} from "@/modules/appointments/hooks/use-appointment-query";
import {
  useCancelAppointmentMutation,
  useUpdateAppointmentStatusMutation,
} from "@/modules/appointments/hooks/use-appointment-mutations";
import type {
  AppointmentRecord,
  AppointmentStatus,
} from "@/modules/appointments/types/appointment.types";
import { useI18n } from "@/providers/i18n-provider";
import { useState } from "react";

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

export function AppointmentDetailPanel({
  appointmentId,
  initialAppointment,
  onClose,
}: {
  appointmentId: string;
  initialAppointment?: AppointmentRecord;
  onClose: () => void;
}) {
  const { dictionary, locale } = useI18n();
  const detailQuery = useAppointmentQuery(appointmentId, initialAppointment);
  const statusMutation = useUpdateAppointmentStatusMutation(appointmentId);
  const cancelMutation = useCancelAppointmentMutation(appointmentId);
  const [statusNote, setStatusNote] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [cancelDetails, setCancelDetails] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isCancellationOpen, setIsCancellationOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);

  if (detailQuery.isPending && !detailQuery.data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{dictionary.appointments.editor.loading}</CardTitle>
          <CardDescription>
            {dictionary.appointments.editor.detailDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-3 pt-0 text-sm text-muted-foreground">
          <Spinner size="sm" />
          {dictionary.appointments.editor.loading}
        </CardContent>
      </Card>
    );
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{dictionary.appointments.editor.loadErrorTitle}</CardTitle>
          <CardDescription>
            {dictionary.appointments.editor.loadError}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pt-0">
          <Button variant="outline" onClick={() => void detailQuery.refetch()}>
            {dictionary.appointments.actions.retry}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            {dictionary.appointments.actions.closePanel}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const appointment = detailQuery.data;
  const allowedNextStatuses = (appointmentStatusFlow[appointment.status] ?? []).filter(
    (status) => status !== "CANCELLED",
  );
  const canCancel =
    appointment.status === "PENDING" || appointment.status === "CONFIRMED";
  const canReschedule =
    appointment.status === "PENDING" || appointment.status === "CONFIRMED";

  const handleStatusChange = async (nextStatus: AppointmentStatus) => {
    try {
      const updated = await statusMutation.mutateAsync({
        status: nextStatus,
        note: statusNote.trim() || undefined,
      });
      setActionError(null);
      setActionSuccess(
        dictionary.appointments.statusActions.success[
          updated.status as keyof typeof dictionary.appointments.statusActions.success
        ] ?? dictionary.appointments.statusActions.updated,
      );
      setStatusNote("");
    } catch (error) {
      setActionSuccess(null);
      setActionError(
        getApiErrorMessage(error, dictionary.appointments.statusActions.failed),
      );
    }
  };

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync({
        reason: cancelReason.trim() || undefined,
        details: cancelDetails.trim() || undefined,
      });
      setActionError(null);
      setActionSuccess(dictionary.appointments.cancellation.success);
      setCancelReason("");
      setCancelDetails("");
      setIsCancellationOpen(false);
    } catch (error) {
      setActionSuccess(null);
      setActionError(
        getApiErrorMessage(error, dictionary.appointments.cancellation.failed),
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>{appointment.code}</CardTitle>
            <CardDescription>
              {dictionary.appointments.editor.detailDescription}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={appointment.status} />
            <Badge variant={getSourceBadgeVariant(appointment.source)}>
              {
                dictionary.appointments.options.sources[
                  appointment.source as keyof typeof dictionary.appointments.options.sources
                ]
              }
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-0">
        <div className="grid gap-4 rounded-[1.25rem] border border-border/70 bg-surface p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              {dictionary.appointments.detail.summaryTitle}
            </p>
            <p className="mt-2 text-sm text-foreground">
              {formatDateTime(appointment.scheduledStart, locale)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatTimeRange(
                appointment.scheduledStart,
                appointment.scheduledEnd,
                locale,
              )}
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {dictionary.appointments.detail.serviceLabel}
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {appointment.service.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {appointment.branch.name}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {dictionary.appointments.detail.citizenLabel}
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {getCitizenLabel(appointment)}
              </p>
              <p className="text-sm text-muted-foreground">
                {appointment.citizen.email ??
                  dictionary.appointments.table.noCitizenEmail}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.25rem] border border-border/70 bg-surface p-4">
            <p className="text-sm font-semibold text-foreground">
              {dictionary.appointments.detail.slotTitle}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {formatDateTime(appointment.slot.startsAt, locale)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatTimeRange(
                appointment.slot.startsAt,
                appointment.slot.endsAt,
                locale,
              )}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              {dictionary.appointments.detail.slotCapacityLabel}:{" "}
              {appointment.slot.reservedCount}/{appointment.slot.capacity}
            </p>
          </div>

          <div className="rounded-[1.25rem] border border-border/70 bg-surface p-4">
            <p className="text-sm font-semibold text-foreground">
              {dictionary.appointments.detail.notesTitle}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {appointment.citizenNotes ??
                dictionary.appointments.detail.noCitizenNotes}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              {appointment.internalNotes ??
                dictionary.appointments.detail.noInternalNotes}
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-[1.25rem] border border-border/70 bg-surface p-4">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {dictionary.appointments.statusActions.title}
            </p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {dictionary.appointments.statusActions.description}
            </p>
          </div>

          {allowedNextStatuses.length ? (
            <>
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">
                  {dictionary.appointments.statusActions.noteLabel}
                </span>
                <Textarea
                  value={statusNote}
                  onChange={(event) => setStatusNote(event.target.value)}
                  placeholder={dictionary.appointments.statusActions.notePlaceholder}
                />
              </label>
              <div className="flex flex-wrap gap-2">
                {allowedNextStatuses.map((status) => (
                  <Button
                    key={status}
                    variant="outline"
                    size="sm"
                    disabled={statusMutation.isPending}
                    onClick={() => void handleStatusChange(status)}
                  >
                    {
                      dictionary.appointments.statusActions.buttons[
                        status as keyof typeof dictionary.appointments.statusActions.buttons
                      ]
                    }
                  </Button>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {dictionary.appointments.statusActions.noActions}
            </p>
          )}
        </div>

        <div className="space-y-4 rounded-[1.25rem] border border-border/70 bg-surface p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {dictionary.appointments.reschedule.title}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {dictionary.appointments.reschedule.description}
              </p>
            </div>
            {canReschedule ? (
              <Button
                variant={isRescheduleOpen ? "ghost" : "outline"}
                size="sm"
                onClick={() => {
                  setIsRescheduleOpen((current) => !current);
                  setIsCancellationOpen(false);
                  setActionError(null);
                  setActionSuccess(null);
                }}
              >
                {isRescheduleOpen
                  ? dictionary.appointments.reschedule.hideForm
                  : dictionary.appointments.reschedule.showForm}
              </Button>
            ) : null}
          </div>

          {canReschedule && isRescheduleOpen ? (
            <AppointmentReschedulePanel
              appointment={appointment}
              onClose={() => setIsRescheduleOpen(false)}
              onRescheduled={() => {
                setIsRescheduleOpen(false);
                setActionError(null);
                setActionSuccess(dictionary.appointments.reschedule.success);
              }}
            />
          ) : null}

          {!canReschedule ? (
            <p className="text-sm text-muted-foreground">
              {dictionary.appointments.reschedule.unavailable}
            </p>
          ) : null}
        </div>

        <div className="space-y-4 rounded-[1.25rem] border border-border/70 bg-surface p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {dictionary.appointments.cancellation.title}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {dictionary.appointments.cancellation.description}
              </p>
            </div>
            {canCancel ? (
              <Button
                variant={isCancellationOpen ? "ghost" : "outline"}
                size="sm"
                onClick={() => {
                  setIsCancellationOpen((current) => !current);
                  setIsRescheduleOpen(false);
                  setActionError(null);
                  setActionSuccess(null);
                }}
              >
                {isCancellationOpen
                  ? dictionary.appointments.cancellation.hideForm
                  : dictionary.appointments.cancellation.showForm}
              </Button>
            ) : null}
          </div>

          {appointment.cancellation ? (
            <div className="rounded-[1rem] border border-danger/20 bg-danger/5 p-4">
              <p className="text-sm font-semibold text-foreground">
                {appointment.cancellation.reason ??
                  dictionary.appointments.cancellation.noReason}
              </p>
              {appointment.cancellation.details ? (
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {appointment.cancellation.details}
                </p>
              ) : null}
              <p className="mt-3 text-xs text-muted-foreground">
                {formatDateTime(appointment.cancellation.cancelledAt, locale)}
              </p>
            </div>
          ) : null}

          {canCancel && isCancellationOpen ? (
            <div className="grid gap-4">
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">
                  {dictionary.appointments.cancellation.reasonLabel}
                </span>
                <Textarea
                  value={cancelReason}
                  onChange={(event) => setCancelReason(event.target.value)}
                  placeholder={dictionary.appointments.cancellation.reasonPlaceholder}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">
                  {dictionary.appointments.cancellation.detailsLabel}
                </span>
                <Textarea
                  value={cancelDetails}
                  onChange={(event) => setCancelDetails(event.target.value)}
                  placeholder={dictionary.appointments.cancellation.detailsPlaceholder}
                />
              </label>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  disabled={cancelMutation.isPending}
                  onClick={() => void handleCancel()}
                >
                  {cancelMutation.isPending
                    ? dictionary.appointments.cancellation.cancelling
                    : dictionary.appointments.cancellation.submit}
                </Button>
              </div>
            </div>
          ) : null}

          {!canCancel && !appointment.cancellation ? (
            <p className="text-sm text-muted-foreground">
              {dictionary.appointments.cancellation.unavailable}
            </p>
          ) : null}
        </div>

        <div className="space-y-4 rounded-[1.25rem] border border-border/70 bg-surface p-4">
          <p className="text-sm font-semibold text-foreground">
            {dictionary.appointments.history.title}
          </p>
          {appointment.statusHistory?.length ? (
            <div className="space-y-3">
              {appointment.statusHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-[1rem] border border-border/60 bg-background/70 p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">
                      <StatusBadge status={entry.toStatus} />
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(entry.changedAt, locale)}
                    </p>
                  </div>
                  {entry.note ? (
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {entry.note}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {dictionary.appointments.history.empty}
            </p>
          )}
        </div>

        {actionError ? <p className="text-sm text-danger">{actionError}</p> : null}
        {actionSuccess ? (
          <p className="text-sm text-success">{actionSuccess}</p>
        ) : null}

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            {dictionary.appointments.actions.closePanel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
