import { env } from "@/config/env";
import type { TenantApiContext } from "@/modules/tenant/types/tenant.types";
import {
  extractTenantSlugFromHost,
  getTenantSlugFallback,
  normalizeHost,
  resolveBrowserTenantApiContext,
} from "@/modules/tenant/utils/tenant-host";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly payload?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  accessToken?: string;
  body?: unknown;
  tenant?: TenantApiContext;
}

function resolveRequestTenantContext(tenant?: TenantApiContext) {
  if (tenant?.host || tenant?.slug) {
    return {
      host: normalizeHost(tenant.host),
      slug:
        tenant.slug ??
        extractTenantSlugFromHost(tenant.host) ??
        getTenantSlugFallback(),
    };
  }

  const browserTenant = resolveBrowserTenantApiContext();

  if (browserTenant.host || browserTenant.slug) {
    return browserTenant;
  }

  return {
    slug: getTenantSlugFallback(),
  };
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
) {
  if (!env.apiBaseUrl) {
    throw new ApiError("TURNIX_API_URL is not configured.", 500);
  }

  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (options.accessToken) {
    headers.set("Authorization", `Bearer ${options.accessToken}`);
  }

  const tenant = resolveRequestTenantContext(options.tenant);

  if (tenant.host && !headers.has("x-forwarded-host")) {
    headers.set("x-forwarded-host", tenant.host);
  }

  if (tenant.slug && !headers.has("x-tenant-slug")) {
    headers.set("x-tenant-slug", tenant.slug);
  }

  const { tenant: _tenant, body, accessToken: _accessToken, ...requestOptions } =
    options;
  void _tenant;
  void _accessToken;

  const response = await fetch(new URL(path, env.apiBaseUrl), {
    ...requestOptions,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: requestOptions.cache ?? "no-store",
  });

  if (!response.ok) {
    let payload: unknown;

    try {
      payload = await response.json();
    } catch {
      payload = await response.text();
    }

    throw new ApiError(
      `Request to ${path} failed with status ${response.status}.`,
      response.status,
      payload,
    );
  }

  return (await response.json()) as T;
}
