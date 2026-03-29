import type { AppRole } from "@/types/domain";

export const ADMIN_ROLES: AppRole[] = ["SUPER_ADMIN", "TENANT_ADMIN"];

export const BACKOFFICE_ROLES: AppRole[] = [
  "SUPER_ADMIN",
  "TENANT_ADMIN",
  "OPERATOR",
  "VIEWER",
];
