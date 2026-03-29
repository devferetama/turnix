import type { TimeSlot } from "@/types/domain";

export const schedulingQueryKeys = {
  all: ["scheduling"] as const,
  slots: (serviceId: string) =>
    [...schedulingQueryKeys.all, "slots", serviceId] as const,
};

export const slotSeedData: TimeSlot[] = [
  {
    id: "slot_civil_0900",
    serviceId: "svc_civil_records",
    startsAt: "2026-03-31T09:00:00-03:00",
    endsAt: "2026-03-31T09:20:00-03:00",
    capacity: 1,
    reservedCount: 0,
  },
  {
    id: "slot_civil_0940",
    serviceId: "svc_civil_records",
    startsAt: "2026-03-31T09:40:00-03:00",
    endsAt: "2026-03-31T10:00:00-03:00",
    capacity: 1,
    reservedCount: 1,
  },
  {
    id: "slot_building_1030",
    serviceId: "svc_building_permits",
    startsAt: "2026-03-31T10:30:00-03:00",
    endsAt: "2026-03-31T11:00:00-03:00",
    capacity: 2,
    reservedCount: 1,
  },
  {
    id: "slot_social_1130",
    serviceId: "svc_social_programs",
    startsAt: "2026-03-31T11:30:00-03:00",
    endsAt: "2026-03-31T12:15:00-03:00",
    capacity: 3,
    reservedCount: 1,
  },
  {
    id: "slot_social_1430",
    serviceId: "svc_social_programs",
    startsAt: "2026-03-31T14:30:00-03:00",
    endsAt: "2026-03-31T15:15:00-03:00",
    capacity: 3,
    reservedCount: 2,
  },
];
