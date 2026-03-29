import { redirect } from "next/navigation";

import { env, isBackendEnabled } from "@/config/env";
import { ROUTES } from "@/config/routes";
import { AuthForm } from "@/modules/auth/components/auth-form";
import { validateBackendSession } from "@/modules/auth/server/backend-auth.server";
import { getAppSession } from "@/modules/auth/server/session.server";
import { getServerTenantContext } from "@/modules/tenant/server/tenant-context.server";

export default async function LoginPage() {
  const [session, tenant] = await Promise.all([
    getAppSession(),
    getServerTenantContext(),
  ]);

  if (session?.user) {
    const isValidSession = await validateBackendSession(session.accessToken);
    const tenantMatchesHost =
      !tenant.slug ||
      !session.user.tenant?.slug ||
      tenant.slug === session.user.tenant.slug;

    if (isValidSession && tenantMatchesHost) {
      redirect(ROUTES.dashboard);
    }
  }

  return (
    <AuthForm
      showDevelopmentHint={env.allowDevCredentials && !isBackendEnabled()}
    />
  );
}
