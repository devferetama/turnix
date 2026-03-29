import { PageHeader } from "@/components/ui/organisms/page-header";
import { DashboardPageTemplate } from "@/components/ui/templates/dashboard-page-template";
import { getRequestDictionary } from "@/i18n/request";
import { ADMIN_ROLES } from "@/modules/auth/constants/access-control";
import { requireRoles } from "@/modules/auth/server/authorization.server";
import { requireAppSession } from "@/modules/auth/server/session.server";
import { SettingsOverview } from "@/modules/settings/components/settings-overview";
import { getSettingsAreas } from "@/modules/settings/services/settings-api";

export default async function SettingsPage() {
  const session = await requireAppSession();
  const { dictionary } = await getRequestDictionary();
  requireRoles(session.user, ADMIN_ROLES);
  const areas = await getSettingsAreas();

  return (
    <DashboardPageTemplate>
      <PageHeader
        title={dictionary.settings.page.title}
        description={dictionary.settings.page.description}
      />
      <SettingsOverview areas={areas} />
    </DashboardPageTemplate>
  );
}
