import type { AppRole, ID, SessionUser, Tenant } from "@/types/domain";

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface BackendAuthenticatedUser {
  id: ID;
  tenantId: ID;
  branchId?: ID | null;
  email: string;
  firstName: string;
  lastName: string;
  role: AppRole;
  isActive?: boolean;
  tenant?: Tenant;
}

export interface BackendAuthTokens {
  accessToken: string;
  tokenType: string;
  expiresIn?: string | number;
  expiresAt?: number;
}

export interface BackendAuthResponse extends BackendAuthTokens {
  user: BackendAuthenticatedUser;
}

export interface AuthenticatedBackendSession extends BackendAuthTokens {
  user: SessionUser;
}

export interface RouteAccessRule {
  roles: AppRole[];
}
