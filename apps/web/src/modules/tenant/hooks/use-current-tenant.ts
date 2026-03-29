"use client";

import { useTenantContext } from "@/modules/tenant/providers/tenant-provider";

export function useCurrentTenant() {
  return useTenantContext();
}
