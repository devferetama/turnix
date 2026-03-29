import { z } from "zod";

import type {
  CancelPublicAppointmentInput,
  CreatePublicAppointmentInput,
  PublicAppointmentCancellationFormValues,
  PublicAppointmentLookupFormValues,
  PublicAppointmentRescheduleFormValues,
  PublicBookingFormValues,
  PublicServiceSlotRecord,
  ReschedulePublicAppointmentInput,
} from "@/modules/public-booking/types/public-booking.types";

const optionalTrimmedString = z
  .string()
  .trim()
  .max(2000)
  .or(z.literal(""));

export const publicAppointmentCodeSchema = z
  .string()
  .trim()
  .min(8, "Enter a valid appointment code.")
  .max(40, "Appointment code is too long.")
  .regex(/^[A-Za-z0-9-]+$/, "Use only letters, numbers, and hyphens.")
  .transform((value) => value.toUpperCase());

export const publicAppointmentLookupSchema = z.object({
  code: publicAppointmentCodeSchema,
});

export const publicAppointmentCancellationSchema = z.object({
  reason: z.string().trim().max(300, "Reason is too long.").or(z.literal("")),
  details: z
    .string()
    .trim()
    .max(2000, "Details are too long.")
    .or(z.literal("")),
});

export const publicAppointmentRescheduleSchema = z.object({
  selectedDate: z.string().trim().or(z.literal("")),
  branchId: z.string().trim().or(z.literal("")),
  slotId: z.string().trim().min(1, "Select a new available time slot."),
  reason: z.string().trim().max(300, "Reason is too long.").or(z.literal("")),
  details: z
    .string()
    .trim()
    .max(2000, "Details are too long.")
    .or(z.literal("")),
});

export const publicBookingFormSchema = z
  .object({
    firstName: z.string().trim().min(2, "Enter the booking person's first name."),
    lastName: z.string().trim().min(2, "Enter the booking person's last name."),
    email: z.string().trim().email("Enter a valid contact email.").or(z.literal("")),
    phone: z.string().trim().max(60, "Phone is too long.").or(z.literal("")),
    documentType: z.string().trim().max(50, "Document type is too long.").or(z.literal("")),
    documentNumber: z
      .string()
      .trim()
      .max(120, "Document number is too long.")
      .or(z.literal("")),
    citizenNotes: optionalTrimmedString,
    slotId: z.string().trim().min(1, "Select an available time slot."),
  })
  .superRefine((value, context) => {
    const hasDocumentType = value.documentType.trim().length > 0;
    const hasDocumentNumber = value.documentNumber.trim().length > 0;

    if (hasDocumentType !== hasDocumentNumber) {
      context.addIssue({
        code: "custom",
        path: hasDocumentType ? ["documentNumber"] : ["documentType"],
        message: "Document type and number must be provided together.",
      });
    }
  });

export function getPublicBookingFormDefaults(
  draft: Partial<PublicBookingFormValues> = {},
): PublicBookingFormValues {
  return {
    firstName: draft.firstName ?? "",
    lastName: draft.lastName ?? "",
    email: draft.email ?? "",
    phone: draft.phone ?? "",
    documentType: draft.documentType ?? "",
    documentNumber: draft.documentNumber ?? "",
    citizenNotes: draft.citizenNotes ?? "",
    slotId: draft.slotId ?? "",
  };
}

export function getPublicAppointmentLookupDefaults(
  draft: Partial<PublicAppointmentLookupFormValues> = {},
): PublicAppointmentLookupFormValues {
  return {
    code: draft.code ?? "",
  };
}

export function getPublicAppointmentCancellationDefaults(
  draft: Partial<PublicAppointmentCancellationFormValues> = {},
): PublicAppointmentCancellationFormValues {
  return {
    reason: draft.reason ?? "",
    details: draft.details ?? "",
  };
}

export function getPublicAppointmentRescheduleDefaults(
  draft: Partial<PublicAppointmentRescheduleFormValues> = {},
): PublicAppointmentRescheduleFormValues {
  return {
    selectedDate: draft.selectedDate ?? "",
    branchId: draft.branchId ?? "",
    slotId: draft.slotId ?? "",
    reason: draft.reason ?? "",
    details: draft.details ?? "",
  };
}

export function mapPublicBookingFormValuesToPayload(
  values: PublicBookingFormValues,
  selectedServiceId: string,
  selectedSlot: PublicServiceSlotRecord,
): CreatePublicAppointmentInput {
  return {
    serviceId: selectedServiceId,
    branchId: selectedSlot.branchId,
    slotId: selectedSlot.id,
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: normalizeOptionalString(values.email),
    phone: normalizeOptionalString(values.phone),
    documentType: normalizeOptionalString(values.documentType),
    documentNumber: normalizeOptionalString(values.documentNumber),
    citizenNotes: normalizeOptionalString(values.citizenNotes),
  };
}

export function mapPublicAppointmentCancellationToPayload(
  values: PublicAppointmentCancellationFormValues,
): CancelPublicAppointmentInput {
  return {
    reason: normalizeOptionalString(values.reason),
    details: normalizeOptionalString(values.details),
  };
}

export function mapPublicAppointmentRescheduleToPayload(
  values: PublicAppointmentRescheduleFormValues,
): ReschedulePublicAppointmentInput {
  return {
    newSlotId: values.slotId.trim(),
    reason: normalizeOptionalString(values.reason),
    details: normalizeOptionalString(values.details),
  };
}

export function normalizePublicAppointmentCode(value: string) {
  return publicAppointmentCodeSchema.parse(value);
}

function normalizeOptionalString(value: string) {
  const normalized = value.trim();

  return normalized.length > 0 ? normalized : undefined;
}
