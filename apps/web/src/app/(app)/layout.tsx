import { AppShell } from "@/components/ui/organisms/app-shell";
import { appNavigation } from "@/config/navigation";
import { filterNavigationByRole } from "@/modules/auth/server/authorization.server";
import { requireAppSession } from "@/modules/auth/server/session.server";
import { getServerTenantContext } from "@/modules/tenant/server/tenant-context.server";
import { AuthSessionProvider } from "@/providers/auth-session-provider";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, tenant] = await Promise.all([
    requireAppSession(),
    getServerTenantContext(),
  ]);
  const navigation = filterNavigationByRole(appNavigation, session.user.role);
  const tenantLabel =
    session.user.tenant?.name ??
    (tenant.isResolved ? tenant.branding.displayName : session.user.tenantId);

  return (
    <AuthSessionProvider session={session}>
      <AppShell
        navigation={navigation}
        user={session.user}
        tenantLabel={tenantLabel}
      >
        {children}
      </AppShell>
    </AuthSessionProvider>
  );
}
