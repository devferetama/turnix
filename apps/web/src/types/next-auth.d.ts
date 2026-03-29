import type { DefaultUser } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";

import type { AppRole, Tenant } from "@/types/domain";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      image?: string | null;
      tenantId?: string;
      branchId?: string | null;
      firstName?: string;
      lastName?: string;
      tenant?: Tenant;
      role: AppRole;
    };
    accessToken?: string;
    error?: "RefreshAccessTokenError";
  }

  interface User extends DefaultUser {
    id: string;
    tenantId?: string;
    branchId?: string | null;
    firstName?: string;
    lastName?: string;
    tenant?: Tenant;
    role: AppRole;
    accessToken?: string;
    expiresAt?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    tenantId?: string;
    branchId?: string | null;
    firstName?: string;
    lastName?: string;
    tenant?: Tenant;
    role?: AppRole;
    accessToken?: string;
    expiresAt?: number;
    error?: "RefreshAccessTokenError";
  }
}
