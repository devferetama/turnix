import { DashboardPageTemplate } from "@/components/ui/templates/dashboard-page-template";
import { ContextualSplitPageTemplate } from "@/components/ui/templates/contextual-split-page-template";

export default function ServicesLayout({
  children,
  panel,
}: {
  children: React.ReactNode;
  panel: React.ReactNode;
}) {
  return (
    <DashboardPageTemplate>
      <ContextualSplitPageTemplate panel={panel}>
        {children}
      </ContextualSplitPageTemplate>
    </DashboardPageTemplate>
  );
}
