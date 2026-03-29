import { mapDashboardSummary, mapDashboardUpcomingResponse } from "@/modules/dashboard/mappers/dashboard.mappers";
import type {
  DashboardSummary,
  DashboardUpcomingResponse,
} from "@/modules/dashboard/types/dashboard.types";
import type { TenantApiContext } from "@/modules/tenant/types/tenant.types";
import { getAppointments } from "@/modules/appointments/services/appointments-api";
import { getBranches } from "@/modules/branches/services/branches-api";
import { getServices } from "@/modules/services/services/services-api";

export async function getDashboardSummary({
  accessToken,
  tenantId,
  tenant,
}: {
  accessToken?: string;
  tenantId?: string;
  tenant?: TenantApiContext;
} = {}): Promise<DashboardSummary> {
  const [appointmentsResult, servicesResult, branchesResult] =
    await Promise.allSettled([
      getAppointments({
        tenantId,
        accessToken,
        tenant,
      }),
      getServices({
        tenantId,
        accessToken,
        tenant,
        filters: {
          isActive: true,
        },
      }),
      getBranches({
        tenantId,
        accessToken,
        tenant,
        filters: {
          isActive: true,
        },
      }),
    ]);

  const appointments =
    appointmentsResult.status === "fulfilled" ? appointmentsResult.value : null;
  const activeServices =
    servicesResult.status === "fulfilled" ? servicesResult.value : null;
  const activeBranches =
    branchesResult.status === "fulfilled" ? branchesResult.value : null;

  if (!appointments && !activeServices && !activeBranches) {
    throw appointmentsResult.status === "rejected"
      ? appointmentsResult.reason
      : servicesResult.status === "rejected"
        ? servicesResult.reason
        : branchesResult.status === "rejected"
          ? branchesResult.reason
          : new Error("Dashboard data is unavailable.");
  }

  return mapDashboardSummary({
    appointments,
    activeServices,
    activeBranches,
  });
}

export async function getDashboardUpcomingAppointments({
  accessToken,
  tenantId,
  tenant,
}: {
  accessToken?: string;
  tenantId?: string;
  tenant?: TenantApiContext;
} = {}): Promise<DashboardUpcomingResponse> {
  const today = getLocalDateKey(new Date());
  const appointments = await getAppointments({
    tenantId,
    accessToken,
    tenant,
    filters: {
      dateFrom: today,
    },
  });

  return mapDashboardUpcomingResponse(appointments);
}

function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}
