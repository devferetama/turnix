export type TenantResolutionSource = "host" | "env-fallback" | "none";

export interface TenantBranding {
  displayName: string;
  shortName: string;
  logoLabel: string;
  primaryColorToken: string;
}

export interface TenantRuntimeContext {
  slug: string | null;
  host: string | null;
  source: TenantResolutionSource;
  isResolved: boolean;
  isFallback: boolean;
  branding: TenantBranding;
}

export interface TenantApiContext {
  slug?: string | null;
  host?: string | null;
}
