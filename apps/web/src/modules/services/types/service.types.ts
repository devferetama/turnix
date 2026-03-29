import type { ID, ISODateString, Service } from "@/types/domain";

export const serviceVisibilityValues = [
  "PUBLIC",
  "PRIVATE",
  "INTERNAL",
] as const;

export const serviceModeValues = ["IN_PERSON", "REMOTE", "HYBRID"] as const;

export type ServiceVisibility = (typeof serviceVisibilityValues)[number];
export type ServiceMode = (typeof serviceModeValues)[number];

export interface ServiceRecord extends Service {
  categoryId: ID | null;
  branchId: ID | null;
  slug: string;
  description: string | null;
  visibility: ServiceVisibility;
  mode: ServiceMode;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  slotCapacity: number;
  allowOnlineBooking: boolean;
  requiresApproval: boolean;
  requiresAuthentication: boolean;
  allowsCancellation: boolean;
  allowsReschedule: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface ListServicesQuery {
  isActive?: boolean;
  visibility?: ServiceVisibility;
  categoryId?: string;
  branchId?: string;
  search?: string;
}

export interface ServiceFormValues {
  categoryId: string;
  branchId: string;
  slug: string;
  name: string;
  description: string;
  visibility: ServiceVisibility;
  mode: ServiceMode;
  durationMinutes: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  slotCapacity: number;
  allowOnlineBooking: boolean;
  requiresApproval: boolean;
  requiresAuthentication: boolean;
  allowsCancellation: boolean;
  allowsReschedule: boolean;
  isActive: boolean;
}

export interface UpsertServiceInput {
  categoryId?: string;
  branchId?: string;
  slug: string;
  name: string;
  description?: string;
  visibility?: ServiceVisibility;
  mode?: ServiceMode;
  durationMinutes: number;
  bufferBeforeMinutes?: number;
  bufferAfterMinutes?: number;
  slotCapacity?: number;
  allowOnlineBooking?: boolean;
  requiresApproval?: boolean;
  requiresAuthentication?: boolean;
  allowsCancellation?: boolean;
  allowsReschedule?: boolean;
  isActive?: boolean;
}

export type CreateServiceInput = UpsertServiceInput;
export type UpdateServiceInput = Partial<UpsertServiceInput>;
