"use client";

import { createContext, useContext } from "react";

import type { TenantRuntimeContext } from "@/modules/tenant/types/tenant.types";
import { createTenantRuntimeContext } from "@/modules/tenant/utils/tenant-host";

const defaultTenantContext = createTenantRuntimeContext();

const TenantContext = createContext<TenantRuntimeContext>(defaultTenantContext);

export function TenantProvider({
  children,
  tenant,
}: {
  children: React.ReactNode;
  tenant: TenantRuntimeContext;
}) {
  return (
    <TenantContext.Provider value={tenant}>{children}</TenantContext.Provider>
  );
}

export function useTenantContext() {
  return useContext(TenantContext);
}
