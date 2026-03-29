import { DashboardPageTemplate } from "@/components/ui/templates/dashboard-page-template";
import { ContextualSplitPageTemplate } from "@/components/ui/templates/contextual-split-page-template";

export default function AppointmentsLayout({
  children,
  panel,
}: {
  children: React.ReactNode;
  panel: React.ReactNode;
}) {
  return (
    <DashboardPageTemplate>
      <ContextualSplitPageTemplate
        gridClassName="xl:grid-cols-[minmax(0,1.5fr)_minmax(380px,0.92fr)]"
        panel={panel}
      >
        {children}
      </ContextualSplitPageTemplate>
    </DashboardPageTemplate>
  );
}
