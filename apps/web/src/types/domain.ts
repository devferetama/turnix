export type ID = string;
export type ISODateString = string;

export type AppRole =
  | "SUPER_ADMIN"
  | "TENANT_ADMIN"
  | "OPERATOR"
  | "VIEWER";

export interface SessionUser {
  id: ID;
  tenantId?: ID;
  branchId?: ID | null;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: AppRole;
  tenant?: Tenant;
}

export interface AppSession {
  user: SessionUser;
  accessToken?: string;
}

export interface Tenant {
  id: ID;
  slug: string;
  name: string;
  timezone: string;
  isActive?: boolean;
}

export interface Branch {
  id: ID;
  tenantId: ID;
  name: string;
  isActive: boolean;
}

export interface Service {
  id: ID;
  tenantId: ID;
  name: string;
  durationMinutes: number;
  isActive: boolean;
}

export interface TimeSlot {
  id: ID;
  serviceId: ID;
  startsAt: ISODateString;
  endsAt: ISODateString;
  capacity: number;
  reservedCount: number;
}

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export interface Appointment {
  id: ID;
  serviceId: ID;
  slotId: ID;
  code: string;
  startsAt: ISODateString;
  status: AppointmentStatus;
}

export interface PublicBookingInput {
  name: string;
  email: string;
  serviceId: ID;
  slotId: ID;
}
