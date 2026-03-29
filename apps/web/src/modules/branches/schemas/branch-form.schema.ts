import { z } from "zod";

import type {
  BranchFormValues,
  BranchRecord,
  CreateBranchInput,
} from "@/modules/branches/types/branch.types";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const branchFormSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Enter a slug.")
    .max(120, "The slug must be 120 characters or fewer.")
    .regex(slugRegex, "Use lowercase letters, numbers, and hyphens only."),
  name: z
    .string()
    .trim()
    .min(1, "Enter a branch name.")
    .max(160, "The name must be 160 characters or fewer."),
  description: z
    .string()
    .trim()
    .max(2000, "The description must be 2000 characters or fewer."),
  timezone: z
    .string()
    .trim()
    .max(100, "The timezone must be 100 characters or fewer."),
  addressLine1: z
    .string()
    .trim()
    .max(160, "Address line 1 must be 160 characters or fewer."),
  addressLine2: z
    .string()
    .trim()
    .max(160, "Address line 2 must be 160 characters or fewer."),
  city: z.string().trim().max(120, "The city must be 120 characters or fewer."),
  state: z
    .string()
    .trim()
    .max(120, "The state must be 120 characters or fewer."),
  country: z
    .string()
    .trim()
    .max(120, "The country must be 120 characters or fewer."),
  postalCode: z
    .string()
    .trim()
    .max(32, "The postal code must be 32 characters or fewer."),
  isActive: z.boolean(),
});

export function normalizeBranchSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getBranchFormDefaults(
  branch?: Partial<BranchRecord>,
): BranchFormValues {
  return {
    slug: branch?.slug ?? "",
    name: branch?.name ?? "",
    description: branch?.description ?? "",
    timezone: branch?.timezone ?? "",
    addressLine1: branch?.addressLine1 ?? "",
    addressLine2: branch?.addressLine2 ?? "",
    city: branch?.city ?? "",
    state: branch?.state ?? "",
    country: branch?.country ?? "",
    postalCode: branch?.postalCode ?? "",
    isActive: branch?.isActive ?? true,
  };
}

export function mapBranchFormValuesToPayload(
  values: BranchFormValues,
): CreateBranchInput {
  return {
    slug: normalizeBranchSlug(values.slug),
    name: values.name.trim(),
    description: values.description.trim() || undefined,
    timezone: values.timezone.trim() || undefined,
    addressLine1: values.addressLine1.trim() || undefined,
    addressLine2: values.addressLine2.trim() || undefined,
    city: values.city.trim() || undefined,
    state: values.state.trim() || undefined,
    country: values.country.trim() || undefined,
    postalCode: values.postalCode.trim() || undefined,
    isActive: values.isActive,
  };
}
