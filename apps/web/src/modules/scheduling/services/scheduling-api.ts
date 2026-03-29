import { env, isBackendEnabled } from "@/config/env";
import { apiRequest } from "@/lib/api/client";
import { sleep } from "@/lib/utils";
import { slotSeedData } from "@/modules/scheduling/constants/scheduling.constants";
import type { TenantApiContext } from "@/modules/tenant/types/tenant.types";
import type { TimeSlot } from "@/types/domain";

export async function getAvailableSlots(
  serviceId: string,
  accessToken?: string,
  tenant?: TenantApiContext,
) {
  if (isBackendEnabled() && !env.useMockData) {
    return apiRequest<TimeSlot[]>(`/services/${serviceId}/slots`, {
      method: "GET",
      accessToken,
      tenant,
    });
  }

  await sleep(120);

  return slotSeedData.filter((slot) => slot.serviceId === serviceId);
}
