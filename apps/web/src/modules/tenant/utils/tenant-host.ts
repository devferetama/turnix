import { env } from "@/config/env";
import type {
  TenantApiContext,
  TenantBranding,
  TenantResolutionSource,
  TenantRuntimeContext,
} from "@/modules/tenant/types/tenant.types";

const RESERVED_HOST_LABELS = new Set(["www", "app", "api"]);

function toTitleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function normalizeTenantSlug(value?: string | null) {
  const normalized = value?.trim().toLowerCase() ?? "";
  return normalized || null;
}

export function normalizeHost(rawHost?: string | null) {
  if (!rawHost) {
    return null;
  }

  const value = rawHost.split(",")[0]?.trim().toLowerCase();

  if (!value) {
    return null;
  }

  if (value.includes("://")) {
    try {
      return new URL(value).host.toLowerCase();
    } catch {
      return value;
    }
  }

  return value;
}

export function stripPortFromHost(host?: string | null) {
  if (!host) {
    return null;
  }

  const normalized = normalizeHost(host);

  if (!normalized) {
    return null;
  }

  if (normalized.startsWith("[")) {
    const closingBracketIndex = normalized.indexOf("]");
    return closingBracketIndex === -1
      ? normalized
      : normalized.slice(1, closingBracketIndex);
  }

  const lastColonIndex = normalized.lastIndexOf(":");

  if (lastColonIndex === -1) {
    return normalized;
  }

  return normalized.slice(0, lastColonIndex);
}

export function extractTenantSlugFromHost(rawHost?: string | null) {
  const hostname = stripPortFromHost(rawHost);

  if (!hostname || hostname === "localhost") {
    return null;
  }

  if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return null;
  }

  const labels = hostname.split(".").filter(Boolean);

  if (labels.length < 2) {
    return null;
  }

  const candidate = hostname.endsWith(".localhost")
    ? labels.at(-2)
    : labels.length >= 3
      ? labels.at(-3)
      : null;

  const normalized = normalizeTenantSlug(candidate);

  if (!normalized || RESERVED_HOST_LABELS.has(normalized)) {
    return null;
  }

  return normalized;
}

export function humanizeTenantSlug(slug?: string | null) {
  const normalized = normalizeTenantSlug(slug);

  if (!normalized) {
    return null;
  }

  return normalized
    .split("-")
    .filter(Boolean)
    .map(toTitleCase)
    .join(" ");
}

function buildLogoLabel(displayName: string) {
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

  return initials || "TX";
}

export function buildTenantBranding(slug?: string | null): TenantBranding {
  const displayName = humanizeTenantSlug(slug) ?? env.appName;

  return {
    displayName,
    shortName: displayName,
    logoLabel: buildLogoLabel(displayName),
    primaryColorToken: "primary",
  };
}

export function createTenantRuntimeContext(input: {
  slug?: string | null;
  host?: string | null;
  source?: TenantResolutionSource;
} = {}): TenantRuntimeContext {
  const slug = normalizeTenantSlug(input.slug);
  const host = normalizeHost(input.host);
  const source = input.source ?? (slug ? "host" : "none");

  return {
    slug,
    host,
    source,
    isResolved: Boolean(slug),
    isFallback: source === "env-fallback",
    branding: buildTenantBranding(slug),
  };
}

export function getTenantSlugFallback() {
  return normalizeTenantSlug(env.tenantSlugFallback);
}

export function createTenantContextFromHost(rawHost?: string | null) {
  const host = normalizeHost(rawHost);
  const hostSlug = extractTenantSlugFromHost(host);
  const fallbackSlug = getTenantSlugFallback();

  if (hostSlug) {
    return createTenantRuntimeContext({
      slug: hostSlug,
      host,
      source: "host",
    });
  }

  if (fallbackSlug) {
    return createTenantRuntimeContext({
      slug: fallbackSlug,
      host,
      source: "env-fallback",
    });
  }

  return createTenantRuntimeContext({
    host,
    source: "none",
  });
}

export function resolveBrowserTenantApiContext(): TenantApiContext {
  if (typeof window === "undefined") {
    return {};
  }

  const host = normalizeHost(window.location.host);
  const slug = extractTenantSlugFromHost(host) ?? getTenantSlugFallback();

  return {
    host,
    slug,
  };
}
