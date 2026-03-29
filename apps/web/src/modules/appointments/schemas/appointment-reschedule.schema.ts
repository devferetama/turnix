import { z } from "zod";

import type {
  AppointmentRescheduleFormValues,
  RescheduleAppointmentInput,
} from "@/modules/appointments/types/appointment.types";

const optionalTrimmedString = z
  .string()
  .trim()
  .max(2000, "Details must be 2000 characters or fewer.")
  .or(z.literal(""));

export const appointmentRescheduleSchema = z.object({
  branchId: z.string().trim(),
  selectedDate: z.string().trim(),
  slotId: z.string().trim().min(1, "Select a new slot or enter a slot ID."),
  reason: z.string().trim().max(300, "Reason must be 300 characters or fewer.").or(
    z.literal(""),
  ),
  details: optionalTrimmedString,
});

export function getAppointmentRescheduleDefaults(
  draft: Partial<AppointmentRescheduleFormValues> = {},
): AppointmentRescheduleFormValues {
  return {
    branchId: draft.branchId ?? "",
    selectedDate: draft.selectedDate ?? new Date().toISOString().slice(0, 10),
    slotId: draft.slotId ?? "",
    reason: draft.reason ?? "",
    details: draft.details ?? "",
  };
}

export function mapAppointmentRescheduleToPayload(
  values: AppointmentRescheduleFormValues,
): RescheduleAppointmentInput {
  return {
    newSlotId: values.slotId.trim(),
    reason: normalizeOptionalString(values.reason),
    details: normalizeOptionalString(values.details),
  };
}

function normalizeOptionalString(value: string) {
  const normalized = value.trim();

  return normalized.length > 0 ? normalized : undefined;
}
