import { AuthPageTemplate } from "@/components/ui/templates/auth-page-template";
import { getServerTenantContext } from "@/modules/tenant/server/tenant-context.server";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getServerTenantContext();

  return (
    <AuthPageTemplate
      tenantLabel={tenant.isResolved ? tenant.branding.displayName : undefined}
    >
      {children}
    </AuthPageTemplate>
  );
}
