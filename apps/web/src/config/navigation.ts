import type { Route } from "next";

import { ROUTES } from "@/config/routes";
import type { AppRole } from "@/types/domain";

export type NavigationItemKey =
  | "dashboard"
  | "appointments"
  | "services"
  | "branches"
  | "settings";

export type NavigationIconKey =
  | "dashboard"
  | "appointments"
  | "services"
  | "branches"
  | "settings"
  | "sparkles";

export interface NavigationItem {
  key: NavigationItemKey;
  href: Route;
  iconKey: NavigationIconKey;
  allowedRoles: AppRole[];
}

export const appNavigation: NavigationItem[] = [
  {
    key: "dashboard",
    href: ROUTES.dashboard,
    iconKey: "dashboard",
    allowedRoles: ["SUPER_ADMIN", "TENANT_ADMIN", "OPERATOR", "VIEWER"],
  },
  {
    key: "appointments",
    href: ROUTES.appointments,
    iconKey: "appointments",
    allowedRoles: ["SUPER_ADMIN", "TENANT_ADMIN", "OPERATOR", "VIEWER"],
  },
  {
    key: "services",
    href: ROUTES.services,
    iconKey: "services",
    allowedRoles: ["SUPER_ADMIN", "TENANT_ADMIN", "OPERATOR", "VIEWER"],
  },
  {
    key: "branches",
    href: ROUTES.branches as Route,
    iconKey: "branches",
    allowedRoles: ["SUPER_ADMIN", "TENANT_ADMIN", "OPERATOR", "VIEWER"],
  },
  {
    key: "settings",
    href: ROUTES.settings,
    iconKey: "settings",
    allowedRoles: ["SUPER_ADMIN", "TENANT_ADMIN"],
  },
];

export const dashboardQuickLinks = [
  {
    key: "dashboard" as const,
    href: ROUTES.book,
    iconKey: "sparkles" as const,
  },
] as const;
