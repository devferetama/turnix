import { AppRole } from '@prisma/client';

export interface AuthenticatedTenant {
  id: string;
  slug: string;
  name: string;
  timezone: string;
  isActive: boolean;
}

export interface AuthenticatedUser {
  id: string;
  tenantId: string;
  branchId: string | null;
  email: string;
  firstName: string;
  lastName: string;
  role: AppRole;
  isActive: boolean;
  tenant: AuthenticatedTenant;
}
