import type { AppointmentRecord, AppointmentStatus } from "@/modules/appointments/types/appointment.types";
import type { ISODateString } from "@/types/domain";

export type DashboardMetricKey =
  | "appointments_today"
  | "confirmed_appointments"
  | "completed_appointments"
  | "cancelled_appointments"
  | "no_show_appointments"
  | "active_services";

export type DashboardHighlightKey =
  | "active_branches"
  | "today_pending"
  | "live_queue"
  | "upcoming_next_24h";

export type DashboardUnavailableSection =
  | "appointments"
  | "services"
  | "branches";

export interface DashboardMetric {
  key: DashboardMetricKey;
  value: number | null;
  tone: "primary" | "success" | "warning" | "danger" | "neutral";
}

export interface DashboardHighlight {
  key: DashboardHighlightKey;
  value: number | null;
  tone: "primary" | "success" | "warning" | "neutral";
}

export interface DashboardStatusBreakdownItem {
  status: AppointmentStatus;
  count: number;
}

export interface DashboardSummary {
  metrics: DashboardMetric[];
  highlights: DashboardHighlight[];
  statusBreakdown: DashboardStatusBreakdownItem[];
  unavailableSections: DashboardUnavailableSection[];
  generatedAt: ISODateString;
}

export interface DashboardUpcomingResponse {
  items: AppointmentRecord[];
  generatedAt: ISODateString;
}
