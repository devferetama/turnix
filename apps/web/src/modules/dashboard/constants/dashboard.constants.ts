export const dashboardQueryKeys = {
  all: ["dashboard"] as const,
  summary: (tenantId?: string) =>
    [...dashboardQueryKeys.all, "summary", tenantId ?? "all"] as const,
  upcoming: (tenantId?: string) =>
    [...dashboardQueryKeys.all, "upcoming", tenantId ?? "all"] as const,
};
