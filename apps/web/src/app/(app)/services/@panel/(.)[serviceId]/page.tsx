import { ServiceEditorRoutePanel } from "@/modules/services/components/service-editor-route-panel";

export default async function InterceptedServicePanelPage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;

  return <ServiceEditorRoutePanel mode="edit" serviceId={serviceId} />;
}
