import type { User } from "next-auth";

import type {
  AuthenticatedBackendSession,
  BackendAuthResponse,
} from "@/modules/auth/types/auth.types";

function buildDisplayName(
  firstName?: string,
  lastName?: string,
  fallback?: string,
) {
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();

  return name || fallback;
}

function resolveExpiryTimestamp(expiresIn?: string | number) {
  if (typeof expiresIn === "number" && Number.isFinite(expiresIn)) {
    return Math.floor(Date.now() / 1000) + expiresIn;
  }

  if (typeof expiresIn !== "string") {
    return undefined;
  }

  const trimmed = expiresIn.trim();

  if (/^\d+$/.test(trimmed)) {
    return Math.floor(Date.now() / 1000) + Number(trimmed);
  }

  const match = trimmed.match(/^(\d+)([smhd])$/i);

  if (!match) {
    return undefined;
  }

  const [, rawValue, unit] = match;
  const value = Number(rawValue);
  const multiplier =
    unit.toLowerCase() === "s"
      ? 1
      : unit.toLowerCase() === "m"
        ? 60
        : unit.toLowerCase() === "h"
          ? 60 * 60
          : 60 * 60 * 24;

  return Math.floor(Date.now() / 1000) + value * multiplier;
}

export function mapBackendAuthResponse(
  response: BackendAuthResponse,
): AuthenticatedBackendSession {
  const name = buildDisplayName(
    response.user.firstName,
    response.user.lastName,
    response.user.email,
  );

  return {
    user: {
      id: response.user.id,
      tenantId: response.user.tenantId,
      branchId: response.user.branchId ?? null,
      email: response.user.email,
      firstName: response.user.firstName,
      lastName: response.user.lastName,
      name,
      role: response.user.role,
      tenant: response.user.tenant,
    },
    accessToken: response.accessToken,
    tokenType: response.tokenType,
    expiresIn: response.expiresIn,
    expiresAt:
      response.expiresAt ?? resolveExpiryTimestamp(response.expiresIn),
  };
}

export function mapAuthenticatedSessionToAuthUser(
  session: AuthenticatedBackendSession,
): User {
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
    tenantId: session.user.tenantId,
    branchId: session.user.branchId,
    firstName: session.user.firstName,
    lastName: session.user.lastName,
    tenant: session.user.tenant,
    accessToken: session.accessToken,
    expiresAt: session.expiresAt,
  };
}
