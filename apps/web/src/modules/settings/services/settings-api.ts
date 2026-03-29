import { sleep } from "@/lib/utils";
import type { SettingsArea } from "@/modules/settings/types/settings.types";

const settingsAreas: SettingsArea[] = [
  {
    key: "tenant_profile",
    status: "configured",
  },
  {
    key: "authentication",
    status: "ready",
  },
  {
    key: "scheduling_rules",
    status: "in review",
  },
];

export async function getSettingsAreas() {
  await sleep(80);
  return settingsAreas;
}
