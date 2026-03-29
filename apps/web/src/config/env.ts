const isProduction = process.env.NODE_ENV === "production";
const defaultTenantSlugFallback = isProduction ? "" : "demo";

export const env = {
  appName: "Turnix",
  appUrl: process.env.NEXTAUTH_URL ?? "http://localhost:3000",
  authSecret: process.env.NEXTAUTH_SECRET ?? "turnix-development-secret",
  apiBaseUrl:
    process.env.TURNIX_API_URL ?? process.env.NEXT_PUBLIC_TURNIX_API_URL ?? "",
  tenantSlugFallback:
    process.env.TURNIX_TENANT_SLUG_FALLBACK ??
    process.env.NEXT_PUBLIC_TURNIX_TENANT_SLUG_FALLBACK ??
    defaultTenantSlugFallback,
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  useMockData: process.env.NEXT_PUBLIC_TURNIX_USE_MOCKS !== "false",
  allowDevCredentials:
    !isProduction && process.env.AUTH_USE_DEV_CREDENTIALS !== "false",
};

export function isGoogleAuthEnabled() {
  return Boolean(env.googleClientId && env.googleClientSecret);
}

export function isBackendEnabled() {
  return Boolean(env.apiBaseUrl);
}
