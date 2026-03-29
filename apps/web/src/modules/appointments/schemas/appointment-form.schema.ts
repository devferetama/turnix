import { z } from "zod";

import {
  appointmentSourceValues,
  type AppointmentFormValues,
  type CreateAppointmentInput,
} from "@/modules/appointments/types/appointment.types";

export const appointmentFormSchema = z
  .object({
    branchId: z.string().trim().min(1, "Select a branch."),
    serviceId: z.string().trim().min(1, "Select a service."),
    slotId: z.string().trim().min(1, "Select a slot or enter a slot ID."),
    selectedDate: z
      .string()
      .trim()
      .min(1, "Select a date for slot lookup."),
    citizenMode: z.enum(["existing", "create"]),
    citizenId: z.string().trim(),
    citizenFirstName: z.string().trim(),
    citizenLastName: z.string().trim(),
    citizenEmail: z.string().trim().email("Enter a valid email.").or(z.literal("")),
    citizenPhone: z.string().trim().max(60, "Phone must be 60 characters or fewer."),
    citizenDocumentType: z
      .string()
      .trim()
      .max(50, "Document type must be 50 characters or fewer."),
    citizenDocumentNumber: z
      .string()
      .trim()
      .max(120, "Document number must be 120 characters or fewer."),
    staffUserId: z.string().trim(),
    source: z.enum(appointmentSourceValues),
    citizenNotes: z
      .string()
      .trim()
      .max(2000, "Citizen notes must be 2000 characters or fewer."),
    internalNotes: z
      .string()
      .trim()
      .max(2000, "Internal notes must be 2000 characters or fewer."),
  })
  .superRefine((values, context) => {
    if (values.citizenMode === "existing" && values.citizenId.trim().length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["citizenId"],
        message: "Enter an existing citizen ID.",
      });
    }

    if (values.citizenMode === "create") {
      if (values.citizenFirstName.trim().length === 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["citizenFirstName"],
          message: "Enter the citizen first name.",
        });
      }

      if (values.citizenLastName.trim().length === 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["citizenLastName"],
          message: "Enter the citizen last name.",
        });
      }
    }

    const hasDocumentType = values.citizenDocumentType.trim().length > 0;
    const hasDocumentNumber = values.citizenDocumentNumber.trim().length > 0;

    if (hasDocumentType !== hasDocumentNumber) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["citizenDocumentNumber"],
        message: "Document type and number must be provided together.",
      });
    }
  });

export function getAppointmentFormDefaults(): AppointmentFormValues {
  return {
    branchId: "",
    serviceId: "",
    slotId: "",
    selectedDate: new Date().toISOString().slice(0, 10),
    citizenMode: "create",
    citizenId: "",
    citizenFirstName: "",
    citizenLastName: "",
    citizenEmail: "",
    citizenPhone: "",
    citizenDocumentType: "",
    citizenDocumentNumber: "",
    staffUserId: "",
    source: "STAFF",
    citizenNotes: "",
    internalNotes: "",
  };
}

export function mapAppointmentFormValuesToPayload(
  values: AppointmentFormValues,
): CreateAppointmentInput {
  const payload: CreateAppointmentInput = {
    branchId: values.branchId.trim(),
    serviceId: values.serviceId.trim(),
    slotId: values.slotId.trim(),
    source: values.source,
    staffUserId: values.staffUserId.trim() || undefined,
    citizenNotes: values.citizenNotes.trim() || undefined,
    internalNotes: values.internalNotes.trim() || undefined,
  };

  if (values.citizenMode === "existing") {
    payload.citizenId = values.citizenId.trim();
    return payload;
  }

  payload.citizen = {
    firstName: values.citizenFirstName.trim(),
    lastName: values.citizenLastName.trim(),
    email: values.citizenEmail.trim() || undefined,
    phone: values.citizenPhone.trim() || undefined,
    documentType: values.citizenDocumentType.trim() || undefined,
    documentNumber: values.citizenDocumentNumber.trim() || undefined,
  };

  return payload;
}
