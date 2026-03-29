import type { ID, ISODateString } from "@/types/domain";
import type {
  ServiceMode,
  ServiceVisibility,
} from "@/modules/services/types/service.types";

export type PublicSlotStatus = "OPEN" | "FULL" | "BLOCKED";
export type PublicAppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW"
  | "RESCHEDULED";
export type PublicAppointmentSource = "WEB" | "STAFF" | "API" | "IMPORT";

export interface PublicBranchSummary {
  id: ID;
  slug: string;
  name: string;
  description: string | null;
  timezone: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
}

export interface PublicServiceRecord {
  id: ID;
  categoryId: ID | null;
  branchId: ID | null;
  slug: string;
  name: string;
  description: string | null;
  visibility: ServiceVisibility;
  mode: ServiceMode;
  durationMinutes: number;
  slotCapacity: number;
  allowOnlineBooking: boolean;
  requiresApproval: boolean;
  branch: PublicBranchSummary | null;
}

export interface PublicServiceSlotRecord {
  id: ID;
  branchId: ID;
  serviceId: ID;
  staffUserId: ID | null;
  slotDate: ISODateString;
  startsAt: ISODateString;
  endsAt: ISODateString;
  capacity: number;
  availableCapacity: number;
  status: PublicSlotStatus;
  branch: PublicBranchSummary;
}

export interface PublicAppointmentCitizenSummary {
  id: ID;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  documentType: string | null;
  documentNumber: string | null;
}

export interface PublicAppointmentServiceSummary {
  id: ID;
  slug: string;
  name: string;
  mode: ServiceMode;
  durationMinutes: number;
}

export interface PublicAppointmentSlotSummary {
  id: ID;
  branchId: ID;
  serviceId: ID;
  staffUserId: ID | null;
  slotDate: ISODateString;
  startsAt: ISODateString;
  endsAt: ISODateString;
}

export interface PublicAppointmentConfirmation {
  id: ID;
  code: string;
  source: PublicAppointmentSource;
  status: PublicAppointmentStatus;
  scheduledStart: ISODateString;
  scheduledEnd: ISODateString;
  citizenNotes: string | null;
  createdAt: ISODateString;
  service: PublicAppointmentServiceSummary;
  branch: PublicBranchSummary;
  citizen: PublicAppointmentCitizenSummary;
  slot: PublicAppointmentSlotSummary;
}

export interface PublicAppointmentLookupCitizenSummary {
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
}

export interface PublicAppointmentLookupServiceSummary {
  id?: ID;
  slug: string;
  name: string;
  mode: ServiceMode;
  durationMinutes: number;
}

export interface PublicAppointmentLookupBranchSummary {
  id?: ID;
  slug: string;
  name: string;
  description: string | null;
  timezone: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
}

export interface PublicAppointmentCancellationSummary {
  cancelledAt: ISODateString;
}

export interface PublicAppointmentLookupRecord {
  code: string;
  status: PublicAppointmentStatus;
  scheduledStart: ISODateString;
  scheduledEnd: ISODateString;
  service: PublicAppointmentLookupServiceSummary;
  branch: PublicAppointmentLookupBranchSummary;
  citizen: PublicAppointmentLookupCitizenSummary;
  cancellation: PublicAppointmentCancellationSummary | null;
}

export interface ListPublicServicesQuery {
  branchId?: string;
  categoryId?: string;
  search?: string;
}

export interface ListPublicServiceSlotsQuery {
  dateFrom?: string;
  dateTo?: string;
  branchId?: string;
}

export interface CreatePublicAppointmentInput {
  serviceId: ID;
  branchId: ID;
  slotId: ID;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  documentType?: string;
  documentNumber?: string;
  citizenNotes?: string;
}

export interface CancelPublicAppointmentInput {
  reason?: string;
  details?: string;
}

export interface ReschedulePublicAppointmentInput {
  newSlotId: ID;
  reason?: string;
  details?: string;
}

export interface PublicBookingFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  documentType: string;
  documentNumber: string;
  citizenNotes: string;
  slotId: string;
}

export interface PublicBookingDraft extends Partial<PublicBookingFormValues> {
  serviceId?: string;
  serviceName?: string;
  branchId?: string;
  branchName?: string;
}

export interface PublicAppointmentLookupFormValues {
  code: string;
}

export interface PublicAppointmentCancellationFormValues {
  reason: string;
  details: string;
}

export interface PublicAppointmentRescheduleFormValues {
  selectedDate: string;
  branchId: string;
  slotId: string;
  reason: string;
  details: string;
}
