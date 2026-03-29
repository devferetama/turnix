import "server-only";

import { redirect } from "next/navigation";

import { ROUTES } from "@/config/routes";
import type { NavigationItem } from "@/config/navigation";
import type { AppRole, SessionUser } from "@/types/domain";

export function canAccessRole(role: AppRole, allowedRoles: AppRole[]) {
  return allowedRoles.includes(role);
}

export function filterNavigationByRole(
  navigation: NavigationItem[],
  role: AppRole,
) {
  return navigation.filter((item) => canAccessRole(role, item.allowedRoles));
}

export function requireRoles(user: SessionUser, allowedRoles: AppRole[]) {
  if (!canAccessRole(user.role, allowedRoles)) {
    redirect(ROUTES.dashboard);
  }
}
