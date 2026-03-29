import type { AppointmentRecord, AppointmentStatus } from "@/modules/appointments/types/appointment.types";
import type { BranchRecord } from "@/modules/branches/types/branch.types";
import type { ServiceRecord } from "@/modules/services/types/service.types";
import type {
  DashboardSummary,
  DashboardUpcomingResponse,
} from "@/modules/dashboard/types/dashboard.types";

const statusOrder: AppointmentStatus[] = [
  "PENDING",
  "CONFIRMED",
  "CHECKED_IN",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
  "RESCHEDULED",
];

const terminalStatuses = new Set<AppointmentStatus>([
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
]);

export function mapDashboardSummary(input: {
  appointments: AppointmentRecord[] | null;
  activeServices: ServiceRecord[] | null;
  activeBranches: BranchRecord[] | null;
  generatedAt?: string;
}): DashboardSummary {
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const unavailableSections = [
    ...(input.appointments ? [] : (["appointments"] as const)),
    ...(input.activeServices ? [] : (["services"] as const)),
    ...(input.activeBranches ? [] : (["branches"] as const)),
  ];

  const appointments = input.appointments ?? [];
  const activeServices = input.activeServices ?? [];
  const activeBranches = input.activeBranches ?? [];
  const todayDateKey = getLocalDateKey(new Date());

  const appointmentsToday = appointments.filter(
    (appointment) => getLocalDateKey(appointment.scheduledStart) === todayDateKey,
  );
  const liveQueueCount = appointments.filter(
    (appointment) =>
      appointment.status === "CHECKED_IN" || appointment.status === "IN_PROGRESS",
  ).length;
  const upcomingNext24h = appointments.filter((appointment) =>
    isUpcomingInNextHours(appointment, 24),
  ).length;
  const statusBreakdown = input.appointments
    ? statusOrder.map((status) => ({
        status,
        count: appointments.filter((appointment) => appointment.status === status).length,
      }))
    : [];

  return {
    metrics: [
      {
        key: "appointments_today",
        value: input.appointments ? appointmentsToday.length : null,
        tone: "primary",
      },
      {
        key: "confirmed_appointments",
        value: input.appointments
          ? countAppointmentsByStatus(appointments, "CONFIRMED")
          : null,
        tone: "success",
      },
      {
        key: "completed_appointments",
        value: input.appointments
          ? countAppointmentsByStatus(appointments, "COMPLETED")
          : null,
        tone: "neutral",
      },
      {
        key: "cancelled_appointments",
        value: input.appointments
          ? countAppointmentsByStatus(appointments, "CANCELLED")
          : null,
        tone: "danger",
      },
      {
        key: "no_show_appointments",
        value: input.appointments
          ? countAppointmentsByStatus(appointments, "NO_SHOW")
          : null,
        tone: "warning",
      },
      {
        key: "active_services",
        value: input.activeServices ? activeServices.length : null,
        tone: "primary",
      },
    ],
    highlights: [
      {
        key: "active_branches",
        value: input.activeBranches ? activeBranches.length : null,
        tone: "neutral",
      },
      {
        key: "today_pending",
        value: input.appointments
          ? appointmentsToday.filter((appointment) => appointment.status === "PENDING")
              .length
          : null,
        tone: "warning",
      },
      {
        key: "live_queue",
        value: input.appointments ? liveQueueCount : null,
        tone: "success",
      },
      {
        key: "upcoming_next_24h",
        value: input.appointments ? upcomingNext24h : null,
        tone: "primary",
      },
    ],
    statusBreakdown,
    unavailableSections,
    generatedAt,
  };
}

export function mapDashboardUpcomingResponse(
  appointments: AppointmentRecord[],
  generatedAt = new Date().toISOString(),
): DashboardUpcomingResponse {
  return {
    items: appointments
      .filter(isOperationalUpcomingAppointment)
      .sort(
        (left, right) =>
          new Date(left.scheduledStart).getTime() -
          new Date(right.scheduledStart).getTime(),
      )
      .slice(0, 8),
    generatedAt,
  };
}

function countAppointmentsByStatus(
  appointments: AppointmentRecord[],
  status: AppointmentStatus,
) {
  return appointments.filter((appointment) => appointment.status === status).length;
}

function isUpcomingInNextHours(appointment: AppointmentRecord, hours: number) {
  const now = new Date();
  const startsAt = new Date(appointment.scheduledStart).getTime();
  const end = now.getTime() + hours * 60 * 60 * 1000;

  return (
    startsAt >= now.getTime() &&
    startsAt <= end &&
    !terminalStatuses.has(appointment.status)
  );
}

function isOperationalUpcomingAppointment(appointment: AppointmentRecord) {
  const startsAt = new Date(appointment.scheduledStart).getTime();

  return startsAt >= Date.now() && !terminalStatuses.has(appointment.status);
}

function getLocalDateKey(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}
