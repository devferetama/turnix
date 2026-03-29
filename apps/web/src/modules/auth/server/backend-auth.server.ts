import "server-only";

import { env, isBackendEnabled } from "@/config/env";
import { ApiError, apiRequest } from "@/lib/api/client";
import { mapBackendAuthResponse } from "@/modules/auth/mappers/session.mapper";
import { getServerTenantApiContext, getServerTenantContext } from "@/modules/tenant/server/tenant-context.server";
import type {
  AuthenticatedBackendSession,
  BackendAuthResponse,
  LoginFormValues,
} from "@/modules/auth/types/auth.types";

const DEV_CREDENTIALS = {
  email: "admin@turnix.local",
  password: "Turnix123!",
};

function buildDevSession(
  tenantSlug = "demo",
  tenantName = "Turnix Demo",
): AuthenticatedBackendSession {
  const normalizedSlug = tenantSlug.trim().toLowerCase() || "demo";
  const tenantId = `tenant_${normalizedSlug.replace(/-/g, "_")}`;

  return {
    user: {
      id: "usr_turnix_admin",
      tenantId,
      branchId: null,
      email: DEV_CREDENTIALS.email,
      firstName: "Turnix",
      lastName: "Admin",
      name: "Turnix Platform Admin",
      role: "TENANT_ADMIN",
      tenant: {
        id: tenantId,
        slug: normalizedSlug,
        name: tenantName,
        timezone: "America/Santiago",
        isActive: true,
      },
    },
    accessToken: "turnix-dev-access-token",
    tokenType: "Bearer",
    expiresIn: "8h",
    expiresAt: Math.floor(Date.now() / 1000) + 60 * 60,
  };
}

async function getDevSession() {
  const tenant = await getServerTenantContext();

  return buildDevSession(
    tenant.slug ?? "demo",
    tenant.isResolved ? tenant.branding.displayName : "Turnix Demo",
  );
}

export async function authenticateWithBackend(
  input: LoginFormValues,
): Promise<AuthenticatedBackendSession> {
  if (isBackendEnabled()) {
    const tenant = await getServerTenantApiContext();
    const response = await apiRequest<BackendAuthResponse>("/api/v1/auth/login", {
      method: "POST",
      body: input,
      tenant,
    });

    return mapBackendAuthResponse(response);
  }

  if (
    env.allowDevCredentials &&
    input.email === DEV_CREDENTIALS.email &&
    input.password === DEV_CREDENTIALS.password
  ) {
    return getDevSession();
  }

  throw new ApiError("Invalid email or password.", 401, {
    message: "Invalid email or password",
  });
}

export async function getBackendCurrentUser(accessToken?: string) {
  if (!accessToken) {
    return null;
  }

  if (!isBackendEnabled()) {
    return (await getDevSession()).user;
  }

  const tenant = await getServerTenantApiContext();
  return apiRequest<BackendAuthResponse["user"]>("/api/v1/auth/me", {
    method: "GET",
    accessToken,
    tenant,
  });
}

export async function validateBackendSession(accessToken?: string) {
  if (!accessToken) {
    return false;
  }

  try {
    await getBackendCurrentUser(accessToken);
    return true;
  } catch {
    return false;
  }
}
