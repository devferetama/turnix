import { z } from "zod";

import {
  serviceModeValues,
  serviceVisibilityValues,
  type CreateServiceInput,
  type ServiceFormValues,
  type ServiceRecord,
} from "@/modules/services/types/service.types";

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const optionalUuidField = z
  .string()
  .trim()
  .refine((value) => value.length === 0 || uuidRegex.test(value), {
    message: "Enter a valid UUID.",
  });

export const serviceFormSchema = z.object({
  categoryId: optionalUuidField,
  branchId: optionalUuidField,
  slug: z
    .string()
    .trim()
    .min(1, "Enter a slug.")
    .max(120, "The slug must be 120 characters or fewer.")
    .regex(slugRegex, "Use lowercase letters, numbers, and hyphens only."),
  name: z
    .string()
    .trim()
    .min(1, "Enter a service name.")
    .max(160, "The name must be 160 characters or fewer."),
  description: z
    .string()
    .trim()
    .max(2000, "The description must be 2000 characters or fewer."),
  visibility: z.enum(serviceVisibilityValues),
  mode: z.enum(serviceModeValues),
  durationMinutes: z
    .number()
    .int()
    .min(1, "Enter a duration greater than zero."),
  bufferBeforeMinutes: z
    .number()
    .int()
    .min(0, "Use zero or a positive number."),
  bufferAfterMinutes: z
    .number()
    .int()
    .min(0, "Use zero or a positive number."),
  slotCapacity: z.number().int().min(1, "Slot capacity must be at least 1."),
  allowOnlineBooking: z.boolean(),
  requiresApproval: z.boolean(),
  requiresAuthentication: z.boolean(),
  allowsCancellation: z.boolean(),
  allowsReschedule: z.boolean(),
  isActive: z.boolean(),
});

export function normalizeServiceSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getServiceFormDefaults(
  service?: Partial<ServiceRecord>,
): ServiceFormValues {
  return {
    categoryId: service?.categoryId ?? "",
    branchId: service?.branchId ?? "",
    slug: service?.slug ?? "",
    name: service?.name ?? "",
    description: service?.description ?? "",
    visibility: service?.visibility ?? "PUBLIC",
    mode: service?.mode ?? "IN_PERSON",
    durationMinutes: service?.durationMinutes ?? 30,
    bufferBeforeMinutes: service?.bufferBeforeMinutes ?? 0,
    bufferAfterMinutes: service?.bufferAfterMinutes ?? 0,
    slotCapacity: service?.slotCapacity ?? 1,
    allowOnlineBooking: service?.allowOnlineBooking ?? true,
    requiresApproval: service?.requiresApproval ?? false,
    requiresAuthentication: service?.requiresAuthentication ?? false,
    allowsCancellation: service?.allowsCancellation ?? true,
    allowsReschedule: service?.allowsReschedule ?? true,
    isActive: service?.isActive ?? true,
  };
}

export function mapServiceFormValuesToPayload(
  values: ServiceFormValues,
): CreateServiceInput {
  return {
    categoryId: values.categoryId.trim() || undefined,
    branchId: values.branchId.trim() || undefined,
    slug: normalizeServiceSlug(values.slug),
    name: values.name.trim(),
    description: values.description.trim() || undefined,
    visibility: values.visibility,
    mode: values.mode,
    durationMinutes: values.durationMinutes,
    bufferBeforeMinutes: values.bufferBeforeMinutes,
    bufferAfterMinutes: values.bufferAfterMinutes,
    slotCapacity: values.slotCapacity,
    allowOnlineBooking: values.allowOnlineBooking,
    requiresApproval: values.requiresApproval,
    requiresAuthentication: values.requiresAuthentication,
    allowsCancellation: values.allowsCancellation,
    allowsReschedule: values.allowsReschedule,
    isActive: values.isActive,
  };
}
