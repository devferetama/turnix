import "server-only";

import { headers } from "next/headers";

import { createTenantContextFromHost } from "@/modules/tenant/utils/tenant-host";

export async function getServerTenantContext() {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

  return createTenantContextFromHost(host);
}

export async function getServerTenantApiContext() {
  const tenant = await getServerTenantContext();

  return {
    host: tenant.host,
    slug: tenant.slug,
  };
}
