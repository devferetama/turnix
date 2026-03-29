import "server-only";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { ROUTES } from "@/config/routes";
import { authOptions } from "@/modules/auth/config/auth-options";
import { validateBackendSession } from "@/modules/auth/server/backend-auth.server";
import { getServerTenantContext } from "@/modules/tenant/server/tenant-context.server";

export async function getAppSession() {
  return getServerSession(authOptions);
}

export async function requireAppSession() {
  const [session, tenant] = await Promise.all([
    getAppSession(),
    getServerTenantContext(),
  ]);

  if (!session?.user) {
    redirect(ROUTES.login);
  }

  if (
    tenant.slug &&
    session.user.tenant?.slug &&
    tenant.slug !== session.user.tenant.slug
  ) {
    redirect(ROUTES.login);
  }

  const isValid = await validateBackendSession(session.accessToken);

  if (!isValid) {
    redirect(ROUTES.login);
  }

  return session;
}
