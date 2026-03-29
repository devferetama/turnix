import { ApiError } from "@/lib/api/client";

function extractMessageFromPayload(payload: unknown): string | undefined {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  if (Array.isArray(payload)) {
    const messages = payload.filter(
      (value): value is string =>
        typeof value === "string" && value.trim().length > 0,
    );

    return messages.length > 0 ? messages.join(" ") : undefined;
  }

  if (!payload || typeof payload !== "object") {
    return undefined;
  }

  if ("message" in payload) {
    return extractMessageFromPayload(
      (payload as { message?: unknown }).message,
    );
  }

  return undefined;
}

export function getApiErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return extractMessageFromPayload(error.payload) ?? error.message;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return undefined;
}

export function getSignInErrorMessage(
  error: string | null | undefined,
  fallback: string,
) {
  if (!error) {
    return fallback;
  }

  const knownAuthErrors = new Set([
    "CredentialsSignin",
    "AccessDenied",
    "CallbackRouteError",
    "Configuration",
  ]);

  if (knownAuthErrors.has(error)) {
    return fallback;
  }

  return error;
}
