import type { AppRole, ID, ISODateString } from "@/types/domain";

export const appointmentStatusValues = [
  "PENDING",
  "CONFIRMED",
  "CHECKED_IN",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
  "RESCHEDULED",
] as const;

export const appointmentSourceValues = [
  "WEB",
  "STAFF",
  "API",
  "IMPORT",
] as const;

export const slotStatusValues = [
  "OPEN",
  "FULL",
  "BLOCKED",
  "CANCELLED",
] as const;

export type AppointmentStatus = (typeof appointmentStatusValues)[number];
export type AppointmentSource = (typeof appointmentSourceValues)[number];
export type SlotStatus = (typeof slotStatusValues)[number];
export type AppointmentCitizenMode = "existing" | "create";

export interface AppointmentBranchSummary {
  id: ID;
  slug: string;
  name: string;
}

export interface AppointmentServiceSummary {
  id: ID;
  slug: string;
  name: string;
  visibility: "PUBLIC" | "PRIVATE" | "INTERNAL";
  mode: "IN_PERSON" | "REMOTE" | "HYBRID";
  durationMinutes: number;
}

export interface AppointmentCitizenSummary {
  id: ID;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  documentType: string | null;
  documentNumber: string | null;
}

export interface AppointmentStaffUserSummary {
  id: ID;
  branchId: ID | null;
  email: string;
  firstName: string;
  lastName: string;
  role: AppRole;
}

export interface AppointmentSlotSummary {
  id: ID;
  slotDate: ISODateString;
  startsAt: ISODateString;
  endsAt: ISODateString;
  capacity: number;
  reservedCount: number;
  status: SlotStatus;
  branchId: ID;
  serviceId: ID;
  staffUserId: ID | null;
}

export interface AppointmentStatusHistoryRecord {
  id: ID;
  appointmentId: ID;
  fromStatus: AppointmentStatus | null;
  toStatus: AppointmentStatus;
  note: string | null;
  metadata?: Record<string, unknown> | null;
  changedByStaffUserId: ID | null;
  changedAt: ISODateString;
  changedByStaffUser?: AppointmentStaffUserSummary | null;
}

export interface AppointmentCancellationRecord {
  id: ID;
  appointmentId: ID;
  cancelledByStaffUserId: ID | null;
  reason: string | null;
  details: string | null;
  cancelledAt: ISODateString;
  cancelledByStaffUser?: AppointmentStaffUserSummary | null;
}

export interface AppointmentRecord {
  id: ID;
  tenantId: ID;
  branchId: ID;
  serviceId: ID;
  citizenId: ID;
  staffUserId: ID | null;
  slotId: ID;
  code: string;
  source: AppointmentSource;
  status: AppointmentStatus;
  scheduledStart: ISODateString;
  scheduledEnd: ISODateString;
  citizenNotes: string | null;
  internalNotes: string | null;
  checkedInAt: ISODateString | null;
  completedAt: ISODateString | null;
  cancelledAt: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  branch: AppointmentBranchSummary;
  service: AppointmentServiceSummary;
  citizen: AppointmentCitizenSummary;
  slot: AppointmentSlotSummary;
  staffUser: AppointmentStaffUserSummary | null;
  cancellation?: AppointmentCancellationRecord | null;
  statusHistory?: AppointmentStatusHistoryRecord[];
}

export interface ListAppointmentsQuery {
  status?: AppointmentStatus;
  serviceId?: string;
  branchId?: string;
  citizenId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface AppointmentCitizenInput {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  documentType?: string;
  documentNumber?: string;
}

export interface CreateAppointmentInput {
  branchId: string;
  serviceId: string;
  slotId: string;
  citizenId?: string;
  citizen?: AppointmentCitizenInput;
  staffUserId?: string;
  source?: AppointmentSource;
  citizenNotes?: string;
  internalNotes?: string;
}

export interface UpdateAppointmentStatusInput {
  status: AppointmentStatus;
  note?: string;
}

export interface CancelAppointmentInput {
  reason?: string;
  details?: string;
}

export interface RescheduleAppointmentInput {
  newSlotId: string;
  reason?: string;
  details?: string;
}

export interface AppointmentSlotLookupRecord {
  id: ID;
  slotDate: ISODateString;
  startsAt: ISODateString;
  endsAt: ISODateString;
  capacity: number;
  reservedCount: number;
  status: SlotStatus;
  branchId: ID;
  serviceId: ID;
  staffUserId: ID | null;
}

export interface AppointmentSlotLookupResult {
  items: AppointmentSlotLookupRecord[];
  mode: "available" | "manual";
}

export interface AppointmentFormValues {
  branchId: string;
  serviceId: string;
  slotId: string;
  selectedDate: string;
  citizenMode: AppointmentCitizenMode;
  citizenId: string;
  citizenFirstName: string;
  citizenLastName: string;
  citizenEmail: string;
  citizenPhone: string;
  citizenDocumentType: string;
  citizenDocumentNumber: string;
  staffUserId: string;
  source: AppointmentSource;
  citizenNotes: string;
  internalNotes: string;
}

export interface AppointmentRescheduleFormValues {
  branchId: string;
  selectedDate: string;
  slotId: string;
  reason: string;
  details: string;
}
