"use client";

import { create } from "zustand";

import type {
  PublicAppointmentConfirmation,
  PublicBookingDraft,
  PublicServiceRecord,
  PublicServiceSlotRecord,
} from "@/modules/public-booking/types/public-booking.types";

interface BookingFlowState {
  selectedService: PublicServiceRecord | null;
  selectedSlot: PublicServiceSlotRecord | null;
  draft: Partial<PublicBookingDraft>;
  confirmation: PublicAppointmentConfirmation | null;
  setSelectedService: (service: PublicServiceRecord) => void;
  setSelectedSlot: (slot: PublicServiceSlotRecord) => void;
  clearSelectedSlot: () => void;
  setDraft: (draft: Partial<PublicBookingDraft>) => void;
  setConfirmation: (
    confirmation: PublicAppointmentConfirmation | null,
  ) => void;
  reset: () => void;
}

export const useBookingFlowStore = create<BookingFlowState>()((set) => ({
  selectedService: null,
  selectedSlot: null,
  draft: {},
  confirmation: null,
  setSelectedService: (service) =>
    set((state) => ({
      selectedService: service,
      selectedSlot: null,
      draft: {
        ...state.draft,
        serviceId: service.id,
        serviceName: service.name,
        slotId: "",
        branchId: service.branchId ?? "",
        branchName: service.branch?.name ?? "",
      },
      confirmation: null,
    })),
  setSelectedSlot: (slot) =>
    set((state) => ({
      selectedSlot: slot,
      draft: {
        ...state.draft,
        slotId: slot.id,
        branchId: slot.branchId,
        branchName: slot.branch.name,
      },
    })),
  clearSelectedSlot: () =>
    set((state) => ({
      selectedSlot: null,
      draft: {
        ...state.draft,
        slotId: "",
        branchId: state.selectedService?.branchId ?? "",
        branchName: state.selectedService?.branch?.name ?? "",
      },
    })),
  setDraft: (draft) =>
    set((state) => ({
      draft: {
        ...state.draft,
        ...draft,
      },
    })),
  setConfirmation: (confirmation) => set({ confirmation }),
  reset: () =>
    set({
      selectedService: null,
      selectedSlot: null,
      draft: {},
      confirmation: null,
    }),
}));
