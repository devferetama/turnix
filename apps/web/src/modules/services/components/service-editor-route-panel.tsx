"use client";

import { useRouter } from "next/navigation";

import { ROUTES } from "@/config/routes";
import { ServiceFormPanel } from "@/modules/services/components/service-form-panel";

export function ServiceEditorRoutePanel({
  mode,
  serviceId,
}: {
  mode: "create" | "edit";
  serviceId?: string;
}) {
  const router = useRouter();

  return (
    <ServiceFormPanel
      editorState={
        mode === "create" ? { mode: "create" } : { mode: "edit", serviceId: serviceId ?? "" }
      }
      onClose={() => router.push(ROUTES.services)}
      onSaved={(service) => router.replace(ROUTES.serviceDetail(service.id))}
    />
  );
}
